import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import config from '../../src/config/app.config';
import { LoggerService } from '@shared/logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = new LoggerService({
    moduleName: 'NestApp',
    isDev: config.isDev,
    appName: 'gateway',
  });
  app.useLogger({
    log: (message: any) => logger.info(message),
    error: (message: any, trace?: string) => logger.error({ message, trace }),
    warn: (message: any) => logger.warn(message),
    debug: (message: any) => logger.debug?.(message as any),
    verbose: (message: any) => logger.info(message),
  } as any);

  await app.listen(config.port);
  logger.info(`Nest Gateway started on port ${config.port}`);
}

bootstrap();


