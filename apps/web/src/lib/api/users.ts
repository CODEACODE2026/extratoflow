import { apiRequest } from "./client";

export type UserRole = "admin" | "operator" | "viewer";
export type UserStatus = "active" | "inactive";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

type UsersResponse = {
  users: User[];
};

type UserResponse = {
  user: User;
};

export const listUsers = async () => {
  const response = await apiRequest<UsersResponse>("/users");

  return response.users;
};

export const createUser = async (input: { name: string; email: string; password: string; role: UserRole }) => {
  const response = await apiRequest<UserResponse>("/users", {
    body: input,
    method: "POST"
  });

  return response.user;
};

export const updateUser = async (
  id: string,
  input: { name: string; email: string; role: UserRole; password?: string }
) => {
  const response = await apiRequest<UserResponse>(`/users/${id}`, {
    body: input,
    method: "PUT"
  });

  return response.user;
};

export const updateUserStatus = async (id: string, status: UserStatus) => {
  const response = await apiRequest<UserResponse>(`/users/${id}/status`, {
    body: {
      status
    },
    method: "PATCH"
  });

  return response.user;
};
