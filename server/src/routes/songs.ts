import { Router } from 'express';
import {
  getSongs,
  createSong,
  bulkCreateSongs,
  updateSong,
  deleteSong,
  getSongCount,
} from '../controllers/songController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/', getSongs);
router.get('/count', getSongCount);
router.post('/', adminAuth, createSong);
router.post('/bulk', adminAuth, bulkCreateSongs);
router.put('/:id', adminAuth, updateSong);
router.delete('/:id', adminAuth, deleteSong);

export default router;
