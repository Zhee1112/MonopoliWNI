'use client';

import { useState } from 'react';
import { Player } from '@/lib/types';
import { getPropertyCells, BOARD_CELLS } from '@/lib/game/board-data';

interface BankruptcyModalProps {
  isOpen: boolean;
  player: Player;
  otherPlayers: Player[];
  onSellToBank: (propertyName: string) => void;
  onSellToPlayer: (propertyName: string, buyerId: string, amount: number) => void;
  onTakeLoan: (amount: number) => void;
  onDeclineLoan: () => void;
}

export default function BankruptcyModal({
  isOpen,
  player,
  otherPlayers,
  onSellToBank,
  onSellToPlayer,
  onTakeLoan,
  onDeclineLoan,
}: BankruptcyModalProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [showLoanOption, setShowLoanOption] = useState(false);

  if (!isOpen) return null;

  const propertyCells = getPropertyCells();
  const playerProperties = (player.properties || [])
    .map(name => propertyCells.find(c => c.name === name))
    .filter(Boolean);

  const totalPropertyValue = playerProperties.reduce((sum, cell) => sum + (cell?.price || 0), 0);
  const loanAmount = Math.floor(totalPropertyValue * 0.5);

  const getPropertyEmoji = (name: string) => {
    const cell = BOARD_CELLS.find(c => c.name === name);
    return cell?.emoji || '🏠';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0a2514', border: '1px solid #f87171' }}>
        {/* Header */}
        <div className="px-4 py-3 text-center" style={{ backgroundColor: '#2b1013', borderBottom: '1px solid #f87171' }}>
          <span className="text-3xl block mb-2">💀</span>
          <h2 className="text-lg font-bold" style={{ color: '#f87171' }}>BANKRUP!</h2>
          <p className="text-xs mt-1" style={{ color: '#d1c5af' }}>Jual properti atau ambil pinjaman untuk bertahan hidup</p>
        </div>

        {/* Properties List */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider mb-2 font-semibold" style={{ color: '#7a9a7a' }}>
            Properti Kamu ({playerProperties.length})
          </div>
          {playerProperties.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-2xl block mb-2">🏚️</span>
              <span className="text-xs" style={{ color: '#7a9a7a' }}>Tidak ada properti untuk dijual</span>
            </div>
          ) : (
            <div className="space-y-2">
              {playerProperties.map((cell) => {
                if (!cell) return null;
                const isSelected = selectedProperty === cell.name;
                return (
                  <div
                    key={cell.index}
                    className="p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? '#152f1f' : '#0d2e1a',
                      border: `1px solid ${isSelected ? '#4edea3' : '#203a29'}`,
                    }}
                    onClick={() => setSelectedProperty(isSelected ? null : cell.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPropertyEmoji(cell.name)}</span>
                        <div>
                          <span className="text-xs font-bold block" style={{ color: '#e0d8c8' }}>{cell.name}</span>
                          <span className="text-[10px]" style={{ color: '#7a9a7a' }}>Harga beli: Rp {(cell.price || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold block" style={{ color: '#ffd56d' }}>
                          {Math.floor((cell.price || 0) * 0.5).toLocaleString('id-ID')}
                        </span>
                        <span className="text-[9px]" style={{ color: '#7a9a7a' }}>Jual ke bank</span>
                      </div>
                    </div>

                    {/* Sell Options */}
                    {isSelected && (
                      <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid #203a29' }}>
                        {/* Sell to Bank */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSellToBank(cell.name);
                          }}
                          className="w-full py-2 rounded-lg text-xs font-bold transition-all"
                          style={{ backgroundColor: '#152f1f', border: '1px solid #4edea3', color: '#4edea3' }}
                        >
                          🏦 Jual ke Bank (50% = Rp {Math.floor((cell.price || 0) * 0.5).toLocaleString('id-ID')})
                        </button>

                        {/* Sell to Player */}
                        {otherPlayers.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>Atau jual ke pemain:</span>
                            {otherPlayers.filter(p => !p.isBankrupt).map((buyer) => (
                              <button
                                key={buyer.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBuyer(buyer.id);
                                  onSellToPlayer(cell.name, buyer.id, Math.floor((cell.price || 0) * 0.5));
                                }}
                                className="w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between"
                                style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#ffd56d' }}
                              >
                                <span>👤 {buyer.name}</span>
                                <span>Rp {Math.floor((cell.price || 0) * 0.5).toLocaleString('id-ID')}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Loan Section */}
        {loanAmount > 0 && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid #203a29' }}>
            {!showLoanOption ? (
              <button
                onClick={() => setShowLoanOption(true)}
                className="w-full py-2.5 rounded-lg text-xs font-bold transition-all"
                style={{ backgroundColor: '#152f1f', border: '1px solid #38bdf8', color: '#38bdf8' }}
              >
                🏦 Ambil Pinjaman Bank (Rp {loanAmount.toLocaleString('id-ID')})
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#0d2e1a', border: '1px solid #38bdf8' }}>
                  <p className="text-xs" style={{ color: '#d1c5af' }}>
                    Pinjaman bank sebesar <strong style={{ color: '#38bdf8' }}>Rp {loanAmount.toLocaleString('id-ID')}</strong> akan ditambahkan ke saldo bersih kamu.
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: '#f87171' }}>
                    Pinjaman harus dibayar saat melewati Start!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onTakeLoan(loanAmount);
                      setShowLoanOption(false);
                    }}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{ backgroundColor: '#38bdf820', border: '1px solid #38bdf8', color: '#38bdf8' }}
                  >
                    ✅ Ambil Pinjaman
                  </button>
                  <button
                    onClick={() => {
                      onDeclineLoan();
                      setShowLoanOption(false);
                    }}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#7a9a7a' }}
                  >
                    ❌ Tidak
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid #203a29', backgroundColor: '#0d2e1a' }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>Total Nilai Properti</span>
              <span className="text-sm font-bold" style={{ color: '#ffd56d' }}>Rp {totalPropertyValue.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={onDeclineLoan}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ backgroundColor: '#f8717120', border: '1px solid #f87171', color: '#f87171' }}
            >
              💀 Menyerah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}