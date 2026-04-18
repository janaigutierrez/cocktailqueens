import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { songService } from '../../services/songService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Song } from '../../types';
import { Music, Play, CheckCircle, XCircle, PartyPopper } from 'lucide-react';

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
      <div className="space-y-4 text-center">
        <PartyPopper className="mx-auto text-yellow-500" size={64} />
        <h2 className="text-2xl font-bold text-pink-600">
          {winner.type === 'bingo' ? 'BINGO!' : 'LINIA!'}
        </h2>
        <p className="text-lg">Guanyador: {winner.teamName}</p>
        <Button onClick={onFinish} className="w-full">Tornar al lobby</Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-pink-600 text-center">Bingo Musical</h2>
        <Card>
          <p className="text-gray-600 mb-2">Cancons disponibles: {songs.length}</p>
          {songs.length < 15 && (
            <p className="text-red-500 text-sm">Necessites almenys 15 cancons!</p>
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
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-pink-600 text-center">Bingo Musical</h2>

      {pendingMarks.length > 0 && (
        <Card className="border-2 border-orange-300">
          <h3 className="font-semibold mb-2">Marques pendents</h3>
          {pendingMarks.map((mark, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg mb-1">
              <div>
                <span className="font-medium">{mark.teamName}</span>
                <span className="text-sm text-gray-500 ml-2">{mark.songTitle}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleValidate(mark, true)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <CheckCircle size={20} />
                </button>
                <button
                  onClick={() => handleValidate(mark, false)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <h3 className="font-semibold mb-2">Reprodueix una canco ({playedSongs.length}/{songs.length})</h3>
        <div className="max-h-60 overflow-y-auto space-y-1">
          {availableSongs.map((song) => (
            <button
              key={song._id}
              onClick={() => handleNextSong(song._id)}
              className="w-full text-left p-2 hover:bg-pink-50 rounded-lg flex items-center gap-2"
            >
              <Play size={14} className="text-pink-500" />
              <span className="text-sm">
                {song.title} - <span className="text-gray-500">{song.artist}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Button onClick={onFinish} variant="secondary" className="w-full">
        Acabar bingo
      </Button>
    </div>
  );
};
