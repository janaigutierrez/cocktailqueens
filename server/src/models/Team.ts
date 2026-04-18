import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamScores {
  prova1: { taste: number; presentation: number };
  prova2: { creativity: number; taste: number; presentation: number };
  prova3: number;
  bingo: { lines: number; bingos: number };
}

export interface ITeam extends Document {
  name: string;
  scores: ITeamScores;
  totalScore: number;
  isConnected: boolean;
  socketId: string | null;
  game: mongoose.Types.ObjectId;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    scores: {
      prova1: {
        taste: { type: Number, default: 0, min: 0, max: 5 },
        presentation: { type: Number, default: 0, min: 0, max: 5 },
      },
      prova2: {
        creativity: { type: Number, default: 0, min: 0, max: 5 },
        taste: { type: Number, default: 0, min: 0, max: 5 },
        presentation: { type: Number, default: 0, min: 0, max: 5 },
      },
      prova3: { type: Number, default: 0 },
      bingo: {
        lines: { type: Number, default: 0 },
        bingos: { type: Number, default: 0 },
      },
    },
    totalScore: { type: Number, default: 0 },
    isConnected: { type: Boolean, default: false },
    socketId: { type: String, default: null },
    game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  },
  { timestamps: true }
);

teamSchema.index({ game: 1, name: 1 }, { unique: true });

export const Team = mongoose.model<ITeam>('Team', teamSchema);
