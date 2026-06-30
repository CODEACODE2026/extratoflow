import { apiRequest } from "./client";

export type TransactionType = "entry" | "exit";
export type TransactionStatus = "pending" | "transmitted";

export type Transaction = {
  id: string;
  importId: string | null;
  paymentDate: string;
  type: TransactionType;
  payerName: string | null;
  descriptionText: string | null;
  descriptionId: string | null;
  amount: string;
  invoiceNumber: string | null;
  status: TransactionStatus;
  source: "pdf_import" | "manual";
  rawText: string | null;
  dedupHash: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionFilters = {
  month?: string;
  dateStart?: string;
  dateEnd?: string;
  status?: TransactionStatus | "all";
  type?: TransactionType | "all";
  payerName?: string;
  description?: string;
};

export type UpdateTransactionInput = {
  paymentDate: string;
  type: TransactionType;
  amount: string;
  payerName: string | null;
  descriptionText: string | null;
};

type ListTransactionsResponse = {
  transactions: Transaction[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  summary: {
    entryAmount: string;
    exitAmount: string;
    balanceAmount: string;
    pendingAmount: string;
    transmittedAmount: string;
  };
};

type TransactionResponse = {
  transaction: Transaction;
};

const toSearchParams = (filters: TransactionFilters) => {
  const params = new URLSearchParams({
    page: "1",
    perPage: "50"
  });

  if (filters.month) {
    params.set("month", filters.month);
  }

  if (filters.dateStart) {
    params.set("dateStart", filters.dateStart);
  }

  if (filters.dateEnd) {
    params.set("dateEnd", filters.dateEnd);
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.type && filters.type !== "all") {
    params.set("type", filters.type);
  }

  if (filters.payerName?.trim()) {
    params.set("payerName", filters.payerName.trim());
  }

  if (filters.description?.trim()) {
    params.set("description", filters.description.trim());
  }

  return params;
};

export const listTransactions = async (filters: TransactionFilters) => {
  return apiRequest<ListTransactionsResponse>(`/transactions?${toSearchParams(filters).toString()}`);
};

export const updateTransaction = async (id: string, input: UpdateTransactionInput) => {
  const response = await apiRequest<TransactionResponse>(`/transactions/${id}`, {
    body: input,
    method: "PUT"
  });

  return response.transaction;
};

export const applyInvoiceToTransaction = async (transactionId: string, invoiceNumber: string) => {
  const response = await apiRequest<TransactionResponse>(`/invoices/transactions/${transactionId}`, {
    body: {
      invoiceNumber
    },
    method: "POST"
  });

  return response.transaction;
};
