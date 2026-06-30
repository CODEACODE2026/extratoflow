import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate, requireRoles } from "../../http/middlewares/auth.middleware";
import { pdfUpload } from "../../shared/storage/pdf-upload";
import { confirmImportController, getImportController, listImportsController, uploadPdfImportController } from "./imports.controller";

export const importsRoutes = Router();

importsRoutes.use(authenticate);

importsRoutes.get("/imports", requireRoles(UserRole.admin, UserRole.operator, UserRole.viewer), listImportsController);
importsRoutes.get("/imports/:id", requireRoles(UserRole.admin, UserRole.operator, UserRole.viewer), getImportController);
importsRoutes.post("/imports/pdf", requireRoles(UserRole.admin, UserRole.operator), pdfUpload.single("file"), uploadPdfImportController);
importsRoutes.post("/imports/:id/confirm", requireRoles(UserRole.admin, UserRole.operator), confirmImportController);
