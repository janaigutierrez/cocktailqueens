import { Router } from 'express';
import { getGame, createGame, deleteGame, getRanking } from '../controllers/gameController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/', getGame);
router.post('/', adminAuth, createGame);
router.delete('/:id', adminAuth, deleteGame);
router.get('/:id/ranking', getRanking);

export default router;
