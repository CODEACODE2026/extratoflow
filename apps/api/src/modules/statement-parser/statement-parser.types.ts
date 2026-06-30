import type { TransactionType } from "@prisma/client";

export type ParsedStatementTransaction = {
  paymentDate: string;
  type: TransactionType;
  payerName: string | null;
  descriptionText: string | null;
  amount: string;
  rawText: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
};

export type ParseStatementResult = {
  transactions: ParsedStatementTransaction[];
  ignoredLines: number;
  totalLines: number;
};
