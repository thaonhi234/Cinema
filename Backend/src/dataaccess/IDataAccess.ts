// Khai báo hàm lấy thông tin user theo email
import { User } from '../models/user';

export interface IDataAccess {
    // ... các hàm CRUD khác
    getUserByEmail(email: string): Promise<User | null>;
}
export interface IDataAccess {
  getDashboardSummary(): Promise<any>;
}

export {};