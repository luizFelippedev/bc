import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { LoggerService } from '../services/LoggerService';

export class AuthController {
  private logger = LoggerService.getInstance();
    refreshToken: any;

  /**
   * Login de administrador
   * POST /api/auth/login
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Buscar usuário pelo email
      const user = await User.findOne({ email, isActive: true });
      
      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json(
          ApiResponse.error('Credenciais inválidas', 401)
        );
        return;
      }
      
      // Verificar se é admin
      if (user.role !== 'admin') {
        res.status(403).json(
          ApiResponse.error('Acesso restrito apenas para administradores', 403)
        );
        return;
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'sua-chave-secreta',
        { expiresIn: '8h' }
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
        })
      );
      
      this.logger.info(`Admin login: ${user.email}`);
    } catch (error) {
      this.logger.error('Erro no login:', error);
      res.status(500).json(
        ApiResponse.error('Erro ao processar login', 500)
      );
    }
  }

  /**
   * Verificar token JWT
   * GET /api/auth/verify
   */
  public async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      // req.user é definido pelo middleware de autenticação
      const user = await User.findById(req.user?.id).select('-password');
      
      if (!user || !user.isActive) {
        res.status(401).json(
          ApiResponse.error('Token inválido ou usuário inativo', 401)
        );
        return;
      }
      
      res.json(
        ApiResponse.success({ user })
      );
    } catch (error) {
      this.logger.error('Erro na verificação do token:', error);
      res.status(500).json(
        ApiResponse.error('Erro ao verificar token', 500)
      );
    }
  }

  /**
   * Logout (invalidação do token no cliente)
   * POST /api/auth/logout
   */
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      // No frontend, o token será removido do localStorage
      res.json(
        ApiResponse.success(null, 'Logout realizado com sucesso')
      );
      
      this.logger.info(`Admin logout: ${req.user?.id}`);
    } catch (error) {
      this.logger.error('Erro no logout:', error);
      res.status(500).json(
        ApiResponse.error('Erro ao processar logout', 500)
      );
    }
  }
}

export const authController = new AuthController();