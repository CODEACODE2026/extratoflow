import { apiRequest } from "./client";

export type UserRole = "admin" | "operator" | "viewer";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthResponse = {
  user: AuthenticatedUser;
};

export const login = async (email: string, password: string) => {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    body: {
      email,
      password
    },
    method: "POST"
  });

  return response.user;
};

export const getCurrentUser = async () => {
  const response = await apiRequest<AuthResponse>("/auth/me");

  return response.user;
};

export const logout = async () => {
  await apiRequest<void>("/auth/logout", {
    method: "POST"
  });
};
