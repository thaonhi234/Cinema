import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { signToken } from '../utils/JwtUtils';

const userService = new UserService();

export class AuthController {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
        }

        try {
            const user = await userService.login(email, password);
            if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });

            const token = signToken({ MaNguoiDung: user.MaNguoiDung, VaiTro: user.VaiTro, BranchID: user.BranchID });

            return res.status(200).json({
                message: 'Đăng nhập thành công!',
                user: {
                    MaNguoiDung: user.MaNguoiDung,
                    HoTen: user.HoTen,
                    VaiTro: user.VaiTro,
                    BranchID: user.BranchID
                },
                token
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server.' });
        }
    }
    logout(req: Request, res: Response) {
        // Trả về tín hiệu thành công.
        // Frontend sẽ nhận tín hiệu này và xóa token.
        return res.status(200).json({ message: 'Đăng xuất thành công!' });
    }
}
