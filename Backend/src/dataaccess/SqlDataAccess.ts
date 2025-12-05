import * as sql from 'mssql';
import { User, IDataAccess } from '../models/user';
import {  
    DashboardStats, 
    WeeklyRevenue, 
    DailyRevenue, // <--- THÊM 3 INTERFACE MỚI NÀY
    Movie
} from '../models/user';
// Lấy cấu hình từ biến môi trường
const config = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    options: {
        // Cần thiết cho môi trường dev local
        encrypt: false, 
        trustServerCertificate: true // Cho phép tự tin cậy chứng chỉ server nếu dùng local
    }
};

// Connection Pool (quan trọng để quản lý kết nối hiệu quả)
let pool: sql.ConnectionPool | null = null;
let isPoolCreated = false;

export async function getPool(): Promise<sql.ConnectionPool> {
    if (pool && pool.connected) {
        return pool;
    }
    
    try {
        if (!isPoolCreated) {
            console.log(`Đang kết nối tới SQL Server: ${config.server}:${config.port}/${config.database}`);
        }
        pool = await sql.connect(config);
        if (!isPoolCreated){
        console.log("✅ Kết nối SQL Server thành công và tạo Connection Pool!");
        isPoolCreated = true;
        }
        return pool;
    } catch (err) {
        console.error("❌ Lỗi kết nối SQL Server:", err);
        // Ngắt quá trình khởi động server nếu không kết nối được DB
        throw new Error('Database connection failed');
    }
}

export class SQLDataAccess implements IDataAccess {
    
    constructor() {
        // Khởi tạo pool ngay khi lớp được tạo
        if (!pool) {
        getPool().catch(err => {
            console.error("❌ Không thể khởi tạo Connection Pool:", err);
        });
    }
    }

    /**
     * Tìm kiếm người dùng bằng email, kiểm tra cả bảng Customer và Employee.
     */
    async getUserByEmail(email: string): Promise<User | null> {
        const db = await getPool();

        // 1. Kiểm tra trong bảng Customer
        let result = await db.request()
            .input('email', sql.VarChar(30), email)
            .query(`SELECT CUserID, CName, Email, EPassword, UserType 
                    FROM Customer.CUSTOMER 
                    WHERE Email = @email`);

        if (result.recordset.length > 0) {
            const record = result.recordset[0];
            return {
                MaNguoiDung: record.CUserID,
                HoTen: record.CName,
                Email: record.Email,
                PasswordHash: record.EPassword,
                VaiTro: record.UserType.toLowerCase() === 'member' ? 'customer' : 'customer', // Mặc định Customer là customer
                isEmployee: false,
            };
        }

        // 2. Kiểm tra trong bảng Employee
        result = await db.request()
            .input('email', sql.VarChar(30), email)
            .query(`SELECT EUserID, EName, Email, EPassword, UserType 
                    FROM Staff.EMPLOYEE 
                    WHERE Email = @email`);

        if (result.recordset.length > 0) {
            const record = result.recordset[0];
            return {
                MaNguoiDung: record.EUserID,
                HoTen: record.EName,
                Email: record.Email,
                PasswordHash: record.EPassword,
                VaiTro: record.UserType.toLowerCase() as 'staff' | 'manager', // Role có thể là staff hoặc manager
                isEmployee: true,
            };
        }

        return null; // Không tìm thấy người dùng
    }
    async getDashboardStats(): Promise<DashboardStats> {
        const db = await getPool();
        const today = new Date().toISOString().slice(0, 10); // Lấy ngày hôm nay (YYYY-MM-DD)

        // Thực hiện các truy vấn song song để tăng tốc độ
        const [
            totalMoviesResult,
            activeRoomsResult,
            showtimesTodayResult,
            ticketsSoldResult
        ] = await Promise.all([
            // 1. Total Movies
            db.request().query(`SELECT COUNT(*) as total FROM Movie.MOVIE`),

            // 2. Active Rooms (Giả sử RoomType có trường IsActive)
            db.request().query(`SELECT COUNT(*) as active FROM Cinema.SCREENROOM`),
            
            // 3. Showtimes Today
            db.request().input('today', sql.Date, today)
            .query(`SELECT COUNT(*) as total FROM Screening.TIME WHERE Day = @today`),
            // 4. Tickets Sold Today (giả sử vé đã bán được ghi nhận trong Booking.ORDERITEM)
            db.request().input('today', sql.Date, today)
            .query(`SELECT COUNT(*) as total 
                    FROM Screening.TICKETS 
                    WHERE DaySold = @today`)
        ]);


        return {
            totalMovies: totalMoviesResult.recordset[0].total,
            activeRooms: activeRoomsResult.recordset[0].active,
            showtimesToday: showtimesTodayResult.recordset[0].total,
            ticketsSold: ticketsSoldResult.recordset[0].total,
        };
    }

    // Phương thức MỚI: Lấy dữ liệu Doanh thu hàng tuần
    async getWeeklyRevenueData(): Promise<{ summary: WeeklyRevenue, daily: DailyRevenue[] }> {
        const db = await getPool();
        
        // Gọi Stored Procedure đã được cung cấp
        const result = await db.request()
            .execute('sp_GetWeeklyRevenueAndGrowth');

        // result.recordsets[0] là kết quả tổng quan (WeeklyRevenue)
        // result.recordsets[1] là kết quả chi tiết theo ngày (DailyRevenue[])
        const recordsetsArray = result.recordsets as any[];
       const summary = recordsetsArray[0][0] as WeeklyRevenue; // <--- Dùng recordsetsArray[0]
        const daily = recordsetsArray[1] as DailyRevenue[];
        
        // Chuyển đổi GrowthRate từ SP sang dạng số thập phân nếu cần (SP đã trả về DECIMAL(5, 2))
        // Chỉ cần đảm bảo các trường tên đúng như interface
        
        return { 
            summary: {
                TotalRevenue: parseFloat(summary.TotalRevenue.toString()),
                PreviousWeekRevenue: parseFloat(summary.PreviousWeekRevenue.toString()),
                GrowthRate: parseFloat(summary.GrowthRate.toString())
            }, 
            daily: daily.map(d => ({
                DayName: d.DayName,
                DailyRevenue: parseFloat(d.DailyRevenue.toString()),
            })) 
        };
    }
    async getAllMovies(): Promise<Movie[]> {
        // ... (SQL query để JOIN, GROUP BY, và tính AvgRating, Genres)
        // ... (Logic đã được cung cấp trước đó)
        const db = await getPool();

        // CHỈ GỌI STORED PROCEDURE
       const result = await db.request() // Đảm bảo tên tham số khớp với SP
             .execute('Movie.sp_GetAllMovies'); 
        // Ánh xạ bản ghi đơn lẻ sang interface Movie (chú ý: tên trường phải khớp với SELECT của SP)
        const movies: Movie[] = result.recordset.map(record => ({
    MovieID: record.MovieID,
    MName: record.MName,
    Descript: record.Descript,
    RunTime: record.RunTime,
    isDub: record.isDub,
    isSub: record.isSub,
    releaseDate: record.releaseDate,
    closingDate: record.closingDate,
    AgeRating: record.AgeRating,
    AvgRating: record.AvgRating ? parseFloat(record.AvgRating.toFixed(1)) : 0,
    Genres: record.GenresList ? record.GenresList.split(',').map((g: string) => g.trim()) : [],
    Status: record.Status,
}));
return movies;
    }

    // Phương thức TẠO (Sử dụng SP newMovie hoặc sp_InsertNewMovie nếu bạn đã tạo)
    async createMovie(movie: any, genres: string[]): Promise<void> {
        const db = await getPool();
        // Giả sử bạn sử dụng SP Movie.sp_InsertNewMovie đã được gợi ý
        await db.request()
            .input('id', sql.Int, movie.MovieID)
            .input('name', sql.VarChar(255), movie.MName)
            .input('descript', sql.NVarChar(sql.MAX), movie.Descript || 'No description provided')
            .input('runtime', sql.TinyInt, movie.RunTime)
            .input('dub', sql.Bit, movie.isDub)
            .input('sub', sql.Bit, movie.isSub)
            .input('release', sql.Date, movie.releaseDate)
            .input('closing', sql.Date, movie.closingDate)
            .input('agerating', sql.VarChar(30), movie.AgeRating)
            // Tham số cuối cùng: Genres
            .input('Genres', sql.NVarChar(sql.MAX), genres.join(',')) 
            .execute('Movie.sp_InsertNewMovie');
    }
    
    // Phương thức CẬP NHẬT (Sử dụng SP Movie.sp_UpdateMovie)
    async updateMovie(movie: any, genres: string[]): Promise<void> {
        const db = await getPool();
        await db.request()
            .input('id', sql.Int, movie.MovieID)
            .input('name', sql.VarChar(255), movie.MName)
            .input('descript', sql.NVarChar(sql.MAX), movie.Descript || 'No description provided')
            .input('runtime', sql.TinyInt, movie.RunTime)
            .input('dub', sql.Bit, movie.isDub)
            .input('sub', sql.Bit, movie.isSub)
            .input('release', sql.Date, movie.releaseDate)
            .input('closing', sql.Date, movie.closingDate)
            .input('agerating', sql.VarChar(30), movie.AgeRating)
            // Tham số cuối cùng: Genres
            .input('Genres', sql.NVarChar(sql.MAX), genres.join(',')) 
            .execute('Movie.sp_UpdateMovie');
    }

    // Phương thức XÓA (Sử dụng SP deleteMovie hoặc sp_DeleteMovie)
    async deleteMovie(movieId: number): Promise<void> {
        const db = await getPool();
        // Dùng SP cũ deleteMovie (đã sửa THROW) hoặc SP mới Movie.sp_DeleteMovie
        await db.request()
            .input('id', sql.Int, movieId)
            .execute('deleteMovie'); 
    }
    async getMovieById(movieId: number): Promise<Movie | null> {
    const db = await getPool();

    const result = await db.request()
        .input('MovieID', sql.Int, movieId)
        .execute('Movie.sp_GetMovieById'); // SP lấy phim theo ID

    const record = result.recordset[0];
    if (!record) return null;

    return {
        MovieID: record.MovieID,
        MName: record.MName,
        Descript: record.Descript,
        RunTime: record.RunTime,
        isDub: record.isDub,
        isSub: record.isSub,
        releaseDate: record.releaseDate,
        closingDate: record.closingDate,
        AgeRating: record.AgeRating,
        AvgRating: record.AvgRating ? parseFloat(record.AvgRating.toFixed(1)) : 0,
        Genres: record.GenresList ? record.GenresList.split(',').map((g: string) => g.trim()) : [],
        Status: record.Status,
    };
}

}