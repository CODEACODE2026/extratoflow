import { Router } from "express";

import { authenticate } from "../../http/middlewares/auth.middleware";
import { loginController, logoutController, meController } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/auth/login", loginController);
authRoutes.post("/auth/logout", logoutController);
authRoutes.get("/auth/me", authenticate, meController);
