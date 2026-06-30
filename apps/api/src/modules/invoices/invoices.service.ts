import { Prisma, TransactionStatus, TransactionType } from "@prisma/client";

import { prisma } from "../../database/prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { presentTransaction } from "../transactions/transaction.presenter";

type BulkInvoiceFilters = {
  month?: string;
  type?: string;
  payerName?: string;
  description?: string;
};

type PrepareBulkInvoiceInput = {
  invoiceNumber: string;
  filters: BulkInvoiceFilters;
};

type ApplyBulkInvoiceInput = {
  userId: string;
  invoiceNumber: string;
  confirm: boolean;
  transactionIds?: string[];
  filters?: BulkInvoiceFilters;
};

const normalizeRequiredInvoiceNumber = (invoiceNumber: string | undefined) => {
  const normalized = invoiceNumber?.trim();

  if (!normalized) {
    throw new AppError("Invoice number is required.", 400, "INVOICE_NUMBER_REQUIRED");
  }

  return normalized;
};

const parseMonthRange = (month: string | undefined) => {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError("Month must use YYYY-MM format.", 400, "INVALID_MONTH");
  }

  const [yearValue, monthValue] = month.split("-").map(Number);

  return {
    start: new Date(Date.UTC(yearValue, monthValue - 1, 1)),
    end: new Date(Date.UTC(yearValue, monthValue, 1))
  };
};

const parseType = (type: string | undefined) => {
  if (!type) {
    return undefined;
  }

  if (!Object.values(TransactionType).includes(type as TransactionType)) {
    throw new AppError("Invalid transaction type.", 400, "INVALID_TRANSACTION_TYPE");
  }

  return type as TransactionType;
};

const buildBulkWhere = (filters: BulkInvoiceFilters = {}): Prisma.TransactionWhereInput => {
  const { start, end } = parseMonthRange(filters.month);
  const where: Prisma.TransactionWhereInput = {
    paymentDate: {
      gte: start,
      lt: end
    },
    status: TransactionStatus.pending
  };

  const type = parseType(filters.type);

  if (type) {
    where.type = type;
  }

  if (filters.payerName) {
    where.payerName = {
      contains: filters.payerName
    };
  }

  if (filters.description) {
    where.OR = [
      {
        descriptionText: {
          contains: filters.description
        }
      },
      {
        description: {
          name: {
            contains: filters.description
          }
        }
      }
    ];
  }

  return where;
};

const summarizeTransactions = (transactions: { amount: Prisma.Decimal }[]) => {
  return transactions.reduce((total, transaction) => total.plus(transaction.amount), new Prisma.Decimal(0)).toString();
};

export const applyInvoiceToTransaction = async (transactionId: string, invoiceNumberInput: string, userId: string) => {
  const invoiceNumber = normalizeRequiredInvoiceNumber(invoiceNumberInput);

  const transaction = await prisma.$transaction(async (transactionClient) => {
    const updatedTransaction = await transactionClient.transaction.update({
      where: { id: transactionId },
      data: {
        invoiceNumber,
        status: TransactionStatus.transmitted
      }
    });

    await transactionClient.auditLog.create({
      data: {
        userId,
        entity: "transaction",
        entityId: transactionId,
        action: "apply_invoice_number",
        summary: {
          invoiceNumber
        }
      }
    });

    return updatedTransaction;
  });

  return presentTransaction(transaction);
};

export const prepareBulkInvoice = async ({ invoiceNumber, filters }: PrepareBulkInvoiceInput) => {
  const normalizedInvoiceNumber = invoiceNumber.trim();
  const where = buildBulkWhere(filters);
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: [{ paymentDate: "asc" }, { createdAt: "asc" }]
  });

  return {
    invoiceNumber: normalizedInvoiceNumber,
    affectedCount: transactions.length,
    totalAmount: summarizeTransactions(transactions),
    transactions: transactions.map(presentTransaction)
  };
};

export const applyBulkInvoice = async ({ userId, invoiceNumber, confirm, transactionIds, filters }: ApplyBulkInvoiceInput) => {
  const normalizedInvoiceNumber = normalizeRequiredInvoiceNumber(invoiceNumber);

  if (!confirm) {
    throw new AppError("Bulk invoice application requires confirmation.", 400, "BULK_INVOICE_CONFIRMATION_REQUIRED");
  }

  const where: Prisma.TransactionWhereInput =
    transactionIds && transactionIds.length > 0
      ? {
          id: {
            in: transactionIds
          },
          status: TransactionStatus.pending
        }
      : buildBulkWhere(filters);

  const transactions = await prisma.transaction.findMany({
    where
  });

  if (transactions.length === 0) {
    throw new AppError("No pending transactions found for bulk invoice.", 404, "NO_PENDING_TRANSACTIONS_FOUND");
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.transaction.updateMany({
      where: {
        id: {
          in: transactions.map((transaction) => transaction.id)
        }
      },
      data: {
        invoiceNumber: normalizedInvoiceNumber,
        status: TransactionStatus.transmitted
      }
    });

    await transactionClient.auditLog.create({
      data: {
        userId,
        entity: "transaction",
        entityId: "bulk",
        action: "apply_bulk_invoice_number",
        summary: {
          invoiceNumber: normalizedInvoiceNumber,
          affectedCount: transactions.length,
          transactionIds: transactions.map((transaction) => transaction.id)
        }
      }
    });
  });

  return {
    invoiceNumber: normalizedInvoiceNumber,
    affectedCount: transactions.length,
    totalAmount: summarizeTransactions(transactions)
  };
};
