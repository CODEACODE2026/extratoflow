import { Prisma, RecordStatus, SuggestedTransactionType } from "@prisma/client";

import { prisma } from "../../database/prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { presentDescription } from "./description.presenter";

type CreateDescriptionInput = {
  name: string;
  suggestedType?: SuggestedTransactionType;
};

type UpdateDescriptionInput = {
  name?: string;
  suggestedType?: SuggestedTransactionType | null;
};

const normalizeName = (name: string) => name.trim();

const parseSuggestedType = (suggestedType: string | null | undefined) => {
  if (suggestedType === null || suggestedType === undefined || suggestedType === "") {
    return suggestedType === null ? null : undefined;
  }

  if (!Object.values(SuggestedTransactionType).includes(suggestedType as SuggestedTransactionType)) {
    throw new AppError("Invalid suggested transaction type.", 400, "INVALID_SUGGESTED_TYPE");
  }

  return suggestedType as SuggestedTransactionType;
};

const parseStatus = (status: string) => {
  if (!Object.values(RecordStatus).includes(status as RecordStatus)) {
    throw new AppError("Invalid description status.", 400, "INVALID_DESCRIPTION_STATUS");
  }

  return status as RecordStatus;
};

const ensureDescriptionName = (name: string) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    throw new AppError("Description name is required.", 400, "DESCRIPTION_NAME_REQUIRED");
  }

  return normalizedName;
};

const findDescriptionByName = (name: string) => {
  return prisma.description.findFirst({
    where: {
      name: normalizeName(name)
    }
  });
};

export const listDescriptions = async (status?: string) => {
  const descriptions = await prisma.description.findMany({
    where: status ? { status: parseStatus(status) } : undefined,
    orderBy: [{ name: "asc" }]
  });

  return descriptions.map(presentDescription);
};

export const getDescription = async (id: string) => {
  const description = await prisma.description.findUnique({
    where: { id }
  });

  if (!description) {
    throw new AppError("Description not found.", 404, "DESCRIPTION_NOT_FOUND");
  }

  return presentDescription(description);
};

export const createDescription = async (input: CreateDescriptionInput) => {
  const name = ensureDescriptionName(input.name);
  const existingDescription = await findDescriptionByName(name);

  if (existingDescription) {
    throw new AppError("Description already registered.", 409, "DESCRIPTION_ALREADY_EXISTS");
  }

  const description = await prisma.description.create({
    data: {
      name,
      suggestedType: input.suggestedType
    }
  });

  return presentDescription(description);
};

export const updateDescription = async (id: string, input: UpdateDescriptionInput) => {
  await getDescription(id);

  const data: Prisma.DescriptionUpdateInput = {};

  if (input.name !== undefined) {
    const name = ensureDescriptionName(input.name);
    const existingDescription = await findDescriptionByName(name);

    if (existingDescription && existingDescription.id !== id) {
      throw new AppError("Description already registered.", 409, "DESCRIPTION_ALREADY_EXISTS");
    }

    data.name = name;
  }

  if (input.suggestedType !== undefined) {
    data.suggestedType = input.suggestedType;
  }

  const description = await prisma.description.update({
    where: { id },
    data
  });

  return presentDescription(description);
};

export const updateDescriptionStatus = async (id: string, status: string) => {
  await getDescription(id);

  const description = await prisma.description.update({
    where: { id },
    data: {
      status: parseStatus(status)
    }
  });

  return presentDescription(description);
};

export const parseDescriptionSuggestedType = parseSuggestedType;
