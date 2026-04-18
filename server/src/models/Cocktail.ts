import mongoose, { Schema, Document } from 'mongoose';

export interface ICocktail extends Document {
  name: string;
  ingredients: string[];
  isActive: boolean;
}

const cocktailSchema = new Schema<ICocktail>(
  {
    name: { type: String, required: true, trim: true },
    ingredients: [{ type: String, required: true, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Cocktail = mongoose.model<ICocktail>('Cocktail', cocktailSchema);
