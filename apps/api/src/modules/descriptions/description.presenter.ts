import type { Description } from "@prisma/client";

export const presentDescription = (description: Description) => ({
  id: description.id,
  name: description.name,
  suggestedType: description.suggestedType,
  status: description.status,
  createdAt: description.createdAt,
  updatedAt: description.updatedAt
});
