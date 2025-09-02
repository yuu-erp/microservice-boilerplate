import express, { Express } from "express";
import config from "./config/app.config";
import { errorHandler } from "./middlewares";
import apiRouter from "./routers";
import { applyCommonMiddlewares, createSystemRouter } from "@shared/express-bootstrap";

export const createApp = (): Express => {
  const app = express();

  applyCommonMiddlewares(app, {
    isDev: config.isDev,
    rateLimit: config.rateLimit,
    cors: { origin: config.cors.origin, methods: ["GET", "POST", "PUT", "DELETE"], credentials: true },
  });

  // System routes
  app.use(createSystemRouter());

  // API routes
  app.use("/api/v1", apiRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
};


