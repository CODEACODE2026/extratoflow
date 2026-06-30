import { apiRequest } from "./client";
import type { Transaction, TransactionType } from "./transactions";

export type BulkInvoiceFilters = {
  month: string;
  type?: TransactionType | "";
  payerName?: string;
  description?: string;
};

export type BulkInvoicePreview = {
  invoiceNumber: string;
  affectedCount: number;
  totalAmount: string;
  transactions: Transaction[];
};

export type BulkInvoiceResult = {
  invoiceNumber: string;
  affectedCount: number;
  totalAmount: string;
};

const normalizeFilters = (filters: BulkInvoiceFilters) => ({
  month: filters.month,
  ...(filters.type ? { type: filters.type } : {}),
  ...(filters.payerName?.trim() ? { payerName: filters.payerName.trim() } : {}),
  ...(filters.description?.trim() ? { description: filters.description.trim() } : {})
});

export const prepareBulkInvoice = async (invoiceNumber: string, filters: BulkInvoiceFilters) => {
  return apiRequest<BulkInvoicePreview>("/invoices/bulk-prepare", {
    body: {
      invoiceNumber,
      filters: normalizeFilters(filters)
    },
    method: "POST"
  });
};

export const applyBulkInvoice = async (invoiceNumber: string, transactionIds: string[], descriptionText?: string) => {
  return apiRequest<BulkInvoiceResult>("/invoices/bulk-apply", {
    body: {
      confirm: true,
      ...(descriptionText?.trim() ? { descriptionText: descriptionText.trim() } : {}),
      invoiceNumber,
      transactionIds
    },
    method: "POST"
  });
};
