// ===== src/services/LoggerService.ts =====
import { config, isDevelopment } from '../config/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  stack?: string;
}

export class LoggerService {
  private static instance: LoggerService;
  private logLevel: LogLevel;
  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };

  private constructor() {
    const envLogLevel = config.logging.level.toUpperCase() as keyof typeof LogLevel;
    this.logLevel = LogLevel[envLogLevel] ?? LogLevel.INFO;
    
    if (isDevelopment) {
      this.info(`📊 Logger iniciado - Nível: ${envLogLevel}`);
    }
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    
    if (isDevelopment) {
      return this.formatDevelopmentMessage(timestamp, level, message, data);
    } else {
      return this.formatProductionMessage(timestamp, level, message, data);
    }
  }

  private formatDevelopmentMessage(timestamp: string, level: string, message: string, data?: any): string {
    const time = new Date(timestamp).toLocaleTimeString('pt-BR');
    const levelColors = {
      ERROR: this.colors.red,
      WARN: this.colors.yellow,
      INFO: this.colors.cyan,
      DEBUG: this.colors.magenta,
    };

    const color = levelColors[level as keyof typeof levelColors] || this.colors.white;
    const coloredLevel = `${color}${level.padEnd(5)}${this.colors.reset}`;
    
    let formattedMessage = `${this.colors.dim}[${time}]${this.colors.reset} ${coloredLevel} ${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  private formatProductionMessage(timestamp: string, level: string, message: string, data?: any): string {
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
    };

    if (data !== undefined) {
      if (data instanceof Error) {
        logEntry.data = {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      } else {
        logEntry.data = data;
      }
    }

    return JSON.stringify(logEntry);
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  public error(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const formattedMessage = this.formatMessage('ERROR', message, data);
    console.error(formattedMessage);
    
    // Em produção, você pode querer enviar erros para um serviço de monitoramento
    if (!isDevelopment && data instanceof Error) {
      this.sendToMonitoring('error', message, data);
    }
  }

  public warn(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const formattedMessage = this.formatMessage('WARN', message, data);
    console.warn(formattedMessage);
  }

  public info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const formattedMessage = this.formatMessage('INFO', message, data);
    console.log(formattedMessage);
  }

  public debug(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const formattedMessage = this.formatMessage('DEBUG', message, data);
    console.log(formattedMessage);
  }

  // Métodos de conveniência para diferentes tipos de logs
  public success(message: string, data?: any): void {
    const successMessage = `${this.colors.green}✅${this.colors.reset} ${message}`;
    this.info(successMessage, data);
  }

  public failure(message: string, data?: any): void {
    const failureMessage = `${this.colors.red}❌${this.colors.reset} ${message}`;
    this.error(failureMessage, data);
  }

  public request(method: string, url: string, statusCode: number, responseTime: number): void {
    const statusColor = statusCode >= 400 ? this.colors.red : 
                       statusCode >= 300 ? this.colors.yellow : 
                       this.colors.green;
    
    const message = `${method.toUpperCase()} ${url} ${statusColor}${statusCode}${this.colors.reset} - ${responseTime}ms`;
    
    if (statusCode >= 400) {
      this.warn(message);
    } else {
      this.info(message);
    }
  }

  public database(operation: string, collection: string, duration: number, error?: Error): void {
    if (error) {
      this.error(`DB ${operation} failed on ${collection}`, { duration, error: error.message });
    } else {
      const message = `DB ${operation} on ${collection} - ${duration}ms`;
      if (duration > 1000) {
        this.warn(`⚠️  Slow query: ${message}`);
      } else {
        this.debug(message);
      }
    }
  }

  public security(event: string, details: any): void {
    const message = `🔒 Security Event: ${event}`;
    this.warn(message, details);
    
    // Em produção, eventos de segurança devem ser sempre registrados
    if (!isDevelopment) {
      this.sendToMonitoring('security', event, details);
    }
  }

  public performance(operation: string, duration: number, threshold: number = 1000): void {
    if (duration > threshold) {
      this.warn(`⚡ Performance: ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
    } else {
      this.debug(`⚡ Performance: ${operation} took ${duration}ms`);
    }
  }

  // Método para criar um logger com contexto específico
  public createChildLogger(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }

  // Método para enviar logs críticos para serviços de monitoramento
  private sendToMonitoring(type: string, message: string, data: any): void {
    // Aqui você implementaria a integração com serviços como:
    // - Sentry
    // - DataDog
    // - New Relic
    // - CloudWatch
    // etc.
    
    // Exemplo de implementação básica:
    if (process.env.MONITORING_ENABLED === 'true') {
      // Implementar envio para serviço de monitoramento
      console.log(`[MONITORING] ${type}: ${message}`, data);
    }
  }

  // Método para alterar o nível de log em tempo de execução
  public setLogLevel(level: keyof typeof LogLevel): void {
    this.logLevel = LogLevel[level];
    this.info(`Log level alterado para: ${level}`);
  }

  public getLogLevel(): string {
    return LogLevel[this.logLevel];
  }

  // Método para logging estruturado
  public structured(level: keyof typeof LogLevel, event: string, data: Record<string, any>): void {
    const logData = {
      event,
      ...data,
      environment: config.environment,
    };

    switch (level) {
      case 'ERROR':
        this.error(event, logData);
        break;
      case 'WARN':
        this.warn(event, logData);
        break;
      case 'INFO':
        this.info(event, logData);
        break;
      case 'DEBUG':
        this.debug(event, logData);
        break;
    }
  }
}

// Classe para logger com contexto específico
export class ChildLogger {
  constructor(
    private parent: LoggerService,
    private context: string
  ) {}

  private formatMessage(message: string): string {
    return `[${this.context}] ${message}`;
  }

  public error(message: string, data?: any): void {
    this.parent.error(this.formatMessage(message), data);
  }

  public warn(message: string, data?: any): void {
    this.parent.warn(this.formatMessage(message), data);
  }

  public info(message: string, data?: any): void {
    this.parent.info(this.formatMessage(message), data);
  }

  public debug(message: string, data?: any): void {
    this.parent.debug(this.formatMessage(message), data);
  }

  public success(message: string, data?: any): void {
    this.parent.success(this.formatMessage(message), data);
  }

  public failure(message: string, data?: any): void {
    this.parent.failure(this.formatMessage(message), data);
  }
}