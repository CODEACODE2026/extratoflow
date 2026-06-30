import { env } from "../../config/env";

export const getHealthStatus = () => ({
  status: "ok",
  service: "extratoflow-api",
  environment: env.nodeEnv,
  uptimeSeconds: Math.round(process.uptime()),
  timestamp: new Date().toISOString()
});
