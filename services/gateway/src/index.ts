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
  app.listen(port, () => logger.info({ port }, "gateway started"));
}


import http from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

// HTTP middleware already set up above
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

// Metrics/health already added.

// JWT for HTTP (skip /auth/*)
app.use((req, res, next) => {
  if (req.path.startsWith("/auth")) return next();
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "missing token" });
  try {
    (req as any).user = jwt.verify(auth.replace("Bearer ", ""), process.env.JWT_SECRET || "secret");
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
});

// Proxies
app.use("/auth", createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL, changeOrigin: true }));
app.use("/users", createProxyMiddleware({ target: process.env.USER_SERVICE_URL, changeOrigin: true }));
app.use("/chats", createProxyMiddleware({ target: process.env.CHAT_SERVICE_URL, changeOrigin: true }));
app.use("/messages", createProxyMiddleware({ target: process.env.MESSAGE_SERVICE_URL, changeOrigin: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Redis adapter
const pubClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("unauthorized"));
  try {
    (socket as any).user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    next();
  } catch (e) { next(e as any); }
});

io.on("connection", (socket) => {
  socket.on("join", (chatId: string) => socket.join(chatId));
  socket.on("typing", (chatId: string) => io.to(chatId).emit("chat:typing", { chatId }));
});

const port = Number(process.env.PORT || 4000);
if (require.main === module) {
  server.listen(port, () => console.log("gateway started", port));
}
