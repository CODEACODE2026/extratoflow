import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate, requireRoles } from "../../http/middlewares/auth.middleware";
import {
  createTransactionController,
  deleteTransactionController,
  getTransactionController,
  listTransactionsController,
  updateTransactionController,
  updateTransactionDescriptionController,
  updateTransactionInvoiceNumberController
} from "./transactions.controller";

export const transactionsRoutes = Router();

transactionsRoutes.use(authenticate);

transactionsRoutes.get("/transactions", requireRoles(UserRole.admin, UserRole.operator, UserRole.viewer), listTransactionsController);
transactionsRoutes.get("/transactions/:id", requireRoles(UserRole.admin, UserRole.operator, UserRole.viewer), getTransactionController);
transactionsRoutes.post("/transactions", requireRoles(UserRole.admin, UserRole.operator), createTransactionController);
transactionsRoutes.put("/transactions/:id", requireRoles(UserRole.admin, UserRole.operator), updateTransactionController);
transactionsRoutes.patch(
  "/transactions/:id/description",
  requireRoles(UserRole.admin, UserRole.operator),
  updateTransactionDescriptionController
);
transactionsRoutes.patch(
  "/transactions/:id/invoice-number",
  requireRoles(UserRole.admin, UserRole.operator),
  updateTransactionInvoiceNumberController
);
transactionsRoutes.delete("/transactions/:id", requireRoles(UserRole.admin, UserRole.operator), deleteTransactionController);
