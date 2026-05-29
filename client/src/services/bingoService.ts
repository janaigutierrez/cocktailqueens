import api from './api';

export interface PrintableCell {
  title: string;
  artist: string;
  row: number;
  col: number;
}

export const bingoService = {
  generatePrintableCards: (count: number) =>
    api
      .post<{ cards: PrintableCell[][] }>('/bingo/generate-cards', { count })
      .then((r) => r.data.cards),
};
