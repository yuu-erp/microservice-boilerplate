import express, { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import appConfig from "../config/app.config";
import client from "prom-client";

// Collect default Prometheus metrics once per process
const router = express.Router();
router.use(
  "/auth",
  createProxyMiddleware({
    target: appConfig.authServiceUrl,
    changeOrigin: true,
    proxyTimeout: 10_000,
  }),
);
router.get("/healthz", (_req: Request, res: Response) => res.json({ status: "ok" }));
router.get("/readyz", (_req: Request, res: Response) => res.json({ ready: true }));
router.get("/metrics", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    next(error);
  }
});
export default router;
