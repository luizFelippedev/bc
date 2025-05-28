// ===== CORRIGIDO: src/controllers/AuthController.ts =====
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { LoggerService } from '../services/LoggerService';
import { config } from '../config/environment';

interface JWTPayload {
  id: string;
  role: string;
}

export class AuthController {
  private logger = LoggerService.getInstance();

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, isActive: true });

      if (!user || !(await user.comparePassword(password))) {
        throw ApiError.unauthorized('Credenciais inválidas');
      }

      if (user.role !== 'admin') {
        throw ApiError.forbidden('Acesso restrito apenas para administradores');
      }

      const payload: JWTPayload = {
        id: user._id.toString(),
        role: user.role
      };

      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      user.lastLogin = new Date();
      await user.save();

      res.json(ApiResponse.success({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        token
      }, 'Login realizado com sucesso'));

      this.logger.info(`Admin login: ${user.email}`);
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(ApiResponse.success(null, 'Logout realizado com sucesso'));
      this.logger.info(`Admin logout: ${req.user?.id}`);
    } catch (error) {
      next(error);
    }
  }

  public async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.id).select('-password');

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Usuário não encontrado ou inativo');
      }

      res.json(ApiResponse.success({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        }
      }, 'Token válido'));
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.user?.id).select('-password');

      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Usuário não encontrado');
      }

      const payload: JWTPayload = {
        id: user._id.toString(),
        role: user.role
      };

      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      res.json(ApiResponse.success({ token }, 'Token renovado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

// ===== CORRIGIDO: src/app.ts linha 85 =====

import Redis from 'ioredis';
...
private setupSession(): void {
  if (config.session?.enabled) {
    try {
      const RedisStore = ConnectRedis(session);
      const cacheService = CacheService.getInstance();

      this.app.use(session({
        store: new RedisStore({
          client: cacheService.getClient() as Redis,
          prefix: 'sess:'
        }),
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: config.session.maxAge
        }
      }));

      this.logger.info('✅ Session configurada com Redis');
    } catch (error) {
      this.logger.warn('⚠️  Session configurada sem Redis (in-memory):', error);

      this.app.use(session({
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: config.session.maxAge
        }
      }));
    }
  }
}
