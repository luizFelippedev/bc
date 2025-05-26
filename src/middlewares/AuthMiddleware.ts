// ===== src/middlewares/AuthMiddleware.ts =====
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { LoggerService } from '../services/LoggerService';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User';

const logger = LoggerService.getInstance();

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export class AuthMiddleware {
  /**
   * Middleware para autenticação JWT
   */
  public static authenticate = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extrair token do header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Token de autenticação não fornecido');
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
      
      // Verificar se usuário ainda existe e está ativo
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Usuário não encontrado ou inativo');
      }
      
      // Adicionar usuário à requisição
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Erro de autenticação:', error);
      
      if (error instanceof jwt.TokenExpiredError) {
        next(ApiError.unauthorized('Token de autenticação expirado'));
      } else if (error instanceof jwt.JsonWebTokenError) {
        next(ApiError.unauthorized('Token de autenticação inválido'));
      } else if (error instanceof ApiError) {
        next(error);
      } else {
        next(ApiError.internal('Erro interno de autenticação'));
      }
    }
  };

  /**
   * Middleware para autorização baseada em papel
   */
  public static authorize = (roles: string[] = ['admin']) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          throw ApiError.unauthorized('Não autenticado');
        }
        
        if (!roles.includes(req.user.role)) {
          throw ApiError.forbidden('Acesso negado');
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  };
}