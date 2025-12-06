import { Request } from "express";

// Mô hình người dùng trả về từ DataAccess
export interface User {
    MaNguoiDung: string; // CUserID hoặc EUserID
    HoTen: string; // CName hoặc EName
    Email: string;
    PasswordHash: string; // EPassword (mật khẩu dạng plaintext trong DB của bạn)
    VaiTro: 'customer' | 'staff' | 'manager'; // Vai trò dựa trên UserType
    isEmployee: boolean; // Phân biệt Customer và Employee
    BranchID?: number;
}

// Interface định nghĩa các phương thức truy cập DB bắt buộc
// export interface IDataAccess {
//     getUserByEmail(email: string): Promise<User | null>;
//     // Có thể thêm các phương thức khác ở đây: createOrder, getMovieById, etc.
// }
// ... (các import và interface User giữ nguyên)

export interface DashboardStats {
    totalMovies: number;
    activeRooms: number;
    showtimesToday: number;
    ticketsSold: number;
}

export interface WeeklyRevenue {
    TotalRevenue: number;
    PreviousWeekRevenue: number;
    GrowthRate: number;
}

export interface DailyRevenue {
    DayName: string;
    DailyRevenue: number;
}
export interface Movie {
    MovieID: number;
    MName: string;
    Descript: string;
    RunTime: number;
    isDub: boolean; // Có lồng tiếng không (BIT)
    isSub: boolean; // Có phụ đề không (BIT)
    releaseDate: Date;
    closingDate: Date;
    AgeRating: string;
    AvgRating?: number; 
    Genres?: string[];
    Status?: 'Now Showing' | 'Coming Soon' | 'Ended' | string;
}
export interface RoomDetails {
    BranchID: number;
    RoomID: number;
    BranchName: string;
    RType: string;
    TotalCapacity: number;
    TotalRows: number;
    MaxColumns: number;
}
export interface SeatDetail {
    SRow: number;
    SColumn: number;
    SType: boolean;
    SStatus: boolean;
}
// Interface định nghĩa các phương thức truy cập DB bắt buộc
export interface IDataAccess {
    getUserByEmail(email: string): Promise<User | null>;
    
    // THÊM CÁC PHƯƠNG THỨC MỚI CHO DASHBOARD
    getDashboardStats(): Promise<DashboardStats>;
    getWeeklyRevenueData(branchID: number): Promise<{ summary: WeeklyRevenue, daily: DailyRevenue[] }>;
    
    // --- PHƯƠNG THỨC MỚI CHO MOVIE ---
    getAllMovies(): Promise<Movie[]>;
    getMovieById(movieId: number): Promise<Movie | null>;
    // Sử dụng SP để Insert
    createMovie(movie: any, genres: string[]): Promise<void>; 
    // Sử dụng SP để Update
    updateMovie(movie: any, genres: string[]): Promise<void>; 
    // Sử dụng SP để Delete
    deleteMovie(movieId: number): Promise<void>;

    // --- PHƯƠNG THỨC MỚI CHO ROOMS ---
    getAllRooms(branchID: number): Promise<RoomDetails[]>;
    // Hàm này phức tạp, thường gọi 2-3 SP con hoặc query
    // getSeatLayout(branchId: number, roomId: number): Promise<any>; 
    updateRoom(room: any): Promise<void>;
    createRoom(room: any): Promise<void>;
    deleteRoom(branchId: number, roomId: number): Promise<void>;
    getSeatLayout(branchId: number, roomId: number): Promise<SeatDetail[]>;
}
