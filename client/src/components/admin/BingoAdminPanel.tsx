import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { songService } from '../../services/songService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Song } from '../../types';
import { Music, Play, CheckCircle, XCircle, PartyPopper, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

interface MarkEvent {
  teamId: string;
  teamName: string;
  cellIndex: number;
  songTitle: string;
}

export const BingoAdminPanel = ({ onFinish }: Props) => {
  const { socket } = useSocket();
  const { game } = useGame();
  const [songs, setSongs] = useState<Song[]>([]);
  const [started, setStarted] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<string[]>([]);
  const [pendingMarks, setPendingMarks] = useState<MarkEvent[]>([]);
  const [winner, setWinner] = useState<{ type: string; teamName: string } | null>(null);

  useEffect(() => {
    songService.getAll().then(setSongs);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('bingo:cell-marked', (data: MarkEvent) => {
      setPendingMarks((prev) => [...prev, data]);
    });

    socket.on('bingo:winner', (data: { type: string; teamName: string }) => {
      setWinner(data);
    });

    return () => {
      socket.off('bingo:cell-marked');
      socket.off('bingo:winner');
    };
  }, [socket]);

  const handleStart = () => {
    if (!socket || !game) return;
    socket.emit('bingo:start', { gameId: game._id });
    setStarted(true);
  };

  const handleNextSong = (songId: string) => {
    if (!socket || !game) return;
    socket.emit('bingo:next-song', { gameId: game._id, songId });
    setPlayedSongs((prev) => [...prev, songId]);
  };

  const handleValidate = (mark: MarkEvent, valid: boolean) => {
    if (!socket || !game) return;
    socket.emit('bingo:validate-cell', {
      gameId: game._id,
      teamId: mark.teamId,
      cellIndex: mark.cellIndex,
      valid,
    });
    setPendingMarks((prev) => prev.filter((m) => m !== mark));
  };

  if (winner) {
    return (
      <div className="space-y-5 text-center animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 shadow-xl">
          <PartyPopper className="text-white" size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-gradient">
          {winner.type === 'bingo' ? 'BINGO!' : 'LINIA!'}
        </h2>
        <Card className="ring-2 ring-gold-400 ring-offset-2">
          <p className="text-lg font-bold text-rosa-600">
            Guanyador: <span className="text-gradient">{winner.teamName}</span>
          </p>
        </Card>
        <Button onClick={onFinish} variant="gold" className="w-full" size="lg">
          Tornar al lobby
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-lila-400 to-rosa-500 mb-3 shadow-lg">
            <Music className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-gradient">Bingo Musical</h2>
        </div>
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-rosa-500 font-medium">Cancons disponibles</span>
            <span className="text-lg font-extrabold text-gradient">{songs.length}</span>
          </div>
          {songs.length < 15 && (
            <div className="flex items-center gap-2 mt-3 text-red-500 bg-red-50 p-3 rounded-xl">
              <AlertCircle size={16} />
              <p className="text-sm font-medium">Necessites almenys 15 cancons!</p>
            </div>
          )}
        </Card>
        <Button onClick={handleStart} disabled={songs.length < 15} className="w-full" size="lg">
          <Music size={20} className="inline mr-2" />
          Generar cartons i comencar
        </Button>
      </div>
    );
  }

  const availableSongs = songs.filter((s) => !playedSongs.includes(s._id));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-lila-400 to-rosa-500 mb-3 shadow-lg">
          <Music className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-extrabold text-gradient">Bingo Musical</h2>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lila-500 bg-lila-50 px-3 py-1 rounded-full mt-2">
          <Sparkles size={14} />
          {playedSongs.length}/{songs.length} cancons reproduides
        </span>
      </div>

      {pendingMarks.length > 0 && (
        <Card className="ring-2 ring-gold-400 ring-offset-2">
          <h3 className="font-bold text-rosa-600 mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-gold-500" />
            Marques pendents ({pendingMarks.length})
          </h3>
          <div className="space-y-2">
            {pendingMarks.map((mark, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-gold-50 to-rosa-50 rounded-xl border border-gold-200">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-rosa-600 truncate">{mark.teamName}</p>
                  <p className="text-sm text-rosa-400 truncate">{mark.songTitle}</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleValidate(mark, true)}
                    className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => handleValidate(mark, false)}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-rosa-600 mb-3 flex items-center gap-2">
          <Play size={16} className="text-lila-500" />
          Reprodueix una canco
        </h3>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {availableSongs.map((song) => (
            <button
              key={song._id}
              onClick={() => handleNextSong(song._id)}
              className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-rosa-50 hover:to-lila-50 rounded-xl flex items-center gap-3 transition-colors active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lila-100 to-rosa-100 flex items-center justify-center flex-shrink-0">
                <Play size={12} className="text-lila-500 ml-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-rosa-600 truncate">{song.title}</p>
                <p className="text-xs text-rosa-400 truncate">{song.artist}</p>
              </div>
            </button>
          ))}
          {availableSongs.length === 0 && (
            <p className="text-center text-rosa-300 py-4 text-sm">Totes les cancons reproduides!</p>
          )}
        </div>
      </Card>

      <Button onClick={onFinish} variant="secondary" className="w-full" size="lg">
        Acabar bingo
      </Button>
    </div>
  );
};
