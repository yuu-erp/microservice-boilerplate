import express from "express";
import helmet from "helmet";
import cors from "cors";
import client from "prom-client";

client.collectDefaultMetrics();

export const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
app.get("/readyz", (_req, res) => res.json({ ready: true }));
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const port = Number(process.env.PORT || 4000);
if (require.main === module) {
  app.listen(port, () => console.log("user-service started", port));
}
