import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import appConfig from "../config/app.config";

const router = express.Router();

router.use(
  "/auth",
  createProxyMiddleware({
    target: appConfig.authServiceUrl,
    changeOrigin: true,
    proxyTimeout: 10_000,
    onError: (err, _req, res) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad gateway", detail: err.message }));
    },
  })
);
export default router
