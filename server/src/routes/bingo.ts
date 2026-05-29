import { Router } from 'express';
import { generatePrintableCards } from '../controllers/bingoController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.post('/generate-cards', adminAuth, generatePrintableCards);

export default router;
