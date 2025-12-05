// // src/services/DashboardService.ts
// // Hoặc thư viện kết nối SQL của bạn
// import { getPool } from '../dataaccess/SqlDataAccess'; // Đường dẫn đến module kết nối DB của bạn

// // Interface định nghĩa cấu trúc dữ liệu trả về từ Quick Stats
// interface QuickStatsResult {
//     TotalMovies: number;
//     ActiveRooms: number;
//     ShowtimesToday: number;
//     TicketsSold: number;
//     OccupancyRate: number;
// }

// // Interface cho kết quả Doanh thu
// interface WeeklyRevenueResult {
//     TotalRevenue: number;
//     GrowthRate: number;
//     DailyRevenue: Array<{ DayName: string; DailyRevenue: number }>;
// }

// export class DashboardService {

//     // 1. Lấy chỉ số tổng hợp
//     async getQuickStats(): Promise<QuickStatsResult> {
//         try {
//             // SP: sp_GetQuickStats (Đã định nghĩa trong câu trả lời trước, nhưng cần đảm bảo nó trả 5 kết quả)
//             const dbPool = await getPool(); 

//             // SP: sp_GetQuickStats
//             const result = await dbPool.request()
//                 .execute('sp_GetQuickStats');
            
//             // Giả định SP trả về 5 result sets, hoặc bạn cần chỉnh SP để trả về 1 row duy nhất cho 4 chỉ số đầu.
//             // Nếu SP của bạn trả về 5 result sets (1 cho mỗi chỉ số), bạn cần kết hợp chúng:
//             const totalMovies = result.recordsets[0][0]?.TotalMovies || 0;
//             const activeRooms = result.recordsets[1][0]?.ActiveRooms || 0;
//             const showtimesToday = result.recordsets[2][0]?.ShowtimesToday || 0;
//             const ticketsSold = result.recordsets[3][0]?.TicketsSold || 0;
//             const occupancyRate = result.recordsets[4][0]?.OccupancyRate || 0;
            
//             return {
//                 TotalMovies: totalMovies,
//                 ActiveRooms: activeRooms,
//                 ShowtimesToday: showtimesToday,
//                 TicketsSold: ticketsSold,
//                 OccupancyRate: occupancyRate,
//             };

//         } catch (error) {
//             console.error('Lỗi khi lấy Quick Stats:', error);
//             throw new Error('Không thể lấy dữ liệu thống kê nhanh.');
//         }
//     }

//     // 2. Lấy Doanh thu hàng tuần
//     async getWeeklyRevenue(): Promise<WeeklyRevenueResult> {
//         try {
//             const dbPool = await getPool(); // Lấy Pool kết nối
//             const result = await dbPool.request()
//                 .execute('sp_GetWeeklyRevenueAndGrowth');
//             // Result set 1: Tổng quan (TotalRevenue, GrowthRate)
//             const totalStats = result.recordsets[0][0];
            
//             // Result set 2: Chi tiết theo ngày (cho biểu đồ)
//             const dailyRevenueData: { DayName: string; DailyRevenue: number }[] = result.recordsets[1].map((row: any) => ({
//     DayName: row.DayName,
//     DailyRevenue: parseFloat(row.DailyRevenue)
// }));
// const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// const formattedDailyRevenue = daysOrder.map((day: string) => {
//     const found = dailyRevenueData.find((d: { DayName: string; DailyRevenue: number }) => d.DayName === day);
//     return { DayName: day.substring(0, 3), DailyRevenue: found ? found.DailyRevenue : 0 };
// });


//             return {
//                 TotalRevenue: parseFloat(totalStats.TotalRevenue) || 0,
//                 GrowthRate: parseFloat(totalStats.GrowthRate) || 0,
//                 DailyRevenue: formattedDailyRevenue,
//             };

//         } catch (error) {
//             console.error('Lỗi khi lấy Weekly Revenue:', error);
//             throw new Error('Không thể lấy dữ liệu doanh thu hàng tuần.');
//         }
//     }

//     // 3. Lấy Tỷ lệ Hài lòng Khách hàng
//     async getCustomerSatisfaction(): Promise<number> {
//         try {
//             // SP: sp_GetSatisfactionRate (Đã định nghĩa)
//            const dbPool = await getPool(); // Lấy Pool kết nối
//             const result = await dbPool.request()
//                 .execute('sp_GetSatisfactionRate');
//             // Giả định SP trả về một cột AvgRating
//             const avgRating = result.recordset[0]?.AvgRating || 0;

//             // Chuyển rating (thang 1-10) thành tỷ lệ % (0-100)
//             return (parseFloat(avgRating) * 10); 

//         } catch (error) {
//             console.error('Lỗi khi lấy Satisfaction Rate:', error);
//             throw new Error('Không thể lấy dữ liệu hài lòng khách hàng.');
//         }
//     }

// }