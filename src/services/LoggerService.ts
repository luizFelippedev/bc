import winston, { Logger } from 'winston';
import { config } from '../config/environment';

export class LoggerService {
  private static instance: LoggerService;
  private logger: Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'portfolio-backend' },
      transports: this.setupTransports()
    });
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private setupTransports(): winston.transport[] {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ];

    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5
        })
      );
    }

    return transports;
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
