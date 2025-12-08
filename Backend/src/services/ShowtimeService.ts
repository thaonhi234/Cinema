import { getPool } from '../dataaccess/SqlDataAccess';
import sql from 'mssql';

export class ShowtimeService {

    // 👇 Hàm tự động sửa giờ (Frontend không cần lo nữa)
    private fixTimeFormat(timeString: any): string {
        if (!timeString) return '00:00:00';
        const str = String(timeString).trim();
        
        // Nếu Frontend gửi "07:00" (5 ký tự) -> Server tự thêm ":00"
        if (str.length === 5) return str + ':00';
        
        // Nếu Frontend gửi "7:00" (4 ký tự) -> Server tự sửa thành "07:00:00"
        if (str.length === 4) return '0' + str + ':00';
        
        return str;
    }
    
    // 1. Lấy danh sách (Giữ nguyên)
    async getAllShowtimes(branchId: number, date: string) {
        const pool = await getPool();
        const result = await pool.request()
            .input('BranchID', sql.Int, branchId)
            .input('Date', sql.Date, date) 
            .execute('Screening.sp_GetAllShowtimes');
        return result.recordset;
    }

    // 2. Thêm suất chiếu (Đã nâng cấp)
    async createShowtime(data: any) {
        const pool = await getPool();
        const timeId = Math.floor(Math.random() * 1000000);

        // Server tự xử lý giờ
        const startTimeFixed = this.fixTimeFormat(data.StartTime);
        const endTimeFixed = this.fixTimeFormat(data.EndTime);

        await pool.request()
            .input('TimeID', sql.Int, timeId)
            .input('BranchID', sql.Int, data.BranchID)
            .input('RoomID', sql.Int, data.RoomID)
            .input('Day', sql.Date, data.Day)
            
            // 👇 QUAN TRỌNG: Dùng sql.VarChar để chấp nhận chuỗi, tránh lỗi Validation
            .input('StartTime', sql.VarChar, startTimeFixed) 
            .input('EndTime', sql.VarChar, endTimeFixed)
            
            .input('FName', sql.NVarChar, data.FName) 
            .input('MovieID', sql.Int, data.MovieID)
            .execute('Screening.sp_InsertShowtime');
    }

    // 3. Cập nhật (Cũng nâng cấp tương tự)
    async updateShowtime(timeId: number, data: any) {
        const pool = await getPool();
        
        const startTimeFixed = this.fixTimeFormat(data.StartTime);
        const endTimeFixed = this.fixTimeFormat(data.EndTime);

        await pool.request()
            .input('TimeID', sql.Int, timeId)
            .input('BranchID', sql.Int, data.BranchID)
            .input('RoomID', sql.Int, data.RoomID)
            .input('Day', sql.Date, data.Day)
            
            // 👇 Dùng sql.VarChar
            .input('StartTime', sql.VarChar, startTimeFixed)
            .input('EndTime', sql.VarChar, endTimeFixed)
            
            .input('FName', sql.NVarChar, data.FName)
            .input('MovieID', sql.Int, data.MovieID)
            .execute('Screening.sp_UpdateShowtime');
    }

    // 4. Xóa (Giữ nguyên)
    async deleteShowtime(timeId: number, branchId: number) {
        const pool = await getPool();
        await pool.request()
            .input('TimeID', sql.Int, timeId)
            .input('BranchID', sql.Int, branchId)
            .execute('Screening.sp_DeleteShowtime');
    }
}