import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Card } from '../components/ui/Card';
import { Users, Wifi, WifiOff } from 'lucide-react';

export const LobbyPage = () => {
  const { game, teams, myTeam } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!myTeam) {
      navigate('/');
      return;
    }

    if (game && game.status !== 'lobby' && game.status !== 'lobby-intermedi') {
      navigate('/game');
    }
  }, [game, myTeam, navigate]);

  return (
    <div className="min-h-svh flex flex-col items-center p-6 bg-gradient-to-b from-pink-100 to-purple-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-pink-600 mb-2">Sala d'espera</h1>
        <p className="text-gray-600">
          {game?.status === 'lobby-intermedi'
            ? "Pausa entre jocs - esperant l'admin"
            : "Esperant que l'admin comenci el joc..."}
        </p>
        {myTeam && (
          <p className="text-sm text-pink-500 mt-2">
            El teu equip: <strong>{myTeam.name}</strong>
          </p>
        )}
      </div>

      <Card className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-pink-500" />
          <h2 className="font-semibold">Equips ({teams.length})</h2>
        </div>
        <ul className="space-y-2">
          {teams.map((team) => (
            <li
              key={team._id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <span className={team._id === myTeam?._id ? 'font-bold text-pink-600' : ''}>
                {team.name}
              </span>
              {team.isConnected ? (
                <Wifi size={16} className="text-green-500" />
              ) : (
                <WifiOff size={16} className="text-red-400" />
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-8 flex items-center gap-2">
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
        <span className="text-sm text-gray-500">En espera...</span>
      </div>
    </div>
  );
};
