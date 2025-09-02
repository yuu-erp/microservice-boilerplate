import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import * as cors from 'cors';

/**
 * Cấu hình bảo mật cho Gateway
 * Trách nhiệm: Xác thực & Phân quyền, Các vấn đề cắt ngang
 */
export function configureSecurity(app: INestApplication): void {
  // Helmet - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // CORS configuration
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // Trust proxy (for X-Forwarded-*)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.getInstance().set('trust proxy', 1);
}
