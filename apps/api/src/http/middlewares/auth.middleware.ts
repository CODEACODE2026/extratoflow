import type { RequestHandler } from "express";
import type { UserRole } from "@prisma/client";

import { env } from "../../config/env";
import { getAuthenticatedUser } from "../../modules/auth/auth.service";
import type { AuthenticatedUser } from "../../modules/auth/auth.types";
import { AppError } from "../../shared/errors/app-error";

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return undefined;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
};

export const authenticate: RequestHandler = async (request, response, next) => {
  try {
    const token = request.cookies?.[env.authCookieName] ?? getBearerToken(request.header("authorization"));

    if (!token) {
      throw new AppError("Authentication required.", 401, "AUTHENTICATION_REQUIRED");
    }

    response.locals.currentUser = await getAuthenticatedUser(token);

    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles =
  (...roles: UserRole[]): RequestHandler =>
  (_request, response, next) => {
    const currentUser = response.locals.currentUser as AuthenticatedUser | undefined;

    if (!currentUser) {
      next(new AppError("Authentication required.", 401, "AUTHENTICATION_REQUIRED"));
      return;
    }

    if (!roles.includes(currentUser.role)) {
      next(new AppError("Permission denied.", 403, "PERMISSION_DENIED"));
      return;
    }

    next();
  };
