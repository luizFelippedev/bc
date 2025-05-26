// src/middleware/SecurityMiddleware.ts - Middleware de Segurança Avançado
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { LoggerService } from '../services/LoggerService';

const logger = LoggerService.getInstance();

export const securityMiddleware = {
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
  }),

  sanitizeInput: (req: Request, res: Response, next: NextFunction) => {
    // Aqui você pode implementar sanitização avançada se desejar
    next();
  },

  securityHeaders: (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  }
};