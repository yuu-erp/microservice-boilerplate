import { LoggerService } from "@shared/logger";
import { applyCommonMiddlewares, createSystemRouter } from "@shared/express-bootstrap";
import express from "express";

import config from "./config/app.config";
import { errorHandler } from "./middlewares";

export const createApp = () => {
  const app = express();
  const logger = new LoggerService({ moduleName: "user-service", isDev: config.isDev, appName: "user-service" });

  applyCommonMiddlewares(app, { isDev: config.isDev, rateLimit: config.rateLimit, cors: config.cors });

  app.use(logger.expressMiddleware?.() || ((req, res, next) => next()));

  app.use(createSystemRouter());

  app.use(errorHandler);

  return app;
};


