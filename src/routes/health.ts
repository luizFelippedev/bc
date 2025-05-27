// src/routes/health.ts
import { Router } from 'express';
import { healthController } from '../controllers/HealthController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Rota pública - para load balancers e ferramentas de monitoramento
router.get('/', healthController.getHealth.bind(healthController));

// Rotas protegidas - apenas para administradores
router.get('/detailed', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.authorize(['admin']), 
  healthController.getDetailedHealth.bind(healthController)
);

router.get('/check', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.authorize(['admin']), 
  healthController.checkHealth.bind(healthController)
);

export { router as healthRoutes };