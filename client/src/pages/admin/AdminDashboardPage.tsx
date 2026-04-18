import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { adminService } from '../../services/adminService';
import { gameService } from '../../services/gameService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Prova1AdminPanel } from '../../components/admin/Prova1AdminPanel';
import { Prova2AdminPanel } from '../../components/admin/Prova2AdminPanel';
import { Prova3AdminPanel } from '../../components/admin/Prova3AdminPanel';
import { BingoAdminPanel } from '../../components/admin/BingoAdminPanel';
import {
  Wine,
  Music,
  Users,
  ArrowLeft,
  Trophy,
  LogOut,
  Wifi,
  WifiOff,
  Plus,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { game, teams, refreshGame } = useGame();

  useEffect(() => {
    if (!adminService.isLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleCreateGame = async () => {
    await gameService.create();
    await refreshGame();
  };

  const handleSelectMode = (mode: 'cocktails' | 'bingo') => {
    if (!socket || !game) return;
    socket.emit('game:select-mode', { gameId: game._id, mode });
  };

  const handleAdvance = () => {
    if (!socket || !game) return;
    socket.emit('game:advance', { gameId: game._id });
  };

  const handleBackToLobby = () => {
    if (!socket || !game) return;
    socket.emit('game:back-to-lobby', { gameId: game._id });
  };

  const handleFinish = () => {
    if (!socket || !game) return;
    socket.emit('game:finish', { gameId: game._id });
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin');
  };

  const renderLobbyView = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-pink-500" />
          <h2 className="font-semibold">Equips connectats ({teams.length})</h2>
        </div>
        {teams.length === 0 ? (
          <p className="text-gray-400 text-sm">Encara no hi ha equips</p>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li key={team._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-medium">{team.name}</span>
                {team.isConnected ? (
                  <Wifi size={16} className="text-green-500" />
                ) : (
                  <WifiOff size={16} className="text-red-400" />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold mb-4">Triar joc</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleSelectMode('cocktails')}
            disabled={game?.completedModes.includes('cocktails')}
            className="flex flex-col items-center gap-2 py-6"
          >
            <Wine size={32} />
            <span>Coctels</span>
            {game?.completedModes.includes('cocktails') && (
              <span className="text-xs opacity-75">Completat</span>
            )}
          </Button>
          <Button
            onClick={() => handleSelectMode('bingo')}
            disabled={game?.completedModes.includes('bingo')}
            variant="secondary"
            className="flex flex-col items-center gap-2 py-6"
          >
            <Music size={32} />
            <span>Bingo</span>
            {game?.completedModes.includes('bingo') && (
              <span className="text-xs opacity-75">Completat</span>
            )}
          </Button>
        </div>

        {(game?.completedModes.length ?? 0) > 0 && (
          <Button onClick={handleFinish} variant="danger" className="w-full mt-4">
            <Trophy size={16} className="inline mr-2" />
            Acabar partida
          </Button>
        )}
      </Card>
    </div>
  );

  const renderGameControls = () => {
    if (!game) return null;

    switch (game.status) {
      case 'cocktails-prova1':
        return <Prova1AdminPanel onAdvance={handleAdvance} />;
      case 'cocktails-prova2':
        return <Prova2AdminPanel onAdvance={handleAdvance} />;
      case 'cocktails-prova3':
        return <Prova3AdminPanel onAdvance={handleAdvance} />;
      case 'cocktails-results':
        return (
          <div className="space-y-4">
            <Card className="text-center">
              <Trophy className="mx-auto text-yellow-500 mb-2" size={36} />
              <h2 className="text-xl font-bold">Resultats Coctels</h2>
            </Card>
            <Button onClick={handleBackToLobby} className="w-full">
              <ArrowLeft size={16} className="inline mr-2" />
              Tornar al lobby
            </Button>
          </div>
        );
      case 'bingo':
        return <BingoAdminPanel onFinish={handleBackToLobby} />;
      case 'bingo-results':
        return (
          <div className="space-y-4">
            <Card className="text-center">
              <Trophy className="mx-auto text-yellow-500 mb-2" size={36} />
              <h2 className="text-xl font-bold">Resultats Bingo</h2>
            </Card>
            <Button onClick={handleBackToLobby} className="w-full">
              <ArrowLeft size={16} className="inline mr-2" />
              Tornar al lobby
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-svh bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="font-bold text-pink-600">Admin Panel</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin/cocktails" className="p-2 hover:bg-gray-100 rounded-lg" title="Coctels">
            <Wine size={20} />
          </Link>
          <Link to="/admin/songs" className="p-2 hover:bg-gray-100 rounded-lg" title="Cancons">
            <Music size={20} />
          </Link>
          <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg" title="Sortir">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {!game ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hi ha cap partida activa</p>
            <Button onClick={handleCreateGame}>
              <Plus size={16} className="inline mr-2" />
              Crear partida
            </Button>
          </div>
        ) : game.status === 'lobby' || game.status === 'lobby-intermedi' ? (
          renderLobbyView()
        ) : game.status === 'finished' ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Partida acabada!</h2>
            <Button onClick={handleCreateGame}>Nova partida</Button>
          </div>
        ) : (
          renderGameControls()
        )}
      </main>
    </div>
  );
};
