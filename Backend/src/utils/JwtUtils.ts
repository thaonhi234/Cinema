import * as jwt from 'jsonwebtoken';

const SECRET: jwt.Secret = process.env.JWT_SECRET || 'my_secret_jwt_key';
const EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h'; // ép kiểu string

export function signToken(payload: object): string {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
}
