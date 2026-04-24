import mongoose, { Schema, Document } from 'mongoose';

export interface IBingoCell {
  song: mongoose.Types.ObjectId;
  row: number;
  col: number;
  markedByTeam: boolean;
  validatedByAdmin: boolean;
}

export interface IBingoCard extends Document {
  game: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId;
  cells: IBingoCell[];
}

const bingoCardSchema = new Schema<IBingoCard>(
  {
    game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    cells: [
      {
        song: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
        row: { type: Number, required: true, min: 0, max: 2 },
        col: { type: Number, required: true, min: 0, max: 8 },
        markedByTeam: { type: Boolean, default: false },
        validatedByAdmin: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

bingoCardSchema.index({ game: 1, team: 1 }, { unique: true });

export const BingoCard = mongoose.model<IBingoCard>('BingoCard', bingoCardSchema);
