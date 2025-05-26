import { Application } from 'express';
import { loggerMiddleware } from './loggerMiddleware';
import { securityMiddleware } from './SecurityMiddleware';
import { validate } from './ValidationMiddleware';
import { errorHandler } from './errorHandler';

export const setupMiddlewares = (app: Application) => {
  app.use(loggerMiddleware);
  app.use(securityMiddleware.securityHeaders);
  app.use(securityMiddleware.rateLimiter);
  app.use(securityMiddleware.sanitizeInput);
  // O middleware de validação é aplicado por rota, não globalmente
};

export * from './loggerMiddleware';
export * from './SecurityMiddleware';
export * from './ValidationMiddleware';
export * from './errorHandler';
