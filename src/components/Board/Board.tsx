'use client';

import { BOARD_CELLS } from '@/lib/game/board-data';
import { BoardCell } from '@/lib/types';

// ============================================================
// BOARD COMPONENT - 40 Petak MonopoliWNI
// ============================================================

interface BoardProps {
  players: Array<{
    id: string;
    position: number;
    tokenColor: string;
    name: string;
  }>;
  onCellClick?: (cell: BoardCell) => void;
}

export default function Board({ players, onCellClick }: BoardProps) {
  const getPlayersOnCell = (cellIndex: number) => {
    return players.filter((p) => p.position === cellIndex);
  };

  return (
    <div className="relative w-full max-w-[800px] mx-auto">
      {/* Board Grid */}
      <div className="grid grid-cols-11 grid-rows-11 gap-1">
        {/* Row 0: Bottom side (cells 0-10, reversed) */}
        {Array.from({ length: 11 }, (_, i) => {
          const cellIndex = i === 0 ? 0 : 10 - i + 1;
          const cell = BOARD_CELLS[cellIndex];
          const cellPlayers = getPlayersOnCell(cellIndex);

          return (
            <div
              key={`cell-${cellIndex}`}
              className={`relative aspect-square flex flex-col items-center justify-center p-1 text-xs font-bold cursor-pointer hover:brightness-110 transition-all rounded ${
                cell.type === 'corner'
                  ? 'col-span-1 row-span-1'
                  : ''
              }`}
              style={{ backgroundColor: cell.color }}
              onClick={() => onCellClick?.(cell)}
            >
              <span className="text-white text-[8px] md:text-[10px] text-center leading-tight">
                {cell.name}
              </span>
              {cell.price && (
                <span className="text-yellow-300 text-[7px] md:text-[9px]">
                  Rp{(cell.price / 1000).toFixed(0)}rb
                </span>
              )}

              {/* Players on this cell */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                {cellPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-md animate-pulse"
                    style={{ backgroundColor: player.tokenColor }}
                    title={player.name}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Row 1-9: Left and Right columns with empty middle */}
        {Array.from({ length: 9 }, (_, rowIndex) => {
          const leftCellIndex = 39 - rowIndex;
          const rightCellIndex = 11 + rowIndex;
          const leftCell = BOARD_CELLS[leftCellIndex];
          const rightCell = BOARD_CELLS[rightCellIndex];
          const leftPlayers = getPlayersOnCell(leftCellIndex);
          const rightPlayers = getPlayersOnCell(rightCellIndex);

          return (
            <div key={`row-${rowIndex}`} className="contents">
              {/* Left cell */}
              <div
                className="relative aspect-square flex flex-col items-center justify-center p-1 text-xs font-bold cursor-pointer hover:brightness-110 transition-all rounded"
                style={{ backgroundColor: leftCell.color }}
                onClick={() => onCellClick?.(leftCell)}
              >
                <span className="text-white text-[8px] md:text-[10px] text-center leading-tight">
                  {leftCell.name}
                </span>
                {leftCell.price && (
                  <span className="text-yellow-300 text-[7px] md:text-[9px]">
                    Rp{(leftCell.price / 1000).toFixed(0)}rb
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                  {leftPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-md animate-pulse"
                      style={{ backgroundColor: player.tokenColor }}
                      title={player.name}
                    />
                  ))}
                </div>
              </div>

              {/* Middle empty space */}
              <div className="col-span-9 row-span-1 bg-green-800 rounded flex items-center justify-center">
                {rowIndex === 4 && (
                  <div className="text-center text-white">
                    <div className="text-xl md:text-3xl font-bold">MONOPOLI</div>
                    <div className="text-sm md:text-lg">WNI</div>
                  </div>
                )}
              </div>

              {/* Right cell */}
              <div
                className="relative aspect-square flex flex-col items-center justify-center p-1 text-xs font-bold cursor-pointer hover:brightness-110 transition-all rounded"
                style={{ backgroundColor: rightCell.color }}
                onClick={() => onCellClick?.(rightCell)}
              >
                <span className="text-white text-[8px] md:text-[10px] text-center leading-tight">
                  {rightCell.name}
                </span>
                {rightCell.price && (
                  <span className="text-yellow-300 text-[7px] md:text-[9px]">
                    Rp{(rightCell.price / 1000).toFixed(0)}rb
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                  {rightPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-md animate-pulse"
                      style={{ backgroundColor: player.tokenColor }}
                      title={player.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Row 10: Top side (cells 20-30) */}
        {Array.from({ length: 11 }, (_, i) => {
          const cellIndex = i === 0 ? 20 : 20 + i;
          const cell = BOARD_CELLS[cellIndex];
          const cellPlayers = getPlayersOnCell(cellIndex);

          return (
            <div
              key={`cell-${cellIndex}`}
              className={`relative aspect-square flex flex-col items-center justify-center p-1 text-xs font-bold cursor-pointer hover:brightness-110 transition-all rounded ${
                cell.type === 'corner'
                  ? 'col-span-1 row-span-1'
                  : ''
              }`}
              style={{ backgroundColor: cell.color }}
              onClick={() => onCellClick?.(cell)}
            >
              <span className="text-white text-[8px] md:text-[10px] text-center leading-tight">
                {cell.name}
              </span>
              {cell.price && (
                <span className="text-yellow-300 text-[7px] md:text-[9px]">
                  Rp{(cell.price / 1000).toFixed(0)}rb
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
                {cellPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-md animate-pulse"
                    style={{ backgroundColor: player.tokenColor }}
                    title={player.name}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
