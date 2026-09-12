'use client';

import { useState, useEffect } from 'react';
import { rollDice } from '@/lib/game/game-logic';

// ============================================================
// DICE ROLL MODAL
// ============================================================

interface DiceRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRollComplete: (result: { dice1: number; dice2: number; total: number }) => void;
}

export default function DiceRollModal({ isOpen, onClose, onRollComplete }: DiceRollModalProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRolling(false);
      setDice1(1);
      setDice2(1);
      setShowResult(false);
    }
  }, [isOpen]);

  const handleRoll = () => {
    setIsRolling(true);
    setShowResult(false);

    // Animate dice
    let count = 0;
    const interval = setInterval(() => {
      setDice1(rollDice(6));
      setDice2(rollDice(6));
      count++;

      if (count >= 15) {
        clearInterval(interval);
        const finalDice1 = rollDice(6);
        const finalDice2 = rollDice(6);
        setDice1(finalDice1);
        setDice2(finalDice2);
        setIsRolling(false);
        setShowResult(true);

        setTimeout(() => {
          onRollComplete({
            dice1: finalDice1,
            dice2: finalDice2,
            total: finalDice1 + finalDice2,
          });
        }, 1500);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎲 LEMPAR DADU!</h2>
          <p className="text-gray-500 text-sm">Klik tombol untuk melempar</p>
        </div>

        {/* Dice Display */}
        <div className="flex justify-center gap-8 mb-6">
          <div
            className={`w-24 h-24 bg-white border-4 border-gray-300 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg transition-transform ${
              isRolling ? 'animate-spin' : ''
            }`}
          >
            {dice1}
          </div>
          <div
            className={`w-24 h-24 bg-white border-4 border-gray-300 rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg transition-transform ${
              isRolling ? 'animate-spin' : ''
            }`}
          >
            {dice2}
          </div>
        </div>

        {/* Result */}
        {showResult && (
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {dice1 + dice2}
            </div>
            <p className="text-gray-600">Total: {dice1} + {dice2}</p>
          </div>
        )}

        {/* Roll Button */}
        {!showResult && (
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isRolling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 active:scale-95'
            }`}
          >
            {isRolling ? 'MENGOCOK...' : 'LEMPAR!'}
          </button>
        )}

        {/* Close button after result */}
        {showResult && (
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 transition-all"
          >
            LANJUTKAN
          </button>
        )}
      </div>
    </div>
  );
}
