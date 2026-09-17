'use client';

import { BoardCell } from '@/lib/types';

// ============================================================
// UPGRADE PROPERTY MODAL
// Shows when landing on own property — upgrade or landmark options
// ============================================================

interface PropertyRow {
  board_index: number;
  owner_id: string | null;
  house_level: number;
  is_landmark: boolean;
}

interface UpgradePropertyModalProps {
  isOpen: boolean;
  cell: BoardCell;
  dbProperty: PropertyRow | null;
  playerMoney: number;
  onUpgrade: (boardIndex: number) => void;
  onTakeover?: (boardIndex: number) => void;
  onClose: () => void;
  isOwnProperty: boolean;
  isLoading?: boolean;
}

function getUpgradeCost(cell: BoardCell, currentLevel: number): number {
  if (!cell.buildingCost) return 0;
  if (currentLevel === 0) return cell.buildingCost;
  if (currentLevel === 1) return Math.floor(cell.buildingCost * 1.5);
  if (currentLevel === 2) return cell.buildingCost * 2;
  if (currentLevel === 3) return Math.floor(cell.buildingCost * 2.5);
  if (currentLevel === 4) return cell.buildingCost * 5;
  return 0;
}

const LEVEL_LABELS = ['Tanpa Bangunan', 'Rumah', 'Ruko', 'Gedung', 'Mall', 'Landmark'];

export default function UpgradePropertyModal({
  isOpen,
  cell,
  dbProperty,
  playerMoney,
  onUpgrade,
  onTakeover,
  onClose,
  isOwnProperty,
  isLoading = false,
}: UpgradePropertyModalProps) {
  if (!isOpen) return null;

  const currentLevel = dbProperty?.house_level || 0;
  const isLandmark = dbProperty?.is_landmark || false;
  const upgradeCost = isOwnProperty ? getUpgradeCost(cell, currentLevel) : cell.price * 2;
  const canAfford = playerMoney >= upgradeCost;
  const nextLevel = Math.min(currentLevel + 1, 5);
  const nextLabel = LEVEL_LABELS[nextLevel] || 'Landmark';

  const rentMultipliers = [1, 1.5, 2, 2.5, 3, 5];
  const currentRent = Math.floor((cell.rent || 0) * rentMultipliers[currentLevel]);
  const nextRent = Math.floor((cell.rent || 0) * rentMultipliers[nextLevel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{ backgroundColor: cell.color }}
        >
          <h2 className="text-2xl font-bold text-white">{cell.name}</h2>
          <p className="text-white/80 text-sm">{cell.description}</p>
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Status</span>
            <span className="font-bold text-gray-800">
              {isLandmark ? '⭐ Landmark' : LEVEL_LABELS[currentLevel]}
            </span>
          </div>
          {/* Upgrade bars */}
          <div className="flex gap-1 mb-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full"
                style={{
                  backgroundColor: i < currentLevel ? '#4edea3' : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Sewa saat ini: Rp{currentRent.toLocaleString('id-ID')}</span>
            {!isLandmark && <span>Sewa berikutnya: Rp{nextRent.toLocaleString('id-ID')}</span>}
          </div>
        </div>

        {/* Action */}
        {isOwnProperty ? (
          isLandmark ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-yellow-700 font-bold">⭐ Sudah Landmark!</p>
              <p className="text-yellow-600 text-sm">Properti ini sudah di level maksimum</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Upgrade ke {nextLabel}:</span>
                <span className={`font-bold ${canAfford ? 'text-[#4edea3]' : 'text-red-500'}`}>
                  Rp{upgradeCost.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Uang kamu:</span>
                <span className={`font-bold ${canAfford ? 'text-gray-800' : 'text-red-500'}`}>
                  Rp{playerMoney.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Takeover (200% harga):</span>
              <span className={`font-bold ${canAfford ? 'text-[#ffd56d]' : 'text-red-500'}`}>
                Rp{upgradeCost.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Uang kamu:</span>
              <span className={`font-bold ${canAfford ? 'text-gray-800' : 'text-red-500'}`}>
                Rp{playerMoney.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-xs text-gray-400">Properti akan di-reset ke level 0</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {(isOwnProperty && !isLandmark) ? (
            <button
              onClick={() => onUpgrade(cell.index)}
              disabled={!canAfford || isLoading}
              className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                canAfford && !isLoading
                  ? 'bg-[#4edea3] text-white hover:bg-[#3dc992]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'UPGRADING...' : 'UPGRADE'}
            </button>
          ) : (!isOwnProperty && onTakeover) ? (
            <button
              onClick={() => onTakeover(cell.index)}
              disabled={!canAfford || isLoading}
              className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                canAfford && !isLoading
                  ? 'bg-[#ffd56d] text-black hover:bg-[#ffc853]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'MEMBELI...' : 'TAKEOVER'}
            </button>
          ) : null}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            LEWATI
          </button>
        </div>
      </div>
    </div>
  );
}
