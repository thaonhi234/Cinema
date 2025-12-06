import axiosClient from './axiosClient';

// Định nghĩa kiểu dữ liệu cho dữ liệu phòng chiếu
interface RoomData {
    BranchID: number;
    RoomID: number;
    RType: string;
    RCapacity: number;
    TotalRows?: number; // Chỉ cần khi tạo mới
    SeatsPerRow?: number; // Chỉ cần khi tạo mới
}

// Định nghĩa kiểu dữ liệu cho ghế chi tiết (Seat Detail)
interface SeatDetail {
    SRow: number;
    SColumn: number;
    SType: boolean; // 0: Ghế thường, 1: Ghế VIP
    SStatus: boolean; // 0: Hỏng/Khóa, 1: Sẵn sàng
}

const roomsApi = {
    // 1. READ: Lấy danh sách tất cả phòng trong chi nhánh của người dùng
    // GET /api/rooms (BranchID được lấy từ Token)
    getAllRooms: () => {
        return axiosClient.get('/rooms');
    },

    // 2. READ: Lấy sơ đồ ghế chi tiết của một phòng
    // GET /api/rooms/:branchId/:roomId/seats
    getSeatLayout: (branchId: number, roomId: number) => {
        return axiosClient.get<SeatDetail[]>(`/rooms/${branchId}/${roomId}/seats`);
    },

    // 3. CREATE: Tạo phòng chiếu mới và ma trận ghế
    // POST /api/rooms
    createRoom: (data: RoomData & { TotalRows: number; SeatsPerRow: number }) => {
        return axiosClient.post('/rooms', data);
    },

    // 4. UPDATE: Cập nhật thông tin cơ bản của phòng (BranchID, RoomID là key)
    // PUT /api/rooms/:branchId/:roomId
    updateRoom: (branchId: number, roomId: number, data: Omit<RoomData, 'BranchID' | 'RoomID'>) => {
        return axiosClient.put(`/rooms/${branchId}/${roomId}`, data);
    },

    // 5. DELETE: Xóa phòng chiếu
    // DELETE /api/rooms/:branchId/:roomId
    deleteRoom: (branchId: number, roomId: number) => {
        return axiosClient.delete(`/rooms/${branchId}/${roomId}`);
    },
};

export default roomsApi;