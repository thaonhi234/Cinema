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
        } catch (error: any) {
        console.error("Lỗi khi tạo movie:", error);

        const message =
            error?.originalError?.info?.message ||
            error?.message ||
            "Lỗi server khi tạo movie";

        return res.status(400).json({ message });
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
    async getTopMovies(req: Request, res: Response) {
        // Lấy tham số 'limit' từ query string (VD: ?limit=5)
        const limit = parseInt(req.query.limit as string) || 5; 

        try {
            // Gọi phương thức Data Access đã được định nghĩa trong SQLDataAccess
            const movies = await dataAccess.getTopMovies(limit);
            
            // Trả về danh sách phim
            return res.status(200).json(movies);
        } catch (error) {
            console.error(`Lỗi khi lấy Top ${limit} Movies:`, error);
            return res.status(500).json({ message: 'Lỗi server khi lấy danh sách phim xếp hạng cao nhất.' });
        }
    }
    async updatePoster(req: Request, res: Response) {
    const movieId = parseInt(req.params.id);
    const { posterURL } = req.body;

    if (isNaN(movieId) || !posterURL) {
        return res.status(400).json({ message: 'MovieID hoặc PosterURL không hợp lệ.' });
    }

    try {
        await dataAccess.updateMoviePoster(movieId, posterURL);
        return res.status(200).json({ message: 'Cập nhật Poster thành công.' });
    } catch (error) {
        console.error('Lỗi khi cập nhật poster:', error);
        return res.status(500).json({ message: 'Lỗi server khi cập nhật poster.' });
    }
}
}