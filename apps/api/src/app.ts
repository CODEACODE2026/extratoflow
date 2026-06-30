import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env";
import { errorMiddleware } from "./http/middlewares/error.middleware";
import { notFoundMiddleware } from "./http/middlewares/not-found.middleware";
import { requestIdMiddleware } from "./http/middlewares/request-id.middleware";
import { healthRoutes } from "./http/routes/health.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { descriptionsRoutes } from "./modules/descriptions/descriptions.routes";
import { importsRoutes } from "./modules/imports/imports.routes";
import { invoicesRoutes } from "./modules/invoices/invoices.routes";
import { transactionsRoutes } from "./modules/transactions/transactions.routes";
import { usersRoutes } from "./modules/users/users.routes";

export const app = express();

app.disable("x-powered-by");

app.use(requestIdMiddleware);
app.use(cors({ origin: env.webOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", healthRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", descriptionsRoutes);
app.use("/api/v1", transactionsRoutes);
app.use("/api/v1", importsRoutes);
app.use("/api/v1", invoicesRoutes);
app.use("/api/v1", dashboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
