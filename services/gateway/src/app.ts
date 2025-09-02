import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import config from "./config/app.config";
import { errorHandler } from "./middlewares";
import apiRouter from "./routers";
import systemRouter from "./routers/system.router";

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: { error: "Too many requests, please try again later" },
    })
  );
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  // System routes
  app.use(systemRouter);

  // API routes
  app.use("/api/v1", apiRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
};


