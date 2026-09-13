'use client';

import { useState } from 'react';
import { BoardCell } from '@/lib/types';

interface GameEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  cell: BoardCell;
  diceResult?: { dice1: number; dice2: number; total: number };
  playerName: string;
  playerLevel?: number;
  playerRank?: string;
  rollResult?: {
    baseDice: number;
    statBonus: number;
    luckBonus: number;
    evidenceBonus: number;
    totalScore: number;
    dcTarget: number;
    passed: boolean;
    margin: number;
  };
  eventCard?: {
    title: string;
    description: string;
    reward?: string;
    expReward?: number;
  };
  turnNumber?: number;
}

const EVIDENCE_OPTIONS = [
  {
    id: 'kwitansi',
    name: 'Kwitansi Setoran Pajak Resmi',
    effect: '+1 Pertahanan DC / Pembuktian Sah',
    unlocked: true,
  },
  {
    id: 'rekaman',
    name: 'Rekaman Obrolan Oknum',
    effect: '+2 Persuasi (Membutuhkan Pengacara)',
    unlocked: false,
  },
  {
    id: 'mutasi',
    name: 'Mutasi Rekening Bersih',
    effect: '+1 Skor Kelicinan',
    unlocked: false,
  },
];

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
      className="relative w-20 h-20 rounded-xl bg-[#FBF8EE] text-[#07190F] p-3 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(0,0,0,0.2)] hover:rotate-0 transition-transform duration-200"
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

export default function GameEventModal({
  isOpen,
  onClose,
  onContinue,
  cell,
  diceResult,
  playerName,
  playerLevel = 1,
  playerRank = 'Magang',
  rollResult,
  eventCard,
  turnNumber = 1,
}: GameEventModalProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  if (!isOpen) return null;

  const d1 = diceResult?.dice1 || 3;
  const d2 = diceResult?.dice2 || 4;
  const baseDice = rollResult?.baseDice || d1 + d2;
  const statBonus = rollResult?.statBonus || 0;
  const luckBonus = rollResult?.luckBonus || 0;
  const evidenceBonus = rollResult?.evidenceBonus || (selectedEvidence ? 1 : 0);
  const totalScore = rollResult?.totalScore || baseDice + statBonus + luckBonus + evidenceBonus;
  const dcTarget = rollResult?.dcTarget || 10;
  const passed = rollResult?.passed || totalScore >= dcTarget;
  const margin = rollResult?.margin || totalScore - dcTarget;

  const cellName = cell.name || 'Petak Misterius';
  const isTax = cell.type === 'tax';
  const isDraw = cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001809]/90 backdrop-blur-md">
      {/* Background Board Atmosphere */}
      <div className="absolute inset-0 opacity-25 pointer-events-none select-none">
        <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-2 p-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="bg-[#152f1f] rounded-lg p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#ffd56d]">PETAK {i + 1}</span>
              <span className="text-xs text-[#cbead1]">...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dark Scrim */}
      <div className="absolute inset-0 bg-[#001809]/80 backdrop-blur-sm z-10" />

      {/* Main Modal */}
      <div className="relative z-20 w-full max-w-5xl mx-4 bg-[#0a1a11] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,213,109,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#092515] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#152f1f] flex items-center justify-center text-[#ffd56d] shadow-[inset_0_1px_1px_rgba(255,213,109,0.4)]">
              <span className="text-2xl">&#x1F3B2;</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#ffd56d] uppercase tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>Uji Stat &amp; Manuver Meja</span>
                <span className="px-2 py-0.5 rounded bg-[#00a572]/30 text-[#4edea3] text-[11px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>FASE AKSI</span>
              </div>
              <h1 className="text-lg font-bold text-[#cbead1] tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{cellName}</h1>
              <p className="text-xs text-[#d1c5af]">Petak {cell.index} &bull; {isTax ? 'Bayar Denda' : isDraw ? 'Ambil Kartu' : 'Event Khusus'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#001206]">
              <div className="w-6 h-6 rounded-full bg-[#e5b842] flex items-center justify-center">
                <span className="text-[#614900] text-xs font-bold">&#x1F9D1;</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#cbead1]">{playerName}</span>
                <span className="text-[10px] text-[#ffd56d] font-bold">Lv {playerLevel} {playerRank}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#152f1f] text-[#d1c5af] hover:text-[#ffd56d] hover:bg-[#203a29] transition-colors flex items-center justify-center"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* LEFT: Dice + Evidence */}
          <div className="lg:col-span-5 p-5 flex flex-col gap-5 bg-[#0a1a11]/60">
            {/* Dice Display */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#d1c5af] uppercase tracking-wider">Hasil Lemparan Dadu</span>
                <span className="px-2.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-xs font-semibold flex items-center gap-1">
                  &#x2705; Sukses Bergulir
                </span>
              </div>
              <div className="relative w-full h-44 rounded-xl bg-[#001206] flex items-center justify-center gap-6 overflow-hidden p-4 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]">
                <div className="absolute w-40 h-40 rounded-full bg-[#ffd56d]/10 blur-xl pointer-events-none" />
                <div className="relative">
                  <Dice3D value={d1} rotation="rotate(-6deg)" />
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-[#ffd56d] text-[#3e2e00] text-[10px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>D1: {d1}</span>
                </div>
                <div className="text-[#ffd56d] text-xl font-bold select-none">+</div>
                <div className="relative">
                  <Dice3D value={d2} rotation="rotate(12deg)" />
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-[#ffd56d] text-[#3e2e00] text-[10px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>D2: {d2}</span>
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-lg bg-[#152f1f] flex items-center justify-between">
                <span className="text-xs text-[#d1c5af]">Langkah Alami:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#ffd56d]">{d1} + {d2} = {d1 + d2} Langkah</span>
                  <span className="text-[#9a907c] text-xs">&bull; {d1 === d2 ? 'GANDA!' : 'Non-Ganda'}</span>
                </div>
              </div>
            </div>

            {/* Evidence Selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#ffd56d] uppercase tracking-wider">Sisipkan Bukti Warga (Slot 1/1)</span>
                <span className="text-xs text-[#4edea3]">Terapkan Buff</span>
              </div>
              {EVIDENCE_OPTIONS.map((evidence) => (
                <div
                  key={evidence.id}
                  onClick={() => evidence.unlocked && setSelectedEvidence(selectedEvidence === evidence.id ? null : evidence.id)}
                  className={`p-3 rounded-lg flex items-center justify-between gap-3 transition-all ${
                    selectedEvidence === evidence.id
                      ? 'bg-[#203a29] cursor-pointer shadow-[0_2px_0_0_#4edea3]'
                      : evidence.unlocked
                        ? 'bg-[#092515] hover:bg-[#152f1f] cursor-pointer'
                        : 'bg-[#092515] opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                      selectedEvidence === evidence.id
                        ? 'bg-[#4edea3] text-[#003824]'
                        : 'bg-[#001206] text-[#9a907c]'
                    }`}>
                      {selectedEvidence === evidence.id ? '&#x2713;' : ''}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#cbead1]">{evidence.name}</span>
                      <span className="text-xs text-[#4edea3]">{evidence.effect}</span>
                    </div>
                  </div>
                  {!evidence.unlocked && <span className="text-[#9a907c]">&#x1F512;</span>}
                  {selectedEvidence === evidence.id && <span className="px-2 py-0.5 rounded bg-[#001206] text-[#ffd56d] text-[10px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>AKTIF</span>}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: RPG Calculation + Event Card */}
          <div className="lg:col-span-7 p-5 flex flex-col gap-5">
            {/* RPG Ledger */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#d1c5af] uppercase tracking-wider">Kalkulasi Roll RPG (D&amp;D Format)</span>
                <span className="text-[11px] text-[#9a907c] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>ATURAN BABAK #{turnNumber}</span>
              </div>
              <div className="rounded-xl bg-[#152f1f] p-4 flex flex-col gap-2">
                {/* Base Dice */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ffd56d]">&#x1F3B2;</span>
                    <span className="text-sm text-[#cbead1]">Nilai Dadu Dasar (D1 + D2)</span>
                  </div>
                  <span className="text-sm font-bold text-[#ffd56d] font-mono">+{baseDice}</span>
                </div>

                {/* Stat Bonus */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#4edea3]">&#x1F9E0;</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#cbead1]">Stat Negosiasi Warga (Lv {playerLevel})</span>
                      <div className="w-16 h-2 rounded bg-[#0a1a11] overflow-hidden hidden sm:block">
                        <div className="h-full bg-[#4edea3] rounded" style={{ width: `${Math.min(100, (statBonus / 5) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#4edea3] font-mono">+{statBonus}</span>
                </div>

                {/* Luck Bonus */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ffd56d]">&#x2B50;</span>
                    <span className="text-sm text-[#cbead1]">Modifikator Hoki Netizen (Rasio 45%)</span>
                  </div>
                  <span className="text-sm font-bold text-[#ffd56d] font-mono">+{luckBonus}</span>
                </div>

                {/* Evidence Bonus */}
                {selectedEvidence && (
                  <div className="flex items-center justify-between py-1.5 px-2 rounded bg-[#001206]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#4edea3]">&#x1F4CB;</span>
                      <span className="text-sm text-[#cbead1]">Bukti Dilampirkan: Kwitansi Sah</span>
                    </div>
                    <span className="text-sm font-bold text-[#4edea3] font-mono">+{evidenceBonus}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="h-0.5 w-full bg-[#4e4635]/40 my-1" />

                {/* Score Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-[#092515] flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-[#d1c5af] uppercase font-semibold tracking-wider">TOTAL SKOR ROLL</span>
                    <div className="flex items-baseline justify-center gap-1.5 my-1">
                      <span className="text-3xl font-extrabold text-[#ffd56d]">{totalScore}</span>
                      <span className="text-xs text-[#4edea3] font-bold">POIN</span>
                    </div>
                    <span className="text-xs text-[#d1c5af]">Formula: {baseDice} + {statBonus} + {luckBonus} + {evidenceBonus}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#092515] flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-[#d1c5af] uppercase font-semibold tracking-wider">AMBANG TARGET (DC)</span>
                    <div className="flex items-baseline justify-center gap-1.5 my-1">
                      <span className="text-3xl font-extrabold text-[#cbead1]">{dcTarget}</span>
                      <span className="text-xs text-[#9a907c] font-bold">DC</span>
                    </div>
                    <span className={`text-xs font-bold ${passed ? 'text-[#4edea3]' : 'text-[#f87171]'}`}>
                      {passed ? `+${margin} Di Atas Ambang` : `${Math.abs(margin)} Di Bawah Ambang`}
                    </span>
                  </div>
                </div>

                {/* Result Strip */}
                <div className={`mt-1 p-2.5 rounded-lg flex items-center justify-between ${
                  passed ? 'bg-[#00a572]/20' : 'bg-[#93000a]/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${passed ? 'text-[#4edea3]' : 'text-[#f87171]'}`}>
                      {passed ? '&#x2705;' : '&#x274C;'}
                    </span>
                    <span className={`text-sm font-bold ${passed ? 'text-[#4edea3]' : 'text-[#f87171]'}`} style={{ fontFamily: "'Syne', sans-serif" }}>
                      UJI {isTax ? 'DENDA' : 'TIPiring'}: {passed ? 'LOLOS SEPENUHNYA!' : 'GAGAL!'}
                    </span>
                  </div>
                  <span className="text-xs text-[#cbead1] bg-[#152f1f] px-2 py-0.5 rounded">
                    {passed ? 'Bebas Denda' : `Bayar Denda`}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Card */}
            {eventCard && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#ffd56d] uppercase tracking-wider">Kartu Kejutan Terbuka</span>
                  <span className="text-[11px] text-[#4edea3] font-mono">SERI #042</span>
                </div>
                <div className="rounded-xl bg-[#FBF8EE] text-[#07190F] p-4 shadow-[4px_4px_0_0_#001206] flex flex-col gap-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-[#07190F]/20">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#E5B842] text-[#07190F] text-[10px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>KARTU WNI</span>
                      <span className="text-xs font-semibold text-[#07190F]/70">Kelas Menengah Ngehe</span>
                    </div>
                    <span className="text-[#07190F]/50">&#x1F0CF;</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-lg bg-[#07190F]/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl">&#x1F4B0;</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-[#07190F] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{eventCard.title}</h2>
                      <p className="text-xs text-[#07190F]/80 leading-snug">{eventCard.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#07190F]/20">
                    <div className="flex items-center gap-3">
                      {eventCard.reward && (
                        <span className="text-xs font-bold text-[#00603b] flex items-center gap-1">
                          &#x1F4B5; {eventCard.reward}
                        </span>
                      )}
                      {eventCard.expReward && (
                        <span className="text-xs font-bold text-[#b45309] flex items-center gap-1">
                          &#x1F3C6; +{eventCard.expReward} EXP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#07190F]/40 font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>MONOPOLI WNI EDITION</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-[#092515] px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#203a29]">
          <div className="flex items-center gap-2 text-[#d1c5af] text-xs">
            <span className="text-[#4edea3] animate-spin">&#x21BB;</span>
            <span>Eksekusi bidak otomatis dalam <strong className="text-[#ffd56d] font-mono font-bold">14 detik</strong></span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#152f1f] text-[#cbead1] hover:bg-[#203a29] transition-colors text-sm font-semibold flex items-center gap-1.5 border border-[#203a29]"
            >
              &#x1F4DC; Audit Log Meja
            </button>
            <button
              onClick={onContinue}
              className="px-6 py-2.5 rounded-lg bg-[#ffd56d] text-[#3e2e00] hover:bg-[#eec14a] transition-all transform active:scale-95 text-sm font-bold shadow-[2px_2px_0_0_#000] flex items-center gap-2"
            >
              Lanjut Langkah ({d1 + d2} Petak)
              <span>&#x2192;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
