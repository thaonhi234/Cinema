export interface User {
    MaNguoiDung: string;
    HoTen: string;
    VaiTro: 'QUAN_TRI' | 'NHAN_VIEN' | 'KHACH_HANG';
    Email: string;
    PasswordHash: string;
}
export {};