import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

const router = Router();
const controller = new AuthController();

router.post('/login', ValidationMiddleware.loginValidation(), ValidationMiddleware.handleValidationErrors, controller.login.bind(controller));
router.post('/logout', controller.logout?.bind(controller) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/refresh-token', controller.refreshToken?.bind(controller) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.get('/verify', controller.verifyToken?.bind(controller) || ((req, res) => res.status(501).json({ message: 'Not implemented' })));

export { router as authRoutes };
