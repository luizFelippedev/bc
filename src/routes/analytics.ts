// src/routes/analytics.ts
import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';

const router = Router();

// Todas as rotas de analytics requerem autenticação
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize(['admin']));

// Rate limiting específico para analytics
router.use(RateLimitMiddleware.adminLimiter);

// Rotas de analytics
router.get('/dashboard', adminController.getDashboardData.bind(adminController));
router.get('/detailed', adminController.getAnalytics.bind(adminController));
router.get('/realtime', adminController.getRealTimeStats.bind(adminController));

export { router as analyticsRoutes };