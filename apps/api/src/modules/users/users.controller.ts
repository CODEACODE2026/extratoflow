import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";
import { createUser, getUser, listUsers, parseUserRole, updateUser, updateUserStatus } from "./users.service";

const getRouteId = (id: string | string[] | undefined) => {
  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid user id.", 400, "INVALID_USER_ID");
  }

  return id;
};

export const listUsersController: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ users: await listUsers() });
  } catch (error) {
    next(error);
  }
};

export const getUserController: RequestHandler = async (request, response, next) => {
  try {
    response.json({ user: await getUser(getRouteId(request.params.id)) });
  } catch (error) {
    next(error);
  }
};

export const createUserController: RequestHandler = async (request, response, next) => {
  try {
    const { name, email, password, role } = request.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const user = await createUser({
      name: name ?? "",
      email: email ?? "",
      password: password ?? "",
      role: parseUserRole(role)
    });

    response.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUserController: RequestHandler = async (request, response, next) => {
  try {
    const { name, email, password, role } = request.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    response.json({
      user: await updateUser(getRouteId(request.params.id), {
        name,
        email,
        password,
        role: parseUserRole(role)
      })
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatusController: RequestHandler = async (request, response, next) => {
  try {
    const { status } = request.body as { status?: string };

    response.json({
      user: await updateUserStatus(getRouteId(request.params.id), status ?? "")
    });
  } catch (error) {
    next(error);
  }
};
