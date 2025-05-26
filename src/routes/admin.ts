// src/routes/admin.ts - Rotas Administrativas Completas
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { AuditMiddleware } from '../middleware/AuditMiddleware';
import { SecurityMiddleware } from '../middleware/SecurityMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { upload } from '../middleware/UploadMiddleware';

const router = Router();
const adminController = new AdminController();

// Middlewares globais admin
router.use(authenticate);
router.use(authorize(['admin']));
router.use(SecurityMiddleware.antiInjection);

// Dashboard
router.get('/dashboard', AuditMiddleware.audit('dashboard_view', 'admin'), adminController.getDashboardData.bind(adminController));

// System
router.get('/system/metrics', adminController.getSystemMetrics.bind(adminController));
router.get('/system/config', adminController.getSystemConfig.bind(adminController));
router.put('/system/config', AuditMiddleware.audit('system_config_update', 'system'), adminController.updateSystemConfig.bind(adminController));

// Analytics
router.get('/analytics/advanced', adminController.getAdvancedAnalytics.bind(adminController));
router.get('/analytics/performance', adminController.getPerformanceMetrics.bind(adminController));

// Usuários
router.get('/users', adminController.getUsers.bind(adminController));
router.put('/users/:userId/role', AuditMiddleware.audit('user_role_update', 'user'), ValidationMiddleware.validateBody(['role']), adminController.updateUserRole.bind(adminController));

// Projetos
router.get('/projects', adminController.getAllProjects?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/projects', upload.fields([{ name: 'featuredImage', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), AuditMiddleware.audit('project_create', 'project'), ValidationMiddleware.validateBody(['title', 'shortDescription', 'category']), adminController.createProject?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.put('/projects/:id', upload.fields([{ name: 'featuredImage', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), AuditMiddleware.audit('project_update', 'project'), adminController.updateProject?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.delete('/projects/:id', AuditMiddleware.audit('project_delete', 'project'), adminController.deleteProject?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.get('/projects/:id/analytics', adminController.getProjectAnalytics?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));

// Certificados
router.get('/certificates', adminController.getAllCertificates?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/certificates', upload.fields([{ name: 'certificate', maxCount: 1 }, { name: 'badge', maxCount: 1 }]), AuditMiddleware.audit('certificate_create', 'certificate'), ValidationMiddleware.validateBody(['title', 'issuer', 'dates']), adminController.createCertificate?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.put('/certificates/:id', upload.fields([{ name: 'certificate', maxCount: 1 }, { name: 'badge', maxCount: 1 }]), AuditMiddleware.audit('certificate_update', 'certificate'), adminController.updateCertificate?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.delete('/certificates/:id', AuditMiddleware.audit('certificate_delete', 'certificate'), adminController.deleteCertificate?.bind(adminController) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs.bind(adminController));

// Backup
router.post('/backup', AuditMiddleware.audit('backup_create', 'system'), SecurityMiddleware.createAdvancedRateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 1 }), adminController.createBackup.bind(adminController));

// Cache
router.post('/cache/clear', AuditMiddleware.audit('cache_clear', 'system'), adminController.clearCache.bind(adminController));

export { router as adminRoutes };