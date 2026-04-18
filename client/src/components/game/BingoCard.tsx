import type { BingoCell, Song } from '../../types';

interface BingoCardProps {
  cells: BingoCell[];
  onMarkCell: (index: number) => void;
}

export const BingoCard = ({ cells, onMarkCell }: BingoCardProps) => {
  const grid: (BingoCell & { index: number })[][] = [[], [], []];

  cells.forEach((cell, i) => {
    grid[cell.row].push({ ...cell, index: i });
  });

  // Sort each row by column
  grid.forEach((row) => row.sort((a, b) => a.col - b.col));

  const getCellColor = (cell: BingoCell) => {
    if (cell.validatedByAdmin) return 'bg-green-400 text-white';
    if (cell.markedByTeam) return 'bg-pink-300 text-white';
    return 'bg-white hover:bg-pink-50';
  };

  const getSongTitle = (cell: BingoCell) => {
    if (typeof cell.song === 'object' && cell.song !== null) {
      return (cell.song as Song).title;
    }
    return '...';
  };

  return (
    <div className="space-y-1">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-5 gap-1">
          {row.map((cell) => (
            <button
              key={cell.index}
              onClick={() => !cell.markedByTeam && onMarkCell(cell.index)}
              className={`aspect-square rounded-lg text-xs font-medium p-1 flex items-center justify-center border border-pink-200 transition-colors ${getCellColor(cell)}`}
            >
              {getSongTitle(cell)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
