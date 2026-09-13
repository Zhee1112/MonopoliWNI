'use client';

import { BOARD_CELLS, isCornerCell } from '@/lib/game/board-data';
import { BoardCell, Player } from '@/lib/types';

// ============================================================
// BOARD COMPONENT - 11x11 CSS Grid (HTML reference design)
// ============================================================

interface BoardProps {
  players: Array<{
    id: string;
    position: number;
    tokenColor: string;
    name: string;
  }>;
  currentPlayer?: Player;
  activePlayerName?: string;
  activePlayerTokenColor?: string;
  potMoney?: number;
  round?: number;
  totalRounds?: number;
  ownedCells?: Record<number, string>;
  onCellClick?: (cell: BoardCell) => void;
}

function getPlayersOnCell(cellIndex: number, players: BoardProps['players']) {
  return players.filter((p) => p.position === cellIndex);
}

const GRID_POS: Record<number, string> = {
  0: 'col-start-11 row-start-11',
  1: 'col-start-10 row-start-11',
  2: 'col-start-9 row-start-11',
  3: 'col-start-8 row-start-11',
  4: 'col-start-7 row-start-11',
  5: 'col-start-6 row-start-11',
  6: 'col-start-5 row-start-11',
  7: 'col-start-4 row-start-11',
  8: 'col-start-3 row-start-11',
  9: 'col-start-2 row-start-11',
  10: 'col-start-1 row-start-11',
  11: 'col-start-1 row-start-10',
  12: 'col-start-1 row-start-9',
  13: 'col-start-1 row-start-8',
  14: 'col-start-1 row-start-7',
  15: 'col-start-1 row-start-6',
  16: 'col-start-1 row-start-5',
  17: 'col-start-1 row-start-4',
  18: 'col-start-1 row-start-3',
  19: 'col-start-1 row-start-2',
  20: 'col-start-1 row-start-1',
  21: 'col-start-2 row-start-1',
  22: 'col-start-3 row-start-1',
  23: 'col-start-4 row-start-1',
  24: 'col-start-5 row-start-1',
  25: 'col-start-6 row-start-1',
  26: 'col-start-7 row-start-1',
  27: 'col-start-8 row-start-1',
  28: 'col-start-9 row-start-1',
  29: 'col-start-10 row-start-1',
  30: 'col-start-11 row-start-1',
  31: 'col-start-11 row-start-2',
  32: 'col-start-11 row-start-3',
  33: 'col-start-11 row-start-4',
  34: 'col-start-11 row-start-5',
  35: 'col-start-11 row-start-6',
  36: 'col-start-11 row-start-7',
  37: 'col-start-11 row-start-8',
  38: 'col-start-11 row-start-9',
  39: 'col-start-11 row-start-10',
};

function CellTokenDots({ cellPlayers }: { cellPlayers: BoardProps['players'] }) {
  if (cellPlayers.length === 0) return null;
  return (
    <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 z-30">
      {cellPlayers.map((p) => (
        <div key={p.id} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-background" style={{ backgroundColor: p.tokenColor }} title={p.name} />
      ))}
    </div>
  );
}

function CornerCell({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const idx = cell.index;
  const isStart = idx === 0;
  const isParkir = idx === 20;
  const isRazia = idx === 30;
  const isRutan = idx === 10;

  const borderColor = isStart ? 'border-2 border-primary/60' : isRazia ? 'border border-rose-600/50' : isParkir ? 'border border-secondary/40' : 'border border-outline-variant';
  const bgColor = isStart ? 'bg-surface-container-high' : isRazia ? 'bg-[#2b1013]' : 'bg-surface-container-high';

  return (
    <div
      className={`${GRID_POS[idx]} ${bgColor} ${borderColor} rounded-lg p-1 sm:p-1.5 flex flex-col justify-between text-center shadow-md cursor-pointer hover:brightness-110 transition-all`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-base sm:text-xl">{cell.emoji}</span>
        {isParkir && <span className="text-[9px] font-bold text-secondary uppercase hidden sm:inline">PARKIR</span>}
        {isRazia && <span className="text-[9px] font-bold text-rose-400 uppercase hidden sm:inline">RAZIA</span>}
        {isRutan && <span className="text-[9px] font-bold text-on-surface-variant uppercase hidden sm:inline">RUTAN</span>}
        {isStart && <span className="text-[9px] font-bold text-primary uppercase hidden sm:inline">START</span>}
      </div>
      <div>
        <span className="font-bold text-[10px] sm:text-xs leading-tight block" style={{ color: isRazia ? '#fca5a5' : isStart ? '#ffd56d' : '#cbead1' }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-on-surface-variant leading-none hidden md:block">{cell.subtitle}</span>
      </div>
      {isStart && <span className="text-[9px] sm:text-[10px] font-mono font-bold text-secondary bg-background py-0.5 rounded">+Rp 200k</span>}
      {isRazia && <span className="text-[8px] font-mono text-red-300 bg-background py-0.5 rounded">LANGSUNG BUI</span>}
      {isRutan && (
        <div className="flex items-center justify-center gap-1 bg-background py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[8px] font-mono text-amber-300">Doni</span>
        </div>
      )}
      {isParkir && <span className="text-[8px] font-mono text-secondary bg-background py-0.5 rounded">GRATIS</span>}
      <CellTokenDots cellPlayers={cellPlayers} />
    </div>
  );
}

function TopRowCell({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';

  return (
    <div
      className={`${GRID_POS[cell.index]} bg-surface-container-low hover:bg-surface-container-high border border-outline-variant rounded-lg flex flex-col justify-between overflow-hidden p-1 text-center transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full" style={{ backgroundColor: cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-rose-400">TILANG</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-tertiary uppercase">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-primary block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-on-surface-variant hidden sm:block">{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-primary">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-rose-400">-Rp 150k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-outline">ACAK</span>
      ) : null}

      <CellTokenDots cellPlayers={cellPlayers} />
    </div>
  );
}

function BottomRowCell({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';

  return (
    <div
      className={`${GRID_POS[cell.index]} bg-surface-container-low hover:bg-surface-container-high border border-outline-variant rounded-lg flex flex-col justify-between overflow-hidden p-1 text-center transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-primary">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-rose-400">-Rp 50k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-outline">ACAK</span>
      ) : null}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-primary block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-on-surface-variant hidden sm:block">{cell.subtitle}</span>
      </div>

      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-b-sm w-full" style={{ backgroundColor: cell.groupColor }} />}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-tertiary uppercase">TAKDIR</span>}
      {isTax && <span className="text-[8px] font-bold text-rose-400">RETRIBUSI</span>}

      <CellTokenDots cellPlayers={cellPlayers} />
    </div>
  );
}

function LeftColCell({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';

  return (
    <div
      className={`${GRID_POS[cell.index]} bg-surface-container-low hover:bg-surface-container-high border border-outline-variant rounded-lg p-1 sm:p-1.5 flex flex-col justify-between text-left transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center gap-1">
        {isProperty && !isTax && <div className="w-1.5 sm:w-2 h-4 rounded-sm shrink-0" style={{ backgroundColor: cell.groupColor }} />}
        {isDraw && <span className="text-xs">{cell.emoji}</span>}
        {isTax && <span className="text-xs">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface leading-tight truncate">{cell.name}</span>
      </div>
      {cell.price ? (
        <span className="text-[9px] font-mono font-bold text-primary text-right">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-on-surface-variant text-right">Ambil Kartu</span>
      ) : null}
      <CellTokenDots cellPlayers={cellPlayers} />
    </div>
  );
}

function RightColCell({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';

  return (
    <div
      className={`${GRID_POS[cell.index]} bg-surface-container-low hover:bg-surface-container-high border border-outline-variant rounded-lg p-1 sm:p-1.5 flex flex-col justify-between text-right transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center justify-end gap-1">
        <span className="text-[10px] sm:text-[11px] font-semibold text-on-surface leading-tight truncate">{cell.name}</span>
        {isProperty && !isTax && <div className="w-1.5 sm:w-2 h-4 rounded-sm shrink-0" style={{ backgroundColor: cell.groupColor }} />}
        {isDraw && <span className="text-xs font-black text-primary">{cell.emoji}</span>}
      </div>
      {cell.price ? (
        <span className="text-[9px] font-mono font-bold text-primary">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[9px] font-mono font-bold text-rose-400">-Rp 200k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-on-surface-variant">{cell.subtitle}</span>
      ) : null}
      <CellTokenDots cellPlayers={cellPlayers} />
    </div>
  );
}

function getCellPositionType(index: number): 'corner' | 'top' | 'left' | 'right' | 'bottom' {
  if (index === 0 || index === 10 || index === 20 || index === 30) return 'corner';
  if (index >= 21 && index <= 29) return 'top';
  if (index >= 11 && index <= 19) return 'left';
  if (index >= 31 && index <= 39) return 'right';
  if (index >= 1 && index <= 9) return 'bottom';
  return 'corner';
}

export default function Board({ players, currentPlayer, activePlayerName, activePlayerTokenColor, potMoney = 0, round = 1, totalRounds = 4, ownedCells = {}, onCellClick }: BoardProps) {
  return (
    <div className="w-full max-w-[1400px] aspect-square max-h-[calc(100vh-140px)] min-h-[500px] p-2 sm:p-3 rounded-2xl bg-surface-container-lowest border-2 border-outline-variant shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative overflow-hidden">
      <div className="absolute inset-0 bg-radial from-surface-container-high/30 via-transparent to-black/60 pointer-events-none" />

      <div className="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 gap-1 sm:gap-1.5">
        {BOARD_CELLS.map((cell) => {
          const posType = getCellPositionType(cell.index);
          const cellPlayers = getPlayersOnCell(cell.index, players);
          switch (posType) {
            case 'corner':
              return <CornerCell key={cell.index} cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} />;
            case 'top':
              return <TopRowCell key={cell.index} cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} />;
            case 'bottom':
              return <BottomRowCell key={cell.index} cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} />;
            case 'left':
              return <LeftColCell key={cell.index} cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} />;
            case 'right':
              return <RightColCell key={cell.index} cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} />;
            default:
              return null;
          }
        })}

        {/* Center area overlay — spans inner 9x9 */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-surface-container-low/90 border border-outline-variant/60 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col justify-between items-center text-center shadow-inner relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top meta */}
          <div className="w-full flex items-center justify-between text-xs border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-primary text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                BABAK {round} / {totalRounds}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-lg border border-primary/30 shadow-sm">
              <span className="text-primary text-base">💰</span>
              <div className="text-right">
                <span className="text-[9px] text-on-surface-variant uppercase block font-semibold leading-none">KAS JACKPOT PARKIR</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-primary">Rp {potMoney.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="my-auto flex flex-col items-center justify-center max-w-xl px-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-primary/30 text-primary mb-2 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest uppercase">&bull; EDISI RESMI &bull; WARGA +62 &bull;</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <span>MONOPOLI</span>
              <span className="bg-gradient-to-r from-primary via-primary-fixed to-primary-container bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,213,109,0.4)]">WNI</span>
            </h1>
            <p className="text-xs sm:text-sm text-primary font-semibold mt-2 tracking-wide">Versi Indonesia yang kekinian &amp; penuh intrik</p>
            <p className="text-[11px] sm:text-xs text-on-surface-variant max-w-md mt-1 leading-relaxed">Kocok dadu, kuasai kavling ibukota, hindari razia pajak Satpol PP</p>

            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
              <div className="bg-surface-container-high hover:bg-surface-container-highest border border-rose-500/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-full h-1 bg-rose-500 rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-rose-400 mb-0.5">
                  <span className="text-lg">🃏</span>
                  <span className="font-bold text-xs">TAKDIR NETIZEN</span>
                </div>
                <span className="text-[10px] text-on-surface-variant block">102 Kartu</span>
              </div>
              <div className="bg-surface-container-high hover:bg-surface-container-highest border border-secondary/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-full h-1 bg-secondary rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-secondary mb-0.5">
                  <span className="text-lg">📦</span>
                  <span className="font-bold text-xs">DANA BANSOS</span>
                </div>
                <span className="text-[10px] text-on-surface-variant block">100 Kartu</span>
              </div>
            </div>
          </div>

          {/* Bottom turn info */}
          <div className="w-full flex items-center justify-between bg-background-lowest/80 border border-outline-variant rounded-xl p-2.5 sm:p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow" style={{ backgroundColor: activePlayerTokenColor || '#3b82f6' }}>
                  {activePlayerName ? activePlayerName.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-background-lowest" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-on-surface text-xs">{activePlayerName || 'Menunggu...'}</span>
                </div>
                <span className="text-[10px] text-secondary">Sedang memegang giliran dadu</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[9px] text-outline block uppercase font-semibold">Kas Dompet</span>
                <span className="font-mono font-bold text-primary text-xs sm:text-sm">Rp {(currentPlayer?.cleanMoney || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
