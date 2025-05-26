import { Router } from 'express';
import { authRoutes } from './auth';
import { adminRoutes } from './admin';
import { publicRoutes } from './public';
import { analyticsRoutes } from './analytics';
import { SecurityMiddleware } from '../middlewares/SecurityMiddleware';
import { LoggerService } from '../services/LoggerService';

const router = Router();

// Middleware global de logging e segurança
router.use((req, res, next) => {
  LoggerService.getInstance().info(`[${req.method}] ${req.originalUrl}`);
  next();
});
router.use(SecurityMiddleware.sanitizeInput);

// Rotas principais
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
