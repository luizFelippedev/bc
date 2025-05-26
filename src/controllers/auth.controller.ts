import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export class AuthController {
  constructor(private authService = new AuthService()) {}

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      return res.sendSuccess(result);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.sendError(error.message);
      }
      return res.sendError('Erro no login');
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const user = await this.authService.verify(req.user?.id);
      return res.sendSuccess({ user });
    } catch (error) {
      return res.sendError('Erro na verificação');
    }
  }
}

export const authController = new AuthController();
