import { ImportStatus, Prisma, TransactionSource, TransactionStatus, TransactionType } from "@prisma/client";

import { prisma } from "../../database/prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { extractTextFromPdf } from "../statement-parser/pdf-text-extractor";
import { parseStatementText } from "../statement-parser/statement-text-parser";
import { presentImport } from "./import.presenter";

type UploadedPdf = {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
};

type CreatePdfImportInput = {
  file: UploadedPdf;
  userId: string;
};

type ConfirmImportTransactionInput = {
  paymentDate: string;
  type: string;
  payerName?: string | null;
  descriptionText?: string | null;
  descriptionId?: string | null;
  amount: string | number;
  rawText?: string | null;
};

type ConfirmImportInput = {
  importId: string;
  userId: string;
  transactions: ConfirmImportTransactionInput[];
};

const parseDate = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime())) {
    throw new AppError("paymentDate must use YYYY-MM-DD format.", 400, "INVALID_PAYMENT_DATE");
  }

  return date;
};

const parseType = (type: string) => {
  if (!Object.values(TransactionType).includes(type as TransactionType)) {
    throw new AppError("Invalid transaction type.", 400, "INVALID_TRANSACTION_TYPE");
  }

  return type as TransactionType;
};

const parseAmount = (value: string | number) => {
  const decimal = new Prisma.Decimal(value);

  if (decimal.isNaN() || decimal.lessThanOrEqualTo(0)) {
    throw new AppError("amount must be greater than zero.", 400, "INVALID_AMOUNT");
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

export const listImports = async () => {
  const imports = await prisma.import.findMany({
    orderBy: [{ createdAt: "desc" }]
  });

  return imports.map(presentImport);
};

export const getImport = async (id: string) => {
  const statementImport = await prisma.import.findUnique({
    where: { id }
  });

  if (!statementImport) {
    throw new AppError("Import not found.", 404, "IMPORT_NOT_FOUND");
  }

  return presentImport(statementImport);
};

export const createPdfImport = async ({ file, userId }: CreatePdfImportInput) => {
  const statementImport = await prisma.import.create({
    data: {
      fileOriginalName: file.originalname,
      fileStoragePath: file.path,
      fileMimeType: file.mimetype,
      fileSize: file.size,
      status: ImportStatus.processing,
      userId
    }
  });

  try {
    const text = await extractTextFromPdf(file.path);
    const parsed = parseStatementText(text);

    const updatedImport = await prisma.import.update({
      where: { id: statementImport.id },
      data: {
        status: ImportStatus.review_required,
        totalLinesRead: parsed.totalLines,
        totalTransactionsDetected: parsed.transactions.length
      }
    });

    return {
      import: presentImport(updatedImport),
      candidates: parsed.transactions,
      ignoredLines: parsed.ignoredLines
    };
  } catch (error) {
    await prisma.import.update({
      where: { id: statementImport.id },
      data: {
        status: ImportStatus.failed,
        errorMessage: error instanceof Error ? error.message : "Falha ao processar PDF."
      }
    });

    throw error;
  }
};

export const confirmImport = async ({ importId, userId, transactions }: ConfirmImportInput) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new AppError("At least one reviewed transaction is required.", 400, "IMPORT_TRANSACTIONS_REQUIRED");
  }

  const statementImport = await prisma.import.findUnique({
    where: { id: importId }
  });

  if (!statementImport) {
    throw new AppError("Import not found.", 404, "IMPORT_NOT_FOUND");
  }

  if (statementImport.status === ImportStatus.confirmed) {
    throw new AppError("Import already confirmed.", 409, "IMPORT_ALREADY_CONFIRMED");
  }

  const data = transactions.map((transaction) => ({
    importId,
    paymentDate: parseDate(transaction.paymentDate),
    type: parseType(transaction.type),
    payerName: normalizeOptionalText(transaction.payerName),
    descriptionText: normalizeOptionalText(transaction.descriptionText),
    descriptionId: normalizeOptionalText(transaction.descriptionId),
    amount: parseAmount(transaction.amount),
    invoiceNumber: null,
    status: TransactionStatus.pending,
    source: TransactionSource.pdf_import,
    rawText: normalizeOptionalText(transaction.rawText)
  }));

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.transaction.createMany({
      data
    });

    const updatedImport = await transactionClient.import.update({
      where: { id: importId },
      data: {
        status: ImportStatus.confirmed,
        totalTransactionsSaved: data.length
      }
    });

    await transactionClient.auditLog.create({
      data: {
        userId,
        entity: "import",
        entityId: importId,
        action: "confirm_import",
        summary: {
          savedTransactions: data.length
        }
      }
    });

    return updatedImport;
  });

  return {
    import: presentImport(result),
    savedTransactions: data.length
  };
};
