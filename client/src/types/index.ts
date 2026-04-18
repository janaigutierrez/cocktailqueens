export interface Cocktail {
  _id: string;
  name: string;
  ingredients: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: string;
  isActive: boolean;
  createdAt: string;
}

export interface TeamScores {
  prova1: { taste: number; presentation: number };
  prova2: { creativity: number; taste: number; presentation: number };
  prova3: number;
  bingo: { lines: number; bingos: number };
}

export interface Team {
  _id: string;
  name: string;
  scores: TeamScores;
  totalScore: number;
  isConnected: boolean;
  socketId: string | null;
  game: string;
}

export type GameStatus =
  | 'lobby'
  | 'cocktails-prova1'
  | 'cocktails-prova2'
  | 'cocktails-prova3'
  | 'cocktails-results'
  | 'lobby-intermedi'
  | 'bingo'
  | 'bingo-results'
  | 'finished';

export type GameMode = 'cocktails' | 'bingo';

export interface Game {
  _id: string;
  status: GameStatus;
  currentMode: GameMode | null;
  completedModes: GameMode[];
  prova1Assignments: { team: string; cocktail: string }[];
  prova2Submissions: { team: string; cocktailName: string; description: string }[];
  prova3Config: { cocktails: { number: number; correctName: string }[] };
  prova3Submissions: { team: string; guesses: { number: number; guessedName: string }[] }[];
  bingoCurrentSong: string | null;
  bingoPlayedSongs: string[];
  bingoWinners: { line: string | null; bingo: string | null };
}

export interface BingoCell {
  song: Song | string;
  row: number;
  col: number;
  markedByTeam: boolean;
  validatedByAdmin: boolean;
}

export interface BingoCard {
  _id: string;
  game: string;
  team: string;
  cells: BingoCell[];
}
