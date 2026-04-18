import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { GlassWater, ArrowRight, Star, Check } from 'lucide-react';

interface Props {
  onAdvance: () => void;
}

export const Prova1AdminPanel = ({ onAdvance }: Props) => {
  const { socket } = useSocket();
  const { game, teams } = useGame();
  const [assigned, setAssigned] = useState(false);
  const [scores, setScores] = useState<Record<string, { taste: number; presentation: number }>>({});
  const [scored, setScored] = useState<Set<string>>(new Set());

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
    setScored((prev) => new Set(prev).add(teamId));
  };

  const updateScore = (teamId: string, field: 'taste' | 'presentation', value: number) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || { taste: 0, presentation: 0 }), [field]: value },
    }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-3 shadow-lg">
          <GlassWater className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-extrabold text-gradient">Prova 1: Recrea el coctel</h2>
      </div>

      {!assigned && (
        <Button onClick={handleAssign} className="w-full" size="lg">
          <GlassWater size={20} className="inline mr-2" />
          Assignar coctels als equips
        </Button>
      )}

      {assigned && (
        <>
          <div className="space-y-3 stagger">
            {teams.map((team) => {
              const isScored = scored.has(team._id);
              return (
                <Card key={team._id} className={isScored ? 'ring-2 ring-green-300 ring-offset-2' : ''}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-rosa-600">{team.name}</h3>
                    {isScored && <Check size={18} className="text-green-500" />}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-rosa-500 flex items-center gap-1">
                          <Star size={12} /> Gust
                        </label>
                        <span className="text-lg font-extrabold text-gradient">{scores[team._id]?.taste ?? 0}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={scores[team._id]?.taste ?? 0}
                        onChange={(e) => updateScore(team._id, 'taste', Number(e.target.value))}
                        className="w-full accent-rosa-500 h-2"
                      />
                      <div className="flex justify-between text-xs text-rosa-300 mt-0.5">
                        <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-rosa-500 flex items-center gap-1">
                          <Star size={12} /> Presentacio
                        </label>
                        <span className="text-lg font-extrabold text-gradient">{scores[team._id]?.presentation ?? 0}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={scores[team._id]?.presentation ?? 0}
                        onChange={(e) => updateScore(team._id, 'presentation', Number(e.target.value))}
                        className="w-full accent-rosa-500 h-2"
                      />
                      <div className="flex justify-between text-xs text-rosa-300 mt-0.5">
                        <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                      </div>
                    </div>
                    <Button onClick={() => handleScore(team._id)} size="sm" className="w-full">
                      {isScored ? 'Actualitzar' : 'Puntuar'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button onClick={onAdvance} variant="gold" className="w-full" size="lg">
            Seguent prova <ArrowRight size={16} className="inline ml-2" />
          </Button>
        </>
      )}
    </div>
  );
};
