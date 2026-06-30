import type { ErrorRequestHandler } from "express";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import type { HttpErrorResponse } from "../../shared/errors/http-error-response";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const requestId = response.locals.requestId as string | undefined;

  if (error instanceof AppError) {
    const body: HttpErrorResponse = {
      code: error.code,
      message: error.message,
      requestId
    };

    response.status(error.statusCode).json(body);
    return;
  }

  const body: HttpErrorResponse = {
    code: "INTERNAL_SERVER_ERROR",
    message: env.nodeEnv === "production" ? "Internal server error." : error instanceof Error ? error.message : "Unexpected error.",
    requestId
  };

  response.status(500).json(body);
};
