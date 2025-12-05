import { Request, Response } from 'express';
import { IDataAccess } from '../models/user';
import { SQLDataAccess } from '../dataaccess/SqlDataAccess';

const dataAccess: IDataAccess = new SQLDataAccess();

export class DashboardController {
    
    // Lấy 4 số liệu tổng quan
    async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await dataAccess.getDashboardStats();
            return res.status(200).json(stats);
        } catch (error) {
            console.error('Lỗi khi lấy Dashboard Stats:', error);
            return res.status(500).json({ message: 'Lỗi server khi lấy số liệu tổng quan.' });
        }
    }

    // Lấy doanh thu hàng tuần và chi tiết theo ngày
    async getWeeklyRevenue(req: Request, res: Response) {
        try {
            const data = await dataAccess.getWeeklyRevenueData();
            
            // Format lại Daily Revenue cho FE dễ dùng (đảm bảo 7 ngày)
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const formattedDaily = days.map(day => {
                const dayData = data.daily.find(d => d.DayName.toLowerCase() === day.toLowerCase());
                return {
                    DayName: day.substring(0, 3), // Mon, Tue, ...
                    Revenue: dayData ? dayData.DailyRevenue : 0
                };
            });
            
            return res.status(200).json({
                summary: data.summary, // { TotalRevenue, PreviousWeekRevenue, GrowthRate }
                dailyRevenue: formattedDaily
            });

        } catch (error) {
            console.error('Lỗi khi lấy Doanh thu hàng tuần:', error);
            return res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu doanh thu.' });
        }
    }
}