import express from "express";
import pinoHttp from "pino-http";
import helmet from "helmet";
import cors from "cors";
import client from "prom-client";
import { loadEnv } from "@shared/config";
import { logger } from "@shared/logger";
import { initOtel } from "@shared/otel";

const env = loadEnv(process.env);
initOtel(process.env.SERVICE_NAME || "service", process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
client.collectDefaultMetrics();

export const app = express();
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
app.get("/readyz", (_req, res) => res.json({ ready: true }));
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const port = Number(env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => logger.info({ port }, "user-service started"));
}


import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

app.get("/users/me", async (req: any, res) => {
  const userId = req.headers["x-user-id"] || req.user?.sub;
  if (!userId) return res.status(401).json({ error: "unauthorized" });
  const profile = await prisma.profile.findUnique({ where: { userId: String(userId) } });
  res.json(profile || {});
});

app.patch("/users/me", async (req: any, res) => {
  const userId = req.headers["x-user-id"] || req.user?.sub;
  if (!userId) return res.status(401).json({ error: "unauthorized" });
  const { displayName, avatarUrl } = req.body || {};
  const profile = await prisma.profile.upsert({
    where: { userId: String(userId) },
    update: { displayName, avatarUrl },
    create: { userId: String(userId), displayName, avatarUrl }
  });
  res.json(profile);
});
