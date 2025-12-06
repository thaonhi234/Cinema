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
    // 1. READ: Lấy danh sách suất chiếu theo ngày (Lọc theo BranchID qua Token)
    // GET /api/showtimes?date=YYYY-MM-DD
    getAllShowtimes: (date: string) => {
        return axiosClient.get(`/showtimes?date=${date}`);
    },

    // 2. CREATE: Thêm suất chiếu mới
    // POST /api/showtimes
    createShowtime: (data: ShowtimeCreateUpdateData & { TimeID: number }) => {
        // TimeID cần được cung cấp hoặc được tạo ở Frontend nếu Backend không dùng Sequence
        return axiosClient.post('/showtimes', data);
    },

    // 3. UPDATE: Cập nhật suất chiếu (Yêu cầu TimeID và BranchID)
    // PUT /api/showtimes/:id
    updateShowtime: (timeId: number, data: ShowtimeCreateUpdateData) => {
        // BranchID được lấy từ Token và được gắn vào body trong Controller
        return axiosClient.put(`/showtimes/${timeId}`, data);
    },

    // 4. DELETE: Xóa suất chiếu
    // DELETE /api/showtimes/:id
    deleteShowtime: (timeId: number) => {
        // BranchID được lấy từ Token để xác thực
        return axiosClient.delete(`/showtimes/${timeId}`);
    },
};

export default showtimeApi;