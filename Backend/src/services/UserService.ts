// UserService.ts

import { IDataAccess} from '../dataaccess/IDataAccess';
// import { MockDataAccess } from '../dataaccess/MockDataAccess'; // Xoá hoặc comment
import { SQLDataAccess } from '../dataaccess/SQLDataAccess'; // <--- IMPORT MỚI
import { User } from '../models/user';

// Sử dụng SQLDataAccess
const dataAccess: IDataAccess = new SQLDataAccess(); // <--- DÙNG SQL DATA ACCESS

export class UserService {
    // Hàm login giữ nguyên
    async login(email: string, password: string): Promise<User | null> {
        const user = await dataAccess.getUserByEmail(email);

        if (!user) {
            return null; 
        }

        // Trong DB của bạn, EPassword là plaintext, nên so sánh trực tiếp
        if (user.PasswordHash !== password) { // So sánh EPassword trong DB với password người dùng nhập
            return null; 
        }
        
        return user; 
    }
}