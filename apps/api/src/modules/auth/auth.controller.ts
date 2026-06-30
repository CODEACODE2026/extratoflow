import type { RequestHandler } from "express";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { getAuthCookieOptions, login } from "./auth.service";
import type { AuthenticatedUser } from "./auth.types";

export const loginController: RequestHandler = async (request, response, next) => {
  try {
    const { email, password } = request.body as { email?: string; password?: string };

    if (!email || !password) {
      throw new AppError("Email and password are required.", 400, "LOGIN_FIELDS_REQUIRED");
    }

    const result = await login({ email, password });

    response.cookie(env.authCookieName, result.token, getAuthCookieOptions());
    response.json({ user: result.user });
  } catch (error) {
    next(error);
  }
};

export const logoutController: RequestHandler = (_request, response) => {
  response.clearCookie(env.authCookieName, {
    path: "/"
  });

  response.status(204).send();
};

export const meController: RequestHandler = (_request, response) => {
  const currentUser = response.locals.currentUser as AuthenticatedUser;

  response.json({ user: currentUser });
};
