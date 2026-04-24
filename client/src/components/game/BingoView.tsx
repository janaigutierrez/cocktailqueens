import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { BingoCard } from './BingoCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Music, PartyPopper, Crown, Trophy, Zap } from 'lucide-react';
import type { BingoCell } from '../../types';

export const BingoView = () => {
  const { socket } = useSocket();
  const { game, myTeam } = useGame();
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [lineWinner, setLineWinner] = useState<string | null>(null);
  const [bingoWinner, setBingoWinner] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const challengeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('bingo:card', (data: { card: { cells: BingoCell[] } }) => {
      setCells(data.card.cells);
    });

    socket.on('bingo:cell-validated', (data: { cellIndex: number; valid: boolean }) => {
      setCells((prev) =>
        prev.map((cell, i) =>
          i === data.cellIndex
            ? { ...cell, validatedByAdmin: data.valid, markedByTeam: data.valid }
            : cell
        )
      );
    });

    socket.on('bingo:winner', (data: { type: string; teamName: string }) => {
      if (data.type === 'line') {
        setLineWinner(data.teamName);
      } else if (data.type === 'bingo') {
        setBingoWinner(data.teamName);
      }
    });

    socket.on('bingo:challenge', (data: { text: string }) => {
      setChallenge(data.text);
    });

    return () => {
      socket.off('bingo:card');
      socket.off('bingo:cell-validated');
      socket.off('bingo:winner');
      socket.off('bingo:challenge');
    };
  }, [socket]);

  // Auto-dismiss challenge after 15 seconds
  useEffect(() => {
    if (!challenge) return;

    if (challengeTimerRef.current) {
      clearTimeout(challengeTimerRef.current);
    }

    challengeTimerRef.current = setTimeout(() => {
      setChallenge(null);
      challengeTimerRef.current = null;
    }, 15_000);

    return () => {
      if (challengeTimerRef.current) {
        clearTimeout(challengeTimerRef.current);
        challengeTimerRef.current = null;
      }
    };
  }, [challenge]);

  const handleMarkCell = (cellIndex: number) => {
    if (!socket || !game || !myTeam) return;
    setCells((prev) =>
      prev.map((cell, i) => (i === cellIndex ? { ...cell, markedByTeam: true } : cell))
    );
    socket.emit('bingo:mark-cell', { teamId: myTeam._id, gameId: game._id, cellIndex });
  };

  const handleClaimLine = () => {
    if (!socket || !game || !myTeam) return;
    socket.emit('bingo:claim-line', { teamId: myTeam._id, gameId: game._id });
  };

  const handleClaimBingo = () => {
    if (!socket || !game || !myTeam) return;
    socket.emit('bingo:claim-bingo', { teamId: myTeam._id, gameId: game._id });
  };

  // Full-screen victory only for BINGO
  if (bingoWinner) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-bounce-in">
        <PartyPopper className="text-gold-500 mb-2" size={64} />
        <Crown className="text-gold-400 mb-4" size={36} />
        <h2 className="text-3xl font-extrabold text-gradient mb-2">BINGO!</h2>
        <p className="text-xl text-rosa-500 font-bold">{bingoWinner}</p>
      </div>
    );
  }

  if (cells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-lila-100 flex items-center justify-center mb-4 animate-pulse-glow">
          <Music className="text-lila-500" size={32} />
        </div>
        <p className="text-rosa-400 text-lg">Esperant el carto de bingo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Challenge overlay */}
      {challenge && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setChallenge(null)}
        >
          <div className="animate-bounce-in bg-gradient-to-br from-gold-400 to-gold-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <Zap className="text-white mx-auto mb-3" size={48} />
            <h2 className="text-2xl font-extrabold text-white mb-2">REPTE!</h2>
            <p className="text-lg text-white/90 font-bold">{challenge}</p>
            <p className="text-white/60 text-xs mt-4">Toca per tancar</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-gradient">Bingo Musical</h2>
      </div>

      {lineWinner && (
        <Card className="bg-gradient-to-r from-gold-50 to-gold-100 border-gold-300 ring-2 ring-gold-400 ring-offset-1">
          <div className="flex items-center gap-2">
            <Trophy className="text-gold-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-extrabold text-gold-600">LINIA!</p>
              <p className="text-sm text-gold-500 font-medium">Guanyador: {lineWinner}</p>
            </div>
          </div>
        </Card>
      )}

      <BingoCard cells={cells} onMarkCell={handleMarkCell} />

      <div className="flex gap-3">
        <Button
          onClick={handleClaimLine}
          variant="secondary"
          className="flex-1"
          size="lg"
          disabled={!!lineWinner}
        >
          {lineWinner ? 'Linia reclamada' : 'Linia!'}
        </Button>
        <Button onClick={handleClaimBingo} variant="gold" className="flex-1" size="lg">
          BINGO!
        </Button>
      </div>
    </div>
  );
};
