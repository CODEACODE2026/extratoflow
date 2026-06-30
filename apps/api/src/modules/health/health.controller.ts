import type { RequestHandler } from "express";

import { getHealthStatus } from "./health.service";

export const showHealth: RequestHandler = (_request, response) => {
  response.json(getHealthStatus());
};
