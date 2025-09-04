export interface ProxyConfig {
  target?: string;
  pathRewrite: Record<string, string>;
  ws?: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * Cấu hình proxy cho các microservice
 * Trách nhiệm: Định tuyến yêu cầu (Request Routing)
 */
export const proxyConfig: Record<string, ProxyConfig> = {
  '/api/v1/users': {
    target: process.env.USERS_SERVICE_URL,
    pathRewrite: { '^/api/v1/users': '' },
    timeout: 30000,
    retries: 3,
  },
  '/api/v1/auth': {
    target: process.env.AUTH_SERVICE_URL,
    pathRewrite: { '^/api/v1/auth': '' },
    timeout: 30000,
    retries: 3,
  },
  '/api/v1/messages': {
    target: process.env.MESSAGES_SERVICE_URL,
    pathRewrite: { '^/api/v1/messages': '' },
    ws: true, // Enable WebSocket support
    timeout: 60000, // Longer timeout for WebSocket
    retries: 2,
  },
  '/api/v1/notifications': {
    target: process.env.NOTIFICATIONS_SERVICE_URL,
    pathRewrite: { '^/api/v1/notifications': '' },
    ws: true,
    timeout: 60000,
    retries: 2,
  },
};

console.log('proxyConfig', proxyConfig);
