import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import {
  createDescription,
  getDescription,
  listDescriptions,
  parseDescriptionSuggestedType,
  updateDescription,
  updateDescriptionStatus
} from "./descriptions.service";

const getRouteId = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid description id.", 400, "INVALID_DESCRIPTION_ID");
  }

  return id;
};

export const listDescriptionsController: RequestHandler = async (request, response, next) => {
  try {
    const status = typeof request.query.status === "string" ? request.query.status : undefined;

    response.json({ descriptions: await listDescriptions(status) });
  } catch (error) {
    next(error);
  }
};

export const getDescriptionController: RequestHandler = async (request, response, next) => {
  try {
    response.json({ description: await getDescription(getRouteId(request.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const createDescriptionController: RequestHandler = async (request, response, next) => {
  try {
    const { name, suggestedType } = request.body as {
      name?: string;
      suggestedType?: string;
    };

    const description = await createDescription({
      name: name ?? "",
      suggestedType: parseDescriptionSuggestedType(suggestedType) ?? undefined
    });

    response.status(201).json({ description });
  } catch (error) {
    next(error);
  }
};

export const updateDescriptionController: RequestHandler = async (request, response, next) => {
  try {
    const { name, suggestedType } = request.body as {
      name?: string;
      suggestedType?: string | null;
    };

    response.json({
      description: await updateDescription(getRouteId(request.params.id), {
        name,
        suggestedType: parseDescriptionSuggestedType(suggestedType)
      })
    });
  } catch (error) {
    next(error);
  }
};

export const updateDescriptionStatusController: RequestHandler = async (request, response, next) => {
  try {
    const { status } = request.body as { status?: string };

    response.json({
      description: await updateDescriptionStatus(getRouteId(request.params.id), status ?? "")
    });
  } catch (error) {
    next(error);
  }
};
