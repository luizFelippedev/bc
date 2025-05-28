import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { authController } from '../controllers/AuthController';
import { adminController } from '../controllers/AdminController';
import { projectController } from '../controllers/ProjectController';
import { certificateController } from '../controllers/CertificateController';
import { configurationController } from '../controllers/ConfigurationController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import path from 'path';

const router = Router();

// Configuração do multer corrigida
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

// Rotas de autenticação
router.post('/auth/login', authController.login.bind(authController));
router.post('/auth/logout', authController.logout.bind(authController));
router.get('/auth/verify', authMiddleware.authenticate, authController.verifyToken.bind(authController));

// Proteger todas as rotas abaixo com autenticação e autorização
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin']));

// Dashboard e analytics
router.get('/dashboard', adminController.getDashboardData.bind(adminController));
router.get('/analytics', adminController.getAnalytics.bind(adminController));
router.get('/realtime', adminController.getRealTimeStats.bind(adminController));

// Projetos
router.get('/projects', projectController.getAllProjects.bind(projectController));
router.get('/projects/:id', projectController.getProject.bind(projectController));
router.post('/projects', 
  upload.fields([
    { name: 'featured', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  projectController.createProject.bind(projectController)
);
router.put('/projects/:id', 
  upload.fields([
    { name: 'featured', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  projectController.updateProject.bind(projectController)
);
router.delete('/projects/:id', projectController.deleteProject.bind(projectController));
router.patch('/projects/:id/featured', projectController.toggleFeatured.bind(projectController));

// Certificados
router.get('/certificates', certificateController.getAllCertificates.bind(certificateController));
router.get('/certificates/:id', certificateController.getCertificate.bind(certificateController));
router.post('/certificates', 
  upload.single('image'), 
  certificateController.createCertificate.bind(certificateController)
);
router.put('/certificates/:id', 
  upload.single('image'), 
  certificateController.updateCertificate.bind(certificateController)
);
router.delete('/certificates/:id', certificateController.deleteCertificate.bind(certificateController));
router.patch('/certificates/:id/featured', certificateController.toggleFeatured.bind(certificateController));

// Configuração
router.get('/configuration', configurationController.getConfiguration.bind(configurationController));
router.put('/configuration', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 },
    { name: 'metaImage', maxCount: 1 }
  ]), 
  configurationController.updateConfiguration.bind(configurationController)
);

export default router;