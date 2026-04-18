import { useGame } from '../context/GameContext';
import { Card } from '../components/ui/Card';
import { Trophy, Medal } from 'lucide-react';

export const RankingPage = () => {
  const { teams, game } = useGame();

  const sorted = [...teams].sort((a, b) => b.totalScore - a.totalScore);

  const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="min-h-svh flex flex-col items-center p-6 bg-gradient-to-b from-pink-100 to-purple-100">
      <div className="text-center mb-8">
        <Trophy className="mx-auto mb-4 text-yellow-500" size={48} />
        <h1 className="text-3xl font-bold text-pink-600 mb-1">Ranking</h1>
        <p className="text-gray-600">
          {game?.status === 'finished' ? 'Ranking final' : 'Ranking en directe'}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {sorted.map((team, i) => (
          <Card key={team._id} className={i === 0 ? 'ring-2 ring-yellow-400' : ''}>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${podiumColors[i] || 'text-gray-400'}`}>
                {i < 3 ? <Medal size={28} /> : <span>{i + 1}</span>}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{team.name}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>P1: {team.scores.prova1.taste + team.scores.prova1.presentation}</span>
                  <span>
                    P2:{' '}
                    {team.scores.prova2.creativity +
                      team.scores.prova2.taste +
                      team.scores.prova2.presentation}
                  </span>
                  <span>P3: {team.scores.prova3}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-pink-600">{team.totalScore}</div>
            </div>
          </Card>
        ))}

        {sorted.length === 0 && (
          <p className="text-center text-gray-500">Encara no hi ha puntuacions</p>
        )}
      </div>
    </div>
  );
};
