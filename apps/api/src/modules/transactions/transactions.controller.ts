import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
  updateTransactionDescription,
  updateTransactionInvoiceNumber
} from "./transactions.service";

const getRouteId = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid transaction id.", 400, "INVALID_TRANSACTION_ID");
  }

  return id;
};

const getQueryValue = (value: unknown) => (typeof value === "string" ? value : undefined);

export const listTransactionsController: RequestHandler = async (request, response, next) => {
  try {
    const result = await listTransactions({
      page: getQueryValue(request.query.page),
      perPage: getQueryValue(request.query.perPage),
      month: getQueryValue(request.query.month),
      dateStart: getQueryValue(request.query.dateStart),
      dateEnd: getQueryValue(request.query.dateEnd),
      type: getQueryValue(request.query.type),
      status: getQueryValue(request.query.status),
      payerName: getQueryValue(request.query.payerName),
      description: getQueryValue(request.query.description),
      valueMin: getQueryValue(request.query.valueMin),
      valueMax: getQueryValue(request.query.valueMax)
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTransactionController: RequestHandler = async (request, response, next) => {
  try {
    response.json({ transaction: await getTransaction(getRouteId(request.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const createTransactionController: RequestHandler = async (request, response, next) => {
  try {
    response.status(201).json({
      transaction: await createTransaction(request.body)
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionController: RequestHandler = async (request, response, next) => {
  try {
    response.json({
      transaction: await updateTransaction(getRouteId(request.params.id), request.body)
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionDescriptionController: RequestHandler = async (request, response, next) => {
  try {
    const { descriptionId, descriptionText } = request.body as {
      descriptionId?: string | null;
      descriptionText?: string | null;
    };

    response.json({
      transaction: await updateTransactionDescription(getRouteId(request.params.id), descriptionId, descriptionText)
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionInvoiceNumberController: RequestHandler = async (request, response, next) => {
  try {
    const { invoiceNumber } = request.body as { invoiceNumber?: string | null };

    response.json({
      transaction: await updateTransactionInvoiceNumber(getRouteId(request.params.id), invoiceNumber)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransactionController: RequestHandler = async (request, response, next) => {
  try {
    const confirmTransmitted = request.query.confirmTransmitted === "true";

    await deleteTransaction(getRouteId(request.params.id), confirmTransmitted);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};
