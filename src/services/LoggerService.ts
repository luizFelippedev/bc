// ===== src/services/LoggerService.ts =====
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export class LoggerService {
  private static instance: LoggerService;
  private logger: winston.Logger;

  private constructor() {
    const logsDir = path.join(process.cwd(), 'logs');

    // Criar diretório de logs se não existir
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Formatos de log
    const { combine, timestamp, printf, colorize, json, errors } =
      winston.format;

    // Formato para desenvolvimento (console)
    const consoleFormat = combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} ${level}: ${message}`;

        if (stack) {
          log += `\n${stack}`;
        }

        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return log;
      })
    );

    // Formato para produção (JSON)
    const fileFormat = combine(timestamp(), errors({ stack: true }), json());

    this.logger = winston.createLogger({
      level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
      format: fileFormat,
      defaultMeta: {
        service: 'portfolio-backend',
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
      },
      transports: [
        // Log de erro em arquivo
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Log combinado em arquivo
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logsDir, 'rejections.log'),
        }),
      ],
    });

    // Em desenvolvimento, log também no console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: consoleFormat,
        })
      );
    }
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log de requisições HTTP
   */
  public logRequest(req: Request, res: Response, responseTime: number): void {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
      contentLength: res.get('content-length') || 0,
    };

    if (res.statusCode >= 400) {
      this.warn(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    } else {
      this.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
    }
  }
}
