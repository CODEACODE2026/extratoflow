import type { RequestHandler } from "express";

import type { AuthenticatedUser } from "../auth/auth.types";
import { AppError } from "../../shared/errors/app-error";
import { applyBulkInvoice, applyInvoiceToTransaction, prepareBulkInvoice } from "./invoices.service";

const getRouteId = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid transaction id.", 400, "INVALID_TRANSACTION_ID");
  }

  return id;
};

export const applyIndividualInvoiceController: RequestHandler = async (request, response, next) => {
  try {
    const currentUser = response.locals.currentUser as AuthenticatedUser;
    const { invoiceNumber } = request.body as { invoiceNumber?: string };

    response.json({
      transaction: await applyInvoiceToTransaction(getRouteId(request.params.transactionId), invoiceNumber ?? "", currentUser.id)
    });
  } catch (error) {
    next(error);
  }
};

export const prepareBulkInvoiceController: RequestHandler = async (request, response, next) => {
  try {
    const { invoiceNumber, filters } = request.body as {
      invoiceNumber?: string;
      filters?: {
        month?: string;
        type?: string;
        payerName?: string;
        description?: string;
      };
    };

    response.json(
      await prepareBulkInvoice({
        invoiceNumber: invoiceNumber ?? "",
        filters: filters ?? {}
      })
    );
  } catch (error) {
    next(error);
  }
};

export const applyBulkInvoiceController: RequestHandler = async (request, response, next) => {
  try {
    const currentUser = response.locals.currentUser as AuthenticatedUser;
    const { invoiceNumber, descriptionText, confirm, transactionIds, filters } = request.body as {
      invoiceNumber?: string;
      descriptionText?: string;
      confirm?: boolean;
      transactionIds?: string[];
      filters?: {
        month?: string;
        type?: string;
        payerName?: string;
        description?: string;
      };
    };

    response.json(
      await applyBulkInvoice({
        userId: currentUser.id,
        invoiceNumber: invoiceNumber ?? "",
        descriptionText,
        confirm: confirm === true,
        transactionIds,
        filters
      })
    );
  } catch (error) {
    next(error);
  }
};
