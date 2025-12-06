import { Request, Response } from 'express';
import { SQLDataAccess } from '../dataaccess/SqlDataAccess'; 

const dataAccess = new SQLDataAccess();

// Định nghĩa interface để truy cập user đã được gắn bởi authMiddleware
interface AuthRequest extends Request {
    user?: {
        MaNguoiDung: string;
        VaiTro: 'staff' | 'manager';
        BranchID: number;
    };
}

export class EmployeeController {
    
    // [GET] /api/employees?search=... (READ + FILTER)
    async getAllEmployees(req: AuthRequest, res: Response) {
        const user = req.user!; 
        const branchId = user.BranchID;
        // Lấy tham số tìm kiếm từ query (ví dụ: ?search=nguyen)
        const searchTerm = req.query.search as string;

        if (!branchId) {
            return res.status(403).json({ message: 'Không xác định được chi nhánh.' });
        }
        
        try {
            // Truyền BranchID và SearchTerm xuống Data Access
            const employees = await dataAccess.getAllEmployees(branchId, searchTerm); 
            return res.status(200).json(employees);
        } catch (error) {
            console.error('Lỗi khi tải nhân viên:', error);
            return res.status(500).json({ message: 'Lỗi server khi tải danh sách nhân viên.' });
        }
    }
    
    // [POST] /api/employees (CREATE)
    async createEmployee(req: AuthRequest, res: Response) {
        const user = req.user!;
        const employeeData = req.body;
        
        // Kiểm tra bảo mật: Manager chỉ được tạo nhân viên trong chi nhánh của mình
        if (employeeData.BranchID !== user.BranchID) {
             return res.status(403).json({ message: 'Bạn không thể tạo nhân viên cho chi nhánh khác.' });
        }
        
        try {
            await dataAccess.createEmployee(employeeData);
            return res.status(201).json({ message: 'Nhân viên đã được thêm thành công!' });
        } catch (error) {
            console.error('Lỗi tạo nhân viên:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi tạo nhân viên.' });
        }
    }
    
    // [PUT] /api/employees/:id (UPDATE)
    async updateEmployee(req: AuthRequest, res: Response) {
        const user = req.user!;
        const employeeId = req.params.id;
        const employeeData = { ...req.body, EmployeeID: employeeId };
        
        // Kiểm tra bảo mật: Manager chỉ được cập nhật nhân viên trong chi nhánh của mình
        if (employeeData.BranchID !== user.BranchID) {
            return res.status(403).json({ message: 'Bạn không thể cập nhật nhân viên chi nhánh khác.' });
        }

        try {
            await dataAccess.updateEmployee(employeeData);
            return res.status(200).json({ message: 'Nhân viên đã được cập nhật thành công!' });
        } catch (error) {
            console.error('Lỗi cập nhật nhân viên:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi cập nhật nhân viên.' });
        }
    }
    
    // [DELETE] /api/employees/:id (DELETE)
    async deleteEmployee(req: AuthRequest, res: Response) {
        const user = req.user!;
        const employeeId = req.params.id;
        
        // Logic kiểm tra BranchID của nhân viên bị xóa nên được thêm vào SP để bảo mật DB.
        
        try {
            await dataAccess.deleteEmployee(employeeId);
            return res.status(200).json({ message: 'Nhân viên đã được xóa thành công.' });
        } catch (error) {
            console.error('Lỗi xóa nhân viên:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi xóa nhân viên.' });
        }
    }
}