import dotenv from "dotenv";

dotenv.config();

const parsePort = (value: string | undefined, fallback: number) => {
  const port = Number(value ?? fallback);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("API_PORT must be a valid TCP port.");
  }

  return port;
};

const parseWebOrigin = (value: string | undefined) => {
  const origin = value ?? "http://localhost:5173";

  try {
    new URL(origin);
  } catch {
    throw new Error("WEB_ORIGIN must be a valid URL.");
  }

  return origin;
};

const parseDatabaseUrl = (value: string | undefined) => {
  if (!value) {
    return "mysql://extratoflow_user:change_me@localhost:3306/extratoflow";
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "mysql:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw new Error("DATABASE_URL must be a valid MySQL connection URL.");
  }

  return value;
};

const parseJwtSecret = (value: string | undefined, nodeEnv: string) => {
  if (value) {
    return value;
  }

  if (nodeEnv === "production") {
    throw new Error("JWT_SECRET is required in production.");
  }

  return "dev-only-extratoflow-secret";
};

const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  nodeEnv,
  port: parsePort(process.env.API_PORT, 3333),
  webOrigin: parseWebOrigin(process.env.WEB_ORIGIN),
  databaseUrl: parseDatabaseUrl(process.env.DATABASE_URL),
  jwtSecret: parseJwtSecret(process.env.JWT_SECRET, nodeEnv),
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "extratoflow_token"
};
