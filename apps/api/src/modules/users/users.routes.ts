import { UserRole } from "@prisma/client";
import { Router } from "express";

import { authenticate, requireRoles } from "../../http/middlewares/auth.middleware";
import {
  createUserController,
  getUserController,
  listUsersController,
  updateUserController,
  updateUserStatusController
} from "./users.controller";

export const usersRoutes = Router();

usersRoutes.use(authenticate, requireRoles(UserRole.admin));

usersRoutes.get("/users", listUsersController);
usersRoutes.post("/users", createUserController);
usersRoutes.get("/users/:id", getUserController);
usersRoutes.put("/users/:id", updateUserController);
usersRoutes.patch("/users/:id/status", updateUserStatusController);
