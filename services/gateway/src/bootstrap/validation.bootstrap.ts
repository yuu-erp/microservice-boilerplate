import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

/**
 * Cấu hình validation cho Gateway
 * Trách nhiệm: Kiểm tra dữ liệu đầu vào (Input Validation)
 */
export function configureValidation(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce(
          (acc, error) => {
            acc[error.property] = Object.values(error.constraints || {}).join(
              ', ',
            );
            return acc;
          },
          {} as Record<string, string>,
        );

        return new Error(
          JSON.stringify({
            status: 'error',
            message: 'Validation failed',
            errors: formattedErrors,
            timestamp: new Date().toISOString(),
          }),
        );
      },
    }),
  );
}
