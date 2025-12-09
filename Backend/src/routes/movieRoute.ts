// Trong src/routes/movieRoutes.ts

import { Router } from 'express';
import { checkAuth, checkRole } from '../middleware/authMiddleware';
import { MovieController } from '../controllers/MovieController';

const router = Router();
const movieController = new MovieController();

router.use(checkAuth);
router.use(checkRole('manager', 'staff'));

router.get('/', movieController.getAllMovies); // READ
router.post('/', movieController.createMovie); // CREATE
router.put('/:id', movieController.updateMovie); // UPDATE
router.delete('/:id', movieController.deleteMovie); // DELETE
router.get('/top-rated', movieController.getTopMovies);
router.get('/:id', movieController.getMovieById); // READ theo ID
router.patch('/:id/poster', movieController.updatePoster);
export default router;