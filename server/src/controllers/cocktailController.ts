import { Request, Response } from 'express';
import { Cocktail } from '../models/Cocktail';

export const getCocktails = async (req: Request, res: Response) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    const cocktails = await Cocktail.find(filter).sort({ createdAt: -1 });
    res.json(cocktails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cocktails' });
  }
};

export const createCocktail = async (req: Request, res: Response) => {
  try {
    const { name, ingredients } = req.body;
    const cocktail = await Cocktail.create({ name, ingredients });
    res.status(201).json(cocktail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cocktail' });
  }
};

export const updateCocktail = async (req: Request, res: Response) => {
  try {
    const cocktail = await Cocktail.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cocktail) {
      res.status(404).json({ error: 'Cocktail not found' });
      return;
    }
    res.json(cocktail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cocktail' });
  }
};

export const deleteCocktail = async (req: Request, res: Response) => {
  try {
    const cocktail = await Cocktail.findByIdAndDelete(req.params.id);
    if (!cocktail) {
      res.status(404).json({ error: 'Cocktail not found' });
      return;
    }
    res.json({ message: 'Cocktail deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cocktail' });
  }
};
