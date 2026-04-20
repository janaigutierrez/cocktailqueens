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
  UserX,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const statusLabels: Record<string, string> = {
  'lobby': 'Lobby',
  'lobby-intermedi': 'Lobby intermedi',
  'cocktails-prova1': 'Coctels - Prova 1',
  'cocktails-prova2': 'Coctels - Prova 2',
  'cocktails-prova3': 'Coctels - Prova 3',
  'cocktails-results': 'Coctels - Resultats',
  'bingo': 'Bingo Musical',
  'bingo-results': 'Bingo - Resultats',
  'finished': 'Partida acabada',
};

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { game, teams, refreshGame } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showReplayConfirm, setShowReplayConfirm] = useState<'cocktails' | 'bingo' | null>(null);
  const [showTeams, setShowTeams] = useState(true);

  useEffect(() => {
    if (!adminService.isLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleCreateGame = async () => {
    // Clean up old game if exists
    if (game) {
      try { await gameService.delete(game._id); } catch { /* ignore */ }
    }
    await gameService.create();
    await refreshGame();
  };

  const handleSelectMode = (mode: 'cocktails' | 'bingo') => {
    if (!socket || !game) return;
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

  const handleKickTeam = (teamId: string) => {
    if (!socket || !game) return;
    socket.emit('team:kick', { teamId, gameId: game._id });
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin');
  };

  // Persistent team panel - shown in all game states
  const renderTeamPanel = () => {
    if (!game) return null;
    const isLobby = game.status === 'lobby' || game.status === 'lobby-intermedi';
    const connectedCount = teams.filter((t) => t.isConnected).length;

    return (
      <Card className="mb-4">
        <button
          onClick={() => setShowTeams(!showTeams)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Users size={18} className="text-rosa-500" />
            <h2 className="font-bold text-rosa-600">
              Equips ({teams.length})
            </h2>
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
              {connectedCount} online
            </span>
          </div>
          {showTeams ? <ChevronUp size={18} className="text-rosa-400" /> : <ChevronDown size={18} className="text-rosa-400" />}
        </button>

        {showTeams && (
          <div className="mt-3">
            {teams.length === 0 ? (
              <p className="text-rosa-300 text-sm text-center py-3">Encara no hi ha equips</p>
            ) : (
              <ul className="space-y-1.5">
                {teams.map((team) => (
                  <li key={team._id} className="flex items-center justify-between p-2.5 rounded-xl bg-rosa-50/50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {team.isConnected ? (
                        <Wifi size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <WifiOff size={14} className="text-gray-300 flex-shrink-0" />
                      )}
                      <span className="font-medium truncate">{team.name}</span>
                      {!isLobby && (
                        <span className="text-xs text-rosa-400 flex-shrink-0">
                          {team.totalScore} pts
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleKickTeam(team._id); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Expulsar equip"
                    >
                      <UserX size={14} className="text-red-400" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderModeSelector = () => (
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
            <div className="absolute top-2 right-2">
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
            <div className="absolute top-2 right-2">
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

  // Bottom actions bar - always visible when game exists
  const renderBottomActions = () => {
    if (!game) return null;
    const isInGame = game.status !== 'lobby' && game.status !== 'lobby-intermedi' && game.status !== 'finished';

    return (
      <div className="mt-6 space-y-2">
        {isInGame && (
          <Button onClick={handleBackToLobby} variant="secondary" className="w-full" size="sm">
            <ArrowLeft size={14} className="inline mr-2" />
            Tornar al lobby
          </Button>
        )}
        <Button onClick={() => setShowResetConfirm(true)} variant="danger" className="w-full" size="sm">
          <RotateCcw size={14} className="inline mr-2" />
          Resetejar tot (nova partida de 0)
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-svh bg-festa">
      <header className="glass p-4 shadow-sm border-b border-rosa-100/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="font-extrabold text-gradient">Admin</h1>
            {game && (
              <p className="text-xs text-rosa-400 font-medium">
                {statusLabels[game.status] || game.status}
              </p>
            )}
          </div>
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
        ) : (
          <>
            {/* Team panel - always visible */}
            {renderTeamPanel()}

            {/* Main content based on game status */}
            {game.status === 'lobby' || game.status === 'lobby-intermedi' ? (
              <div className="space-y-5 animate-fade-in">
                {renderModeSelector()}
              </div>
            ) : game.status === 'finished' ? (
              <div className="text-center py-8 animate-bounce-in">
                <Trophy className="mx-auto text-gold-500 mb-4" size={64} />
                <h2 className="text-2xl font-extrabold text-gradient mb-6">Partida acabada!</h2>
                <Button onClick={handleCreateGame} size="lg" className="w-full">
                  <Plus size={18} className="inline mr-2" />
                  Nova partida
                </Button>
              </div>
            ) : (
              renderGameControls()
            )}

            {/* Bottom actions - always visible */}
            {renderBottomActions()}
          </>
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
