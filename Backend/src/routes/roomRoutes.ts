import { Router } from 'express';
import { checkAuth, checkRole } from '../middleware/authMiddleware';
import { RoomController } from '../controllers/RoomControllers';

const router = Router();
const roomController = new RoomController();

router.use(checkAuth);
router.use(checkRole('manager', 'staff'));

router.get('/', roomController.getAllRooms); // READ Danh sách
router.post('/', roomController.createRoom); // CREATE Phòng và Ghế
router.delete('/:branchId/:roomId', roomController.deleteRoom); // DELETE
router.put('/:branchId/:roomId', roomController.updateRoom);
router.get(
    '/:branchId/:roomId/seats', 
    roomController.getSeatLayout
);
export default router;