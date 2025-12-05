import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login
router.post('/login', authController.login.bind(authController));

export default router;