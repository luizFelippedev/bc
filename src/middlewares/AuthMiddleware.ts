import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from './errorHandler';

const logger = LoggerService.getInstance();

interface DecodedToken {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const authMiddleware = {
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw ApiError.unauthorized('Token não fornecido');
      }

      const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Erro na autenticação:', error);
      next(ApiError.unauthorized('Token inválido'));
    }
  },

  authorize: (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(ApiError.forbidden('Acesso negado'));
      }
      next();
    };
  }
};
