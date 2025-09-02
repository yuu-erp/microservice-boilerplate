import { LoggerService } from "@shared/logger";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import config from "./config/app.config";
import systemRouter from "./routers/system.router";
import { errorHandler } from "./middlewares";

export const createApp = () => {
  const app = express();
  const logger = new LoggerService({ moduleName: "user-service", isDev: config.isDev, appName: "user-service" });

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
      methods: config.cors.methods,
      credentials: config.cors.credentials,
    })
  );

  app.use(logger.expressMiddleware?.() || ((req, res, next) => next()));

  app.use(systemRouter);

  app.use(errorHandler);

  return app;
};


