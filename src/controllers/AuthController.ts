// ===== src/controllers/AuthController.ts =====
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { LoggerService } from '../services/LoggerService';
import { config } from '../config/environment';

export class AuthController {
  private logger = LoggerService.getInstance();

  /**
   * Login de administrador
   * POST /api/auth/login
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Buscar usuário pelo email
      const user = await User.findOne({ email, isActive: true });
      
      if (!user || !(await user.comparePassword(password))) {
        throw ApiError.unauthorized('Credenciais inválidas');
      }
      
      // Verificar se é admin
      if (user.role !== 'admin') {
        throw ApiError.forbidden('Acesso restrito apenas para administradores');
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Atualizar último login
      user.lastLogin = new Date();
      await user.save();
      
      res.json(
        ApiResponse.success({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          },
          token
        }, 'Login realizado com sucesso')
      );
      
      this.logger.info(`Admin login: ${user.email}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar token JWT
   * GET /api/auth/verify
   */
  public async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.id).select('-password');
      
      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Token inválido ou usuário inativo');
      }
      
      res.json(
        ApiResponse.success({ user }, 'Token válido')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (invalidação do token no cliente)
   * POST /api/auth/logout
   */
  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(
        ApiResponse.success(null, 'Logout realizado com sucesso')
      );
      
      this.logger.info(`Admin logout: ${req.user?.id}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.id).select('-password');
      
      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Usuário não encontrado');
      }
      
      // Gerar novo token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json(
        ApiResponse.success({ token }, 'Token renovado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();