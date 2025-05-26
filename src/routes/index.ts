import { Router } from 'express';
import adminRoutes from './admin';
import publicRoutes from './public';

const router = Router();

// Rotas administrativas
router.use('/admin', adminRoutes);

// Rotas públicas
router.use('/', publicRoutes);

export default router;