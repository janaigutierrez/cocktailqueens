import { Router } from 'express';
import { adminLogin, verifyAdmin } from '../controllers/adminController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.post('/login', adminLogin);
router.get('/verify', adminAuth, verifyAdmin);

export default router;
