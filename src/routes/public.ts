import { Router } from 'express';
import { PublicController } from '../controllers/PublicController';

const router = Router();
const publicController = new PublicController();

// Rotas públicas
router.get('/projects', publicController.getProjects.bind(publicController));
router.get('/projects/:slug', publicController.getProjectBySlug.bind(publicController));
router.get('/certificates', publicController.getCertificates.bind(publicController));
router.get('/configuration', publicController.getConfiguration.bind(publicController));

// Rastreamento de analytics
router.post('/analytics/track', publicController.trackEvent.bind(publicController));

export default router;