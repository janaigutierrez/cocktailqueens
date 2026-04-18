import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGame } from '../../context/GameContext';
import { BingoCard } from './BingoCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Music, PartyPopper } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-12">
        <PartyPopper className="text-yellow-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-pink-600">
          {winner.type === 'bingo' ? 'BINGO!' : 'LINIA!'}
        </h2>
        <p className="text-lg mt-2">Guanyador: {winner.teamName}</p>
      </div>
    );
  }

  if (cells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Music className="text-pink-400 mb-4 animate-pulse" size={48} />
        <p className="text-gray-600">Esperant el carto de bingo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-pink-600">Bingo Musical</h2>

      {currentSongNumber !== null && (
        <Card className="text-center bg-pink-50">
          <Music className="inline mr-2 text-pink-500" size={20} />
          <span className="font-bold">Canco #{currentSongNumber}</span>
        </Card>
      )}

      <BingoCard cells={cells} onMarkCell={handleMarkCell} />

      <div className="flex gap-3">
        <Button onClick={handleClaimLine} variant="secondary" className="flex-1">
          Linia!
        </Button>
        <Button onClick={handleClaimBingo} className="flex-1">
          BINGO!
        </Button>
      </div>
    </div>
  );
};
