import { Request, Response } from 'express';
import { Game } from '../models/Game';
import { Team } from '../models/Team';

export const getGame = async (_req: Request, res: Response) => {
  try {
    const game = await Game.findOne().sort({ createdAt: -1 });
    if (!game) {
      res.status(404).json({ error: 'No active game' });
      return;
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
};

export const createGame = async (_req: Request, res: Response) => {
  try {
    const game = await Game.create({});
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
};

export const deleteGame = async (req: Request, res: Response) => {
  try {
    await Team.deleteMany({ game: req.params.id });
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete game' });
  }
};

export const getRanking = async (req: Request, res: Response) => {
  try {
    const teams = await Team.find({ game: req.params.id }).sort({
      totalScore: -1,
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ranking' });
  }
};
