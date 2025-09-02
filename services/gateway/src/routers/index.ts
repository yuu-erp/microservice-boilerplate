import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import appConfig from "../config/app.config";

const router = express.Router();

router.use("/auth", createProxyMiddleware({ target: appConfig.authServiceUrl, changeOrigin: true }));
export default router
