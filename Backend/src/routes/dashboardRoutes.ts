import { Router } from 'express';
import { checkAuth, checkRole } from '../middleware/authMiddleware'; // <--- Import middleware
import { DashboardController } from '../controllers/DashboardController'; // <--- Import Controller

const router = Router();
const dashboardController = new DashboardController();

// Áp dụng checkAuth cho tất cả các route Dashboard
// Chỉ cho phép VaiTro là 'manager' hoặc 'staff' truy cập
router.use(checkAuth);
router.use(checkRole('manager', 'staff'));

// GET /api/dashboard/stats
router.get('/stats', dashboardController.getDashboardStats); 

// GET /api/dashboard/weekly-revenue
router.get('/weekly-revenue', dashboardController.getWeeklyRevenue); 

export default router;