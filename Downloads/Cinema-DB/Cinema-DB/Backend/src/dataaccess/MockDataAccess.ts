import { IDataAccess } from './IDataAccess';
import { User } from '../models/user';

// Mật khẩu giả lập cho sManager (SỬ DỤNG MOCK DATA)
// Tên đăng nhập: sManager@cinemax.com
// Mật khẩu: 123456 (giả định)
const MOCK_USER_MANAGER: User = {
    MaNguoiDung: 'EMP0001',
    HoTen: 'S Manager',
    VaiTro: 'NHAN_VIEN', // Hoặc QUAN_TRI tùy thuộc vào vai trò sManager
    Email: 'sManager@cinemax.com',
    PasswordHash: '123456', // Dùng plaintext vì đây là mock
};

export class MockDataAccess implements IDataAccess {
    async getUserByEmail(email: string): Promise<User | null> {
        if (email === MOCK_USER_MANAGER.Email) {
            return Promise.resolve(MOCK_USER_MANAGER);
        }
        return Promise.resolve(null);
    }
    // ... Triển khai các hàm Mock CRUD khác
}