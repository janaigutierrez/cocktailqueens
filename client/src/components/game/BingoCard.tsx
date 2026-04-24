import type { BingoCell, Song } from '../../types';

interface BingoCardProps {
  cells: BingoCell[];
  onMarkCell: (index: number) => void;
}

export const BingoCard = ({ cells, onMarkCell }: BingoCardProps) => {
  // Build lookup: "row-col" -> { cell, index }
  const cellMap = new Map<string, { cell: BingoCell; index: number }>();
  cells.forEach((cell, i) => {
    cellMap.set(`${cell.row}-${cell.col}`, { cell, index: i });
  });

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
    <div className="space-y-1">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-9 gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((col) => {
            const entry = cellMap.get(`${row}-${col}`);
            if (!entry) {
              // Empty cell
              return (
                <div
                  key={col}
                  className="aspect-[3/4] rounded-lg bg-gray-100/50 border border-gray-200"
                />
              );
            }
            // Filled cell
            return (
              <button
                key={col}
                onClick={() => !entry.cell.markedByTeam && !entry.cell.validatedByAdmin && onMarkCell(entry.index)}
                className={`aspect-[3/4] rounded-lg text-[7px] sm:text-[9px] font-semibold p-0.5 flex items-center justify-center border-2 transition-all duration-200 leading-tight ${getCellStyles(entry.cell)}`}
              >
                {getSongTitle(entry.cell)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
