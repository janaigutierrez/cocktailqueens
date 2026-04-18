import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRight } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-pink-600 text-center">Prova 2: Coctel Raquel</h2>
      <p className="text-center text-gray-500 text-sm">
        Submissions: {submissions.length}/{teams.length}
      </p>

      <div className="space-y-3">
        {teams.map((team) => {
          const sub = submissions.find((s) => s.teamId === team._id);
          return (
            <Card key={team._id}>
              <h3 className="font-semibold">{team.name}</h3>
              {sub ? (
                <div className="mt-2">
                  <p className="text-pink-600 font-medium">{sub.cocktailName}</p>
                  <p className="text-sm text-gray-500">{sub.description}</p>
                  <div className="mt-3 space-y-2">
                    {(['creativity', 'taste', 'presentation'] as const).map((field) => (
                      <div key={field}>
                        <label className="text-sm text-gray-600 capitalize">
                          {field === 'creativity' ? 'Creativitat' : field === 'taste' ? 'Gust' : 'Presentacio'} (0-5)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="1"
                          value={scores[team._id]?.[field] ?? 0}
                          onChange={(e) => updateScore(team._id, field, Number(e.target.value))}
                          className="w-full accent-pink-500"
                        />
                        <span className="text-sm font-bold">{scores[team._id]?.[field] ?? 0}</span>
                      </div>
                    ))}
                    <Button onClick={() => handleScore(team._id)} size="sm" className="w-full">
                      Puntuar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Esperant envio...</p>
              )}
            </Card>
          );
        })}
      </div>

      <Button onClick={onAdvance} variant="secondary" className="w-full">
        Seguent prova <ArrowRight size={16} className="inline ml-2" />
      </Button>
    </div>
  );
};
