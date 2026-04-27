import { ITeamScores } from '../models/Team';

export const recalcTotalScore = (scores: ITeamScores): number => {
  const prova1 = scores.prova1.taste + scores.prova1.presentation;
  const prova2 = scores.prova2.creativity + scores.prova2.taste + scores.prova2.presentation;
  const prova3 = scores.prova3;

  return prova1 + prova2 + prova3;
};
