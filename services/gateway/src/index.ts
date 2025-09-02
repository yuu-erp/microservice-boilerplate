import { LoggerService } from '@shared/logger';
import { Express } from 'express';
import config from './config/app.config';
import { createApp } from './app';
import { initOtel } from '@shared/otel';

// Initialize Express app
const app: Express = createApp();
// Initialize logger
const logger = new LoggerService({
  moduleName: 'App',
  isDev: config.isDev,
  appName: 'gateway', // For namespaced log files
});

// Init OpenTelemetry (optional endpoint via env OTEL_EXPORTER_OTLP_ENDPOINT)
initOtel('gateway', process.env.OTEL_EXPORTER_OTLP_ENDPOINT);

// Attach request logging middleware if available
app.use(logger.expressMiddleware?.() || ((req, res, next) => next()));

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
