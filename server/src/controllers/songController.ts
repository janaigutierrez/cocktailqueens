import { Request, Response } from 'express';
import { Song } from '../models/Song';

export const getSongs = async (req: Request, res: Response) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {};
    const songs = await Song.find(filter).sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
};

export const createSong = async (req: Request, res: Response) => {
  try {
    const { title, artist } = req.body;
    const song = await Song.create({ title, artist });
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create song' });
  }
};

export const bulkCreateSongs = async (req: Request, res: Response) => {
  try {
    const { songs } = req.body;
    if (!Array.isArray(songs) || songs.length === 0) {
      res.status(400).json({ error: 'Provide an array of songs' });
      return;
    }
    const created = await Song.insertMany(songs);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk create songs' });
  }
};

export const updateSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update song' });
  }
};

export const deleteSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      res.status(404).json({ error: 'Song not found' });
      return;
    }
    res.json({ message: 'Song deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
};

export const getSongCount = async (_req: Request, res: Response) => {
  try {
    const count = await Song.countDocuments({ isActive: true });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count songs' });
  }
};
