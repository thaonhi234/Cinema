import { Router } from 'express';
import { ShowtimeController } from '../controllers/ShowtimeController';

const router = Router();
const controller = new ShowtimeController();

// Đường dẫn: /api/showtimes

// Sửa getAll -> getAllShowtimes
router.get('/', controller.getAllShowtimes); 

// Sửa create -> createShowtime
router.post('/', controller.createShowtime); 

// Thêm update (nếu cần)
router.put('/:id', controller.updateShowtime);

// Sửa delete -> deleteShowtime
router.delete('/:id', controller.deleteShowtime); 

export default router;