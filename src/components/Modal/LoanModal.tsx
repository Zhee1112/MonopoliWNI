'use client';

import { useState } from 'react';
import {
  Loan,
  BANK_LOAN_CONFIG,
  PINJOL_LOAN_CONFIG,
  calculateTotalAssets,
  calculateMaxLoanAmount,
  calculateLoanInterest,
  createLoan,
  LoanResult,
} from '@/lib/game/loan-system';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBorrow: (loan: Loan, amount: number) => void;
  playerId: string;
  currentTurn: number;
  cleanMoney: number;
  properties: Array<{ id: string; name: string; price?: number }>;
  existingLoans: Loan[];
}

export default function LoanModal({
  isOpen,
  onClose,
  onBorrow,
  playerId,
  currentTurn,
  cleanMoney,
  properties,
  existingLoans,
}: LoanModalProps) {
  const [selectedLender, setSelectedLender] = useState<'bank' | 'pinjol'>('bank');
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [selectedCollateral, setSelectedCollateral] = useState<string>('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const totalAssets = calculateTotalAssets(cleanMoney, properties);
  const maxLoan = calculateMaxLoanAmount(selectedLender, totalAssets, existingLoans);
  const { interestRate, interestAmount, totalOwed } = calculateLoanInterest(selectedLender, loanAmount || 0);
  const config = selectedLender === 'bank' ? BANK_LOAN_CONFIG : PINJOL_LOAN_CONFIG;

  const handleBorrow = () => {
    setError('');

    if (selectedLender === 'bank' && !selectedCollateral) {
      setError('Pilih properti jaminan untuk Bank BUMN!');
      return;
    }

    const result: LoanResult = createLoan(
      selectedLender,
      loanAmount,
      playerId,
      currentTurn,
      properties,
      existingLoans,
      cleanMoney,
      selectedCollateral || undefined
    );

    if (!result.success) {
      setError(result.error || 'Gagal meminjam');
      return;
    }

    if (result.loan) {
      onBorrow(result.loan, loanAmount);
      onClose();
    }
  };

  const activeLoans = existingLoans.filter((l) => l.isActive);
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.totalOwed, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001809]/90 backdrop-blur-md">
      <div className="relative z-20 w-full max-w-2xl mx-4 bg-[#0a1a11] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,213,109,0.25)] flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#092515] px-5 py-4 flex items-center justify-between border-b border-[#203a29]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <h1 className="text-lg font-bold text-[#cbead1]">Pinjaman</h1>
              <p className="text-xs text-[#d1c5af]">Bank BUMN &amp; Pinjol Ilegal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#152f1f] text-[#d1c5af] hover:text-[#ffd56d] hover:bg-[#203a29] transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Lender Selection */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Bank BUMN */}
            <button
              onClick={() => { setSelectedLender('bank'); setLoanAmount(0); setSelectedCollateral(''); setError(''); }}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedLender === 'bank'
                  ? 'bg-[#4edea3]/10 border-2 border-[#4edea3] shadow-[0_0_15px_rgba(78,222,163,0.15)]'
                  : 'bg-[#092215] border border-[#203a29] hover:border-[#4edea3]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏦</span>
                <span className="font-bold text-[#cbead1]">Bank BUMN</span>
              </div>
              <div className="space-y-1 text-xs text-[#d1c5af]">
                <p>✅ Bunga rendah (10%)</p>
                <p>⚠️ Perlu jaminan properti</p>
                <p>⏱️ Batas 10 giliran</p>
              </div>
            </button>

            {/* Pinjol Ilegal */}
            <button
              onClick={() => { setSelectedLender('pinjol'); setLoanAmount(0); setSelectedCollateral(''); setError(''); }}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedLender === 'pinjol'
                  ? 'bg-[#f87171]/10 border-2 border-[#f87171] shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                  : 'bg-[#092215] border border-[#203a29] hover:border-[#f87171]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📱</span>
                <span className="font-bold text-[#cbead1]">Pinjol Ilegal</span>
              </div>
              <div className="space-y-1 text-xs text-[#d1c5af]">
                <p>✅ Tanpa jaminan</p>
                <p>⚠️ Bunga tinggi (25%)</p>
                <p>⚠️ 15% risiko aset disita</p>
              </div>
            </button>
          </div>

          {/* Property Collateral Selector (Bank only) */}
          {selectedLender === 'bank' && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#93c5a7] uppercase tracking-wider mb-2">
                🏠 Pilih Properti Jaminan
              </label>
              {properties.length === 0 ? (
                <div className="rounded-lg bg-[#93000a]/20 border border-[#93000a]/40 p-3">
                  <p className="text-xs text-[#f87171] font-semibold">❌ Tidak ada properti! Bank BUMN membutuhkan jaminan properti.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {properties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => { setSelectedCollateral(prop.id); setError(''); }}
                      className={`p-3 rounded-lg flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        selectedCollateral === prop.id
                          ? 'bg-[#4edea3]/10 border-2 border-[#4edea3] shadow-[0_0_10px_rgba(78,222,163,0.1)]'
                          : 'bg-[#092215] border border-[#203a29] hover:border-[#4edea3]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedCollateral === prop.id
                            ? 'border-[#4edea3] bg-[#4edea3]'
                            : 'border-[#203a29]'
                        }`}>
                          {selectedCollateral === prop.id && (
                            <div className="w-2 h-2 rounded-full bg-[#003824]" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#cbead1]">{prop.name}</span>
                          {prop.price && (
                            <span className="text-[10px] text-[#93c5a7]">Nilai: Rp {prop.price.toLocaleString('id-ID')}</span>
                          )}
                        </div>
                      </div>
                      {selectedCollateral === prop.id && (
                        <span className="px-2 py-0.5 rounded bg-[#4edea3] text-[#003824] text-[10px] font-bold">JAMINAN</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loan Amount Input */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#93c5a7] uppercase tracking-wider mb-2">Jumlah Pinjaman</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={loanAmount || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setLoanAmount(val);
                  setError('');
                }}
                className="flex-1 bg-[#071d11] border border-[#203a29] focus:border-[#4edea3] text-white text-sm rounded-lg px-4 py-3 focus:outline-none transition-colors font-mono"
                placeholder="Masukkan jumlah..."
                min={0}
                max={maxLoan}
              />
              <button
                onClick={() => setLoanAmount(maxLoan)}
                className="px-4 py-2 bg-[#152f1f] border border-[#203a29] text-[#ffd56d] text-xs font-bold rounded-lg hover:bg-[#203a29] transition-colors"
              >
                MAX
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-[#93c5a7]">
              <span>Maksimal: Rp {maxLoan.toLocaleString('id-ID')}</span>
              <span>Total Aset: Rp {totalAssets.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 mb-5">
            {[0.25, 0.50, 0.75, 1.0].map((ratio) => {
              const amount = Math.floor(maxLoan * ratio);
              return (
                <button
                  key={ratio}
                  onClick={() => { setLoanAmount(amount); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    loanAmount === amount
                      ? 'bg-[#ffd56d] text-[#3e2e00]'
                      : 'bg-[#152f1f] border border-[#203a29] text-[#d1c5af] hover:border-[#ffd56d]/50'
                  }`}
                >
                  {ratio * 100}%
                </button>
              );
            })}
          </div>

          {/* Loan Summary */}
          {loanAmount > 0 && (
            <div className="rounded-xl bg-[#152f1f] p-4 mb-5 border border-[#203a29]">
              <h3 className="text-xs font-bold text-[#d1c5af] uppercase tracking-wider mb-3">Ringkasan Pinjaman</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                  <span className="text-sm text-[#cbead1]">Pokok Pinjaman</span>
                  <span className="text-sm font-bold text-[#ffd56d] font-mono">Rp {loanAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                  <span className="text-sm text-[#cbead1]">Bunga ({interestRate * 100}%)</span>
                  <span className="text-sm font-bold text-[#f87171] font-mono">+Rp {interestAmount.toLocaleString('id-ID')}</span>
                </div>
                {selectedLender === 'bank' && selectedCollateral && (
                  <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                    <span className="text-sm text-[#cbead1]">Jaminan</span>
                    <span className="text-sm font-bold text-[#4edea3]">🏠 {properties.find(p => p.id === selectedCollateral)?.name}</span>
                  </div>
                )}
                <div className="h-0.5 w-full bg-[#203a29] my-1" />
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#4edea3]/10">
                  <span className="text-sm font-bold text-[#cbead1]">Total Hutang</span>
                  <span className="text-sm font-bold text-[#4edea3] font-mono">Rp {totalOwed.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 p-3 mb-4">
              <p className="text-xs text-[#f87171] font-semibold">{error}</p>
            </div>
          )}

          {/* Active Loans */}
          {activeLoans.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-[#d1c5af] uppercase tracking-wider mb-2">Pinjaman Aktif</h3>
              <div className="space-y-2">
                {activeLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className={`p-3 rounded-lg border ${
                      loan.lender === 'bank'
                        ? 'bg-[#4edea3]/5 border-[#4edea3]/30'
                        : 'bg-[#f87171]/5 border-[#f87171]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{loan.lender === 'bank' ? '🏦' : '📱'}</span>
                        <span className="text-xs font-bold text-[#cbead1]">{loan.lender === 'bank' ? 'Bank BUMN' : 'Pinjol'}</span>
                        {loan.collateralPropertyId && (
                          <span className="text-[10px] text-[#93c5a7]">• Jaminan: {loan.collateralPropertyId}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#ffd56d] font-mono">Rp {loan.totalOwed.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#092515] px-5 py-4 border-t border-[#203a29] flex items-center justify-between">
          <div className="text-xs text-[#93c5a7]">
            {selectedLender === 'bank' ? '🏦 Bank BUMN' : '📱 Pinjol Ilegal'} &bull; Bunga {interestRate * 100}%
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#152f1f] border border-[#203a29] text-[#d1c5af] text-xs font-bold rounded-lg hover:bg-[#203a29] transition-colors"
            >
              BATAL
            </button>
            <button
              onClick={handleBorrow}
              disabled={loanAmount <= 0 || loanAmount > maxLoan || (selectedLender === 'bank' && !selectedCollateral)}
              className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                loanAmount > 0 && loanAmount <= maxLoan && (selectedLender === 'pinjol' || selectedCollateral)
                  ? selectedLender === 'bank'
                    ? 'bg-[#4edea3] text-[#002b18] hover:bg-[#6ffbbe] active:scale-95 shadow-[2px_2px_0_0_#000]'
                    : 'bg-[#f87171] text-white hover:bg-[#ef4444] active:scale-95 shadow-[2px_2px_0_0_#000]'
                  : 'bg-[#203a29] text-[#9a907c] cursor-not-allowed'
              }`}
            >
              PINJAM Rp {(loanAmount || 0).toLocaleString('id-ID')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
