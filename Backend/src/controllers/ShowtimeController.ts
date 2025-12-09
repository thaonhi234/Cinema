import { Request, Response } from 'express';
import { ShowtimeService } from '../services/ShowtimeService'; // Gọi Service

export class ShowtimeController {
    private service = new ShowtimeService();

    // GET /api/showtimes?branchId=1&date=2025-12-08
    getAllShowtimes = async (req: Request, res: Response) => {
        try {
            const branchId = 1; // Hoặc lấy từ token
            
            // 👇 SỬA ĐOẠN NÀY: Lấy query date, nếu không có thì gán rỗng hoặc null
            const date = req.query.date as string || ''; 
            
            const list = await this.service.getAllShowtimes(branchId, date);
            res.status(200).json(list);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // POST /api/showtimes
    createShowtime = async (req: Request, res: Response) => {
        try {
            await this.service.createShowtime(req.body);
            res.status(201).json({ message: 'Tạo suất chiếu thành công!' });
        } catch (error: any) {
            // Lỗi 50001 từ SQL (Trùng lịch) sẽ rơi vào đây
            res.status(400).json({ message: error.message || 'Lỗi trùng lịch chiếu' });
        }
    }

    // PUT /api/showtimes/:id
    updateShowtime = async (req: Request, res: Response) => {
        try {
            const timeId = parseInt(req.params.id);
            await this.service.updateShowtime(timeId, req.body);
            res.status(200).json({ message: 'Cập nhật thành công!' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // DELETE /api/showtimes/:id
    deleteShowtime = async (req: Request, res: Response) => {
        try {
            const timeId = parseInt(req.params.id);
            // Tạm thời hardcode branchId = 1 để test xóa
            const branchId = parseInt(req.query.branchId as string) || 1;
            
            await this.service.deleteShowtime(timeId, branchId);
            res.status(200).json({ message: 'Xóa thành công!' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}