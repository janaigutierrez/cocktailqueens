import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { adminService } from '../../services/adminService';
import { gameService } from '../../services/gameService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
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
  CheckCircle,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { game, teams, refreshGame } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReplayConfirm, setShowReplayConfirm] = useState<'cocktails' | 'bingo' | null>(null);

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
    // If mode was already completed, ask for confirmation
    if (game.completedModes.includes(mode)) {
      setShowReplayConfirm(mode);
      return;
    }
    socket.emit('game:select-mode', { gameId: game._id, mode });
  };

  const handleConfirmReplay = () => {
    if (!socket || !game || !showReplayConfirm) return;
    socket.emit('game:select-mode', { gameId: game._id, mode: showReplayConfirm });
    setShowReplayConfirm(null);
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

  const handleReset = () => {
    if (!socket || !game) return;
    socket.emit('game:reset', { gameId: game._id });
    setShowResetConfirm(false);
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin');
  };

  const renderLobbyView = () => (
    <div className="space-y-5 animate-fade-in">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-rosa-500" />
          <h2 className="font-bold text-rosa-600">Equips ({teams.length})</h2>
        </div>
        {teams.length === 0 ? (
          <p className="text-rosa-300 text-sm text-center py-4">Encara no hi ha equips</p>
        ) : (
          <ul className="space-y-2 stagger">
            {teams.map((team) => (
              <li key={team._id} className="flex items-center justify-between p-3 rounded-xl bg-rosa-50/50">
                <span className="font-medium">{team.name}</span>
                {team.isConnected ? (
                  <Wifi size={16} className="text-green-500" />
                ) : (
                  <WifiOff size={16} className="text-gray-300" />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-bold text-rosa-600 mb-4">Triar joc</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSelectMode('cocktails')}
            className={`relative p-6 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-2 ${
              game?.completedModes.includes('cocktails')
                ? 'border-green-200 bg-green-50/50 hover:border-rosa-400'
                : 'border-rosa-200 bg-gradient-to-br from-rosa-50 to-lila-50 hover:border-rosa-400 shadow-lg shadow-rosa-100'
            }`}
          >
            {game?.completedModes.includes('cocktails') && (
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" />
              </div>
            )}
            <Wine size={32} className="text-rosa-500" />
            <span className="font-bold text-rosa-600">Coctels</span>
            {game?.completedModes.includes('cocktails') && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <RefreshCw size={10} /> Repetir
              </span>
            )}
          </button>
          <button
            onClick={() => handleSelectMode('bingo')}
            className={`relative p-6 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-2 ${
              game?.completedModes.includes('bingo')
                ? 'border-green-200 bg-green-50/50 hover:border-lila-400'
                : 'border-lila-200 bg-gradient-to-br from-lila-50 to-gold-50 hover:border-lila-400 shadow-lg shadow-lila-100'
            }`}
          >
            {game?.completedModes.includes('bingo') && (
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" />
              </div>
            )}
            <Music size={32} className="text-lila-500" />
            <span className="font-bold text-lila-600">Bingo</span>
            {game?.completedModes.includes('bingo') && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <RefreshCw size={10} /> Repetir
              </span>
            )}
          </button>
        </div>

        {(game?.completedModes.length ?? 0) > 0 && (
          <Button onClick={handleFinish} variant="gold" className="w-full mt-4">
            <Trophy size={16} className="inline mr-2" />
            Acabar partida
          </Button>
        )}
      </Card>

      <Button onClick={() => setShowResetConfirm(true)} variant="danger" className="w-full" size="sm">
        <RotateCcw size={14} className="inline mr-2" />
        Resetejar tot (nova partida de 0)
      </Button>
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
          <div className="space-y-4 animate-fade-in">
            <Card className="text-center">
              <Trophy className="mx-auto text-gold-500 mb-2" size={36} />
              <h2 className="text-xl font-bold text-rosa-600">Resultats Coctels</h2>
            </Card>
            <Button onClick={handleBackToLobby} className="w-full" size="lg">
              <ArrowLeft size={16} className="inline mr-2" />
              Tornar al lobby
            </Button>
          </div>
        );
      case 'bingo':
        return <BingoAdminPanel onFinish={handleBackToLobby} />;
      case 'bingo-results':
        return (
          <div className="space-y-4 animate-fade-in">
            <Card className="text-center">
              <Trophy className="mx-auto text-gold-500 mb-2" size={36} />
              <h2 className="text-xl font-bold text-rosa-600">Resultats Bingo</h2>
            </Card>
            <Button onClick={handleBackToLobby} className="w-full" size="lg">
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
    <div className="min-h-svh bg-festa">
      <header className="glass p-4 shadow-sm border-b border-rosa-100/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="font-extrabold text-gradient">Admin</h1>
          <div className="flex items-center gap-1">
            <Link to="/admin/cocktails" className="p-2.5 hover:bg-rosa-100 rounded-xl transition-colors" title="Coctels">
              <Wine size={20} className="text-rosa-500" />
            </Link>
            <Link to="/admin/songs" className="p-2.5 hover:bg-lila-100 rounded-xl transition-colors" title="Cancons">
              <Music size={20} className="text-lila-500" />
            </Link>
            <button onClick={handleLogout} className="p-2.5 hover:bg-red-50 rounded-xl transition-colors" title="Sortir">
              <LogOut size={20} className="text-red-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {!game ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-rosa-400 mb-4 text-lg">No hi ha cap partida activa</p>
            <Button onClick={handleCreateGame} size="lg">
              <Plus size={18} className="inline mr-2" />
              Crear partida
            </Button>
          </div>
        ) : game.status === 'lobby' || game.status === 'lobby-intermedi' ? (
          renderLobbyView()
        ) : game.status === 'finished' ? (
          <div className="text-center py-16 animate-bounce-in">
            <Trophy className="mx-auto text-gold-500 mb-4" size={64} />
            <h2 className="text-2xl font-extrabold text-gradient mb-6">Partida acabada!</h2>
            <div className="space-y-3">
              <Button onClick={handleCreateGame} size="lg" className="w-full">
                <Plus size={18} className="inline mr-2" />
                Nova partida
              </Button>
              <Button onClick={() => setShowResetConfirm(true)} variant="danger" size="sm" className="w-full">
                <RotateCcw size={14} className="inline mr-2" />
                Resetejar tot
              </Button>
            </div>
          </div>
        ) : (
          renderGameControls()
        )}
      </main>

      {/* Confirm reset modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Resetejar partida">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
            <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-700">Estas segur/a?</p>
              <p className="text-sm text-red-600 mt-1">
                S'esborraran tots els equips, puntuacions i dades del joc. Els jugadors hauran de tornar a entrar.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowResetConfirm(false)} variant="secondary" className="flex-1">
              Cancel·lar
            </Button>
            <Button onClick={handleReset} variant="danger" className="flex-1">
              <RotateCcw size={14} className="inline mr-2" />
              Resetejar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm replay mode modal */}
      <Modal isOpen={!!showReplayConfirm} onClose={() => setShowReplayConfirm(null)} title="Repetir joc">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gold-50 rounded-xl">
            <RefreshCw size={20} className="text-gold-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-rosa-700">
                Vols tornar a jugar {showReplayConfirm === 'cocktails' ? 'Coctels' : 'Bingo'}?
              </p>
              <p className="text-sm text-rosa-500 mt-1">
                Les puntuacions anteriors d'aquest joc es resetejaran. Els equips es mantenen.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowReplayConfirm(null)} variant="secondary" className="flex-1">
              Cancel·lar
            </Button>
            <Button onClick={handleConfirmReplay} variant="gold" className="flex-1">
              <RefreshCw size={14} className="inline mr-2" />
              Repetir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
