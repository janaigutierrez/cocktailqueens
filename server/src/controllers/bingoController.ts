import { Request, Response } from 'express';
import { Song } from '../models/Song';
import { shuffleArray } from '../utils/shuffleArray';

interface PrintableCell {
  title: string;
  artist: string;
  row: number;
  col: number;
}

export const generatePrintableCards = async (req: Request, res: Response) => {
  try {
    const count = Math.max(1, Math.min(100, Number(req.body?.count) || 1));

    const songs = await Song.find({ isActive: true });
    if (songs.length < 15) {
      res.status(400).json({ error: 'Necessites almenys 15 cancons actives' });
      return;
    }

    const cards: PrintableCell[][] = [];

    for (let n = 0; n < count; n++) {
      const shuffled = shuffleArray([...songs]);
      const selected = shuffled.slice(0, 15);
      const cells: PrintableCell[] = [];

      for (let row = 0; row < 3; row++) {
        const rowSongs = selected.slice(row * 5, row * 5 + 5);
        const cols = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8])
          .slice(0, 5)
          .sort((a, b) => a - b);

        rowSongs.forEach((song, i) => {
          cells.push({
            title: song.title,
            artist: song.artist,
            row,
            col: cols[i],
          });
        });
      }

      cards.push(cells);
    }

    res.json({ cards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate cards' });
  }
};
