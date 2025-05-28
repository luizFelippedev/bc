// src/routes/admin.ts - Rotas administrativas
import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { authController } from '../controllers/AuthController';
import { adminController } from '../controllers/AdminController';
import { projectController } from '../controllers/ProjectController';
import { certificateController } from '../controllers/CertificateController';
import { configurationController } from '../controllers/ConfigurationController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import path from 'path';
import fs from 'fs';

const router = Router();

// Garantir que o diretório de uploads existe
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Rate limiting para admin
router.use(RateLimitMiddleware.adminLimiter);

// Rotas de autenticação (sem middleware de auth)
router.post('/auth/login', 
  ValidationMiddleware.validate(ValidationMiddleware.schemas.login),
  (req, res, next) => authController.login(req, res, next)
);

router.post('/auth/logout', 
  authMiddleware.authenticate,
  (req, res, next) => authController.logout(req, res, next)
);

router.get('/auth/verify', 
  authMiddleware.authenticate, 
  (req, res, next) => authController.verifyToken(req, res, next)
);

router.post('/auth/refresh',
  authMiddleware.authenticate,
  (req, res, next) => authController.refreshToken(req, res, next)
);

// Middleware de autenticação e autorização para todas as rotas abaixo
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin']));

// Dashboard e analytics
router.get('/dashboard', (req, res, next) => adminController.getDashboardData(req, res, next));
router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));
router.get('/realtime', (req, res, next) => adminController.getRealTimeStats(req, res, next));

// Rotas de projetos
router.get('/projects', (req, res, next) => projectController.getAllProjects(req, res, next));
router.get('/projects/:id', (req, res, next) => projectController.getProject(req, res, next));

router.post('/projects', 
  upload.fields([
    { name: 'featured', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  ValidationMiddleware.validate(ValidationMiddleware.schemas.createProject),
  (req, res, next) => projectController.createProject(req, res, next)
);

router.put('/projects/:id', 
  upload.fields([
    { name: 'featured', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  (req, res, next) => projectController.updateProject(req, res, next)
);

router.delete('/projects/:id', (req, res, next) => projectController.deleteProject(req, res, next));
router.patch('/projects/:id/featured', (req, res, next) => projectController.toggleFeatured(req, res, next));

// Rotas de certificados
router.get('/certificates', (req, res, next) => certificateController.getAllCertificates(req, res, next));
router.get('/certificates/:id', (req, res, next) => certificateController.getCertificate(req, res, next));

router.post('/certificates', 
  upload.single('image'), 
  (req, res, next) => certificateController.createCertificate(req, res, next)
);

router.put('/certificates/:id', 
  upload.single('image'), 
  (req, res, next) => certificateController.updateCertificate(req, res, next)
);

router.delete('/certificates/:id', (req, res, next) => certificateController.deleteCertificate(req, res, next));
router.patch('/certificates/:id/featured', (req, res, next) => certificateController.toggleFeatured(req, res, next));

// Rotas de configuração
router.get('/configuration', (req, res, next) => configurationController.getConfiguration(req, res, next));

router.put('/configuration', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 },
    { name: 'metaImage', maxCount: 1 }
  ]), 
  (req, res, next) => configurationController.updateConfiguration(req, res, next)
);

export default router;