import { apiRequest } from "./client";
import type { TransactionType } from "./transactions";

export type ImportStatus = "processing" | "review_required" | "confirmed" | "failed";

export type StatementImport = {
  id: string;
  fileOriginalName: string;
  fileStoragePath: string;
  fileMimeType: string;
  fileSize: number;
  status: ImportStatus;
  userId: string;
  totalLinesRead: number;
  totalTransactionsDetected: number;
  totalTransactionsSaved: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportCandidate = {
  paymentDate: string;
  type: TransactionType;
  payerName: string | null;
  descriptionText: string | null;
  amount: string;
  rawText: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
};

export type ReviewedImportTransaction = {
  paymentDate: string;
  type: TransactionType;
  payerName: string | null;
  descriptionText: string | null;
  descriptionId?: string | null;
  amount: string;
  rawText: string | null;
};

type UploadImportResponse = {
  import: StatementImport;
  candidates: ImportCandidate[];
  ignoredLines: number;
};

type ListImportsResponse = {
  imports: StatementImport[];
};

type GetImportResponse = {
  import: StatementImport;
};

type ConfirmImportResponse = {
  import: StatementImport;
  savedTransactions: number;
};

export const uploadPdfImport = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadImportResponse>("/imports/pdf", {
    body: formData,
    method: "POST"
  });
};

export const listImports = async () => {
  const response = await apiRequest<ListImportsResponse>("/imports");

  return response.imports;
};

export const getImport = async (id: string) => {
  const response = await apiRequest<GetImportResponse>(`/imports/${id}`);

  return response.import;
};

export const confirmImport = async (importId: string, transactions: ReviewedImportTransaction[]) => {
  return apiRequest<ConfirmImportResponse>(`/imports/${importId}/confirm`, {
    body: {
      transactions
    },
    method: "POST"
  });
};
