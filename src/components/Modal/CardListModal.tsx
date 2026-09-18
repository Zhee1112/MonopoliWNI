'use client';

import { useState } from 'react';
import { ALL_TAKDIR_CARDS } from '@/lib/game/takdir-cards';
import { ALL_KEGIATAN_CARDS } from '@/lib/game/kegiatan-cards';
import { Card, KegiatanCard } from '@/lib/types';

interface CardListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'takdir' | 'kegiatan';
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ringan: { bg: 'bg-emerald-900/30', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  sedang: { bg: 'bg-amber-900/30', border: 'border-amber-500/30', text: 'text-amber-400' },
  berat: { bg: 'bg-red-900/30', border: 'border-red-500/30', text: 'text-red-400' },
  legendary: { bg: 'bg-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-400' },
};

const CATEGORY_LABELS: Record<string, string> = {
  event_normal: 'Event Normal',
  event_meme: 'Event Meme',
  interaksi: 'Interaksi',
  koruptor: 'Koruptor',
  audit: 'Audit',
  legendary: 'Legendaris',
  usaha: 'Usaha',
  kerja_sampingan: 'Kerja Sampingan',
  investasi: 'Investasi',
  sosial: 'Sosial',
  tantangan: 'Tantangan',
};

function getEffectLabel(card: Card | KegiatanCard): string {
  if ('effect' in card) {
    const eff = card.effect;
    if (!eff) return '';
    if (eff.type === 'money') {
      const val = eff.value || 0;
      return val > 0 ? `+Rp ${val.toLocaleString('id-ID')}` : `-Rp ${Math.abs(val).toLocaleString('id-ID')}`;
    }
    if (eff.type === 'skip') return `Skip ${eff.value || 1} giliran`;
    if (eff.type === 'luck') return `Hoki ${eff.value && eff.value > 0 ? '+' : ''}${eff.value || 0}`;
    if (eff.type === 'dice') return eff.special || 'Efek dadu';
    if (eff.type === 'property') return eff.special || 'Efek properti';
    if (eff.type === 'special') return eff.special || 'Efek spesial';
    if (eff.type === 'interaction') return eff.special || 'Interaksi';
    if (eff.type === 'role') return 'Efek role';
    return eff.type;
  }
  if ('positive' in card) {
    const money = card.positive.money;
    return money > 0 ? `+Rp ${money.toLocaleString('id-ID')}` : `-Rp ${Math.abs(money).toLocaleString('id-ID')}`;
  }
  return '';
}

export default function CardListModal({ isOpen, onClose, type }: CardListModalProps) {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const isTakdir = type === 'takdir';
  const cards = isTakdir ? ALL_TAKDIR_CARDS : ALL_KEGIATAN_CARDS;

  // Get unique categories
  const categories = [...new Set(cards.map(c => c.category))];

  // Filter cards
  const filtered = cards.filter(c => {
    if (filter !== 'all' && c.category !== filter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by category
  const grouped: { [key: string]: typeof filtered } = {};
  filtered.forEach((card) => {
    if (!grouped[card.category]) grouped[card.category] = [];
    grouped[card.category].push(card);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border shadow-2xl"
        style={{ backgroundColor: '#05140b', borderColor: isTakdir ? '#ff6b6b40' : '#4edea340' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: isTakdir ? '#ff6b6b30' : '#4edea330' }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isTakdir ? '🃏' : '📦'}</span>
            <div>
              <h2 className="text-base font-bold" style={{ color: isTakdir ? '#fca5a5' : '#4edea3' }}>
                {isTakdir ? 'TAKDIR WNI' : 'KEGIATAN WNI'}
              </h2>
              <p className="text-[10px]" style={{ color: '#9a907c' }}>{filtered.length} dari {cards.length} kartu</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7a9a7a] hover:text-white hover:bg-white/10 transition-colors">
            &#x2715;
          </button>
        </div>

        {/* Search + Filter */}
        <div className="px-5 py-3 border-b space-y-2" style={{ borderColor: '#1c452e' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kartu..."
            className="w-full px-3 py-2 rounded-lg text-xs bg-[#0a2617] border border-[#1c452e] text-white placeholder-[#7a9a7a] outline-none focus:border-[#4edea3]/50"
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${filter === 'all' ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40' : 'bg-[#0a2617] text-[#7a9a7a] border border-[#1c452e]'}`}
            >
              Semua ({cards.length})
            </button>
            {categories.map(cat => {
              const count = cards.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${filter === cat ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40' : 'bg-[#0a2617] text-[#7a9a7a] border border-[#1c452e]'}`}
                >
                  {CATEGORY_LABELS[cat] || cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {Object.entries(grouped).map(([category, catCards]) => (
            <div key={category}>
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#7a9a7a' }}>
                {CATEGORY_LABELS[category] || category} ({catCards.length})
              </h3>
              <div className="space-y-1.5">
                {catCards.map(card => {
                  const tier = 'tier' in card ? card.tier : 'ringan';
                  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.ringan;
                  return (
                    <div
                      key={card.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border ${tierStyle.bg} ${tierStyle.border} transition-colors hover:brightness-110`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{card.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${tierStyle.text} bg-white/5`}>
                            {tier}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9a907c] mt-0.5 line-clamp-1">{card.flavorText}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-[#ffd56d]">{getEffectLabel(card)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[#7a9a7a]">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-xs">Tidak ditemukan</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
