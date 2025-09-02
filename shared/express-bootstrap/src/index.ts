import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import client from "prom-client";

type CorsOrigin = string | string[];

export interface CommonConfig {
  isDev: boolean;
  rateLimit: { windowMs: number; max: number };
  cors: { origin: CorsOrigin; methods: string[]; credentials: boolean };
}

export const applyCommonMiddlewares = (app: Express, config: CommonConfig) => {
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
    cors({ origin: config.cors.origin, methods: config.cors.methods, credentials: config.cors.credentials })
  );
};

export const createSystemRouter = () => {
  client.collectDefaultMetrics();
  const router = express.Router();
  router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
  router.get("/readyz", (_req, res) => res.json({ ready: true }));
  router.get("/metrics", async (_req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });
  return router;
};


