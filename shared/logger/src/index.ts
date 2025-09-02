import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createLogger, format, Logger, LoggerOptions, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors, json, splat } = format;

// Tạo thư mục logs nếu chưa có
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LoggerOptionsExtended {
  moduleName?: string;
  level?: LogLevel;
  isDev?: boolean;
}

export class LoggerService {
  private logger: Logger;
  private moduleName: string;

  constructor(options: LoggerOptionsExtended = {}) {
    const { moduleName = '', level = 'info', isDev = true } = options;
    this.moduleName = moduleName;

    // Format log
    const logFormat = printf(({ level, message, timestamp, stack }) => {
      const logMessage = stack || message; // in case of error object
      return `${timestamp} [${level}] [${this.moduleName}]: ${logMessage}`;
    });

    const loggerOptions: LoggerOptions = {
      level,
      format: combine(
        errors({ stack: true }), // hiển thị stack trace nếu error object
        splat(), // hỗ trợ log kiểu printf
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        isDev ? colorize() : format.uncolorize(),
        logFormat
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDir, 'combined.log') }),
      ],
      exitOnError: false,
    };

    this.logger = createLogger(loggerOptions);
  }

  log(level: LogLevel, message: string | Error): void {
    if (message instanceof Error) {
      this.logger.log(level, message.stack || message.message);
    } else {
      this.logger.log(level, message);
    }
  }

  info(message: string | Error) { this.log('info', message); }
  warn(message: string | Error) { this.log('warn', message); }
  error(message: string | Error) { this.log('error', message); }
  debug(message: string | Error) { this.log('debug', message); }

  // Middleware Express: log request/response
  expressMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const { method, url, body } = req;
      this.info(`Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)}`);

      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.info(`Response: ${method} ${url} - Status: ${res.statusCode} - Duration: ${duration}ms`);
      });

      next();
    };
  }
}
