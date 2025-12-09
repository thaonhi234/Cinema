import { Request, Response } from 'express';
import { SQLDataAccess } from '../dataaccess/SqlDataAccess'; 

const dataAccess = new SQLDataAccess();

export class RoomController {
    
    async getAllRooms(req: Request, res: Response) {
        const user = (req as any).user;
        const branchID = user.BranchID; // <--- Lấy BranchID từ user
        if (!branchID || (user.VaiTro !== 'manager' && user.VaiTro !== 'staff')) {
        return res.status(403).json({ message: 'Không có quyền truy cập hoặc không xác định được chi nhánh.' });
    }
        try {
            const rooms = await dataAccess.getAllRooms(branchID);
            return res.status(200).json(rooms);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            return res.status(500).json({ message: 'Lỗi server khi tải danh sách phòng.' });
        }
    }

    async createRoom(req: Request, res: Response) {
        const roomData = req.body;
        // Kiểm tra các trường bắt buộc (BranchID, RoomID, TotalRows, SeatsPerRow)
        if (!roomData.BranchID || !roomData.RoomID || !roomData.TotalRows || !roomData.SeatsPerRow) {
             return res.status(400).json({ message: 'Thiếu thông tin phòng cơ bản (ID, Rows, Seats).' });
        }

        try {
            // RCapacity có thể được tính toán bằng TotalRows * SeatsPerRow
            roomData.RCapacity = roomData.TotalRows * roomData.SeatsPerRow;
            
            await dataAccess.createRoom(roomData);
            return res.status(201).json({ message: 'Phòng và cấu hình ghế được tạo thành công!' });
        } catch (error) {
            console.error('Lỗi khi tạo phòng:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi tạo phòng.' });
        }
    }
    
    async deleteRoom(req: Request, res: Response) {
        const branchId = parseInt(req.params.branchId);
        const roomId = parseInt(req.params.roomId);
        
        try {
            await dataAccess.deleteRoom(branchId, roomId);
            return res.status(200).json({ message: 'Phòng đã được xóa thành công.' });
        } catch (error) {
            console.error('Lỗi khi xóa phòng:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi xóa phòng.' });
        }
    }
    async updateRoom(req: Request, res: Response) {
        const branchId = parseInt(req.params.branchId);
        const roomId = parseInt(req.params.roomId);
        //const { RType, RCapacity, TotalRows, SeatsPerRow } = req.body; 
        const RType = req.body.RType;
    const RCapacity = parseInt(req.body.RCapacity);
    const TotalRows = parseInt(req.body.TotalRows);
    const SeatsPerRow = parseInt(req.body.SeatsPerRow);
    // Kiểm tra các trường bắt buộc
    if (isNaN(branchId) || isNaN(roomId) || !RType || !RCapacity || !TotalRows || !SeatsPerRow) {
        return res.status(400).json({ message: 'Thiếu tham số bắt buộc để cập nhật phòng và cấu hình ghế.' });
    }
    if (RCapacity !== TotalRows * SeatsPerRow) {
         // Thông báo cho người dùng nếu Capacity không khớp với cấu hình ghế
         return res.status(400).json({ message: 'Lỗi: RCapacity phải bằng TotalRows nhân SeatsPerRow.' });
    }
    const roomData = { BranchID: branchId, RoomID: roomId, RType, RCapacity, TotalRows, SeatsPerRow };
    
    try {
        await dataAccess.updateRoom(roomData);
        return res.status(200).json({ message: 'Cập nhật phòng thành công.' });
    } catch (error) {
        // Bắt lỗi RAISERROR từ SQL SP 
        const message = (error as any).originalError?.info?.message || 'Lỗi server khi cập nhật phòng.';
        return res.status(400).json({ message });
    }
    }
    // Cần thêm getSeatLayout và updateRoom nếu cần
    async getSeatLayout(req: Request, res: Response) {
        const user = (req as any).user;
        const branchId = parseInt(req.params.branchId); 
        const roomId = parseInt(req.params.roomId);

        // Kiểm tra bảo mật (Manager chỉ được xem phòng của chi nhánh mình)
        if (user.VaiTro === 'manager' && user.BranchID !== branchId) {
            return res.status(403).json({ message: 'Bạn không có quyền quản lý phòng chiếu này.' });
        }

        try {
            // Gọi Data Access
            const seats = await dataAccess.getSeatLayout(branchId, roomId);
            return res.status(200).json(seats);
        } catch (error) {
            console.error('Lỗi khi lấy sơ đồ ghế:', error);
            return res.status(400).json({ message: (error as any).originalError?.info?.message || 'Lỗi tải sơ đồ ghế.' });
        }
    }
}