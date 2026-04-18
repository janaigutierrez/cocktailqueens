import { useGame } from '../../context/GameContext';
import { Card } from '../ui/Card';
import { Trophy } from 'lucide-react';
import { GameMode } from '../../types';

interface RoundResultsProps {
  mode: GameMode;
}

export const RoundResults = ({ mode }: RoundResultsProps) => {
  const { teams } = useGame();

  const getScore = (team: typeof teams[0]) => {
    if (mode === 'cocktails') {
      return (
        team.scores.prova1.taste +
        team.scores.prova1.presentation +
        team.scores.prova2.creativity +
        team.scores.prova2.taste +
        team.scores.prova2.presentation +
        team.scores.prova3
      );
    }
    return team.scores.bingo.lines * 5 + team.scores.bingo.bingos * 10;
  };

  const sorted = [...teams].sort((a, b) => getScore(b) - getScore(a));

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Trophy className="mx-auto text-yellow-500 mb-2" size={36} />
        <h2 className="text-2xl font-bold text-pink-600">
          {mode === 'cocktails' ? 'Resultats Coctels' : 'Resultats Bingo'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">Esperant que l'admin continui...</p>
      </div>

      <div className="space-y-2">
        {sorted.map((team, i) => (
          <Card key={team._id}>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-400 w-8">{i + 1}</span>
              <span className="flex-1 font-semibold">{team.name}</span>
              <span className="text-xl font-bold text-pink-600">{getScore(team)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
