'use client';

import { BOARD_CELLS, isCornerCell } from '@/lib/game/board-data';
import { BoardCell } from '@/lib/types';

// ============================================================
// BOARD COMPONENT - 11x11 Grid (Screen 7 Design)
// ============================================================

interface BoardProps {
  players: Array<{
    id: string;
    position: number;
    tokenColor: string;
    name: string;
  }>;
  ownedCells?: Record<number, string>;
  onCellClick?: (cell: BoardCell) => void;
}

function getPlayersOnCell(cellIndex: number, players: BoardProps['players']) {
  return players.filter((p) => p.position === cellIndex);
}

function CellComponent({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const isCorner = isCornerCell(cell.index);
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';
  const isJail = cell.index === 10 || cell.index === 30;

  if (isCorner) {
    return (
      <div
        className="relative bg-surface-container-high border border-outline-variant/40 rounded-lg p-1 sm:p-1.5 flex flex-col justify-between text-center shadow-md cursor-pointer hover:brightness-110 transition-all"
        style={{ backgroundColor: cell.color }}
        onClick={() => onCellClick?.(cell)}
      >
        <div className="flex items-center justify-center gap-1">
          <span className="text-base sm:text-xl">{cell.emoji}</span>
          {cell.index === 0 && <span className="text-[9px] font-bold text-primary uppercase hidden sm:inline">START</span>}
          {cell.index === 20 && <span className="text-[9px] font-bold text-secondary uppercase hidden sm:inline">PARKIR</span>}
          {cell.index === 30 && <span className="text-[9px] font-bold text-red-400 uppercase hidden sm:inline">RAZIA</span>}
          {cell.index === 10 && <span className="text-[9px] font-bold text-on-surface-variant uppercase hidden sm:inline">RUTAN</span>}
        </div>
        <div>
          <span className="font-bold text-[10px] sm:text-xs leading-tight block" style={{ color: cell.index === 30 ? '#fca5a5' : cell.index === 0 ? '#ffd56d' : '#cbead1' }}>{cell.name}</span>
          <span className="text-[8px] sm:text-[9px] text-on-surface-variant leading-none hidden md:block">{cell.subtitle}</span>
        </div>
        {cell.index === 0 && (
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-secondary bg-background py-0.5 rounded">+Rp 200k</span>
        )}
        {cell.index === 30 && (
          <span className="text-[8px] font-mono text-red-300 bg-background py-0.5 rounded">LANGSUNG BUI</span>
        )}
        {cell.index === 10 && (
          <span className="text-[8px] font-mono text-on-surface-variant bg-background py-0.5 rounded">Doni</span>
        )}
        {cellPlayers.length > 0 && (
          <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20">
            {cellPlayers.map((p) => (
              <div key={p.id} className="w-3 h-3 rounded-full border border-background" style={{ backgroundColor: p.tokenColor }} title={p.name} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative bg-surface-container-low hover:bg-surface-container-high border border-outline-variant rounded-lg flex flex-col justify-between overflow-hidden p-1 text-center transition-colors cursor-pointer"
      onClick={() => onCellClick?.(cell)}
    >
      {/* Color bar - top for top row cells, bottom for bottom row cells */}
      {isProperty && <div className="h-2 sm:h-3 rounded-t-sm w-full" style={{ backgroundColor: cell.groupColor }} />}

      {/* Price */}
      <span className={`text-[9px] sm:text-[10px] font-mono font-bold mt-0.5 ${isTax || cell.index === 26 || cell.index === 33 ? 'text-red-400' : isDraw ? 'text-[#ffcec9]' : 'text-primary'}`}>
        {cell.price ? `Rp ${(cell.price / 1000).toFixed(0)}k` : isTax ? `-Rp ${cell.index === 31 ? '200k' : cell.index === 26 ? '150k' : cell.index === 2 ? '50k' : '???'}` : ''}
        {isDraw && <span className="text-sm font-black">{cell.emoji}</span>}
      </span>

      {/* Name & Subtitle */}
      <div className="my-auto py-0.5">
        <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-on-surface-variant hidden sm:block">{cell.subtitle}</span>
      </div>

      {/* Label */}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold uppercase" style={{ color: cell.groupColor }}>{cell.subtitle}</span>}
      {isTax && <span className="text-[8px] font-bold text-rose-400">RETRIBUSI</span>}
      {cell.index === 13 && <span className="text-[9px] font-mono font-bold text-secondary text-right">{cell.subtitle}</span>}
      {cell.index === 28 && <span className="text-[8px] font-bold text-secondary">{cell.subtitle}</span>}

      {/* Color bar - bottom for side cells */}
      {isProperty && !isTax && (
        <div className="h-2 sm:h-3 rounded-b-sm w-full" style={{ backgroundColor: cell.groupColor }} />
      )}

      {/* Player pawns */}
      {cellPlayers.length > 0 && (
        <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-20">
          {cellPlayers.map((p) => (
            <div key={p.id} className="w-3 h-3 rounded-full border border-background" style={{ backgroundColor: p.tokenColor }} title={p.name} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Board({ players, ownedCells = {}, onCellClick }: BoardProps) {
  // Build grid: rows 1-11, cols 1-11
  const grid: (BoardCell | null)[][] = Array.from({ length: 11 }, () => Array(11).fill(null));

  // Bottom row (Row 11 / index 10): Cells 0-10, right to left (Col 11 to Col 1)
  for (let i = 0; i <= 10; i++) {
    grid[10][10 - i] = BOARD_CELLS[i];
  }
  // Left column (Col 1 / index 0): Cells 11-19, bottom to top (Row 10 to Row 2)
  for (let i = 11; i <= 19; i++) {
    grid[10 - (i - 11)][0] = BOARD_CELLS[i];
  }
  // Top row (Row 1 / index 0): Cells 20-30, left to right (Col 1 to Col 11)
  for (let i = 20; i <= 30; i++) {
    grid[0][i - 20] = BOARD_CELLS[i];
  }
  // Right column (Col 11 / index 10): Cells 31-39, top to bottom (Row 2 to Row 10)
  for (let i = 31; i <= 39; i++) {
    grid[(i - 31) + 1][10] = BOARD_CELLS[i];
  }

  return (
    <div className="relative w-full max-w-[1400px] aspect-square max-h-[calc(100vh-140px)] min-h-[500px] p-2 sm:p-3 rounded-2xl bg-background-lowest border-2 border-outline-variant shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative flex flex-col justify-between overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(21,47,31,0.3) 0%, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />

      {/* 11x11 Grid */}
      <div className="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 gap-1 sm:gap-1.5">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (!cell) {
              // Center area (rows 2-10, cols 2-10)
              if (rowIndex >= 1 && rowIndex <= 9 && colIndex >= 1 && colIndex <= 9) {
                return (
                  <div
                    key={`center-${rowIndex}-${colIndex}`}
                    className="col-span-1 row-span-1"
                    style={{
                      gridColumn: colIndex + 1,
                      gridRow: rowIndex + 1,
                    }}
                  />
                );
              }
              return <div key={`empty-${rowIndex}-${colIndex}`} />;
            }

            const cellPlayers = getPlayersOnCell(cell.index, players);
            const gridCol = colIndex + 1;
            const gridRow = rowIndex + 1;

            // Center area spans cols 2-10, rows 2-10
            const isCenterStart = rowIndex === 1 && colIndex === 1;

            return (
              <div
                key={`cell-${cell.index}`}
                style={{ gridColumn: gridCol, gridRow: gridRow }}
              >
                <CellComponent cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} />
              </div>
            );
          })
        )}

        {/* Center area overlay */}
        <div
          className="bg-surface-container-low/90 border border-outline-variant/60 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col justify-between items-center text-center shadow-inner relative overflow-hidden backdrop-blur-sm"
          style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}
        >
          {/* Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top meta */}
          <div className="w-full flex items-center justify-between text-xs border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-surface-container text-primary text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                BABAK 1 / 4
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-lg border border-primary/30 shadow-sm">
              <span className="material-symbols-outlined text-primary text-base">payments</span>
              <div className="text-right">
                <span className="text-[9px] text-on-surface-variant uppercase block font-semibold leading-none">KAS JACKPOT PARKIR</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-primary">Rp 1.450.000</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="my-auto flex flex-col items-center justify-center max-w-xl px-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary/30 text-primary mb-2 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest uppercase">&bull; EDISI RESMI &bull; WARGA +62 &bull;</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <span>MONOPOLI</span>
              <span className="bg-gradient-to-r from-primary via-primary-fixed to-primary-container bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,213,109,0.4)]">WNI</span>
            </h1>
            <p className="text-xs sm:text-sm text-primary font-semibold mt-2 tracking-wide">Versi Indonesia yang kekinian &amp; penuh intrik</p>
            <p className="text-[11px] sm:text-xs text-on-surface-variant max-w-md mt-1 leading-relaxed">Kocok dadu, kuasai kavling ibukota, hindari razia pajak Satpol PP</p>

            {/* Card Decks */}
            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
              <div className="bg-surface-container hover:bg-surface-container-high border border-rose-500/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-full h-1 bg-rose-500 rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
                  <span className="material-symbols-outlined text-lg">contact_support</span>
                  <span className="font-bold text-xs">TAKDIR NETIZEN</span>
                </div>
                <span className="text-[10px] text-on-surface-variant block">32 Kartu Sisa</span>
              </div>
              <div className="bg-surface-container hover:bg-surface-container-high border border-secondary/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-full h-1 bg-secondary rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-secondary mb-0.5">
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                  <span className="font-bold text-xs">DANA BANSOS</span>
                </div>
                <span className="text-[10px] text-on-surface-variant block">28 Kartu Sisa</span>
              </div>
            </div>
          </div>

          {/* Bottom turn info */}
          <div className="w-full flex items-center justify-between bg-background-lowest/80 border border-outline-variant rounded-xl p-2.5 sm:p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow">🎩</div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-background" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-on-surface text-xs">Giliran Anda</span>
                  <span className="px-1.5 py-0.2 bg-primary/20 text-primary text-[9px] rounded font-mono font-bold">HOST</span>
                </div>
                <span className="text-[10px] text-secondary">Sedang memegang giliran dadu</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[9px] text-outline block uppercase font-semibold">Kas Dompet</span>
                <span className="font-mono font-bold text-primary text-xs sm:text-sm">Rp 1.700.000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
