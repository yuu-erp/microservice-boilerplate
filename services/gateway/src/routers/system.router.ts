import express, { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Collect default Prometheus metrics once per process
client.collectDefaultMetrics();

const systemRouter = express.Router();

systemRouter.get("/healthz", (_req: Request, res: Response) => res.json({ status: "ok" }));
systemRouter.get("/readyz", (_req: Request, res: Response) => res.json({ ready: true }));
systemRouter.get("/metrics", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    next(error);
  }
});

export default systemRouter;


