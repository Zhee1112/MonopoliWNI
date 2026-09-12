'use client';

import { Player } from '@/lib/types';

// ============================================================
// PLAYER PANEL COMPONENT
// ============================================================

interface PlayerPanelProps {
  player: Player;
  isActive?: boolean;
  onRollDice?: () => void;
  onBuyProperty?: () => void;
  onEndTurn?: () => void;
}

export default function PlayerPanel({
  player,
  isActive = false,
  onRollDice,
  onBuyProperty,
  onEndTurn,
}: PlayerPanelProps) {
  const totalMoney = player.cleanMoney + player.dirtyMoney;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isActive
          ? 'border-yellow-400 bg-yellow-50 shadow-lg'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full border-3 border-white shadow-md"
          style={{ backgroundColor: player.tokenColor }}
        />
        <div>
          <h3 className="font-bold text-gray-800">{player.name}</h3>
          <p className="text-xs text-gray-500 capitalize">{player.role.replace('_', ' ')}</p>
        </div>
        {isActive && (
          <span className="ml-auto px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
            GILIRAN
          </span>
        )}
      </div>

      {/* Money Display */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-50 p-2 rounded">
          <p className="text-xs text-green-600">Bersih</p>
          <p className="font-bold text-green-700">
            Rp{player.cleanMoney.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-red-50 p-2 rounded">
          <p className="text-xs text-red-600">Kotor</p>
          <p className="font-bold text-red-700">
            Rp{player.dirtyMoney.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Total Money */}
      <div className="bg-gray-100 p-2 rounded mb-3">
        <p className="text-xs text-gray-600">Total</p>
        <p className="font-bold text-gray-800">
          Rp{totalMoney.toLocaleString('id-ID')}
        </p>
      </div>

      {/* Luck & Position */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-purple-50 p-2 rounded">
          <p className="text-xs text-purple-600">Luck</p>
          <p className="font-bold text-purple-700">{player.luck}/100</p>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <p className="text-xs text-blue-600">Posisi</p>
          <p className="font-bold text-blue-700">{player.position}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3">
        <p className="text-xs font-bold text-gray-600 mb-1">Stats</p>
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <div className="bg-orange-50 p-1 rounded text-center">
            <span className="text-orange-600">N:</span> {player.stats.negotiation}
          </div>
          <div className="bg-cyan-50 p-1 rounded text-center">
            <span className="text-cyan-600">I:</span> {player.stats.investigation}
          </div>
          <div className="bg-pink-50 p-1 rounded text-center">
            <span className="text-pink-600">P:</span> {player.stats.persuasion}
          </div>
          <div className="bg-green-50 p-1 rounded text-center">
            <span className="text-green-600">S:</span> {player.stats.streetSmart}
          </div>
          <div className="bg-yellow-50 p-1 rounded text-center">
            <span className="text-yellow-600">C:</span> {player.stats.charm}
          </div>
        </div>
      </div>

      {/* Evidence Count */}
      <div className="mb-3">
        <p className="text-xs text-gray-600">
          Bukti: <span className="font-bold">{player.evidence.length}</span>
        </p>
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div className="flex gap-2">
          {onRollDice && (
            <button
              onClick={onRollDice}
              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-bold rounded hover:bg-blue-600 transition-colors"
            >
              ROLL DICE
            </button>
          )}
          {onBuyProperty && (
            <button
              onClick={onBuyProperty}
              className="flex-1 px-3 py-2 bg-green-500 text-white text-sm font-bold rounded hover:bg-green-600 transition-colors"
            >
              BELI
            </button>
          )}
          {onEndTurn && (
            <button
              onClick={onEndTurn}
              className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm font-bold rounded hover:bg-gray-600 transition-colors"
            >
              SELESAI
            </button>
          )}
        </div>
      )}

      {/* Meme Role Buff */}
      {player.memeRoleBuff && (
        <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded">
          <p className="text-xs font-bold text-purple-700">
            {player.memeRoleActive ? '🎭' : '💤'} {player.memeRoleBuff.replace('_', ' ')}
          </p>
          <p className="text-[10px] text-purple-600">
            {player.memeRoleActive ? 'AKTIF' : 'NONAKTIF'}
          </p>
        </div>
      )}
    </div>
  );
}
