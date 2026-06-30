import type { Import } from "@prisma/client";

export const presentImport = (statementImport: Import) => ({
  id: statementImport.id,
  fileOriginalName: statementImport.fileOriginalName,
  fileStoragePath: statementImport.fileStoragePath,
  fileMimeType: statementImport.fileMimeType,
  fileSize: statementImport.fileSize,
  status: statementImport.status,
  userId: statementImport.userId,
  totalLinesRead: statementImport.totalLinesRead,
  totalTransactionsDetected: statementImport.totalTransactionsDetected,
  totalTransactionsSaved: statementImport.totalTransactionsSaved,
  errorMessage: statementImport.errorMessage,
  createdAt: statementImport.createdAt,
  updatedAt: statementImport.updatedAt
});
