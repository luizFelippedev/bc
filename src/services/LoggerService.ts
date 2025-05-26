// src/services/LoggerService.ts (melhorado)
import winston, { Logger, format } from 'winston';
import path from 'path';
import { config } from '../config/environment';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug'
}

interface LoggerOptions {
  level?: LogLevel;
  serviceName?: string;
  logToConsole?: boolean;
  logToFile?: boolean;
  logDirectory?: string;
  maxSize?: string;
  maxFiles?: number;
  enableRequestLogging?: boolean;
}

export class LoggerService {
  private static instance: LoggerService;
  private logger: Logger;
  private options: LoggerOptions;

  private constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level || (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
      serviceName: options.serviceName || 'portfolio-backend',
      logToConsole: options.logToConsole !== false,
      logToFile: options.logToFile !== false && process.env.NODE_ENV !== 'test',
      logDirectory: options.logDirectory || 'logs',
      maxSize: options.maxSize || '10m',
      maxFiles: options.maxFiles || 5,
      enableRequestLogging: options.enableRequestLogging !== false
    };

    this.logger = this.createLogger();
  }

  public static getInstance(options?: LoggerOptions): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService(options);
    }
    return LoggerService.instance;
  }

  private createLogger(): Logger {
    const { combine, timestamp, printf, colorize, json } = format;

    // Formato para desenvolvimento (console)
    const developmentFormat = combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ level, message, timestamp, ...metadata }) => {
        let metaStr = '';

        if (Object.keys(metadata).length > 0 && metadata.service === undefined) {
          metaStr = JSON.stringify(metadata, null, 2);
        }

        return `${timestamp} ${level}: ${message} ${metaStr}`;
      })
    );

    // Formato para produção (estruturado/JSON)
    const productionFormat = combine(
      timestamp(),
      json()
    );

    const isProd = process.env.NODE_ENV === 'production';

    const transports: winston.transport[] = [];

    // Adicionar transporte console se habilitado
    if (this.options.logToConsole) {
      transports.push(
        new winston.transports.Console({
          format: isProd ? productionFormat : developmentFormat
        })
      );
    }

    // Adicionar transportes de arquivo se habilitado
    if (this.options.logToFile) {
      const logDir = this.options.logDirectory;

      // Criar transport para erros
      transports.push(
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          format: productionFormat,
          maxsize: this.parseSize(this.options.maxSize),
          maxFiles: this.options.maxFiles
        })
      );

      // Criar transport para todos os logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          format: productionFormat,
          maxsize: this.parseSize(this.options.maxSize),
          maxFiles: this.options.maxFiles
        })
      );
      
      // Log diário (rotativo)
      transports.push(
        new winston.transports.File({
          filename: path.join(logDir, 'daily.log'),
          format: productionFormat,
          maxsize: this.parseSize(this.options.maxSize),
          maxFiles: 7,
          tailable: true
        })
      );
    }

    return winston.createLogger({
      level: this.options.level,
      defaultMeta: { 
        service: this.options.serviceName,
        environment: process.env.NODE_ENV || 'development'
      },
      transports
    });
  }

  private parseSize(size: string): number {
    const units = {
      b: 1,
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024
    };

    const match = size.match(/^(\d+)([bkmg])$/i);
    if (!match) return 10 * 1024 * 1024; // 10MB default

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    return value * units[unit];
  }

  public log(level: LogLevel, message: string, meta?: any): void {
    this.logger.log(level, message, meta);
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

  public http(message: string, meta?: any): void {
    this.logger.http(message, meta);
  }

  /**
   * Registra uma requisição HTTP
   */
  public logRequest(req: any, res: any, responseTime: number): void {
    if (!this.options.enableRequestLogging) return;
    
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'http';
    
    this.log(level as LogLevel, `${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status,
      responseTime: `${responseTime.toFixed(2)}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      contentLength: res.get('content-length') || 0
    });
  }

  /**
   * Cria um logger com contexto específico (ex: um componente ou serviço)
   */
  public createContextLogger(context: string): {
    error: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    info: (message: string, meta?: any) => void;
    debug: (message: string, meta?: any) => void;
    http: (message: string, meta?: any) => void;
  } {
    return {
      error: (message: string, meta?: any) => this.error(message, { context, ...meta }),
      warn: (message: string, meta?: any) => this.warn(message, { context, ...meta }),
      info: (message: string, meta?: any) => this.info(message, { context, ...meta }),
      debug: (message: string, meta?: any) => this.debug(message, { context, ...meta }),
      http: (message: string, meta?: any) => this.http(message, { context, ...meta })
    };
  }
}