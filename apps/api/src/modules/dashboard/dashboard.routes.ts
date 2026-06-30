import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate, requireRoles } from "../../http/middlewares/auth.middleware";
import { getDashboardMonthlyController, getDashboardSummaryController } from "./dashboard.controller";

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate, requireRoles(UserRole.admin, UserRole.operator, UserRole.viewer));

dashboardRoutes.get("/dashboard/summary", getDashboardSummaryController);
dashboardRoutes.get("/dashboard/monthly", getDashboardMonthlyController);
