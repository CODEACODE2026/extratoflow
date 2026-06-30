import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";

export const notFoundMiddleware: RequestHandler = (request, _response, next) => {
  next(new AppError(`Route ${request.method} ${request.originalUrl} not found.`, 404, "ROUTE_NOT_FOUND"));
};
