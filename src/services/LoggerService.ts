import winston from 'winston';
import path from 'path';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export class LoggerService {
  private static instance: LoggerService;
  private logger: winston.Logger;

  private constructor() {
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Formatos de log
    const { combine, timestamp, printf, colorize, json } = winston.format;
    
    // Formato para desenvolvimento (console)
    const consoleFormat = combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
    );
    
    // Formato para produção (JSON)
    const fileFormat = combine(
      timestamp(),
      json()
    );
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: fileFormat,
      defaultMeta: { service: 'portfolio-backend' },
      transports: [
        // Log de erro em arquivo
        new winston.transports.File({ 
          filename: path.join(logsDir, 'error.log'), 
          level: 'error' 
        }),
        // Log combinado em arquivo
        new winston.transports.File({ 
          filename: path.join(logsDir, 'combined.log') 
        })
      ]
    });
    
    // Em desenvolvimento, log também no console
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: consoleFormat
      }));
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
}