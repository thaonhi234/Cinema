import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/logout', authController.logout);
export default router;