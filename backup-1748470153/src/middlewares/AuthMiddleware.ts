// ===== src/middlewares/AuthMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { LoggerService } from '../services/LoggerService';

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
  /**
   * Middleware para autenticação JWT
   */
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extrair token do header Authorization
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: 'Token não fornecido' });
      }

      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
      req.user = decoded;

      next();
    } catch (error) {
      logger.error('Erro na autenticação:', error);
      return res
        .status(401)
        .json({ success: false, message: 'Token inválido' });
    }
  },

  /**
   * Middleware para autorização baseada em papel
   */
  authorize: (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ success: false, message: 'Acesso negado' });
      }
      next();
    };
  },
};
