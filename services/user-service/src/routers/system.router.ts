import express from "express";
import client from "prom-client";

client.collectDefaultMetrics();

const router = express.Router();

router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
router.get("/readyz", (_req, res) => res.json({ ready: true }));
router.get("/metrics", async (_req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

export default router;


