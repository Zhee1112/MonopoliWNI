'use client';

import { useState } from 'react';
import { BoardCell, Card, KegiatanCard } from '@/lib/types';

interface GameEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onEvidenceSelect?: (bonus: number) => void;
  onBribe?: () => void;
  cell: BoardCell;
  diceResult?: { dice1: number; dice2: number; total: number };
  playerName: string;
  playerLevel?: number;
  playerRank?: string;
  playerCleanMoney?: number;
  bribed?: boolean;
  playerEvidence?: Array<{ id?: string; bonusModifier?: number }>;
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
  takdirCard?: Card;
  kegiatanCard?: KegiatanCard;
  ppnAmount?: number;
  turnNumber?: number;
}

const EVIDENCE_LABELS: Record<string, { name: string; effect: string; emoji: string }> = {
  kwitansi_pajak: { name: 'Kwitansi Pajak Resmi', effect: '+1 Pertahanan DC', emoji: '🧾' },
  rekaman_oknum: { name: 'Rekaman Oknum', effect: '+2 Persuasi', emoji: '🎙️' },
  mutasi_rekening: { name: 'Mutasi Rekening', effect: '+1 Kelicinan', emoji: '💳' },
  screenshot_viral: { name: 'Screenshot Viral', effect: '+2 Pertahanan DC', emoji: '📸' },
  saksi_mata: { name: 'Saksi Mata', effect: '+3 Persuasi', emoji: '👁️' },
  dokumen_resmi: { name: 'Dokumen Resmi', effect: '+4 Pertahanan DC', emoji: '📋' },
  rekening_koran: { name: 'Rekening Koran', effect: '+5 Kelicinan', emoji: '🏦' },
  bukti_viral: { name: 'Bukti Viral', effect: '+3 Pertahanan DC', emoji: '📱' },
};

const TIER_LABELS: Record<string, string> = { ringan: 'Kelas Ringan', sedang: 'Kelas Sedang', berat: 'Kelas Berat', legendary: 'Kelas Legendaris' };
const TIER_COLORS: Record<string, string> = { ringan: 'bg-[#4edea3] text-[#003824]', sedang: 'bg-[#ffd56d] text-[#3e2e00]', berat: 'bg-[#f87171] text-[#450a0a]', legendary: 'bg-[#a855f7] text-[#fff]' };
const CATEGORY_ICONS: Record<string, string> = { event_normal: '📋', event_meme: '😂', interaksi: '🤝', koruptor: '🚨', audit: '🔍', legendary: '👑', usaha: '💼', kerja_sampingan: '🔨', investasi: '📈', sosial: '🤝', tantangan: '🎯' };

function DiceFace({ value }: { value: number }) {
  const posMap: Record<string, string> = {
    'top-left': 'col-start-1 row-start-1', 'top-right': 'col-start-3 row-start-1',
    'center-left': 'col-start-1 row-start-2', 'center-center': 'col-start-2 row-start-2', 'center-right': 'col-start-3 row-start-2',
    'bottom-left': 'col-start-1 row-start-3', 'bottom-right': 'col-start-3 row-start-3',
  };
  const positions: Record<number, string[]> = {
    1: ['center-center'], 2: ['top-right', 'bottom-left'], 3: ['top-right', 'center-center', 'bottom-left'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center-center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-right'],
  };
  const dots = positions[value] || positions[1];
  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 p-3 sm:p-4 shadow-[0_8px_18px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(0,0,0,0.15)]">
      <div className="w-full h-full grid grid-cols-3 grid-rows-3">
        {dots.map((pos, i) => (
          <div key={i} className={posMap[pos] + ' w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.7)]'} />
        ))}
      </div>
    </div>
  );
}

export default function GameEventModal({
  isOpen, onClose, onContinue, onEvidenceSelect, onBribe, cell, diceResult, playerName, playerLevel = 1,
  playerRank = 'Magang', playerEvidence = [], rollResult, takdirCard, kegiatanCard, ppnAmount = 0, turnNumber = 1,
  playerCleanMoney = 0, bribed = false,
}: GameEventModalProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  if (!isOpen) return null;

  const bribeCost = Math.max(50000, Math.floor(playerCleanMoney * 0.15));
  const isEventCell = cell.type === 'event' && !takdirCard && !kegiatanCard && !ppnAmount;
  const canBribe = isEventCell && !bribed && !rollResult?.passed;

  const d1 = diceResult?.dice1 ?? 3;
  const d2 = diceResult?.dice2 ?? 4;
  const baseDice = rollResult?.baseDice ?? (d1 + d2);
  const statBonus = rollResult?.statBonus ?? 0;
  const luckBonus = rollResult?.luckBonus ?? 0;
  const evidenceBonus = rollResult?.evidenceBonus ?? (selectedEvidence ? (playerEvidence.find(e => e.id === selectedEvidence)?.bonusModifier || 1) : 0);
  const totalScore = rollResult?.totalScore ?? (baseDice + statBonus + luckBonus + evidenceBonus);
  const dcTarget = rollResult?.dcTarget ?? 10;
  const passed = rollResult?.passed ?? (totalScore >= dcTarget);
  const margin = rollResult?.margin ?? (totalScore - dcTarget);
  const cellName = cell.name || 'Petak Misterius';
  const isTax = cell.type === 'tax';
  const isKegiatan = !!kegiatanCard;
  const isEventOrCorner = cell.type === 'event' || cell.type === 'corner';
  const showEventCard = isEventOrCorner && !takdirCard && !kegiatanCard;

  const headerLabel = isKegiatan ? 'KEGIATAN WNI' : takdirCard ? 'TAKDIR WNI' : 'AKSI';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05140b] text-slate-100 antialiased overflow-hidden">
      {/* Header */}
      <header className="w-full bg-[#071e11]/90 backdrop-blur-md border-b border-[#1c452e] shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#123e25] to-[#0a2617] border border-[#2a5e40] flex items-center justify-center text-2xl shadow-inner select-none">🎲</div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ffd56d]">Uji Stat &amp; Manuver Meja</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-[#4edea3] border border-emerald-700/60">FASE AKSI: {headerLabel}</span>
              </div>
              <p className="text-sm font-semibold text-emerald-200/90 flex items-center gap-1.5 mt-0.5">
                <span>{cellName}</span>
                <span className="text-emerald-500">•</span>
                <span className="text-slate-300">Petak {cell.index}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex bg-[#0c2718] border border-[#204a32] rounded-xl pl-2.5 pr-4 py-1.5 items-center space-x-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-base">🪪</div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-white tracking-wide block">{playerName}</span>
                <span className="text-[11px] font-medium text-[#ffd56d]/90">Lv {playerLevel} {playerRank}</span>
              </div>
            </div>
            <button onClick={onContinue} className="w-10 h-10 rounded-xl bg-[#0e2c1c] border border-[#204a32] text-slate-300 hover:text-white hover:border-[#4edea3]/60 transition-all flex items-center justify-center text-sm active:scale-95">✕</button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Dice Result Card */}
              <section className="bg-[#0c2718] border border-[#1c452e] rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#4edea3]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#4edea3]" /> Hasil Lemparan Dadu
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">✅ Sukses Bergulir</span>
                </div>
                <div className="bg-[#07190f] border border-[#173d28] rounded-xl p-6 flex flex-col items-center justify-center relative shadow-inner">
                  <div className="flex items-center justify-center gap-6 my-2">
                    <div className="relative group">
                      <div className="absolute -top-2.5 right-2 bg-[#f59e0b] text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow z-10">D1: {d1}</div>
                      <div className="rotate-[-3deg] transition-transform duration-300 hover:rotate-0"><DiceFace value={d1} /></div>
                    </div>
                    <div className="text-[#ffd56d] font-bold text-2xl select-none">+</div>
                    <div className="relative group">
                      <div className="absolute -top-2.5 right-2 bg-[#f59e0b] text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow z-10">D2: {d2}</div>
                      <div className="rotate-[4deg] transition-transform duration-300 hover:rotate-0"><DiceFace value={d2} /></div>
                    </div>
                  </div>
                  <div className="w-full mt-4 bg-[#0c2718]/90 border border-[#204a32] py-2.5 px-4 rounded-lg flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400 font-medium">Langkah Alami:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-white">{d1} + {d2} =</span>
                      <span className="text-[#ffd56d] text-base">{d1 + d2} Langkah</span>
                      <span className="text-slate-500 font-normal ml-1 text-xs">• {d1 === d2 ? 'GANDA!' : 'Non-Ganda'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Buff Inventory Card */}
              <section className="bg-[#0c2718] border border-[#1c452e] rounded-2xl p-5 shadow-lg flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#ffd56d] flex items-center gap-1.5">
                        <span>Sisipkan Bukti Warga</span>
                        <span className="text-slate-400 font-normal">(Slot {playerEvidence.length > 0 ? 1 : 0}/{Math.max(1, playerEvidence.length)})</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">Pilih inventaris legal untuk meningkatkan probabilitas lolos</p>
                    </div>
                    <span className="text-xs font-bold text-[#4edea3] bg-[#4edea3]/10 px-2.5 py-1 rounded-md border border-[#4edea3]/20">Terapkan Buff</span>
                  </div>
                  <div className="space-y-2.5">
                    {playerEvidence.length === 0 ? (
                      <div className="text-center py-6 text-[#588568]">
                        <div className="text-2xl mb-2">📦</div>
                        <div className="text-xs">Belum ada bukti. Dapatkan dari kartu Takdir!</div>
                      </div>
                    ) : (
                      playerEvidence.map((ev, idx) => {
                        const evId = ev.id || `ev_${idx}`;
                        const label = EVIDENCE_LABELS[evId] || { name: evId, effect: `+${ev.bonusModifier || 1}`, emoji: '📄' };
                        const isActive = selectedEvidence === evId;
                        return (
                          <div key={evId} onClick={() => {
                            const newSelected = isActive ? null : evId;
                            setSelectedEvidence(newSelected);
                            onEvidenceSelect?.(newSelected ? (playerEvidence.find(e => (e.id || `ev_${playerEvidence.indexOf(e)}`) === newSelected)?.bonusModifier || 0) : 0);
                          }} className={`relative rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#123b24] to-[#0c2919] border-2 border-[#4edea3]/80 shadow-[0_0_20px_rgba(78,222,163,0.25)]'
                              : 'bg-[#081b11]/70 border border-[#163623] hover:bg-[#0c2919]'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${isActive ? 'bg-[#4edea3] text-slate-950' : 'bg-black/40 border border-slate-700'}`}>{label.emoji}</div>
                              <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                  {label.name}
                                  {isActive && <span className="bg-emerald-800 text-[10px] text-[#4edea3] font-semibold px-1.5 py-0.2 rounded">Aktif</span>}
                                </h3>
                                <p className="text-xs text-[#4edea3] font-medium mt-0.5">{label.effect}</p>
                              </div>
                            </div>
                            {isActive && <span className="text-xs font-bold text-[#ffd56d] px-2 py-1 bg-black/25 rounded">+{ev.bonusModifier || 1}</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 italic text-center">*Bukti diperoleh dari kartu Takdir. Pilih sebelum roll untuk bonus.</p>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* RPG Calculation Card */}
              <section className="bg-[#0c2718] border border-[#1c452e] rounded-2xl p-5 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#183d28] pb-3 mb-4">
                  <h2 className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#ffd56d] rotate-45" /> Kalkulasi Roll RPG (D&amp;D Format)
                  </h2>
                  <span className="text-xs font-semibold text-[#ffd56d] uppercase tracking-wider">Aturan Babak #{turnNumber}</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-[#081c11] border border-[#1b422a] rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎲</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Nilai Dadu Dasar (D1 + D2)</div>
                        <div className="text-[11px] text-slate-400">Lemparan alami pemain</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#4edea3] text-sm font-mono">+{baseDice}</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#081c11] border border-[#1b422a] rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🧠</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">Stat Negosiasi Warga (Lv {playerLevel})</span>
                          <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden inline-block">
                            <div className="h-full bg-[#4edea3] rounded" style={{ width: Math.min(100, (statBonus / 5) * 100) + '%' }} />
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400">Profisiensi kelas {playerRank}</div>
                      </div>
                    </div>
                    <span className="font-bold text-slate-300 text-sm font-mono">+{statBonus}</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#081c11] border border-[#1b422a] rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⭐</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Modifikator Hoki Netizen (Rasio 45%)</div>
                        <div className="text-[11px] text-slate-400">Sentimen positif media sosial</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#ffd56d] text-sm font-mono">+{luckBonus}</span>
                  </div>
                  {selectedEvidence && (
                    <div className="flex items-center justify-between bg-[#081c11] border border-[#1b422a] rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📄</span>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Bukti Dilampirkan: Kwitansi Sah</div>
                          <div className="text-[11px] text-slate-400">Pembuktian dokumen resmi</div>
                        </div>
                      </div>
                      <span className="font-bold text-[#4edea3] text-sm font-mono">+{evidenceBonus}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3.5 mt-5">
                  <div className="bg-gradient-to-br from-[#0e2d1c] to-[#07180f] border border-[#4edea3]/50 rounded-xl p-3.5 text-center flex flex-col justify-center">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Skor Roll</div>
                    <div className="text-3xl sm:text-4xl font-black text-[#ffd56d] my-0.5 tracking-tight flex items-baseline justify-center gap-1.5">
                      {totalScore} <span className="text-xs font-bold text-[#4edea3] uppercase">Poin</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">Formula: {baseDice} + {statBonus} + {luckBonus} + {evidenceBonus}</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#0e2d1c] to-[#07180f] border border-[#235035] rounded-xl p-3.5 text-center flex flex-col justify-center">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ambang Target (DC)</div>
                    <div className="text-3xl sm:text-4xl font-black text-white my-0.5 tracking-tight flex items-baseline justify-center gap-1.5">
                      {dcTarget} <span className="text-xs font-bold text-slate-400 uppercase">DC</span>
                    </div>
                    <div className={"text-[11px] font-bold mt-0.5 " + (passed ? 'text-[#4edea3]' : 'text-[#f87171]')}>
                      {passed ? '+' + margin + ' Di Atas Ambang' : Math.abs(margin) + ' Di Bawah Ambang'}
                    </div>
                  </div>
                </div>
                <div className={"mt-4 border-2 rounded-xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-lg " + (passed ? 'bg-[#0a351e] border-[#4edea3]/70' : 'bg-[#3b0a0a] border-[#f87171]/70')}>
                  <div className="flex items-center gap-2.5">
                    <div className={"w-6 h-6 rounded flex items-center justify-center font-bold text-sm " + (passed ? 'bg-[#4edea3] text-black' : 'bg-[#f87171] text-white')}>
                      {passed ? '✓' : '✕'}
                    </div>
                    <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                      UJI {isTax ? 'PPN 12%' : 'TIPIRING'}: {passed ? 'LOLOS SEPENUHNYA!' : 'GAGAL!'}
                    </span>
                  </div>
                  <span className="bg-black/30 border border-current text-xs font-bold px-3 py-1 rounded-full text-slate-300">
                    {passed ? 'Bebas PPN Rp ' + ppnAmount.toLocaleString('id-ID') : 'Bayar PPN Rp ' + ppnAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </section>

              {/* Event/Corner Cell Card */}
              {showEventCard && (
                <section className="bg-[#0c2718] border border-[#1c452e] rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-wider text-[#ffd56d] uppercase flex items-center gap-2">
                      <span>{cell.emoji || '📋'}</span> Efek Petak
                    </h2>
                    <span className="text-xs font-mono font-bold text-slate-400">{cell.emoji}</span>
                  </div>
                  <div className="bg-white text-slate-900 rounded-xl p-4 sm:p-5 shadow-md border-t-4 border-emerald-600">
                    <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">{cell.emoji} {cell.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">{cell.description}</p>
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 w-fit">
                        <span>Efek Petak Aktif</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Takdir Card */}
              {takdirCard && (
                <section className="bg-[#0c2718] border border-[#1c452e] rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-wider text-[#ffd56d] uppercase flex items-center gap-2"><span>🃏</span> Kartu Takdir Terbuka</h2>
                    <span className="text-xs font-mono font-bold text-slate-400">{takdirCard.id.toUpperCase()}</span>
                  </div>
                  <div className="bg-white text-slate-900 rounded-xl p-4 sm:p-5 shadow-md border-t-4 border-amber-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#E5B842] text-white text-[11px] font-extrabold px-2.5 py-1 rounded tracking-wide uppercase">TAKDIR WNI</span>
                        <span className={"px-2 py-0.5 rounded text-[11px] font-bold " + (TIER_COLORS[takdirCard.tier] || '')}>{TIER_LABELS[takdirCard.tier]}</span>
                      </div>
                      <span className="text-2xl">{CATEGORY_ICONS[takdirCard.category] || '📋'}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-950">{CATEGORY_ICONS[takdirCard.category] || '📋'} {takdirCard.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">&ldquo;{takdirCard.flavorText}&rdquo;</p>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {takdirCard.effect.value !== undefined && takdirCard.effect.value !== 0 && (
                          <span className={"text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded border " + (takdirCard.effect.value > 0 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-800 bg-red-50 border-red-200')}>
                            {takdirCard.effect.value > 0 ? '💵 Efek:' : '💸 Efek:'} {takdirCard.effect.value > 0 ? '+' : ''}Rp {Math.abs(takdirCard.effect.value).toLocaleString('id-ID')}
                          </span>
                        )}
                        {takdirCard.effect.special && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">✨ {takdirCard.effect.special.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Monopoli WNI</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Kegiatan Card */}
              {kegiatanCard && (
                <section className="bg-[#0c2718] border border-[#1c452e] rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold tracking-wider text-[#ffd56d] uppercase flex items-center gap-2"><span>🃏</span> Kartu Kegiatan Terbuka</h2>
                    <span className="text-xs font-mono font-bold text-slate-400">{kegiatanCard.id.toUpperCase()}</span>
                  </div>
                  <div className="bg-white text-slate-900 rounded-xl p-4 sm:p-5 shadow-md border-t-4 border-emerald-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-800 text-white text-[11px] font-extrabold px-2.5 py-1 rounded tracking-wide uppercase">Kegiatan WNI</span>
                        <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold px-2 py-0.5 rounded capitalize">{kegiatanCard.category.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-2xl">{CATEGORY_ICONS[kegiatanCard.category] || '💼'}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-950">{CATEGORY_ICONS[kegiatanCard.category] || '💼'} {kegiatanCard.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">&ldquo;{kegiatanCard.flavorText}&rdquo;</p>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">✅ +Rp {kegiatanCard.positive.money.toLocaleString('id-ID')}</span>
                        <span className="text-xs font-semibold text-red-800 bg-red-50 px-2.5 py-1 rounded border border-red-200">❌ {kegiatanCard.negative.money < 0 ? '-' : '+'}Rp {Math.abs(kegiatanCard.negative.money).toLocaleString('id-ID')}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Monopoli WNI</span>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Action Bar */}
      <footer className="w-full bg-[#071e11] border-t border-[#1c452e] py-4 px-4 sm:px-6 lg:px-8 shadow-2xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span>Eksekusi bidak otomatis</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {bribed && (
              <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1.5">
                💰 Sogokan berhasil!
              </span>
            )}
            {canBribe && (
              <button onClick={onBribe} className="w-1/2 sm:w-auto px-4 py-2.5 bg-amber-600/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl text-xs sm:text-sm font-bold text-amber-200 hover:text-amber-100 transition-all shadow-sm flex items-center gap-2">
                <span>💰</span>
                <span>Sogok (Rp {bribeCost.toLocaleString('id-ID')})</span>
              </button>
            )}
            <button onClick={onContinue} className="w-1/2 sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#4edea3] via-emerald-400 to-[#ffd56d] hover:from-[#4edea3] hover:to-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-[#4edea3]/25 active:scale-98 transition-all flex items-center justify-center gap-2">
              <span>Lanjutkan</span>
              <span className="text-base leading-none">➔</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
