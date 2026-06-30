import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RecordStatus } from "@prisma/client";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import type { AuthenticatedUser, LoginInput } from "./auth.types";
import { findActiveUserById, findUserByEmail } from "../users/users.service";

type AuthTokenPayload = {
  sub: string;
};

const TOKEN_EXPIRES_IN = "8h";

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.nodeEnv === "production",
  path: "/",
  maxAge: 8 * 60 * 60 * 1000
});

export const createAuthToken = (user: AuthenticatedUser) => {
  return jwt.sign({ sub: user.id }, env.jwtSecret, {
    expiresIn: TOKEN_EXPIRES_IN
  });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error("Invalid token payload");
    }

    return { sub: payload.sub };
  } catch {
    throw new AppError("Invalid or expired session.", 401, "INVALID_SESSION");
  }
};

export const login = async (input: LoginInput) => {
  const user = await findUserByEmail(input.email);

  if (!user || user.status !== RecordStatus.active) {
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return {
    token: createAuthToken(authenticatedUser),
    user: authenticatedUser
  };
};

export const getAuthenticatedUser = async (token: string) => {
  const payload = verifyAuthToken(token);
  const user = await findActiveUserById(payload.sub);

  if (!user) {
    throw new AppError("Invalid or expired session.", 401, "INVALID_SESSION");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};
