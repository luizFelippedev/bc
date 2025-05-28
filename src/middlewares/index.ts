import { Application } from 'express';
import { LoggerMiddleware } from './loggerMiddleware';
import { securityMiddleware } from './SecurityMiddleware';
import { ValidationMiddleware } from './ValidationMiddleware';
import { ErrorHandlerMiddleware } from './errorHandler';

export const setupMiddlewares = (app: Application) => {
  app.use(LoggerMiddleware.requestId());
  app.use(LoggerMiddleware.requestLogger());
  app.use(securityMiddleware.securityHeaders);
  app.use(securityMiddleware.rateLimiter);
  app.use(securityMiddleware.sanitizeInput);
};

export * from './loggerMiddleware';
export * from './SecurityMiddleware';
export * from './ValidationMiddleware';
export * from './errorHandler';
