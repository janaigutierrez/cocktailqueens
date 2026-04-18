import { useGame } from '../../context/GameContext';
import { Card } from '../ui/Card';
import { Trophy, Sparkles } from 'lucide-react';
import type { GameMode } from '../../types';

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
    <div className="space-y-5 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 mb-3 shadow-lg animate-bounce-in">
          <Trophy className="text-white" size={28} />
        </div>
        <h2 className="text-2xl font-extrabold text-gradient">
          {mode === 'cocktails' ? 'Resultats Coctels' : 'Resultats Bingo'}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 text-rosa-400">
          <Sparkles size={14} />
          <span className="text-sm">Esperant que l'admin continui...</span>
          <Sparkles size={14} />
        </div>
      </div>

      <div className="space-y-2 stagger">
        {sorted.map((team, i) => (
          <Card key={team._id} className={i === 0 ? 'ring-2 ring-gold-400 ring-offset-2' : ''}>
            <div className="flex items-center gap-3">
              <span className={`text-xl font-extrabold w-8 text-center ${
                i === 0 ? 'text-gold-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-rosa-300'
              }`}>
                {i + 1}
              </span>
              <span className="flex-1 font-bold">{team.name}</span>
              <span className="text-2xl font-extrabold text-gradient">{getScore(team)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
