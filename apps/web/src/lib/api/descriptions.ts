import { apiRequest } from "./client";

export type DescriptionStatus = "active" | "inactive";
export type SuggestedTransactionType = "entry" | "exit" | "refund";

export type Description = {
  id: string;
  name: string;
  suggestedType: SuggestedTransactionType | null;
  status: DescriptionStatus;
  createdAt: string;
  updatedAt: string;
};

type DescriptionsResponse = {
  descriptions: Description[];
};

type DescriptionResponse = {
  description: Description;
};

export const listDescriptions = async (status?: DescriptionStatus | "all") => {
  const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiRequest<DescriptionsResponse>(`/descriptions${query}`);

  return response.descriptions;
};

export const createDescription = async (input: { name: string; suggestedType?: SuggestedTransactionType }) => {
  const response = await apiRequest<DescriptionResponse>("/descriptions", {
    body: input,
    method: "POST"
  });

  return response.description;
};

export const updateDescription = async (
  id: string,
  input: { name: string; suggestedType: SuggestedTransactionType | null }
) => {
  const response = await apiRequest<DescriptionResponse>(`/descriptions/${id}`, {
    body: input,
    method: "PUT"
  });

  return response.description;
};

export const updateDescriptionStatus = async (id: string, status: DescriptionStatus) => {
  const response = await apiRequest<DescriptionResponse>(`/descriptions/${id}/status`, {
    body: {
      status
    },
    method: "PATCH"
  });

  return response.description;
};
