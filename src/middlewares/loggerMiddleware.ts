import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
};
