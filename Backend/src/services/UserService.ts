import { IDataAccess} from '../dataaccess/IDataAccess';
import { MockDataAccess } from '../dataaccess/MockDataAccess';
import { User } from '../models/user';

// Sử dụng MockDataAccess cho đến khi CSDL thật được tích hợp
const dataAccess: IDataAccess = new MockDataAccess(); 

export class UserService {
    // Hàm này chứa logic xác thực chính
    async login(email: string, password: string): Promise<User | null> {
        const user = await dataAccess.getUserByEmail(email);

        if (!user) {
            return null; // User không tồn tại
        }

        // --- Logic xác thực (QUAN TRỌNG) ---
        // Trong thực tế: So sánh password với user.PasswordHash
        // Trong Mock: So sánh plaintext
        if (user.PasswordHash !== password) {
            return null; // Mật khẩu không khớp
        }

        // Trong thực tế: Tạo và trả về JWT Token ở đây
        // const token = jwt.sign({ id: user.MaNguoiDung }, process.env.JWT_SECRET);
        
        return user; // Đăng nhập thành công
    }
}