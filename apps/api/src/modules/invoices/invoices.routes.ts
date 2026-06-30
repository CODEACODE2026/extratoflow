import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate, requireRoles } from "../../http/middlewares/auth.middleware";
import { applyBulkInvoiceController, applyIndividualInvoiceController, prepareBulkInvoiceController } from "./invoices.controller";

export const invoicesRoutes = Router();

invoicesRoutes.use(authenticate, requireRoles(UserRole.admin, UserRole.operator));

invoicesRoutes.post("/invoices/transactions/:transactionId", applyIndividualInvoiceController);
invoicesRoutes.post("/invoices/bulk-prepare", prepareBulkInvoiceController);
invoicesRoutes.post("/invoices/bulk-apply", applyBulkInvoiceController);
