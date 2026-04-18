import { ISong } from '../models/Song';
import { shuffleArray } from './shuffleArray';

export const generateBingoCard = (songs: ISong[]) => {
  const shuffled = shuffleArray([...songs]);
  const selected = shuffled.slice(0, 15);

  return selected.map((song, i) => ({
    song: song._id,
    row: Math.floor(i / 5),
    col: i % 5,
    markedByTeam: false,
    validatedByAdmin: false,
  }));
};
