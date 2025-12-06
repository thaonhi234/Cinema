import { Router } from 'express';
import { checkAuth, checkRole } from '../middleware/authMiddleware';
import { EmployeeController } from '../controllers/EmployeeController';

const router = Router();
const employeeController = new EmployeeController();

// Bảo vệ tất cả các route Employee
router.use(checkAuth); 

// GET /api/employees: READ + FILTER (cho Manager và Staff)
router.get('/', checkRole('manager', 'staff'), employeeController.getAllEmployees); 

// CHỈ MANAGER MỚI CÓ QUYỀN CREATE, UPDATE, DELETE
router.post('/', checkRole('manager'), employeeController.createEmployee); 
router.put('/:id', checkRole('manager'), employeeController.updateEmployee); 
router.delete('/:id', checkRole('manager'), employeeController.deleteEmployee); 

export default router;