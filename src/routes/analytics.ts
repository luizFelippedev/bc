// src/routes/analytics.ts
import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';

const router = Router();

// Todas as rotas de analytics requerem autenticação
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin']));

// Rate limiting específico para analytics
router.use(RateLimitMiddleware.adminLimiter);

// Rotas de analytics
router.get('/dashboard', adminController.getDashboardData.bind(adminController));
router.get('/detailed', adminController.getAnalytics.bind(adminController));
router.get('/realtime', adminController.getRealTimeStats.bind(adminController));

export { router as analyticsRoutes };