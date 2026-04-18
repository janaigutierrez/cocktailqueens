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

  grid.forEach((row) => row.sort((a, b) => a.col - b.col));

  const getCellStyles = (cell: BingoCell) => {
    if (cell.validatedByAdmin) return 'bg-gradient-to-br from-green-400 to-green-500 text-white border-green-300 shadow-md shadow-green-200';
    if (cell.markedByTeam) return 'bg-gradient-to-br from-rosa-300 to-lila-300 text-white border-rosa-200 shadow-md shadow-rosa-200 animate-pulse';
    return 'bg-white/90 hover:bg-rosa-50 border-rosa-200 active:scale-95';
  };

  const getSongTitle = (cell: BingoCell) => {
    if (typeof cell.song === 'object' && cell.song !== null) {
      return (cell.song as Song).title;
    }
    return '...';
  };

  return (
    <div className="space-y-1.5">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-5 gap-1.5">
          {row.map((cell) => (
            <button
              key={cell.index}
              onClick={() => !cell.markedByTeam && !cell.validatedByAdmin && onMarkCell(cell.index)}
              className={`aspect-square rounded-xl text-[10px] sm:text-xs font-semibold p-1 flex items-center justify-center border-2 transition-all duration-200 ${getCellStyles(cell)}`}
            >
              {getSongTitle(cell)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
