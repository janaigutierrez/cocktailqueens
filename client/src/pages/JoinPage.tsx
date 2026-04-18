import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wine, Sparkles } from 'lucide-react';

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
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-festa relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-rosa-200 animate-float" style={{ animationDelay: '0s' }}>
        <Sparkles size={24} />
      </div>
      <div className="absolute top-20 right-12 text-lila-200 animate-float" style={{ animationDelay: '1s' }}>
        <Sparkles size={18} />
      </div>
      <div className="absolute bottom-20 left-16 text-gold-200 animate-float" style={{ animationDelay: '2s' }}>
        <Sparkles size={20} />
      </div>

      <div className="text-center mb-10 animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rosa-400 to-lila-500 mb-5 shadow-lg shadow-rosa-300/50">
          <Wine className="text-white" size={36} />
        </div>
        <h1 className="text-4xl font-extrabold text-gradient mb-2">Cocktail Queens</h1>
        <p className="text-rosa-400 text-lg">Comiat de soltera</p>
      </div>

      <div className="w-full max-w-sm space-y-5 animate-slide-up">
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nom del teu equip"
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          className="text-center text-lg"
        />

        <Button
          onClick={handleJoin}
          disabled={!teamName.trim() || !isConnected || !game}
          className="w-full"
          size="lg"
        >
          <Sparkles size={18} className="inline mr-2" />
          Entrar a la festa
        </Button>

        {!isConnected && (
          <div className="flex items-center justify-center gap-2 text-rosa-400">
            <div className="w-2 h-2 bg-rosa-400 rounded-full animate-pulse" />
            <p className="text-sm">Connectant al servidor...</p>
          </div>
        )}
        {!game && isConnected && (
          <p className="text-sm text-lila-400 text-center">
            Esperant que l'admin creii la partida...
          </p>
        )}
      </div>
    </div>
  );
};
