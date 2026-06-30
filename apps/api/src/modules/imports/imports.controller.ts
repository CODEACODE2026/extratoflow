import type { RequestHandler } from "express";

import type { AuthenticatedUser } from "../auth/auth.types";
import { AppError } from "../../shared/errors/app-error";
import { confirmImport, createPdfImport, getImport, listImports } from "./imports.service";

const getRouteId = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid import id.", 400, "INVALID_IMPORT_ID");
  }

  return id;
};

export const uploadPdfImportController: RequestHandler = async (request, response, next) => {
  try {
    const currentUser = response.locals.currentUser as AuthenticatedUser;

    if (!request.file) {
      throw new AppError("PDF file is required.", 400, "PDF_FILE_REQUIRED");
    }

    const result = await createPdfImport({
      file: request.file,
      userId: currentUser.id
    });

    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const listImportsController: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ imports: await listImports() });
  } catch (error) {
    next(error);
  }
};

export const getImportController: RequestHandler = async (request, response, next) => {
  try {
    response.json({ import: await getImport(getRouteId(request.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const confirmImportController: RequestHandler = async (request, response, next) => {
  try {
    const currentUser = response.locals.currentUser as AuthenticatedUser;
    const { transactions } = request.body as { transactions?: unknown[] };

    response.json(
      await confirmImport({
        importId: getRouteId(request.params.id),
        userId: currentUser.id,
        transactions: transactions as never
      })
    );
  } catch (error) {
    next(error);
  }
};
