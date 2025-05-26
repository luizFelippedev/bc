// src/routes/export.ts
import { Router } from 'express';
import { exportController } from '../controllers/ExportController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';

const router = Router();

// Todas as rotas de exportação requerem autenticação e autorização de admin
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin']));

// Limite de taxa específico para exportações (mais restritivo)
router.use(RateLimitMiddleware.forRoute({
  points: 5,
  duration: 60 * 15, // 15 minutos
  blockDuration: 60 * 60 // 1 hora de bloqueio após exceder
}));

// Rotas de exportação
router.get('/projects', exportController.exportProjects.bind(exportController));
router.get('/certificates', exportController.exportCertificates.bind(exportController));
router.get('/users', exportController.exportUsers.bind(exportController));
router.get('/download/:filename', exportController.downloadExportedFile.bind(exportController));

export { router as exportRoutes };