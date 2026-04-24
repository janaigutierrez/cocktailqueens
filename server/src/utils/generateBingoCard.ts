import { ISong } from '../models/Song';
import { shuffleArray } from './shuffleArray';

export const generateBingoCard = (songs: ISong[]) => {
  const shuffled = shuffleArray([...songs]);
  const selected = shuffled.slice(0, 15);

  const cells: { song: ISong['_id']; row: number; col: number; markedByTeam: boolean; validatedByAdmin: boolean }[] = [];

  // 3 rows, each with 5 songs placed in random columns out of 9
  for (let row = 0; row < 3; row++) {
    const rowSongs = selected.slice(row * 5, row * 5 + 5);

    // Pick 5 random column positions from 0-8
    const allCols = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const shuffledCols = shuffleArray(allCols);
    const chosenCols = shuffledCols.slice(0, 5).sort((a, b) => a - b);

    rowSongs.forEach((song, i) => {
      cells.push({
        song: song._id,
        row,
        col: chosenCols[i],
        markedByTeam: false,
        validatedByAdmin: false,
      });
    });
  }

  return cells;
};
