'use client';

import { useState, useEffect } from 'react';
import { rollDice } from '@/lib/game/game-logic';

interface GachaRollModalProps {
  isOpen: boolean;
  cellName: string;
  cellEmoji: string;
  onRollComplete: (gachaRoll: number) => void;
}

function GachaDice({ value, rolling }: { value: number; rolling: boolean }) {
  const patterns: Record<number, { row: number; col: number }[]> = {
    1: [{ row: 2, col: 2 }],
    2: [{ row: 1, col: 3 }, { row: 3, col: 1 }],
    3: [{ row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }],
    4: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
    5: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
    6: [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }],
  };
  const dots = patterns[value] || patterns[1];

  return (
    <div
      className="relative w-24 h-24 rounded-2xl bg-[#FBF8EE] text-[#07190F] p-3 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(0,0,0,0.2)] transition-transform duration-200"
      style={{ transform: rolling ? 'rotate(45deg) scale(1.1)' : 'rotate(-6deg)' }}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 items-center justify-items-center">
        {dots.map((dot, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full bg-[#07190F] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)] ${
              dot.row === 1 && dot.col === 1 ? 'col-start-1 row-start-1' :
              dot.row === 1 && dot.col === 2 ? 'col-start-2 row-start-1' :
              dot.row === 1 && dot.col === 3 ? 'col-start-3 row-start-1' :
              dot.row === 2 && dot.col === 1 ? 'col-start-1 row-start-2' :
              dot.row === 2 && dot.col === 2 ? 'col-start-2 row-start-2' :
              dot.row === 2 && dot.col === 3 ? 'col-start-3 row-start-2' :
              dot.row === 3 && dot.col === 1 ? 'col-start-1 row-start-3' :
              dot.row === 3 && dot.col === 2 ? 'col-start-2 row-start-3' :
              'col-start-3 row-start-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function getGachaEffect(roll: number): { label: string; color: string; description: string } {
  if (roll <= 2) return { label: 'SANGAT BURUK', color: '#ef4444', description: 'Efek negatif besar!' };
  if (roll <= 3) return { label: 'BURUK', color: '#f97316', description: 'Efek negatif sedang.' };
  if (roll <= 4) return { label: 'NETRAL', color: '#eab308', description: 'Efek biasa saja.' };
  if (roll <= 5) return { label: 'BAGUS', color: '#4edea3', description: 'Efek positif!' };
  return { label: 'SANGAT BAGUS', color: '#22c55e', description: 'Efek positif besar!' };
}

export default function GachaRollModal({ isOpen, cellName, cellEmoji, onRollComplete }: GachaRollModalProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [gachaValue, setGachaValue] = useState(1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRolling(false);
      setGachaValue(1);
      setShowResult(false);
    }
  }, [isOpen]);

  const handleRoll = () => {
    setIsRolling(true);
    setShowResult(false);

    let count = 0;
    const interval = setInterval(() => {
      setGachaValue(rollDice(6));
      count++;

      if (count >= 18) {
        clearInterval(interval);
        const finalValue = rollDice(6);
        setGachaValue(finalValue);
        setIsRolling(false);
        setShowResult(true);
      }
    }, 80);
  };

  const handleContinue = () => {
    onRollComplete(gachaValue);
  };

  if (!isOpen) return null;

  const effect = getGachaEffect(gachaValue);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#001809]/95 backdrop-blur-md">
      <div className="relative z-20 w-full max-w-lg bg-[#0a1a11] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,213,109,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#092515] px-5 py-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#152f1f] flex items-center justify-center text-2xl shadow-[inset_0_1px_1px_rgba(255,213,109,0.4)]">
            {cellEmoji}
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#ffd56d] uppercase tracking-widest">GACHA ROLL</span>
            <h2 className="text-lg font-bold text-[#cbead1]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cellName}</h2>
            <p className="text-xs text-[#d1c5af]">Lempar dadu gacha untuk menentukan efek</p>
          </div>
        </div>

        {/* Dice Display */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="relative w-full h-48 rounded-xl bg-[#001206] flex items-center justify-center overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
            <div className="absolute w-48 h-48 rounded-full bg-[#ffd56d]/8 blur-2xl pointer-events-none" />
            <GachaDice value={gachaValue} rolling={isRolling} />
          </div>

          {/* Result Info */}
          {showResult && (
            <div className="w-full rounded-xl bg-[#152f1f] p-4 flex flex-col items-center gap-2 border border-[#203a29]">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold font-mono" style={{ color: effect.color }}>{gachaValue}</span>
                <div className="text-left">
                  <span className="text-xs font-bold block" style={{ color: effect.color }}>{effect.label}</span>
                  <span className="text-[10px] text-[#d1c5af]">{effect.description}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="bg-[#092515] px-5 py-4 flex justify-center">
          {!showResult ? (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                isRolling
                  ? 'bg-[#203a29] text-[#9a907c] cursor-not-allowed'
                  : 'bg-[#ffd56d] text-[#3e2e00] hover:bg-[#eec14a] active:scale-95 shadow-[2px_2px_0_0_#000]'
              }`}
            >
              {isRolling ? 'MENGOCOK GACHA...' : 'LEMPAR GACHA!'}
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="px-8 py-3 rounded-lg bg-[#4edea3] text-[#002b18] font-bold text-sm hover:bg-[#6ffbbe] active:scale-95 shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2"
            >
              Lihat Efek ({gachaValue})
              <span>&#x2192;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
