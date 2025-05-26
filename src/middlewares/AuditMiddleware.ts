import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoggerService } from '../services/LoggerService';
import { ApiResponse } from '../utils/ApiResponse';

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

export class AuthMiddleware {
  private static logger = LoggerService.getInstance();

  /**
   * Middleware para autenticação JWT
   */
  public static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      // Extrair token do header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(
          ApiResponse.error('Token de autenticação não fornecido', 401)
        );
        return;
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verificar token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'sua-chave-secreta'
      ) as DecodedToken;
      
      // Adicionar usuário à requisição
      req.user = decoded;
      
      next();
    } catch (error) {
      AuthMiddleware.logger.error('Erro de autenticação:', error);
      
      if (error.name === 'TokenExpiredError') {
        res.status(401).json(
          ApiResponse.error('Token de autenticação expirado', 401)
        );
      } else {
        res.status(401).json(
          ApiResponse.error('Token de autenticação inválido', 401)
        );
      }
    }
  }

  /**
   * Middleware para autorização baseada em papel
   */
  public static authorize(roles: string[] = ['admin']) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          res.status(401).json(
            ApiResponse.error('Não autenticado', 401)
          );
          return;
        }
        
        if (!roles.includes(req.user.role)) {
          res.status(403).json(
            ApiResponse.error('Acesso negado', 403)
          );
          return;
        }
        
        next();
      } catch (error) {
        AuthMiddleware.logger.error('Erro de autorização:', error);
        res.status(500).json(
          ApiResponse.error('Erro interno de autorização', 500)
        );
      }
    };
  }
}