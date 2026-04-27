import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { songService } from '../../services/songService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import type { Song } from '../../types';
import { Music, CheckCircle, XCircle, PartyPopper, AlertCircle, Trophy, Zap, Send } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

interface MarkEvent {
  teamId: string;
  teamName: string;
  cellIndex: number;
  songTitle: string;
}

const PRESET_CHALLENGES: { label: string; text: string; prefill?: boolean }[] = [
  { label: 'Karaoke flash!', text: "Karaoke flash! Primer que canti el seguent vers s'emporta un punt!" },
  { label: 'Tothom beu un glop!', text: 'Tothom beu un glop!' },
  { label: 'Brindis per la nuvia!', text: 'Brindis per la nuvia! Aixequeu els gots!' },
  { label: 'Beu si...', text: 'Beu si ', prefill: true },
];

export const BingoAdminPanel = ({ onFinish }: Props) => {
  const { socket } = useSocket();
  const { game } = useGame();
  const [songs, setSongs] = useState<Song[]>([]);
  const [started, setStarted] = useState(false);
  const [pendingMarks, setPendingMarks] = useState<MarkEvent[]>([]);
  const [lineWinner, setLineWinner] = useState<string | null>(null);
  const [bingoWinner, setBingoWinner] = useState<string | null>(null);
  const [customChallenge, setCustomChallenge] = useState('');
  const [challengeSent, setChallengeSent] = useState(false);

  useEffect(() => {
    songService.getAll().then(setSongs);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('bingo:cell-marked', (data: MarkEvent) => {
      setPendingMarks((prev) => {
        const dup = prev.some(
          (m) => m.teamId === data.teamId && m.cellIndex === data.cellIndex
        );
        return dup ? prev : [...prev, data];
      });
    });

    socket.on('bingo:pending-marks', (data: { pending: MarkEvent[] }) => {
      setPendingMarks(data.pending);
    });

    socket.on('bingo:winner', (data: { type: string; teamName: string }) => {
      if (data.type === 'line') {
        setLineWinner(data.teamName);
      } else if (data.type === 'bingo') {
        setBingoWinner(data.teamName);
      }
    });

    const requestPending = () => {
      if (game?._id) socket.emit('bingo:request-pending', { gameId: game._id });
    };

    requestPending();
    socket.on('connect', requestPending);

    return () => {
      socket.off('bingo:cell-marked');
      socket.off('bingo:pending-marks');
      socket.off('bingo:winner');
      socket.off('connect', requestPending);
    };
  }, [socket, game?._id]);

  const handleStart = () => {
    if (!socket || !game) return;
    socket.emit('bingo:start', { gameId: game._id });
    setStarted(true);
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

  const handleSendChallenge = (text: string) => {
    if (!socket || !game || !text.trim()) return;
    socket.emit('bingo:send-challenge', { gameId: game._id, text: text.trim() });
    setChallengeSent(true);
    setCustomChallenge('');
    setTimeout(() => setChallengeSent(false), 2000);
  };

  // Full-screen victory only for BINGO
  if (bingoWinner) {
    return (
      <div className="space-y-5 text-center animate-bounce-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 shadow-xl">
          <PartyPopper className="text-white" size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-gradient">BINGO!</h2>
        <Card className="ring-2 ring-gold-400 ring-offset-2">
          <p className="text-lg font-bold text-rosa-600">
            Guanyador: <span className="text-gradient">{bingoWinner}</span>
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

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-lila-400 to-rosa-500 mb-3 shadow-lg">
          <Music className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-extrabold text-gradient">Bingo Musical</h2>
      </div>

      {lineWinner && (
        <Card className="bg-gradient-to-r from-gold-50 to-gold-100 border-gold-300 ring-2 ring-gold-400 ring-offset-1">
          <div className="flex items-center gap-2">
            <Trophy className="text-gold-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-extrabold text-gold-600">LINIA!</p>
              <p className="text-sm text-gold-500 font-medium">Guanyada per: {lineWinner}</p>
            </div>
          </div>
        </Card>
      )}

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

      {pendingMarks.length === 0 && !lineWinner && (
        <Card className="text-center">
          <p className="text-rosa-400 text-sm">Esperant marques dels jugadors...</p>
          <p className="text-rosa-300 text-xs mt-1">Posa la playlist de Spotify!</p>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-rosa-600 mb-3 flex items-center gap-2">
          <Zap size={16} className="text-gold-500" />
          Mini-reptes
        </h3>
        {challengeSent && (
          <div className="text-center text-green-600 font-bold text-sm mb-3 animate-bounce-in">
            Enviat!
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_CHALLENGES.map((c) => (
            <button
              key={c.label}
              onClick={() => (c.prefill ? setCustomChallenge(c.text) : handleSendChallenge(c.text))}
              className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-50 to-rosa-50 border border-gold-200 text-rosa-600 font-medium hover:from-gold-100 hover:to-rosa-100 transition-colors active:scale-95"
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={customChallenge}
            onChange={(e) => setCustomChallenge(e.target.value)}
            placeholder="Repte personalitzat..."
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSendChallenge(customChallenge)}
          />
          <button
            onClick={() => handleSendChallenge(customChallenge)}
            disabled={!customChallenge.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 text-white disabled:opacity-50 transition-all active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </Card>

      <Button onClick={onFinish} variant="secondary" className="w-full" size="lg">
        Acabar bingo
      </Button>
    </div>
  );
};
