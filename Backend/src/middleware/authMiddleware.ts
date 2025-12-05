import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/JwtUtils';

export function checkAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token không tồn tại' });

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const payload = verifyToken(token);
    if (!payload) return res.status(403).json({ message: 'Token không hợp lệ' });

    (req as any).user = payload;
    next();
}

export function checkRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !roles.includes(user.VaiTro)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
        next();
    };
}
