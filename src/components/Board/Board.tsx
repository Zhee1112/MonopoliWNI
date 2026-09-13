'use client';

import { BOARD_CELLS } from '@/lib/game/board-data';
import { BoardCell, Player } from '@/lib/types';

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
        <div key={p.id} className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-black" style={{ backgroundColor: p.tokenColor }} title={p.name} />
      ))}
    </div>
  );
}

const CELL_BASE = 'relative flex flex-col overflow-hidden bg-[#052011] hover:bg-[#152f1f] border border-[#203a29] rounded-lg transition-colors cursor-pointer min-w-0 min-h-0';

function CornerCell({ cell, cellPlayers, onCellClick }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void }) {
  const idx = cell.index;
  const isStart = idx === 0;
  const isParkir = idx === 20;
  const isRazia = idx === 30;
  const isRutan = idx === 10;

  return (
    <div
      className={`${GRID_POS[idx]} ${CELL_BASE} ${isStart ? 'border-2 border-[#ffd56d]/60' : isRazia ? 'bg-[#2b1013] border border-[#ff6b6b]/50' : ''} items-center text-center p-0.5 sm:p-1 justify-between`}
      onClick={() => onCellClick?.(cell)}
    >
      <span className="text-base sm:text-xl leading-none">{cell.emoji}</span>
      <span className="font-bold text-[9px] sm:text-[10px] leading-tight block truncate w-full px-0.5" style={{ color: isRazia ? '#fca5a5' : isStart ? '#ffd56d' : '#cbead1' }}>{cell.name}</span>
      {isStart && <span className="text-[8px] font-mono font-bold text-[#4edea3] bg-black px-1 rounded leading-tight">+Rp200k</span>}
      {isRazia && <span className="text-[7px] font-mono text-red-300 bg-black px-1 rounded leading-tight">BUI</span>}
      {isRutan && <span className="text-[7px] font-mono text-amber-300 bg-black px-1 rounded leading-tight">Doni</span>}
      {isParkir && <span className="text-[7px] font-mono text-[#4edea3] bg-black px-1 rounded leading-tight">FREE</span>}
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
      className={`${GRID_POS[cell.index]} ${CELL_BASE} text-center p-0.5 sm:p-1 justify-between`}
      onClick={() => onCellClick?.(cell)}
    >
      {isProperty && !isTax && <div className="h-1.5 sm:h-2 rounded-t-sm w-full shrink-0" style={{ backgroundColor: cell.groupColor }} />}
      {isTax && <span className="text-[7px] font-bold text-[#fca5a5] shrink-0 leading-none">TILANG</span>}
      {isDraw && <span className="text-[7px] font-bold text-[#ffcec9] uppercase shrink-0 leading-none">?</span>}

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-[#ffd56d] leading-none">{cell.emoji}</span>}
        <span className="text-[9px] sm:text-[10px] font-semibold text-[#cbead1] leading-tight truncate w-full px-0.5">{cell.name}</span>
      </div>

      <div className="shrink-0">
        {cell.price ? (
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#ffd56d] leading-none">Rp{(cell.price / 1000).toFixed(0)}k</span>
        ) : isTax ? (
          <span className="text-[7px] font-mono font-bold text-[#fca5a5] leading-none">-150k</span>
        ) : isDraw ? (
          <span className="text-[7px] text-[#9a907c] leading-none">ACAK</span>
        ) : null}
      </div>

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
      className={`${GRID_POS[cell.index]} ${CELL_BASE} text-center p-0.5 sm:p-1 justify-between`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="shrink-0">
        {cell.price ? (
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#ffd56d] leading-none">Rp{(cell.price / 1000).toFixed(0)}k</span>
        ) : isTax ? (
          <span className="text-[7px] font-mono font-bold text-[#fca5a5] leading-none">-50k</span>
        ) : isDraw ? (
          <span className="text-[7px] text-[#9a907c] leading-none">ACAK</span>
        ) : null}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-[#ffd56d] leading-none">{cell.emoji}</span>}
        <span className="text-[9px] sm:text-[10px] font-semibold text-[#cbead1] leading-tight truncate w-full px-0.5">{cell.name}</span>
      </div>

      {isProperty && !isTax && <div className="h-1.5 sm:h-2 rounded-b-sm w-full shrink-0" style={{ backgroundColor: cell.groupColor }} />}
      {isDraw && <span className="text-[7px] font-bold text-[#ffcec9] uppercase shrink-0 leading-none">?</span>}
      {isTax && <span className="text-[7px] font-bold text-[#fca5a5] shrink-0 leading-none">RETRIBUSI</span>}

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
      className={`${GRID_POS[cell.index]} ${CELL_BASE} text-left p-0.5 sm:p-1 justify-between`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center gap-0.5 min-w-0">
        {isProperty && !isTax && <div className="w-1 sm:w-1.5 h-3 rounded-sm shrink-0" style={{ backgroundColor: cell.groupColor }} />}
        {(isDraw || isTax) && <span className="text-[10px] shrink-0 leading-none">{cell.emoji}</span>}
        <span className="text-[9px] sm:text-[10px] font-semibold text-[#cbead1] leading-tight truncate">{cell.name}</span>
      </div>
      <div className="shrink-0">
        {cell.price ? (
          <span className="text-[8px] font-mono font-bold text-[#ffd56d] leading-none">Rp{(cell.price / 1000).toFixed(0)}k</span>
        ) : isDraw ? (
          <span className="text-[7px] text-[#d1c5af] leading-none">Kartu</span>
        ) : null}
      </div>
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
      className={`${GRID_POS[cell.index]} ${CELL_BASE} text-right p-0.5 sm:p-1 justify-between`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center justify-end gap-0.5 min-w-0">
        <span className="text-[9px] sm:text-[10px] font-semibold text-[#cbead1] leading-tight truncate">{cell.name}</span>
        {isProperty && !isTax && <div className="w-1 sm:w-1.5 h-3 rounded-sm shrink-0" style={{ backgroundColor: cell.groupColor }} />}
        {(isDraw || isTax) && <span className="text-[10px] shrink-0 leading-none">{cell.emoji}</span>}
      </div>
      <div className="shrink-0">
        {cell.price ? (
          <span className="text-[8px] font-mono font-bold text-[#ffd56d] leading-none">Rp{(cell.price / 1000).toFixed(0)}k</span>
        ) : isTax ? (
          <span className="text-[7px] font-mono font-bold text-[#fca5a5] leading-none">-200k</span>
        ) : isDraw ? (
          <span className="text-[7px] text-[#d1c5af] leading-none">Kartu</span>
        ) : null}
      </div>
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
    <div className="w-full max-w-[1400px] aspect-square max-h-[calc(100vh-140px)] min-h-[500px] p-1.5 sm:p-2 rounded-2xl bg-[#001206] border-2 border-[#203a29] shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(21,47,31,0.3) 0%, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />

      <div className="relative z-10 w-full h-full grid grid-cols-11 grid-rows-11 gap-0.5 sm:gap-1">
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

        {/* Center overlay */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-[#092515]/90 border border-[#203a29]/60 rounded-xl flex flex-col items-center text-center shadow-inner relative overflow-hidden backdrop-blur-sm p-3 sm:p-5 lg:p-6 justify-between">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,213,109,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(78,222,163,0.04) 0%, transparent 70%)' }} />

          {/* Top: round + jackpot - compact single line */}
          <div className="w-full flex items-center justify-between shrink-0">
            <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold flex items-center gap-1" style={{ backgroundColor: '#152f1f', color: '#ffd56d' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
              BABAK {round}/{totalRounds}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1" style={{ backgroundColor: '#152f1f', color: '#ffd56d' }}>
              &#x1F4B0; Rp {potMoney.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Center: MONOPOLI WNI title - main focal point */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold tracking-tight leading-none text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              MONOPOLI
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold tracking-tight leading-none bg-gradient-to-r from-[#ffd56d] via-[#ffdf97] to-[#e5b842] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,213,109,0.4)]">
              WNI
            </h1>
            <p className="text-[10px] sm:text-xs text-[#d1c5af] mt-2 tracking-wide">Versi Indonesia yang kekinian &amp; penuh intrik</p>
          </div>

          {/* Bottom: active player info - compact */}
          <div className="w-full flex items-center justify-between shrink-0 rounded-lg p-1.5 sm:p-2 text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #203a29' }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center shadow shrink-0" style={{ backgroundColor: activePlayerTokenColor || '#3b82f6' }}>
                {activePlayerName ? activePlayerName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="text-left min-w-0">
                <span className="font-bold text-[#cbead1] text-[10px] sm:text-xs block truncate">{activePlayerName || 'Menunggu...'}</span>
                <span className="text-[9px] text-[#4edea3] leading-none">Giliran aktif</span>
              </div>
            </div>
            <span className="font-mono font-bold text-[#ffd56d] text-[10px] sm:text-xs shrink-0">
              Rp {(currentPlayer?.cleanMoney || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
