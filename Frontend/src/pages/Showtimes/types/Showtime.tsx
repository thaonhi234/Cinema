// File: src/pages/Showtimes/types.ts

// 1. Dữ liệu từ API (Backend trả về)
export type Showtime = {
  TimeID: number;
  MovieName: string;
  RunTime: number;
  RuntimeMinutes: number;
  RoomType: string;
  RoomID: number;
  BranchID: number;
  Day: string;
  StartTime: string;
  EndTime: string;
  Price: number;
  TicketsSold: number;
  TotalSeats: number;
  FName?: string; 
  FormatName?: string; 
  MovieID: number; 
};

// 2. Dữ liệu hiển thị (Frontend) - THÊM CÁC TRƯỜNG ẨN (movieId, roomId...)
export type ShowtimeDisplay = {
  id: number;
  movieTitle: string;
  runtimeMin: number;
  room: string;
  date: string;
  time: string; 
  priceUSD: number;
  soldSeats: number;
  totalSeats: number;
  
  // 👇 QUAN TRỌNG: Các trường ẩn dùng để đổ dữ liệu vào Form Sửa
  rawStartTime?: string; // Giờ thô "07:00:00"
  rawEndTime?: string;   // Giờ thô "09:00:00"
  format?: string;       // "2D", "3D"...
  movieId?: number;      // ID phim
  roomId?: number;       // ID phòng
}