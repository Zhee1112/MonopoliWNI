'use client';

import { BOARD_CELLS } from '@/lib/game/board-data';
import { BoardTheme, BoardThemeId, BOARD_THEMES } from '@/lib/game/board-themes';
import { BoardCell, Player } from '@/lib/types';

interface PropertyInfo {
  boardIndex: number;
  ownerId: string | null;
  ownerName: string | null;
  ownerColor: string | null;
  houseLevel: number;
  isLandmark: boolean;
}

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
  propertyInfo?: PropertyInfo[];
  onCellClick?: (cell: BoardCell) => void;
  boardTheme?: BoardThemeId;
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

const PION_SHAPES = ['●', '▲', '■', '◆', '★', '⬟', '◈', '◉'];

function CellTokenDots({ cellPlayers }: { cellPlayers: BoardProps['players'] }) {
  if (cellPlayers.length === 0) return null;
  return (
    <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 z-30">
      {cellPlayers.map((p, i) => {
        const pionIdx = i % PION_SHAPES.length;
        return (
          <div
            key={p.id}
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm flex items-center justify-center text-[7px] sm:text-[8px] font-black leading-none border border-black/60 shadow-md"
            style={{ backgroundColor: p.tokenColor, color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.8)' }}
            title={p.name}
          >
            {PION_SHAPES[pionIdx]}
          </div>
        );
      })}
    </div>
  );
}

function CornerCell({ cell, cellPlayers, onCellClick, theme }: { cell: BoardCell; cellPlayers: BoardProps['players']; onCellClick?: (cell: BoardCell) => void; theme: BoardTheme }) {
  const idx = cell.index;
  const isStart = idx === 0;
  const isParkir = idx === 20;
  const isRazia = idx === 30;
  const isRutan = idx === 10;

  const cellStyle = isStart
    ? { backgroundColor: theme.startBg, borderColor: theme.startBorder, borderWidth: '2px' }
    : isRazia
    ? { backgroundColor: theme.jailBg, borderColor: theme.jailBorder }
    : { backgroundColor: theme.freeParkingBg, borderColor: theme.freeParkingBorder };

  return (
    <div
      className={`${GRID_POS[idx]} relative flex flex-col justify-between items-center text-center rounded-lg p-1 sm:p-1.5 cursor-pointer hover:brightness-110 transition-all shadow-md overflow-hidden border`}
      style={cellStyle}
      onClick={() => onCellClick?.(cell)}
    >
      <div className="flex items-center justify-center gap-1">
        <span className="text-base sm:text-xl">{cell.emoji}</span>
      </div>
      <div>
        <span className="font-bold text-[10px] sm:text-xs leading-tight block" style={{ color: isRazia ? '#fca5a5' : isStart ? theme.startText : theme.nameText }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] leading-none hidden md:block" style={{ color: theme.subtitleText }}>{cell.subtitle}</span>
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

function TopRowCell({ cell, cellPlayers, propertyInfo, onCellClick, theme }: { cell: BoardCell; cellPlayers: BoardProps['players']; propertyInfo?: PropertyInfo[]; onCellClick?: (cell: BoardCell) => void; theme: BoardTheme }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';
  const propInfo = propertyInfo?.find(p => p.boardIndex === cell.index);
  const ownerColor = propInfo?.ownerId ? (propInfo.ownerColor || '#666') : null;

  return (
    <div
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden rounded-lg p-1 text-center transition-colors cursor-pointer border`}
      style={{ backgroundColor: theme.cellBg, borderColor: theme.cellBorder, ...(ownerColor ? { borderTop: `3px solid ${ownerColor}` } : {}) }}
      onClick={() => onCellClick?.(cell)}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.cellHoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.cellBg)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full" style={{ backgroundColor: theme.groupColors?.[cell.groupColor] || cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-[#fca5a5]">TILANG</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black block" style={{ color: theme.priceText }}>{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold block leading-tight truncate" style={{ color: theme.nameText }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] hidden sm:block" style={{ color: theme.subtitleText }}>{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold" style={{ color: theme.priceText }}>Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5]">
          {cell.taxAmount ? `-Rp ${(cell.taxAmount / 1000).toFixed(0)}k` : 'PPN 12%'}
        </span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c]">ACAK</span>
      ) : null}

      <CellTokenDots cellPlayers={cellPlayers} />
      <PropertyBadge cellIndex={cell.index} propertyInfo={propertyInfo} />
    </div>
  );
}

function BottomRowCell({ cell, cellPlayers, propertyInfo, onCellClick, theme }: { cell: BoardCell; cellPlayers: BoardProps['players']; propertyInfo?: PropertyInfo[]; onCellClick?: (cell: BoardCell) => void; theme: BoardTheme }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';
  const propInfo = propertyInfo?.find(p => p.boardIndex === cell.index);
  const ownerColor = propInfo?.ownerId ? (propInfo.ownerColor || '#666') : null;

  return (
    <div
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden rounded-lg p-1 text-center transition-colors cursor-pointer border`}
      style={{ backgroundColor: theme.cellBg, borderColor: theme.cellBorder, ...(ownerColor ? { borderBottom: `3px solid ${ownerColor}` } : {}) }}
      onClick={() => onCellClick?.(cell)}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.cellHoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.cellBg)}
    >
      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold" style={{ color: theme.priceText }}>Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5]">
          {cell.taxAmount ? `-Rp ${(cell.taxAmount / 1000).toFixed(0)}k` : 'PPN 12%'}
        </span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c]">ACAK</span>
      ) : null}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black block" style={{ color: theme.priceText }}>{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold block leading-tight truncate" style={{ color: theme.nameText }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] hidden sm:block" style={{ color: theme.subtitleText }}>{cell.subtitle}</span>
      </div>

      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-b-sm w-full" style={{ backgroundColor: theme.groupColors?.[cell.groupColor] || cell.groupColor }} />}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase">TAKDIR</span>}
      {isTax && <span className="text-[8px] font-bold text-[#fca5a5]">RETRIBUSI</span>}

      <CellTokenDots cellPlayers={cellPlayers} />
      <PropertyBadge cellIndex={cell.index} propertyInfo={propertyInfo} />
    </div>
  );
}

function LeftColCell({ cell, cellPlayers, propertyInfo, onCellClick, theme }: { cell: BoardCell; cellPlayers: BoardProps['players']; propertyInfo?: PropertyInfo[]; onCellClick?: (cell: BoardCell) => void; theme: BoardTheme }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';
  const propInfo = propertyInfo?.find(p => p.boardIndex === cell.index);
  const ownerColor = propInfo?.ownerId ? (propInfo.ownerColor || '#666') : null;

  return (
    <div
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden rounded-lg p-1 text-center transition-colors cursor-pointer border`}
      style={{ backgroundColor: theme.cellBg, borderColor: theme.cellBorder, ...(ownerColor ? { borderLeft: `3px solid ${ownerColor}` } : {}) }}
      onClick={() => onCellClick?.(cell)}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.cellHoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.cellBg)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full shrink-0" style={{ backgroundColor: theme.groupColors?.[cell.groupColor] || cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-[#fca5a5] shrink-0">{cell.emoji}</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase shrink-0">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black block" style={{ color: theme.priceText }}>{cell.emoji}</span>}
        {isTax && <span className="text-sm sm:text-base block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold block leading-tight truncate" style={{ color: theme.nameText }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] hidden sm:block" style={{ color: theme.subtitleText }}>{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold shrink-0" style={{ color: theme.priceText }}>Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5] shrink-0">
          {cell.taxAmount ? `-Rp ${(cell.taxAmount / 1000).toFixed(0)}k` : 'PPN 12%'}
        </span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c] shrink-0">Ambil Kartu</span>
      ) : null}

      <CellTokenDots cellPlayers={cellPlayers} />
      <PropertyBadge cellIndex={cell.index} propertyInfo={propertyInfo} />
    </div>
  );
}

function RightColCell({ cell, cellPlayers, propertyInfo, onCellClick, theme }: { cell: BoardCell; cellPlayers: BoardProps['players']; propertyInfo?: PropertyInfo[]; onCellClick?: (cell: BoardCell) => void; theme: BoardTheme }) {
  const isProperty = cell.type === 'property';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';
  const propInfo = propertyInfo?.find(p => p.boardIndex === cell.index);
  const ownerColor = propInfo?.ownerId ? (propInfo.ownerColor || '#666') : null;

  return (
    <div
      className={`${GRID_POS[cell.index]} relative flex flex-col justify-between overflow-hidden rounded-lg p-1 text-center transition-colors cursor-pointer border`}
      style={{ backgroundColor: theme.cellBg, borderColor: theme.cellBorder, ...(ownerColor ? { borderRight: `3px solid ${ownerColor}` } : {}) }}
      onClick={() => onCellClick?.(cell)}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.cellHoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.cellBg)}
    >
      {isProperty && !isTax && <div className="h-2 sm:h-3 rounded-t-sm w-full shrink-0" style={{ backgroundColor: theme.groupColors?.[cell.groupColor] || cell.groupColor }} />}
      {isTax && <span className="text-[8px] sm:text-[9px] font-bold text-[#fca5a5] shrink-0">{cell.emoji}</span>}
      {isDraw && <span className="text-[8px] sm:text-[9px] font-bold text-[#ffcec9] uppercase shrink-0">TAKDIR</span>}

      <div className="my-auto py-0.5">
        {isDraw && <span className="text-sm sm:text-base font-black block" style={{ color: theme.priceText }}>{cell.emoji}</span>}
        {isTax && <span className="text-sm sm:text-base block">{cell.emoji}</span>}
        <span className="text-[10px] sm:text-[11px] font-semibold block leading-tight truncate" style={{ color: theme.nameText }}>{cell.name}</span>
        <span className="text-[8px] sm:text-[9px] hidden sm:block" style={{ color: theme.subtitleText }}>{cell.subtitle}</span>
      </div>

      {cell.price ? (
        <span className="text-[9px] sm:text-[10px] font-mono font-bold shrink-0" style={{ color: theme.priceText }}>Rp {(cell.price / 1000).toFixed(0)}k</span>
      ) : isTax ? (
        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#fca5a5] shrink-0">
          {cell.taxAmount ? `-Rp ${(cell.taxAmount / 1000).toFixed(0)}k` : 'PPN 12%'}
        </span>
      ) : isDraw ? (
        <span className="text-[8px] text-[#9a907c] shrink-0">Ambil Kartu</span>
      ) : null}

      <CellTokenDots cellPlayers={cellPlayers} />
      <PropertyBadge cellIndex={cell.index} propertyInfo={propertyInfo} />
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

function PropertyBadge({ cellIndex, propertyInfo }: { cellIndex: number; propertyInfo?: PropertyInfo[] }) {
  const prop = propertyInfo?.find(p => p.boardIndex === cellIndex);
  if (!prop || !prop.ownerId) return null;

  const initials = prop.ownerName ? prop.ownerName.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-20 pointer-events-none">
      {/* Owner marker with colored border ring and glow */}
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-black text-white shadow-lg"
        style={{
          backgroundColor: prop.ownerColor || '#666',
          border: `3px solid ${prop.ownerColor || '#666'}88`,
          boxShadow: `0 0 0 2px white, 0 0 8px ${prop.ownerColor || '#666'}99, 0 0 16px ${prop.ownerColor || '#666'}55`,
        }}
        title={`Owner: ${prop.ownerName}`}
      >
        {initials}
      </div>
      {/* Upgrade level bars */}
      {prop.houseLevel > 0 && (
        <div className="flex gap-1 mt-1 bg-black/50 rounded-sm px-1 py-0.5">
          {Array.from({ length: Math.min(prop.houseLevel, 5) }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-1.5 sm:w-3 sm:h-2 rounded-sm ${prop.isLandmark ? 'bg-[#ffd56d] shadow-[0_0_4px_#ffd56d]' : 'bg-[#4edea3] shadow-[0_0_4px_#4edea3]'}`}
            />
          ))}
        </div>
      )}
      {/* Landmark crown */}
      {prop.isLandmark && (
        <span className="text-[8px] sm:text-[10px] leading-none -mt-0.5">&#x2B50;</span>
      )}
    </div>
  );
}

export default function Board({ players, currentPlayer, activePlayerName, activePlayerTokenColor, potMoney = 0, round = 1, totalRounds = 4, propertyInfo = [], onCellClick, boardTheme }: BoardProps) {
  const theme = BOARD_THEMES[boardTheme || 'default'];

  return (
    <div className="w-full max-w-[1400px] min-h-[600px] p-2 sm:p-3 rounded-2xl border-2 shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative overflow-hidden" style={{ backgroundColor: theme.boardBg, borderColor: theme.boardBorder }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(21,47,31,0.3) 0%, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />

      <div className="relative z-10 w-full h-full grid grid-cols-11 gap-0.5 sm:gap-1" style={{ gridTemplateRows: '2fr repeat(9, 2fr) 2fr' }}>
        {BOARD_CELLS.map((cell) => {
          const posType = getCellPositionType(cell.index);
          const cellPlayers = getPlayersOnCell(cell.index, players);
          switch (posType) {
            case 'corner':
              return <CornerCell key={cell.index} cell={cell} cellPlayers={cellPlayers} onCellClick={onCellClick} theme={theme} />;
            case 'top':
              return <TopRowCell key={cell.index} cell={cell} cellPlayers={cellPlayers} propertyInfo={propertyInfo} onCellClick={onCellClick} theme={theme} />;
            case 'bottom':
              return <BottomRowCell key={cell.index} cell={cell} cellPlayers={cellPlayers} propertyInfo={propertyInfo} onCellClick={onCellClick} theme={theme} />;
            case 'left':
              return <LeftColCell key={cell.index} cell={cell} cellPlayers={cellPlayers} propertyInfo={propertyInfo} onCellClick={onCellClick} theme={theme} />;
            case 'right':
              return <RightColCell key={cell.index} cell={cell} cellPlayers={cellPlayers} propertyInfo={propertyInfo} onCellClick={onCellClick} theme={theme} />;
            default:
              return null;
          }
        })}

        <div className="col-start-2 col-end-11 row-start-2 row-end-11 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col justify-between items-center text-center shadow-inner relative overflow-hidden backdrop-blur-sm border" style={{ backgroundColor: theme.centerBg + 'e6', borderColor: theme.centerBorder }}>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: theme.priceText + '0d' }} />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: '#4edea30d' }} />

          <div className="w-full flex items-center justify-between text-xs pb-3" style={{ borderBottom: `1px solid ${theme.cellBorder}` }}>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5" style={{ backgroundColor: theme.startBg, color: theme.priceText, fontFamily: "'Syne', sans-serif" }}>
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
                BABAK {round} / {totalRounds}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm" style={{ backgroundColor: theme.startBg, border: `1px solid ${theme.priceText}4d` }}>
              <span style={{ color: theme.priceText }} className="text-base">&#x1F4B0;</span>
              <div className="text-right">
                <span className="text-[9px] uppercase block font-semibold leading-none" style={{ color: theme.subtitleText }}>KAS JACKPOT PARKIR</span>
                <span className="text-xs sm:text-sm font-mono font-bold" style={{ color: theme.priceText }}>Rp {potMoney.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="my-auto flex flex-col items-center justify-center max-w-xl px-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2 shadow-sm" style={{ backgroundColor: theme.startBg, border: `1px solid ${theme.priceText}4d`, color: theme.priceText }}>
              <span className="text-[10px] font-bold tracking-widest uppercase">&bull; EDISI RESMI &bull; WARGA +62 &bull;</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span>MONOPOLI</span>
              <span className="bg-gradient-to-r from-[#ffd56d] via-[#ffdf97] to-[#e5b842] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,213,109,0.4)]">WNI</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold mt-2 tracking-wide" style={{ color: theme.priceText }}>Versi Indonesia yang kekinian &amp; penuh intrik</p>
            <p className="text-[11px] sm:text-xs max-w-md mt-1 leading-relaxed" style={{ color: theme.subtitleText }}>Kocok dadu, kuasai kavling ibukota, hindari razia pajak Satpol PP</p>

            <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-md">
              <div className="hover:brightness-110 border border-[#ff6b6b]/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer" style={{ backgroundColor: theme.startBg }}>
                <div className="w-full h-1 bg-[#ff6b6b] rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-[#fca5a5] mb-0.5">
                  <span className="text-lg">&#x1F0CF;</span>
                  <span className="font-bold text-xs">TAKDIR WNI</span>
                </div>
                <span className="text-[10px] block" style={{ color: theme.subtitleText }}>102 Kartu</span>
              </div>
              <div className="hover:brightness-110 border border-[#4edea3]/40 rounded-xl p-3 text-center shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer" style={{ backgroundColor: theme.startBg }}>
                <div className="w-full h-1 bg-[#4edea3] rounded-full mb-2" />
                <div className="flex items-center justify-center gap-1 text-[#4edea3] mb-0.5">
                  <span className="text-lg">&#x1F4E6;</span>
                  <span className="font-bold text-xs">KEGIATAN WNI</span>
                </div>
                <span className="text-[10px] block" style={{ color: theme.subtitleText }}>100 Kartu</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between rounded-xl p-2.5 sm:p-3 text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: theme.cellBorder, borderWidth: '1px' }}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg text-white font-black text-sm flex items-center justify-center shadow-lg border-2 border-white/20" style={{ backgroundColor: activePlayerTokenColor || '#3b82f6', boxShadow: `0 0 12px ${activePlayerTokenColor || '#3b82f6'}60` }}>
                  {activePlayerName ? activePlayerName.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4edea3] ring-2 ring-black animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs" style={{ color: theme.nameText }}>{activePlayerName || 'Menunggu...'}</span>
                </div>
                <span className="text-[10px] text-[#4edea3]">Sedang memegang giliran dadu</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[9px] block uppercase font-semibold" style={{ color: theme.subtitleText }}>Kas Dompet</span>
                <span className="font-mono font-bold text-xs sm:text-sm" style={{ color: theme.priceText }}>Rp {(currentPlayer?.cleanMoney || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
