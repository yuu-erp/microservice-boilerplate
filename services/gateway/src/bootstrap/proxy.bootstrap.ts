import { INestApplication } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyConfig } from '../config/proxy.config';

/**
 * Cấu hình proxy middleware
 * Trách nhiệm: Định tuyến yêu cầu (Request Routing), Hỗ trợ WebSocket & Streaming
 */
export function configureProxy(app: INestApplication): void {
  for (const [path, config] of Object.entries(proxyConfig)) {
    if (!config.target) {
      console.warn(
        `[Gateway] ${path} target URL is not defined, skipping proxy`,
      );
      continue;
    }

    console.log(`[Gateway] Configuring proxy for ${path} -> ${config.target}`);

    app.use(
      path,
      createProxyMiddleware({
        target: config.target,
        changeOrigin: true,
        xfwd: true,
        ws: config.ws || false,
        pathRewrite: config.pathRewrite,
        timeout: config.timeout || 30000,
        proxyTimeout: config.timeout || 30000,
      }),
    );
  }
}
