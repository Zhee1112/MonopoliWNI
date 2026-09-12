'use client';

import { useState } from 'react';
import { DEFENSE_OPTIONS, DefenseOption } from '@/lib/game/game-logic';
import { PlayerStats } from '@/lib/types';

// ============================================================
// DEFENSE MODAL
// ============================================================

interface DefenseModalProps {
  isOpen: boolean;
  auditAmount: number;
  playerStats: PlayerStats;
  playerMoney: number;
  dirtyMoney: number;
  onDefense: (option: DefenseOption, rollResult?: { success: boolean; total: number; dc: number }) => void;
  onClose: () => void;
}

export default function DefenseModal({
  isOpen,
  auditAmount,
  playerStats,
  playerMoney,
  dirtyMoney,
  onDefense,
  onClose,
}: DefenseModalProps) {
  const [selectedOption, setSelectedOption] = useState<DefenseOption | null>(null);
  const [rollResult, setRollResult] = useState<{ success: boolean; total: number; dc: number } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (option: DefenseOption) => {
    setSelectedOption(option);
    setRollResult(null);
  };

  const handleRoll = () => {
    if (!selectedOption) return;

    setIsRolling(true);

    setTimeout(() => {
      const statValue = playerStats[selectedOption.statRequired];
      const dice = Math.floor(Math.random() * 20) + 1;
      const total = dice + statValue;
      const success = total >= selectedOption.dcRequired;

      setRollResult({ success, total, dc: selectedOption.dcRequired });
      setIsRolling(false);
    }, 1500);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onDefense(selectedOption, rollResult || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🛡️ OPSI DEFENSE!</h2>
          <p className="text-gray-500 text-sm">Kamu dipilih untuk audit</p>
        </div>

        {/* Audit Info */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-red-600">Duit Kotor:</span>
            <span className="font-bold text-red-700">
              Rp{dirtyMoney.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-red-600">Penalty:</span>
            <span className="font-bold text-red-700">
              Sita Rp{auditAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Defense Options */}
        <div className="space-y-3 mb-6">
          {DEFENSE_OPTIONS.map((option) => {
            const statValue = playerStats[option.statRequired];
            const canAfford = playerMoney >= option.cost;

            return (
              <button
                key={option.type}
                onClick={() => handleSelectOption(option)}
                disabled={!canAfford}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOption?.type === option.type
                    ? 'border-blue-500 bg-blue-50'
                    : canAfford
                    ? 'border-gray-200 hover:border-gray-300 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <div className="text-right">
                    {option.cost > 0 && (
                      <p className={`text-sm font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                        Rp{option.cost.toLocaleString('id-ID')}
                      </p>
                    )}
                    {option.dcRequired > 0 && (
                      <p className="text-xs text-gray-500">
                        {option.statRequired.toUpperCase()}: {statValue} | DC: {option.dcRequired}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Roll Button */}
        {selectedOption && selectedOption.dcRequired > 0 && !rollResult && (
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`w-full py-4 rounded-xl font-bold text-lg mb-4 transition-all ${
              isRolling
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {isRolling ? 'MENGOCOK...' : 'ROLL D20'}
          </button>
        )}

        {/* Roll Result */}
        {rollResult && (
          <div
            className={`p-4 rounded-xl mb-4 text-center ${
              rollResult.success
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <p className="text-3xl font-bold mb-2">
              {rollResult.success ? '✅ SUCCESS!' : '❌ FAIL!'}
            </p>
            <p className="text-gray-600">
              Total: {rollResult.total} vs DC: {rollResult.dc}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {rollResult ? (
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
            >
              KONFIRMASI
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
            >
              BATAL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
