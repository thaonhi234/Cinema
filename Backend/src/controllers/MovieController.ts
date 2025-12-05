// Trong src/controllers/MovieController.ts
import { Request, Response } from 'express';
import { IDataAccess, Movie } from '../models/user';
import { SQLDataAccess } from '../dataaccess/SqlDataAccess';

// Khởi tạo đối tượng dataAccess
const dataAccess: IDataAccess = new SQLDataAccess();
export class MovieController {
    
    // GET /api/movies (Giữ nguyên)
   async getAllMovies(req: Request, res: Response) {
        try {
            const movies: Movie[] = await dataAccess.getAllMovies();
            
            // Controller chỉ còn nhiệm vụ format ngày tháng nếu cần và trả về
            const processedMovies = movies.map(movie => ({
                ...movie,
                // Format ngày tháng thành chuỗi YYYY-MM-DD nếu cần
                releaseDate: new Date(movie.releaseDate as Date).toISOString().split('T')[0],
                closingDate: new Date(movie.closingDate as Date).toISOString().split('T')[0],
            }));

            return res.status(200).json(processedMovies);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phim:', error);
            return res.status(500).json({ message: 'Lỗi server khi tải danh sách phim.' });
        }
    }
    // GET /api/movies/:id
getMovieById = async (req: Request, res: Response) => {
    try {
        const movieId = parseInt(req.params.id);
        if (isNaN(movieId)) {
            return res.status(400).json({ message: 'MovieID không hợp lệ' });
        }
        // DÙNG BIẾN dataAccess bên ngoài class
        const movie = await dataAccess.getMovieById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Không tìm thấy movie' });
        }
        res.json(movie);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
}


    // POST /api/movies
    async createMovie(req: Request, res: Response) {
        const movieData = req.body;
        const { Genres, ...rest } = movieData; 
        try {
            await dataAccess.createMovie(rest, Genres);
            res.status(201).json({ message: 'Movie added successfully.' });
        } catch (error) {
            // Xử lý lỗi từ RAISERROR (ví dụ: Closing date must be after release date)
            return res.status(400).json({ message: (error as any).originalError.info.message });
        }
    }

    // PUT /api/movies/:id
    async updateMovie(req: Request, res: Response) {
        const movieId = parseInt(req.params.id);
        const movieData = { ...req.body, MovieID: movieId };
        const { Genres, ...rest } = movieData; 
        try {
            await dataAccess.updateMovie(rest, Genres);
            res.status(200).json({ message: 'Movie updated successfully.' });
        } catch (error) {
            return res.status(400).json({ message: (error as any).originalError.info.message });
        }
    }

    // DELETE /api/movies/:id
    async deleteMovie(req: Request, res: Response) {
        const movieId = parseInt(req.params.id);
        try {
            await dataAccess.deleteMovie(movieId);
            res.status(200).json({ message: 'Movie deleted successfully.' });
        } catch (error) {
            return res.status(400).json({ message: (error as any).originalError.info.message });
        }
    }
}