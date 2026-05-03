import { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../ui/Card';
import { Trophy, Sparkles, PartyPopper, Crown, TrendingUp } from 'lucide-react';
import type { GameMode } from '../../types';

interface RoundResultsProps {
  mode: GameMode | 'interim';
  countdownSeconds?: number;
}

export const RoundResults = ({ mode, countdownSeconds }: RoundResultsProps) => {
  const { teams, game, myTeam } = useGame();
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds ?? 0);

  useEffect(() => {
    if (mode !== 'interim' || !countdownSeconds) return;
    setSecondsLeft(countdownSeconds);
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [mode, countdownSeconds]);

  if (mode === 'interim') {
    const sorted = [...teams].sort((a, b) => b.totalScore - a.totalScore);

    return (
      <div className="space-y-5 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-3 shadow-lg animate-bounce-in">
            <TrendingUp className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-gradient">Anem com anem!</h2>
          {secondsLeft > 0 && (
            <p className="text-sm text-rosa-400 mt-2 font-medium">
              Seguent prova en {secondsLeft}s...
            </p>
          )}
        </div>

        <div className="space-y-2 stagger">
          {sorted.map((team, i) => {
            const isMine = team._id === myTeam?._id;
            return (
              <Card
                key={team._id}
                className={
                  isMine
                    ? 'ring-2 ring-rosa-400 ring-offset-2 bg-gradient-to-r from-rosa-50 to-lila-50'
                    : i === 0
                    ? 'ring-2 ring-gold-400 ring-offset-2'
                    : ''
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xl font-extrabold w-8 text-center ${
                      i === 0
                        ? 'text-gold-500'
                        : i === 1
                        ? 'text-gray-400'
                        : i === 2
                        ? 'text-amber-600'
                        : 'text-rosa-300'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-bold">
                    {team.name}
                    {isMine && (
                      <span className="ml-2 text-xs text-rosa-500 font-medium">(tu)</span>
                    )}
                  </span>
                  <span className="text-2xl font-extrabold text-gradient">
                    {team.totalScore}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'bingo') {
    const lineWinner = teams.find((t) => t._id === game?.bingoWinners?.line);
    const bingoWinner = teams.find((t) => t._id === game?.bingoWinners?.bingo);

    return (
      <div className="space-y-5 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 mb-3 shadow-lg animate-bounce-in">
            <PartyPopper className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-gradient">Resultats Bingo</h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-rosa-400">
            <Sparkles size={14} />
            <span className="text-sm">Esperant que l'admin continui...</span>
            <Sparkles size={14} />
          </div>
        </div>

        {lineWinner && (
          <Card className="bg-gradient-to-r from-gold-50 to-gold-100 border-gold-300 ring-2 ring-gold-400 ring-offset-1">
            <div className="flex items-center gap-3">
              <Trophy className="text-gold-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-xs font-bold uppercase text-gold-500 tracking-wide">Linia</p>
                <p className="font-extrabold text-gold-700 text-lg">{lineWinner.name}</p>
              </div>
            </div>
          </Card>
        )}

        {bingoWinner && (
          <Card className="bg-gradient-to-r from-rosa-50 to-lila-50 border-rosa-300 ring-2 ring-rosa-400 ring-offset-1">
            <div className="flex items-center gap-3">
              <Crown className="text-rosa-500 flex-shrink-0" size={24} />
              <div>
                <p className="text-xs font-bold uppercase text-rosa-500 tracking-wide">Bingo!</p>
                <p className="text-gradient font-extrabold text-lg">{bingoWinner.name}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="text-center">
          <p className="text-rosa-500 font-medium">Premis fisics a part!</p>
          <p className="text-rosa-400 text-sm mt-1">Linia i bingo no compten al ranking</p>
        </Card>
      </div>
    );
  }

  const getScore = (team: typeof teams[0]) =>
    team.scores.prova1.taste +
    team.scores.prova1.presentation +
    team.scores.prova2.creativity +
    team.scores.prova2.taste +
    team.scores.prova2.presentation +
    team.scores.prova3;

  const sorted = [...teams].sort((a, b) => getScore(b) - getScore(a));

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 mb-3 shadow-lg animate-bounce-in">
          <Trophy className="text-white" size={28} />
        </div>
        <h2 className="text-2xl font-extrabold text-gradient">Resultats Coctels</h2>
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
