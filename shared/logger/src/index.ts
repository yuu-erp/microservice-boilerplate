import fs from 'fs/promises';
import path from 'path';

import { NextFunction, Request, Response } from 'express';
import { createLogger, format, Logger, LoggerOptions, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

const { combine, timestamp, printf, colorize, errors, json, splat } = format;

// Ensure logs directory exists asynchronously
const logDir = 'logs';
const ensureLogDir = async () => {
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
    throw error;
  }
};

export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface LoggerOptionsExtended {
  moduleName?: string;
  level?: LogLevel;
  isDev?: boolean;
  appName?: string; // For namespacing log files
}

interface RequestWithId extends Request {
  requestId?: string;
}

export class LoggerService {
  private logger: Logger;
  private moduleName: string;

  constructor(options: LoggerOptionsExtended = {}) {
    const { moduleName = '', level = 'info', isDev = false, appName = 'app' } = options;
    this.moduleName = moduleName;

    // Format for development (human-readable)
    const devFormat = combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ level, message, timestamp, stack, ...metadata }) => {
        const logMessage = stack || message;
        const metaStr = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : '';
        return `${timestamp} [${level}] [${this.moduleName}]: ${logMessage}${metaStr}`;
      }),
    );

    // Format for production (JSON)
    const prodFormat = combine(timestamp(), json());

    const loggerOptions: LoggerOptions = {
      level,
      format: combine(
        errors({ stack: true }), // Include stack traces for errors
        splat(), // Support printf-style formatting
        isDev ? devFormat : prodFormat,
      ),
      transports: [
        new transports.Console(),
        new DailyRotateFile({
          filename: path.join(logDir, `${appName}-error-%DATE%.log`),
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d', // Keep logs for 14 days
          maxSize: '20m', // Rotate if file exceeds 20MB
          zippedArchive: true, // Compress old logs
        }),
        new DailyRotateFile({
          filename: path.join(logDir, `${appName}-combined-%DATE%.log`),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '14d',
          maxSize: '20m',
          zippedArchive: true,
        }),
      ],
      exitOnError: false,
    };

    this.logger = createLogger(loggerOptions);
  }

  // Generic log method with metadata support
  log(level: LogLevel, message: string | Error | unknown, metadata: Record<string, unknown> = {}): void {
    if (message instanceof Error) {
      this.logger.log(level, message.stack || message.message, metadata);
    } else {
      this.logger.log(level, String(message), metadata);
    }
  }

  // Expose all Winston log levels
  error(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('error', message, metadata);
  }
  warn(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('warn', message, metadata);
  }
  info(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('info', message, metadata);
  }
  http(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('http', message, metadata);
  }
  verbose(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('verbose', message, metadata);
  }
  debug(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('debug', message, metadata);
  }
  silly(message: string | Error | unknown, metadata: Record<string, unknown> = {}) {
    this.log('silly', message, metadata);
  }

  // Express middleware for request/response logging
  expressMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const requestId = uuidv4(); // Generate unique request ID
      const { method, url } = req;

      // Safely stringify body, limiting size to avoid performance issues
      let bodyStr = '';
      try {
        if (req.body && Object.keys(req.body).length) {
          bodyStr = JSON.stringify(req.body, null, 2).substring(0, 1000); // Limit to 1000 chars
        }
      } catch (error) {
        this.error('Failed to stringify request body', { error, requestId });
      }

      this.http(`Incoming Request: ${method} ${url}`, { body: bodyStr, requestId });

      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.http(`Response: ${method} ${url}`, {
          status: res.statusCode,
          durationMs: duration,
          requestId,
        });
      });

      // Attach requestId to req for downstream use
      const reqWithId = req as RequestWithId;
      reqWithId.requestId = requestId;
      next();
    };
  }
}

// Initialize log directory before any LoggerService instance
ensureLogDir().catch((error) => {
  console.error('Logger initialization failed:', error);
  process.exit(1);
});
