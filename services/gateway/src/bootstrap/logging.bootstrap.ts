import { INestApplication } from '@nestjs/common';
import * as morgan from 'morgan';

/**
 * Cấu hình logging cho Gateway
 * Trách nhiệm: Ghi log & Giám sát (Logging & Monitoring)
 */
export function configureLogging(app: INestApplication): void {
  // Structured logging với JSON format
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          console.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              level: 'info',
              message: message.trim(),
              service: 'gateway',
            }),
          );
        },
      },
    }),
  );
}
