'use client';

import { BoardCell } from '@/lib/types';

// ============================================================
// BUY PROPERTY MODAL
// ============================================================

interface BuyPropertyModalProps {
  isOpen: boolean;
  cell: BoardCell;
  playerMoney: number;
  onBuy: () => void;
  onSkip: () => void;
}

export default function BuyPropertyModal({
  isOpen,
  cell,
  playerMoney,
  onBuy,
  onSkip,
}: BuyPropertyModalProps) {
  if (!isOpen) return null;

  const canAfford = playerMoney >= (cell.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div
          className="rounded-xl p-4 mb-4 text-center"
          style={{ backgroundColor: cell.color }}
        >
          <h2 className="text-2xl font-bold text-white">{cell.name}</h2>
          <p className="text-white/80 text-sm">{cell.description}</p>
        </div>

        {/* Property Info */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Harga:</span>
            <span className="font-bold text-gray-800">
              Rp{(cell.price || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Sewa Dasar:</span>
            <span className="font-bold text-gray-800">
              Rp{(cell.rent || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Grup:</span>
            <span
              className="px-2 py-1 rounded text-xs font-bold text-white"
              style={{ backgroundColor: cell.color }}
            >
              {cell.group || 'Tidak ada'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Uang Kamu:</span>
            <span
              className={`font-bold ${
                canAfford ? 'text-green-600' : 'text-red-600'
              }`}
            >
              Rp{playerMoney.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Affordability Message */}
        {!canAfford && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm text-center">
              Uang tidak cukup untuk membeli properti ini!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
              canAfford
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            BELI
          </button>
          <button
            onClick={onSkip}
            className="flex-1 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
          >
            LEWATI
          </button>
        </div>
      </div>
    </div>
  );
}
