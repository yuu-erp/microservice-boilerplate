import { LoggerService } from '@shared/logger';
import cors from 'cors';
import express, { Express, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import client from 'prom-client';
import config from './config/app.config';
import { errorHandler } from './middlewares';
import router from './routers';

// Initialize Express app
const app: Express = express();
// Initialize logger
const logger = new LoggerService({
  moduleName: 'App',
  isDev: config.isDev,
  appName: 'gateway', // For namespaced log files
});
// Collect default Prometheus metrics
client.collectDefaultMetrics();

// Middleware
app.use(express.json());
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests, please try again later' },
  }),
);
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);
app.use(logger.expressMiddleware?.() || ((req, res, next) => next())); // Fallback if middleware is undefined

// Health and readiness endpoints
router.get('/healthz', (_req: Request, res: Response) => res.json({ status: 'ok' }));
router.get('/readyz', (_req: Request, res: Response) => res.json({ ready: true }));
router.get('/metrics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error('Unknown error in metrics endpoint'));
    next(error); // Delegate to global error handler
  }
});

// API routes
app.use('/api/v1', router);

// Global error handling middleware
router.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Gateway started on port ${config.port}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Received shutdown signal. Closing server...');
  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info('Server shut down gracefully');
    process.exit(0);
  });

  // Force close after 10 seconds to handle stuck connections
  setTimeout(() => {
    logger.warn('Forcing server shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err as any);
  shutdown();
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason as any);
  shutdown();
});

// Export for testing or module usage
export default app;
