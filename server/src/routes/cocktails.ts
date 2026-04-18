import { Router } from 'express';
import {
  getCocktails,
  createCocktail,
  updateCocktail,
  deleteCocktail,
} from '../controllers/cocktailController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/', getCocktails);
router.post('/', adminAuth, createCocktail);
router.put('/:id', adminAuth, updateCocktail);
router.delete('/:id', adminAuth, deleteCocktail);

export default router;
