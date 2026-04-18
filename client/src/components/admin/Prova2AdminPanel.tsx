import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRight, Star, Check, Clock, Wine, Sparkles } from 'lucide-react';

interface Props {
  onAdvance: () => void;
}

interface Submission {
  teamId: string;
  teamName: string;
  cocktailName: string;
  description: string;
}

export const Prova2AdminPanel = ({ onAdvance }: Props) => {
  const { socket } = useSocket();
  const { game, teams } = useGame();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scores, setScores] = useState<
    Record<string, { creativity: number; taste: number; presentation: number }>
  >({});
  const [scored, setScored] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    socket.on('prova2:submitted', (data: Submission) => {
      setSubmissions((prev) => {
        const exists = prev.find((s) => s.teamId === data.teamId);
        if (exists) return prev.map((s) => (s.teamId === data.teamId ? data : s));
        return [...prev, data];
      });
    });

    return () => {
      socket.off('prova2:submitted');
    };
  }, [socket]);

  const handleScore = (teamId: string) => {
    if (!socket || !game) return;
    const s = scores[teamId];
    if (!s) return;
    socket.emit('prova2:score', { gameId: game._id, teamId, ...s });
    setScored((prev) => new Set(prev).add(teamId));
  };

  const updateScore = (
    teamId: string,
    field: 'creativity' | 'taste' | 'presentation',
    value: number
  ) => {
    setScores((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || { creativity: 0, taste: 0, presentation: 0 }), [field]: value },
    }));
  };

  const fieldLabels = {
    creativity: 'Creativitat',
    taste: 'Gust',
    presentation: 'Presentacio',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-3 shadow-lg">
          <Wine className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-extrabold text-gradient">Prova 2: Coctel Raquel</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rosa-400 bg-rosa-50 px-3 py-1 rounded-full">
            <Sparkles size={14} />
            {submissions.length}/{teams.length} enviats
          </span>
        </div>
      </div>

      <div className="space-y-3 stagger">
        {teams.map((team) => {
          const sub = submissions.find((s) => s.teamId === team._id);
          const isScored = scored.has(team._id);
          return (
            <Card key={team._id} className={isScored ? 'ring-2 ring-green-300 ring-offset-2' : ''}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-rosa-600">{team.name}</h3>
                {isScored ? (
                  <Check size={18} className="text-green-500" />
                ) : sub ? (
                  <span className="text-xs bg-lila-50 text-lila-600 px-2 py-0.5 rounded-full font-medium">Rebut</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-rosa-300">
                    <Clock size={12} /> Esperant...
                  </span>
                )}
              </div>
              {sub ? (
                <div>
                  <div className="bg-gradient-to-r from-rosa-50 to-lila-50 rounded-xl p-3 mb-3 border border-rosa-100">
                    <p className="font-bold text-rosa-600">{sub.cocktailName}</p>
                    <p className="text-sm text-rosa-400 mt-1">{sub.description}</p>
                  </div>
                  <div className="space-y-3">
                    {(['creativity', 'taste', 'presentation'] as const).map((field) => (
                      <div key={field}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-rosa-500 flex items-center gap-1">
                            <Star size={12} /> {fieldLabels[field]}
                          </label>
                          <span className="text-lg font-extrabold text-gradient">
                            {scores[team._id]?.[field] ?? 0}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="1"
                          value={scores[team._id]?.[field] ?? 0}
                          onChange={(e) => updateScore(team._id, field, Number(e.target.value))}
                          className="w-full accent-rosa-500 h-2"
                        />
                        <div className="flex justify-between text-xs text-rosa-300 mt-0.5">
                          <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => handleScore(team._id)} size="sm" className="w-full">
                      {isScored ? 'Actualitzar' : 'Puntuar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-rosa-300 text-center py-4">Esperant que l'equip enviï el seu coctel...</p>
              )}
            </Card>
          );
        })}
      </div>

      <Button onClick={onAdvance} variant="gold" className="w-full" size="lg">
        Seguent prova <ArrowRight size={16} className="inline ml-2" />
      </Button>
    </div>
  );
};
