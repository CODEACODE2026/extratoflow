import { Prisma, TransactionSource, TransactionStatus, TransactionType } from "@prisma/client";

import { prisma } from "../../database/prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { presentTransaction } from "./transaction.presenter";

type ListTransactionsFilters = {
  page?: string;
  perPage?: string;
  month?: string;
  dateStart?: string;
  dateEnd?: string;
  type?: string;
  status?: string;
  payerName?: string;
  description?: string;
  valueMin?: string;
  valueMax?: string;
};

type CreateTransactionInput = {
  paymentDate: string;
  type: string;
  amount: string | number;
  payerName?: string | null;
  descriptionText?: string | null;
  descriptionId?: string | null;
  invoiceNumber?: string | null;
  rawText?: string | null;
};

type UpdateTransactionInput = Partial<CreateTransactionInput>;

const parsePagination = (page?: string, perPage?: string) => {
  const parsedPage = Number(page ?? 1);
  const parsedPerPage = Number(perPage ?? 25);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    throw new AppError("Invalid page.", 400, "INVALID_PAGE");
  }

  if (!Number.isInteger(parsedPerPage) || parsedPerPage < 1 || parsedPerPage > 100) {
    throw new AppError("Invalid perPage. Use a value between 1 and 100.", 400, "INVALID_PER_PAGE");
  }

  return {
    page: parsedPage,
    perPage: parsedPerPage,
    skip: (parsedPage - 1) * parsedPerPage
  };
};

const parseDate = (value: string, fieldName: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} must use YYYY-MM-DD format.`, 400, "INVALID_DATE");
  }

  return date;
};

const parseMonthRange = (month: string) => {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError("Month must use YYYY-MM format.", 400, "INVALID_MONTH");
  }

  const [yearValue, monthValue] = month.split("-").map(Number);
  const start = new Date(Date.UTC(yearValue, monthValue - 1, 1));
  const end = new Date(Date.UTC(yearValue, monthValue, 1));

  return { start, end };
};

const parseType = (type: string) => {
  if (!Object.values(TransactionType).includes(type as TransactionType)) {
    throw new AppError("Invalid transaction type.", 400, "INVALID_TRANSACTION_TYPE");
  }

  return type as TransactionType;
};

const parseStatus = (status: string) => {
  if (!Object.values(TransactionStatus).includes(status as TransactionStatus)) {
    throw new AppError("Invalid transaction status.", 400, "INVALID_TRANSACTION_STATUS");
  }

  return status as TransactionStatus;
};

const parseAmount = (value: string | number, fieldName = "amount") => {
  const decimal = new Prisma.Decimal(value);

  if (decimal.isNaN() || decimal.lessThanOrEqualTo(0)) {
    throw new AppError(`${fieldName} must be greater than zero.`, 400, "INVALID_AMOUNT");
  }

  return decimal;
};

const normalizeOptionalText = (value: string | null | undefined) => {
  if (value === null) {
    return null;
  }

  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const deriveStatusFromInvoiceNumber = (invoiceNumber: string | null | undefined) => {
  return normalizeOptionalText(invoiceNumber) ? TransactionStatus.transmitted : TransactionStatus.pending;
};

const buildFilters = (filters: ListTransactionsFilters): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = {};

  if (filters.month) {
    const { start, end } = parseMonthRange(filters.month);
    where.paymentDate = {
      gte: start,
      lt: end
    };
  }

  if (filters.dateStart || filters.dateEnd) {
    where.paymentDate = {
      ...(typeof where.paymentDate === "object" ? where.paymentDate : {}),
      ...(filters.dateStart ? { gte: parseDate(filters.dateStart, "dateStart") } : {}),
      ...(filters.dateEnd ? { lte: parseDate(filters.dateEnd, "dateEnd") } : {})
    };
  }

  if (filters.type) {
    where.type = parseType(filters.type);
  }

  if (filters.status) {
    where.status = parseStatus(filters.status);
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

  if (filters.valueMin || filters.valueMax) {
    where.amount = {
      ...(filters.valueMin ? { gte: parseAmount(filters.valueMin, "valueMin") } : {}),
      ...(filters.valueMax ? { lte: parseAmount(filters.valueMax, "valueMax") } : {})
    };
  }

  return where;
};

export const listTransactions = async (filters: ListTransactionsFilters) => {
  const pagination = parsePagination(filters.page, filters.perPage);
  const where = buildFilters(filters);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
      skip: pagination.skip,
      take: pagination.perPage
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    transactions: transactions.map(presentTransaction),
    pagination: {
      page: pagination.page,
      perPage: pagination.perPage,
      total
    }
  };
};

export const getTransaction = async (id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id }
  });

  if (!transaction) {
    throw new AppError("Transaction not found.", 404, "TRANSACTION_NOT_FOUND");
  }

  return presentTransaction(transaction);
};

export const createTransaction = async (input: CreateTransactionInput) => {
  const invoiceNumber = normalizeOptionalText(input.invoiceNumber);

  const transaction = await prisma.transaction.create({
    data: {
      paymentDate: parseDate(input.paymentDate, "paymentDate"),
      type: parseType(input.type),
      amount: parseAmount(input.amount),
      payerName: normalizeOptionalText(input.payerName),
      descriptionText: normalizeOptionalText(input.descriptionText),
      descriptionId: normalizeOptionalText(input.descriptionId),
      invoiceNumber,
      status: deriveStatusFromInvoiceNumber(invoiceNumber),
      source: TransactionSource.manual,
      rawText: normalizeOptionalText(input.rawText)
    }
  });

  return presentTransaction(transaction);
};

export const updateTransaction = async (id: string, input: UpdateTransactionInput) => {
  await getTransaction(id);

  const data: Prisma.TransactionUpdateInput = {};

  if (input.paymentDate !== undefined) {
    data.paymentDate = parseDate(input.paymentDate, "paymentDate");
  }

  if (input.type !== undefined) {
    data.type = parseType(input.type);
  }

  if (input.amount !== undefined) {
    data.amount = parseAmount(input.amount);
  }

  if (input.payerName !== undefined) {
    data.payerName = normalizeOptionalText(input.payerName);
  }

  if (input.descriptionText !== undefined) {
    data.descriptionText = normalizeOptionalText(input.descriptionText);
  }

  if (input.descriptionId !== undefined) {
    data.description = input.descriptionId ? { connect: { id: input.descriptionId } } : { disconnect: true };
  }

  if (input.invoiceNumber !== undefined) {
    const invoiceNumber = normalizeOptionalText(input.invoiceNumber);
    data.invoiceNumber = invoiceNumber;
    data.status = deriveStatusFromInvoiceNumber(invoiceNumber);
  }

  if (input.rawText !== undefined) {
    data.rawText = normalizeOptionalText(input.rawText);
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data
  });

  return presentTransaction(transaction);
};

export const updateTransactionDescription = async (id: string, descriptionId?: string | null, descriptionText?: string | null) => {
  await getTransaction(id);

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      descriptionText: normalizeOptionalText(descriptionText),
      description: descriptionId ? { connect: { id: descriptionId } } : { disconnect: true }
    }
  });

  return presentTransaction(transaction);
};

export const updateTransactionInvoiceNumber = async (id: string, invoiceNumberInput?: string | null) => {
  await getTransaction(id);

  const invoiceNumber = normalizeOptionalText(invoiceNumberInput);
  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      invoiceNumber,
      status: deriveStatusFromInvoiceNumber(invoiceNumber)
    }
  });

  return presentTransaction(transaction);
};

export const deleteTransaction = async (id: string, confirmTransmitted: boolean) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id }
  });

  if (!transaction) {
    throw new AppError("Transaction not found.", 404, "TRANSACTION_NOT_FOUND");
  }

  if (transaction.status === TransactionStatus.transmitted && !confirmTransmitted) {
    throw new AppError("Confirm deletion of transmitted transaction.", 409, "TRANSMITTED_TRANSACTION_DELETE_CONFIRMATION_REQUIRED");
  }

  await prisma.transaction.delete({
    where: { id }
  });
};
