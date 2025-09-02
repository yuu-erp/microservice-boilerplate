import { LoggerService } from '@shared/logger';
import cors from "cors";
import express, { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import client from "prom-client";
import appConfig from "./config/app.config";
import { errorHandler } from "./middlewares";
import router from "./routers";

// Initialize Express app
const app: Express = express();
const isDev = process.env.NODE_ENV !== "production";
const logger = new LoggerService({ moduleName: "App", isDev });

const PORT = appConfig.port
// Collect default Prometheus metrics
client.collectDefaultMetrics();


if (isNaN(PORT)) {
  logger.error("Invalid PORT environment variable");
  process.exit(1);
}

// Middleware
app.use(rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  message: { error: "Too many requests, please try again later" },
}));
app.use(logger.expressMiddleware());
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*", // Allow specific origins
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Health and readiness endpoints
router.get("/healthz", (_req: Request, res: Response) => res.json({ status: "ok" }));
router.get("/readyz", (_req: Request, res: Response) => res.json({ ready: true }));
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    logger.error(error as Error);
    res.status(500).json({ error: "Failed to retrieve metrics" });
  }
});
// Global error handling middleware
router.use(errorHandler);

// API routes
app.use("/api/v1", router);

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`Gateway started on port ${PORT}`);
});

// Handle termination signals
const shutdown = () => {
  logger.info("Shutting down server...");
  server.close(() => {
    logger.info("Server shut down gracefully");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Export for testing or module usage
export default app;
