import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wine } from 'lucide-react';

export const JoinPage = () => {
  const [teamName, setTeamName] = useState('');
  const { socket, isConnected } = useSocket();
  const { game, setMyTeam } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on('team:joined', (data) => {
      if (data.team.socketId === socket.id) {
        setMyTeam(data.team);
        navigate('/lobby');
      }
    });

    return () => {
      socket.off('team:joined');
    };
  }, [socket, navigate, setMyTeam]);

  const handleJoin = () => {
    if (!socket || !game || !teamName.trim()) return;
    socket.emit('team:join', { teamName: teamName.trim(), gameId: game._id });
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-gradient-to-b from-pink-100 to-purple-100">
      <div className="text-center mb-8">
        <Wine className="mx-auto mb-4 text-pink-500" size={48} />
        <h1 className="text-4xl font-bold text-pink-600 mb-2">Cocktail Queens</h1>
        <p className="text-gray-600">Entra el nom del teu equip</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nom de l'equip"
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />

        <Button
          onClick={handleJoin}
          disabled={!teamName.trim() || !isConnected || !game}
          className="w-full"
          size="lg"
        >
          Entrar
        </Button>

        {!isConnected && (
          <p className="text-sm text-red-500 text-center">Connectant al servidor...</p>
        )}
        {!game && isConnected && (
          <p className="text-sm text-orange-500 text-center">
            Esperant que l'admin creii una partida...
          </p>
        )}
      </div>
    </div>
  );
};
