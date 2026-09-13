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
        <div key={p.id} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black" style={{ backgroundColor: p.tokenColor }} title={p.name} />
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

  return (
    <div
      className={`${GRID_POS[idx]} relative flex flex-col justify-between items-center text-center rounded-lg p-1 sm:p-1.5 cursor-pointer hover:brightness-110 transition-all shadow-md overflow-hidden
        ${isStart ? 'bg-[#152f1f] border-2 border-[#ffd56d]/60' : isRazia ? 'bg-[#2b1013] border border-[#ff6b6b]/50' : 'bg-[#152f1f] border border-[#203a29]'}`}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-base sm:text-xl">{cell.emoji}</span>
      </div>
      <div>
        <span className="font-bold text-[10px] sm:text-xs leading-tight block" style={{ color: isRazia ? '#fca5a5' : isStart ? '#ffd56d' : '#cbead1' }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-[#9a907c] leading-none hidden md:block">{cell.subtitle}</span>
      </div>
      {isStart && <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#4edea3] bg-black py-0.5 px-1 rounded">+Rp 200k</span>}
      {isRazia && <span className="text-[8px] font-mono text-red-300 bg-black py-0.5 px-1 rounded">LANGSUNG BUI</span>}
      {isRutan && (
        <div className="flex items-center justify-center gap-1 bg-black py-0.5 px-1 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[8px] font-mono text-amber-300">Doni</span>
        </div>
      )}
      {isParkir && <span className="text-[8px] font-mono text-[#4edea3] bg-black py-0.5 px-1 rounded">GRATIS</span>}
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
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden bg-[#052011] hover:bg-[#152f1f] border border-[#203a29] rounded-lg p-1 text-center transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full" style={{ backgroundColor: cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-[#fca5a5]">TILANG</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-[#ffd56d] block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#cbead1] block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-[#d1c5af] hidden sm:block">{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#ffd56d]">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5]">-Rp 150k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c]">ACAK</span>
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
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden bg-[#052011] hover:bg-[#152f1f] border border-[#203a29] rounded-lg p-1 text-center transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#ffd56d]">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5]">-Rp 50k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c]">ACAK</span>
      ) : null}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-[#ffd56d] block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#cbead1] block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-[#d1c5af] hidden sm:block">{cell.subtitle}</span>
      </div>

      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-b-sm w-full" style={{ backgroundColor: cell.groupColor }} />}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase">TAKDIR</span>}
      {isTax && <span className="text-[8px] font-bold text-[#fca5a5]">RETRIBUSI</span>}

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
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden bg-[#052011] hover:bg-[#152f1f] border border-[#203a29] rounded-lg p-1 text-center transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full shrink-0" style={{ backgroundColor: cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-[#fca5a5] shrink-0">{cell.emoji}</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase shrink-0">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-[#ffd56d] block">{cell.emoji}</span>}
        {isTax && <span className="text-sm sm:text-base block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#cbead1] block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-[#d1c5af] hidden sm:block">{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#ffd56d] shrink-0">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5] shrink-0">-Rp 200k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c] shrink-0">Ambil Kartu</span>
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
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden bg-[#052011] hover:bg-[#152f1f] border border-[#203a29] rounded-lg p-1 text-center transition-colors cursor-pointer`}
      onClick={() => onCellClick?.(cell)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full shrink-0" style={{ backgroundColor: cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-[#fca5a5] shrink-0">{cell.emoji}</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase shrink-0">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black text-[#ffd56d] block">{cell.emoji}</span>}
        {isTax && <span className="text-sm sm:text-base block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#cbead1] block leading-tight truncate">{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] text-[#d1c5af] hidden sm:block">{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#ffd56d] shrink-0">Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5] shrink-0">-Rp 150k</span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c] shrink-0">Ambil Kartu</span>
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
    <div className="w-full max-w-[1400px] min-h-[600px] p-2 sm:p-3 rounded-2xl bg-[#001206] border-2 border-[#203a29] shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(21,47,31,0.3) 0%, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />

      <div className="relative z-10 w-full h-full grid grid-cols-11 gap-0.5 sm:gap-1" style={{ gridTemplateRows: '2fr repeat(9, 2fr) 2fr' }}>
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

        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-[#092515]/90 border border-[#203a29]/60 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col justify-between items-center text-center shadow-inner relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full flex items-center justify-between text-xs border-b border-[#203a29] pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#152f1f] text-[#ffd56d] text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
                BABAK {round} / {totalRounds}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#152f1f] px-3 py-1 rounded-lg border border-[#ffd56d]/30 shadow-sm">
              <span className="text-[#ffd56d] text-base">&#x1F4B0;</span>
              <div className="text-right">
                <span className="text-[9px] text-[#d1c5af] uppercase block font-semibold leading-none">KAS JACKPOT PARKIR</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-[#ffd56d]">Rp {potMoney.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="my-auto flex flex-col items-center justify-center max-w-xl px-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#152f1f] border border-[#ffd56d]/30 text-[#ffd56d] mb-2 shadow-sm">
              <span className="text-[10px] font-bold tracking-widest uppercase">&bull; EDISI RESMI &bull; WARGA +62 &bull;</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tighter leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              <span>MONOPOLI</span>
              <span className="bg-gradient-to-r from-[#ffd56d] via-[#ffdf97] to-[#e5b842] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,213,109,0.4)]">WNI</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#ffd56d] font-semibold mt-2 tracking-wide">Versi Indonesia yang kekinian &amp; penuh intrik</p>
            <p className="text-[11px] sm:text-xs text-[#d1c5af] max-w-md mt-1 leading-relaxed">Kocok dadu, kuasai kavling ibukota, hindari razia pajak Satpol PP</p>

            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
              <div className="bg-[#152f1f] hover:bg-[#203a29] border border-[#ff6b6b]/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-full h-1 bg-[#ff6b6b] rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-[#fca5a5] mb-0.5">
                  <span className="text-lg">&#x1F0CF;</span>
                  <span className="font-bold text-xs">TAKDIR NETIZEN</span>
                </div>
                <span className="text-[10px] text-[#d1c5af] block">102 Kartu</span>
              </div>
              <div className="bg-[#152f1f] hover:bg-[#203a29] border border-[#4edea3]/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer">
                <div className="w-full h-1 bg-[#4edea3] rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-[#4edea3] mb-0.5">
                  <span className="text-lg">&#x1F4E6;</span>
                  <span className="font-bold text-xs">DANA BANSOS</span>
                </div>
                <span className="text-[10px] text-[#d1c5af] block">100 Kartu</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between bg-black/80 border border-[#203a29] rounded-xl p-2.5 sm:p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow" style={{ backgroundColor: activePlayerTokenColor || '#3b82f6' }}>
                  {activePlayerName ? activePlayerName.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-black" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#cbead1] text-xs">{activePlayerName || 'Menunggu...'}</span>
                </div>
                <span className="text-[10px] text-[#4edea3]">Sedang memegang giliran dadu</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[9px] text-[#9a907c] block uppercase font-semibold">Kas Dompet</span>
                <span className="font-mono font-bold text-[#ffd56d] text-xs sm:text-sm">Rp {(currentPlayer?.cleanMoney || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
