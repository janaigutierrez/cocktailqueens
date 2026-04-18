import { useGame } from '../context/GameContext';
import { Card } from '../components/ui/Card';
import { Trophy, Crown, Medal } from 'lucide-react';

export const RankingPage = () => {
  const { teams, game } = useGame();

  const sorted = [...teams].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-svh flex flex-col items-center p-6 bg-festa">
      <div className="text-center mb-8 animate-bounce-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 mb-4 shadow-lg shadow-gold-300/50">
          <Trophy className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gradient mb-1">Ranking</h1>
        <p className="text-rosa-400">
          {game?.status === 'finished' ? 'Ranking final' : 'En directe'}
        </p>
      </div>

      {/* Podium for top 3 */}
      {sorted.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-8 w-full max-w-sm animate-slide-up">
          {/* 2nd place */}
          <div className="flex-1 text-center">
            <div className="bg-white/80 rounded-2xl p-3 shadow-lg border border-gray-200">
              <Medal size={24} className="mx-auto text-gray-400 mb-1" />
              <p className="font-bold text-sm truncate">{sorted[1].name}</p>
              <p className="text-xl font-extrabold text-gray-500">{sorted[1].totalScore}</p>
            </div>
            <div className="h-16 bg-gradient-to-t from-gray-200 to-gray-100 rounded-b-xl mt-1" />
          </div>
          {/* 1st place */}
          <div className="flex-1 text-center">
            <div className="bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl p-3 shadow-lg border border-gold-300 animate-pulse-glow">
              <Crown size={28} className="mx-auto text-gold-500 mb-1" />
              <p className="font-bold text-sm truncate">{sorted[0].name}</p>
              <p className="text-2xl font-extrabold text-gold-500">{sorted[0].totalScore}</p>
            </div>
            <div className="h-24 bg-gradient-to-t from-gold-300 to-gold-100 rounded-b-xl mt-1" />
          </div>
          {/* 3rd place */}
          <div className="flex-1 text-center">
            <div className="bg-white/80 rounded-2xl p-3 shadow-lg border border-orange-200">
              <Medal size={24} className="mx-auto text-amber-600 mb-1" />
              <p className="font-bold text-sm truncate">{sorted[2].name}</p>
              <p className="text-xl font-extrabold text-amber-600">{sorted[2].totalScore}</p>
            </div>
            <div className="h-12 bg-gradient-to-t from-amber-200 to-amber-100 rounded-b-xl mt-1" />
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="w-full max-w-sm space-y-2 stagger">
        {sorted.map((team, i) => (
          <Card key={team._id} className={i === 0 ? 'ring-2 ring-gold-400 ring-offset-2' : ''}>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-extrabold w-8 text-center ${
                i === 0 ? 'text-gold-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-rosa-300'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{team.name}</p>
                <div className="flex gap-2 text-xs text-rosa-400 mt-0.5">
                  <span>P1: {team.scores.prova1.taste + team.scores.prova1.presentation}</span>
                  <span>P2: {team.scores.prova2.creativity + team.scores.prova2.taste + team.scores.prova2.presentation}</span>
                  <span>P3: {team.scores.prova3}</span>
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gradient">{team.totalScore}</div>
            </div>
          </Card>
        ))}

        {sorted.length === 0 && (
          <p className="text-center text-rosa-300 py-8">Encara no hi ha puntuacions</p>
        )}
      </div>
    </div>
  );
};
