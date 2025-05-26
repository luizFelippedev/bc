// ===== src/routes/auth.ts =====
import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';

const router = Router();

// Rate limiting para autenticação
router.use(RateLimitMiddleware.authLimiter);

// Rotas de autenticação
router.post('/login', 
  ValidationMiddleware.validate(ValidationMiddleware.schemas.login),
  authController.login.bind(authController)
);

router.post('/logout', 
  AuthMiddleware.authenticate,
  authController.logout.bind(authController)
);

router.get('/verify', 
  AuthMiddleware.authenticate,
  authController.verifyToken.bind(authController)
);

router.post('/refresh', 
  AuthMiddleware.authenticate,
  authController.refreshToken.bind(authController)
);

export default router;