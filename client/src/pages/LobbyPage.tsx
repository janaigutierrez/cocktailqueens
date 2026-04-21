import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Card } from '../components/ui/Card';
import { Users, Wifi, WifiOff, Sparkles } from 'lucide-react';

export const LobbyPage = () => {
  const { game, teams, myTeam, isReconnecting } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for reconnection to finish before redirecting
    if (isReconnecting) return;

    if (!myTeam) {
      navigate('/');
      return;
    }

    if (game && game.status !== 'lobby' && game.status !== 'lobby-intermedi') {
      if (game.status === 'finished') {
        navigate('/ranking');
      } else {
        navigate('/game');
      }
    }
  }, [game, myTeam, navigate, isReconnecting]);

  return (
    <div className="min-h-svh flex flex-col items-center p-6 bg-festa">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-4 shadow-lg shadow-rosa-300/50 animate-pulse-glow">
          <Sparkles className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gradient mb-1">
          {game?.status === 'lobby-intermedi' ? 'Pausa entre jocs' : "Sala d'espera"}
        </h1>
        <p className="text-rosa-400">
          {game?.status === 'lobby-intermedi'
            ? "Preparant el seguent joc..."
            : "Esperant que l'admin comenci..."}
        </p>
        {myTeam && (
          <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-rosa-100 text-rosa-600 font-semibold text-sm">
            Equip: {myTeam.name}
          </div>
        )}
      </div>

      <Card className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-rosa-500" />
          <h2 className="font-bold text-rosa-600">Equips ({teams.length})</h2>
        </div>
        <ul className="space-y-2 stagger">
          {teams.map((team) => (
            <li
              key={team._id}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                team._id === myTeam?._id
                  ? 'bg-gradient-to-r from-rosa-50 to-lila-50 border border-rosa-200'
                  : 'bg-rosa-50/50'
              }`}
            >
              <span className={team._id === myTeam?._id ? 'font-bold text-rosa-600' : 'text-gray-700'}>
                {team.name}
              </span>
              {team.isConnected ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-gray-300" />
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-8 flex items-center gap-2">
        <div className="w-2 h-2 bg-rosa-400 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-lila-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
      </div>
    </div>
  );
};
