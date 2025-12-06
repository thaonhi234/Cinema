import { Router } from 'express';
import { checkAuth, checkRole } from '../middleware/authMiddleware';
import { ShowtimeController } from '../controllers/ShowtimeController';

const router = Router();
const showtimeController = new ShowtimeController();

router.use(checkAuth);
router.use(checkRole('manager', 'staff'));

router.get('/', showtimeController.getAllShowtimes); // READ
router.post('/', checkRole('manager'), showtimeController.createShowtime); // CREATE
router.put('/:id', checkRole('manager'), showtimeController.updateShowtime);
router.delete('/:id', checkRole('manager'), showtimeController.deleteShowtime); // DELETE

export default router;