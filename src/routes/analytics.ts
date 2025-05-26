// src/routes/analytics.ts - Rotas de Analytics
import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Public analytics (limited data)
router.post('/track', analyticsController.trackEvent.bind(analyticsController));
router.get('/public/stats', analyticsController.getPublicStats.bind(analyticsController));

// Admin analytics (full access)
router.use(authenticate);
router.use(authorize(['admin']));

router.get('/metrics', ValidationMiddleware.queryValidation(), ValidationMiddleware.handleValidationErrors, analyticsController.getMetrics.bind(analyticsController));
router.get('/realtime', analyticsController.getRealTimeMetrics.bind(analyticsController));
router.get('/export', analyticsController.exportData?.bind(analyticsController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));

export { router as analyticsRoutes };