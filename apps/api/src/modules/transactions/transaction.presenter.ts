import type { Transaction } from "@prisma/client";

export const presentTransaction = (transaction: Transaction) => ({
  id: transaction.id,
  importId: transaction.importId,
  paymentDate: transaction.paymentDate,
  type: transaction.type,
  payerName: transaction.payerName,
  descriptionText: transaction.descriptionText,
  descriptionId: transaction.descriptionId,
  amount: transaction.amount.toString(),
  invoiceNumber: transaction.invoiceNumber,
  status: transaction.status,
  source: transaction.source,
  rawText: transaction.rawText,
  dedupHash: transaction.dedupHash,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt
});
