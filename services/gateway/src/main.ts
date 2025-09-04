import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureLogging } from './bootstrap/logging.bootstrap';
import { configureSecurity } from './bootstrap/security.bootstrap';
import { configureProxy } from './bootstrap/proxy.bootstrap';
import { configureValidation } from './bootstrap/validation.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Phase 1: Basic Configuration
  configureLogging(app);
  configureSecurity(app);
  configureValidation(app);

  // Global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Phase 2: Proxy Configuration
  configureProxy(app);

  // Phase 3: API Documentation (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Micro Chat Enterprise API Gateway')
    .setDescription('API Gateway for Microservices Architecture')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('gateway', 'Gateway operations')
    .addTag('health', 'Health check operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Global error handling

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`🚀 API Gateway is running on port ${port}`);
  console.log(
    `📚 Swagger documentation available at http://localhost:${port}/api/v1/docs`,
  );
  console.log(
    `🏥 Health check available at http://localhost:${port}/api/v1/health`,
  );
}
bootstrap();
