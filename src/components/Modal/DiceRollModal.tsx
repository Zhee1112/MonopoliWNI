'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { rollDice } from '@/lib/game/game-logic';

interface DiceRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRollComplete: (result: { dice1: number; dice2: number; total: number }) => void;
}

function DiceDot({ row, col }: { row: number; col: number }) {
  return (
    <div
      className={`w-3 h-3 rounded-full bg-[#07190F] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)] ${
        row === 1 && col === 1 ? 'col-start-1 row-start-1' :
        row === 1 && col === 2 ? 'col-start-2 row-start-1' :
        row === 1 && col === 3 ? 'col-start-3 row-start-1' :
        row === 2 && col === 1 ? 'col-start-1 row-start-2' :
        row === 2 && col === 2 ? 'col-start-2 row-start-2' :
        row === 2 && col === 3 ? 'col-start-3 row-start-2' :
        row === 3 && col === 1 ? 'col-start-1 row-start-3' :
        row === 3 && col === 2 ? 'col-start-2 row-start-3' :
        'col-start-3 row-start-3'
      }`}
    />
  );
}

function getDiceDots(value: number): { row: number; col: number }[] {
  const patterns: Record<number, { row: number; col: number }[]> = {
    1: [{ row: 2, col: 2 }],
    2: [{ row: 1, col: 3 }, { row: 3, col: 1 }],
    3: [{ row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }],
    4: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
    5: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
    6: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
  };
  return patterns[value] || patterns[1];
}

function Dice3D({ value, rotation }: { value: number; rotation: string }) {
  const dots = getDiceDots(value);
  return (
    <div
      className={`relative w-20 h-20 rounded-xl bg-[#FBF8EE] text-[#07190F] p-3 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(0,0,0,0.2)] hover:rotate-0 transition-transform duration-200`}
      style={{ transform: rotation }}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 items-center justify-items-center">
        {dots.map((dot, i) => (
          <DiceDot key={i} row={dot.row} col={dot.col} />
        ))}
      </div>
    </div>
  );
}

export default function DiceRollModal({ isOpen, onClose, onRollComplete }: DiceRollModalProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  useEffect(() => {
    if (isOpen) {
      cleanup();
      setIsRolling(false);
      setDice1(1);
      setDice2(1);
      setShowResult(false);
      completedRef.current = false;
    }
    return cleanup;
  }, [isOpen, cleanup]);

  const handleRoll = () => {
    cleanup();
    completedRef.current = false;
    setIsRolling(true);
    setShowResult(false);

    let count = 0;
    intervalRef.current = setInterval(() => {
      setDice1(rollDice(6));
      setDice2(rollDice(6));
      count++;

      if (count >= 15) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        const finalDice1 = rollDice(6);
        const finalDice2 = rollDice(6);
        setDice1(finalDice1);
        setDice2(finalDice2);
        setIsRolling(false);
        setShowResult(true);

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          if (!completedRef.current) {
            completedRef.current = true;
            onRollComplete({
              dice1: finalDice1,
              dice2: finalDice2,
              total: finalDice1 + finalDice2,
            });
          }
        }, 2000);
      }
    }, 100);
  };

  const handleClose = () => {
    cleanup();
    if (!completedRef.current) {
      completedRef.current = true;
      const total = dice1 + dice2;
      if (showResult) {
        onRollComplete({ dice1, dice2, total });
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const total = dice1 + dice2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001809]/90 backdrop-blur-md">
      <div className="relative z-20 w-full max-w-3xl bg-[#0a1a11] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,213,109,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#092515] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#152f1f] flex items-center justify-center text-[#ffd56d] shadow-[inset_0_1px_1px_rgba(255,213,109,0.4)]">
              <span className="text-2xl">&#x1F3B2;</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#ffd56d] uppercase tracking-wider">Uji Stat &amp; Manuver Meja</span>
                <span className="px-2 py-0.5 rounded bg-[#00a572]/30 text-[#4edea3] text-[11px] font-bold">FASE AKSI</span>
              </div>
              <h1 className="text-lg font-bold text-[#cbead1] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lempar Dadu Nasib!</h1>
              <p className="text-xs text-[#d1c5af]">Kocok dadu untuk menentukan langkahmu di peta</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-lg bg-[#152f1f] text-[#d1c5af] hover:text-[#ffd56d] hover:bg-[#203a29] transition-colors flex items-center justify-center"
          >
            &#x2715;
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* LEFT: Dice Display */}
          <div className="p-5 flex flex-col gap-4 bg-[#0a1a11]/60">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#d1c5af] uppercase tracking-wider">Hasil Lemparan Dadu</span>
                {showResult && (
                  <span className="px-2.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-xs font-semibold flex items-center gap-1">
                    &#x2705; Sukses Bergulir
                  </span>
                )}
              </div>
              <div className="relative w-full h-44 rounded-xl bg-[#001206] flex items-center justify-center gap-6 overflow-hidden p-4 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
                <div className="absolute w-40 h-40 rounded-full bg-[#ffd56d]/10 blur-xl pointer-events-none" />
                <Dice3D value={dice1} rotation={isRolling ? 'rotate(45deg)' : '-rotate-6'} />
                <div className="text-[#ffd56d] text-xl font-bold select-none">+</div>
                <Dice3D value={dice2} rotation={isRolling ? 'rotate(-30deg)' : 'rotate(12deg)'} />
              </div>
              <div className="px-4 py-2.5 rounded-lg bg-[#152f1f] flex items-center justify-between">
                <span className="text-xs text-[#d1c5af]">Langkah Alami:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#ffd56d]">{dice1} + {dice2} = {total} Langkah</span>
                  <span className="text-[#9a907c] text-xs">&bull; {dice1 === dice2 ? 'GANDA!' : 'Non-Ganda'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: RPG Calculation */}
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#d1c5af] uppercase tracking-wider">Kalkulasi Roll RPG</span>
              <span className="text-[11px] text-[#9a907c] font-mono">D&amp;D Format</span>
            </div>
            <div className="rounded-xl bg-[#152f1f] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd56d]">&#x1F3B2;</span>
                  <span className="text-sm text-[#cbead1]">Nilai Dadu Dasar (D1 + D2)</span>
                </div>
                <span className="text-sm font-bold text-[#ffd56d] font-mono">+{total}</span>
              </div>
              <div className="h-0.5 w-full bg-[#4e4635]/40 my-1" />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#092515] flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-[#d1c5af] uppercase font-semibold tracking-wider">TOTAL SKOR ROLL</span>
                  <div className="flex items-baseline justify-center gap-1.5 my-1">
                    <span className="text-3xl font-extrabold text-[#ffd56d]">{total}</span>
                    <span className="text-xs text-[#4edea3] font-bold">POIN</span>
                  </div>
                  <span className="text-xs text-[#d1c5af]">Formula: {dice1} + {dice2}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#092515] flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-[#d1c5af] uppercase font-semibold tracking-wider">LANGKAH</span>
                  <div className="flex items-baseline justify-center gap-1.5 my-1">
                    <span className="text-3xl font-extrabold text-[#cbead1]">{total}</span>
                    <span className="text-xs text-[#9a907c] font-bold">PETAK</span>
                  </div>
                  <span className="text-xs text-[#4edea3] font-bold">Bergerak {total} langkah</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-[#092515] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#d1c5af] text-xs">
            {isRolling ? (
              <>
                <span className="text-[#4edea3] animate-spin">&#x21BB;</span>
                <span>Mengocok dadu...</span>
              </>
            ) : showResult ? (
              <>
                <span className="text-[#4edea3]">&#x2705;</span>
                <span>Pion akan bergerak <strong className="text-[#ffd56d]">{total} langkah</strong></span>
              </>
            ) : (
              <>
                <span className="text-[#ffd56d]">&#x1F3B2;</span>
                <span>Klik tombol untuk melempar dadu</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!showResult ? (
              <button
                onClick={handleRoll}
                disabled={isRolling}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  isRolling
                    ? 'bg-[#203a29] text-[#9a907c] cursor-not-allowed'
                    : 'bg-[#ffd56d] text-[#3e2e00] hover:bg-[#eec14a] active:scale-95 shadow-[2px_2px_0_0_#000]'
                }`}
              >
                {isRolling ? 'MENGOCOK...' : 'LEMPAR DADU!'}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg bg-[#4edea3] text-[#002b18] font-bold text-sm hover:bg-[#6ffbbe] active:scale-95 shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2"
              >
                Lanjut Langkah ({total} Petak)
                <span>&#x2192;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
