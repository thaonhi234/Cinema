import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

const userService = new UserService();

export class AuthController {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
        }

        try {
            const user = await userService.login(email, password);

            if (!user) {
                // Trả về lỗi chung để tăng tính bảo mật
                return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
            }

            // Đăng nhập thành công
            return res.status(200).json({
                message: 'Đăng nhập thành công!',
                user: {
                    MaNguoiDung: user.MaNguoiDung,
                    HoTen: user.HoTen,
                    VaiTro: user.VaiTro
                },
                // token: 'FAKE_JWT_TOKEN_FOR_FRONTEND' 
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Lỗi server.' });
        }
    }
}