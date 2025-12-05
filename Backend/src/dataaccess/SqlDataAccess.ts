// dataaccess/SQLDataAccess.ts
import sql from 'mssql';
import { IDataAccess } from './IDataAccess';
import { User } from '../models/user';
import dotenv from 'dotenv';
dotenv.config();

export class SQLDataAccess implements IDataAccess {
    private pool: sql.ConnectionPool;

    constructor() {
        const user = process.env.DB_USERNAME;
        const password = process.env.DB_PASSWORD;
        const server = process.env.DB_HOST;
        const database = process.env.DB_DATABASE;
        const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433;

        if (!user || !password || !server || !database) {
            throw new Error('Missing DB config in .env');
        }

        this.pool = new sql.ConnectionPool({
            user,
            password,
            server,
            port,
            database,
            options: {
                encrypt: false, // local dev
                trustServerCertificate: true
            }
        });

        // Connect ngay khi khởi tạo
        this.pool.connect()
            .then(() => console.log('Connected to SQL Server!'))
            .catch(err => console.error('SQL Server connection error:', err));
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const result = await this.pool.request()
                .input('email', sql.VarChar, email)
                .query(`SELECT MaNguoiDung, HoTen, VaiTro, Email, PasswordHash 
                        FROM Users 
                        WHERE Email = @email`);

            if (result.recordset.length === 0) return null;
            return result.recordset[0] as User;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}
