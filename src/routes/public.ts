// ===== src/routes/public.ts =====
import { Router } from 'express';
import { publicController } from '../controllers/PublicController';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';

const router = Router();

// Rate limiting para rotas públicas
router.use(RateLimitMiddleware.publicApiLimiter);

// Rotas públicas
router.get('/projects', publicController.getProjects.bind(publicController));
router.get(
  '/projects/:slug',
  publicController.getProjectBySlug.bind(publicController)
);
router.get(
  '/certificates',
  publicController.getCertificates.bind(publicController)
);
router.get(
  '/configuration',
  publicController.getConfiguration.bind(publicController)
);

// Analytics tracking
router.post(
  '/analytics/track',
  publicController.trackEvent.bind(publicController)
);

export default router;
