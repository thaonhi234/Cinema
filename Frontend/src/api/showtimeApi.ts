import axiosClient from './axiosClient';

// Định nghĩa kiểu dữ liệu cho dữ liệu Suất chiếu khi tạo/cập nhật
interface ShowtimeCreateUpdateData {
    // Các trường bắt buộc cho SP/Controller
    BranchID: number; 
    RoomID: number;
    Day: string; // YYYY-MM-DD
    StartTime: string; // HH:mm:ss
    EndTime: string;
    FName: string; // Tên Format (2D, IMAX,...)
    MovieID: number;
    Price?: number; // Nếu bạn triển khai thêm chức năng giá
}

const showtimeApi = {
  // 1. Lấy danh sách
  getAllShowtimes: (date: string) => axiosClient.get(`/showtimes?date=${date}`),
  
  // 2. Thêm mới
  createShowtime: (data: any) => axiosClient.post("/showtimes", data),
  
  // 3. Xóa
  deleteShowtime: (id: number) => axiosClient.delete(`/showtimes/${id}`),
  
  // 👇 4. Cập nhật (KIỂM TRA KỸ DÒNG NÀY CÓ CHƯA?)
  updateShowtime: (id: number, data: any) => axiosClient.put(`/showtimes/${id}`, data),
};

export default showtimeApi;