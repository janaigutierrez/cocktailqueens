import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { BingoCard } from './BingoCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Music, PartyPopper, Crown } from 'lucide-react';
import type { BingoCell } from '../../types';

export const BingoView = () => {
  const { socket } = useSocket();
  const { game, myTeam } = useGame();
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [currentSongNumber, setCurrentSongNumber] = useState<number | null>(null);
  const [winner, setWinner] = useState<{ type: string; teamName: string } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('bingo:card', (data: { card: { cells: BingoCell[] } }) => {
      setCells(data.card.cells);
    });

    socket.on('bingo:current-song', (data: { songNumber: number }) => {
      setCurrentSongNumber(data.songNumber);
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
      setWinner(data);
    });

    return () => {
      socket.off('bingo:card');
      socket.off('bingo:current-song');
      socket.off('bingo:cell-validated');
      socket.off('bingo:winner');
    };
  }, [socket]);

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

  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-bounce-in">
        <PartyPopper className="text-gold-500 mb-2" size={64} />
        <Crown className="text-gold-400 mb-4" size={36} />
        <h2 className="text-3xl font-extrabold text-gradient mb-2">
          {winner.type === 'bingo' ? 'BINGO!' : 'LINIA!'}
        </h2>
        <p className="text-xl text-rosa-500 font-bold">{winner.teamName}</p>
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
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-gradient">Bingo Musical</h2>
      </div>

      {currentSongNumber !== null && (
        <Card className="text-center bg-gradient-to-r from-lila-50 to-rosa-50 border-lila-200">
          <div className="flex items-center justify-center gap-2">
            <Music className="text-lila-500 animate-pulse" size={20} />
            <span className="font-bold text-lila-600">Canco #{currentSongNumber}</span>
          </div>
        </Card>
      )}

      <BingoCard cells={cells} onMarkCell={handleMarkCell} />

      <div className="flex gap-3">
        <Button onClick={handleClaimLine} variant="secondary" className="flex-1" size="lg">
          Linia!
        </Button>
        <Button onClick={handleClaimBingo} variant="gold" className="flex-1" size="lg">
          BINGO!
        </Button>
      </div>
    </div>
  );
};
