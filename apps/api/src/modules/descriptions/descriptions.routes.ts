import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate, requireRoles } from "../../http/middlewares/auth.middleware";
import {
  createDescriptionController,
  getDescriptionController,
  listDescriptionsController,
  updateDescriptionController,
  updateDescriptionStatusController
} from "./descriptions.controller";

export const descriptionsRoutes = Router();

descriptionsRoutes.use(authenticate, requireRoles(UserRole.admin, UserRole.operator));

descriptionsRoutes.get("/descriptions", listDescriptionsController);
descriptionsRoutes.post("/descriptions", createDescriptionController);
descriptionsRoutes.get("/descriptions/:id", getDescriptionController);
descriptionsRoutes.put("/descriptions/:id", updateDescriptionController);
descriptionsRoutes.patch("/descriptions/:id/status", updateDescriptionStatusController);
