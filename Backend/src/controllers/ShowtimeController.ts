import { Request, Response } from 'express';
import { SQLDataAccess } from '../dataaccess/SqlDataAccess'; 

const dataAccess = new SQLDataAccess();

export class ShowtimeController {
    
    // GET /api/showtimes
    async getAllShowtimes(req: Request, res: Response) {
        const user = (req as any).user;
        const branchId = user.BranchID;
        // Lấy ngày cần lọc từ query param (Ví dụ: /showtimes?date=2025-12-06)
        const dateFilter = req.query.date as string || new Date().toISOString().split('T')[0];

        if (!branchId || (user.VaiTro !== 'manager' && user.VaiTro !== 'staff')) {
            return res.status(403).json({ message: 'Không có quyền truy cập.' });
        }

        try {
            const showtimes = await dataAccess.getAllShowtimes(branchId, dateFilter); 
            return res.status(200).json(showtimes);
        } catch (error) {
            console.error('Lỗi khi lấy suất chiếu:', error);
            return res.status(500).json({ message: 'Lỗi server khi tải suất chiếu.' });
        }
    }
    
    // POST /api/showtimes
    async createShowtime(req: Request, res: Response) {
        const user = (req as any).user;
        const branchId = user.BranchID;
        const showtimeData = req.body;
        
        if (user.VaiTro !== 'manager' || !branchId) {
            return res.status(403).json({ message: 'Chỉ Manager mới có quyền tạo suất chiếu.' });
        }
        
        // Đảm bảo BranchID của suất chiếu khớp với BranchID của Manager
        if (showtimeData.BranchID !== branchId) {
             return res.status(403).json({ message: 'Không thể tạo suất chiếu cho chi nhánh khác.' });
        }

        try {
            await dataAccess.createShowtime(showtimeData);
            return res.status(201).json({ message: 'Suất chiếu đã được thêm thành công!' });
        } catch (error) {
            console.error('Lỗi tạo suất chiếu:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi tạo suất chiếu (Có thể trùng lịch).' });
        }
    }
    
    // DELETE /api/showtimes/:id
    async deleteShowtime(req: Request, res: Response) {
        const user = (req as any).user;
        const timeId = parseInt(req.params.id);
        const branchId = user.BranchID;

        if (user.VaiTro !== 'manager' || !branchId) {
            return res.status(403).json({ message: 'Chỉ Manager mới có quyền xóa.' });
        }

        try {
            await dataAccess.deleteShowtime(timeId, branchId);
            return res.status(200).json({ message: 'Suất chiếu đã được xóa thành công.' });
        } catch (error) {
            console.error('Lỗi xóa suất chiếu:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi xóa suất chiếu.' });
        }
    }
    
    // Cần thêm UpdateShowtime nếu cần
    async updateShowtime(req: Request, res: Response) {
        const user = (req as any).user;
        const timeId = parseInt(req.params.id);
        const branchId = user.BranchID;
        const showtimeData = { ...req.body, TimeID: timeId, BranchID: branchId };
        
        if (user.VaiTro !== 'manager' || !branchId) {
            return res.status(403).json({ message: 'Chỉ Manager mới có quyền cập nhật suất chiếu.' });
        }
        
        // Kiểm tra BranchID của suất chiếu phải khớp với Manager
        if (showtimeData.BranchID !== branchId) {
             return res.status(403).json({ message: 'Không thể cập nhật suất chiếu cho chi nhánh khác.' });
        }

        try {
            await dataAccess.updateShowtime(showtimeData);
            return res.status(200).json({ message: 'Suất chiếu đã được cập nhật thành công!' });
        } catch (error) {
            console.error('Lỗi cập nhật suất chiếu:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi cập nhật suất chiếu (Có thể trùng lịch hoặc đã bán vé).' });
        }
    }
}