import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { GlassWater, ArrowRight } from 'lucide-react';

interface Props {
  onAdvance: () => void;
}

export const Prova1AdminPanel = ({ onAdvance }: Props) => {
  const { socket } = useSocket();
  const { game, teams } = useGame();
  const [assigned, setAssigned] = useState(false);
  const [scores, setScores] = useState<Record<string, { taste: number; presentation: number }>>({});

  const handleAssign = () => {
    if (!socket || !game) return;
    socket.emit('prova1:assign', { gameId: game._id });
    setAssigned(true);
  };

  const handleScore = (teamId: string) => {
    if (!socket || !game) return;
    const teamScores = scores[teamId];
    if (!teamScores) return;
    socket.emit('prova1:score', {
      gameId: game._id,
      teamId,
      taste: teamScores.taste,
      presentation: teamScores.presentation,
    });
  };

  const updateScore = (teamId: string, field: 'taste' | 'presentation', value: number) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || { taste: 0, presentation: 0 }), [field]: value },
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-pink-600 text-center">Prova 1: Recrea el coctel</h2>

      {!assigned && (
        <Button onClick={handleAssign} className="w-full" size="lg">
          <GlassWater size={20} className="inline mr-2" />
          Assignar coctels
        </Button>
      )}

      {assigned && (
        <>
          <div className="space-y-3">
            {teams.map((team) => (
              <Card key={team._id}>
                <h3 className="font-semibold mb-3">{team.name}</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">Gust (0-5)</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={scores[team._id]?.taste ?? 0}
                      onChange={(e) => updateScore(team._id, 'taste', Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                    <span className="text-sm font-bold">{scores[team._id]?.taste ?? 0}</span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Presentacio (0-5)</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={scores[team._id]?.presentation ?? 0}
                      onChange={(e) => updateScore(team._id, 'presentation', Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                    <span className="text-sm font-bold">{scores[team._id]?.presentation ?? 0}</span>
                  </div>
                  <Button onClick={() => handleScore(team._id)} size="sm" className="w-full">
                    Puntuar
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Button onClick={onAdvance} variant="secondary" className="w-full">
            Seguent prova <ArrowRight size={16} className="inline ml-2" />
          </Button>
        </>
      )}
    </div>
  );
};
