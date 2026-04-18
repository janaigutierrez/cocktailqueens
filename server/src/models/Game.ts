import mongoose, { Schema, Document } from 'mongoose';

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

export interface IProva1Assignment {
  team: mongoose.Types.ObjectId;
  cocktail: mongoose.Types.ObjectId;
}

export interface IProva2Submission {
  team: mongoose.Types.ObjectId;
  cocktailName: string;
  description: string;
}

export interface IProva3Cocktail {
  number: number;
  correctName: string;
}

export interface IProva3Submission {
  team: mongoose.Types.ObjectId;
  guesses: { number: number; guessedName: string }[];
}

export interface IGame extends Document {
  status: GameStatus;
  currentMode: GameMode | null;
  completedModes: GameMode[];
  prova1Assignments: IProva1Assignment[];
  prova2Submissions: IProva2Submission[];
  prova3Config: { cocktails: IProva3Cocktail[] };
  prova3Submissions: IProva3Submission[];
  bingoSongPool: mongoose.Types.ObjectId[];
  bingoCurrentSong: mongoose.Types.ObjectId | null;
  bingoPlayedSongs: mongoose.Types.ObjectId[];
  bingoWinners: {
    line: mongoose.Types.ObjectId | null;
    bingo: mongoose.Types.ObjectId | null;
  };
}

const gameSchema = new Schema<IGame>(
  {
    status: {
      type: String,
      enum: [
        'lobby',
        'cocktails-prova1',
        'cocktails-prova2',
        'cocktails-prova3',
        'cocktails-results',
        'lobby-intermedi',
        'bingo',
        'bingo-results',
        'finished',
      ],
      default: 'lobby',
    },
    currentMode: {
      type: String,
      enum: ['cocktails', 'bingo', null],
      default: null,
    },
    completedModes: [{ type: String, enum: ['cocktails', 'bingo'] }],
    prova1Assignments: [
      {
        team: { type: Schema.Types.ObjectId, ref: 'Team' },
        cocktail: { type: Schema.Types.ObjectId, ref: 'Cocktail' },
      },
    ],
    prova2Submissions: [
      {
        team: { type: Schema.Types.ObjectId, ref: 'Team' },
        cocktailName: String,
        description: String,
      },
    ],
    prova3Config: {
      cocktails: [
        {
          number: Number,
          correctName: String,
        },
      ],
    },
    prova3Submissions: [
      {
        team: { type: Schema.Types.ObjectId, ref: 'Team' },
        guesses: [
          {
            number: Number,
            guessedName: String,
          },
        ],
      },
    ],
    bingoSongPool: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    bingoCurrentSong: { type: Schema.Types.ObjectId, ref: 'Song', default: null },
    bingoPlayedSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    bingoWinners: {
      line: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
      bingo: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    },
  },
  { timestamps: true }
);

export const Game = mongoose.model<IGame>('Game', gameSchema);
