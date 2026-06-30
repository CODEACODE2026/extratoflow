import { Router } from "express";

import { showHealth } from "../../modules/health/health.controller";

export const healthRoutes = Router();

healthRoutes.get("/health", showHealth);
