import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/environment';
import { LoggerService } from '../services/LoggerService';
import { ApiResponse } from '../utils/ApiResponse';

export class AuthController {
  private logger = LoggerService.getInstance();

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !await user.comparePassword(password)) {
        return res.status(401).json(
          ApiResponse.error('Credenciais inválidas', 401)
        );
      }

      const token = this.generateTokens(user);
      
      res.json(ApiResponse.success({
        token: token.accessToken,
        refreshToken: token.refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }));
    } catch (error) {
      this.logger.error('Erro no login:', error);
      res.status(500).json(
        ApiResponse.error('Erro interno do servidor', 500)
      );
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json(
          ApiResponse.error('Refresh token não fornecido', 400)
        );
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshToken.secret) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json(
          ApiResponse.error('Usuário não encontrado', 401)
        );
      }

      const tokens = this.generateTokens(user);

      res.json(ApiResponse.success({ tokens }));
    } catch (error) {
      this.logger.error('Erro ao renovar token:', error);
      res.status(401).json(
        ApiResponse.error('Refresh token inválido', 401)
      );
    }
  }

  async logout(req: Request, res: Response) {
    try {
      // Implemente a lógica de logout aqui
      // Por exemplo, invalidar o refreshToken
      res.json(ApiResponse.success(null, 'Logout realizado com sucesso'));
    } catch (error) {
      this.logger.error('Erro no logout:', error);
      res.status(500).json(
        ApiResponse.error('Erro ao realizar logout', 500)
      );
    }
  }

  async verifyToken(req: Request, res: Response) {
    try {
      const user = await User.findById(req.user?.id).select('-password');
      if (!user) {
        return res.status(401).json(
          ApiResponse.error('Usuário não encontrado', 401)
        );
      }
      res.json(ApiResponse.success({ user }));
    } catch (error) {
      this.logger.error('Erro na verificação do token:', error);
      res.status(401).json(
        ApiResponse.error('Token inválido', 401)
      );
    }
  }

  private generateTokens(user: any) {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      config.jwt.refreshToken.secret,
      { expiresIn: config.jwt.refreshToken.expiresIn }
    );

    return { accessToken, refreshToken };
  }
}

export const authController = new AuthController();
