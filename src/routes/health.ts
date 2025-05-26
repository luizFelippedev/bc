// src/routes/health.ts
import { Router } from 'express';
import { healthController } from '../controllers/HealthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota pública - para load balancers e ferramentas de monitoramento
router.get('/', healthController.getHealth.bind(healthController));

// Rotas protegidas - apenas para administradores
router.get('/detailed', 
  authMiddleware.authenticate, 
  authMiddleware.authorize(['admin']), 
  healthController.getDetailedHealth.bind(healthController)
);

router.get('/check', 
  authMiddleware.authenticate, 
  authMiddleware.authorize(['admin']), 
  healthController.checkHealth.bind(healthController)
);

export { router as healthRoutes };