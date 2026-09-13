'use client';

import { useState } from 'react';
import { Card, KegiatanCard } from '@/lib/types';

interface EventCardModalProps {
  isOpen: boolean;
  card: Card | KegiatanCard;
  drawnBy: string;
  isTarget?: boolean;
  targetName?: string;
  reactions: Record<string, string[]>;
  onReact?: (reaction: string) => void;
  onAccept?: () => void;
  onRefuse?: () => void;
  onDismiss?: () => void;
  showButtons?: boolean;
}

const REACTION_EMOJIS = {
  wkwk: '😂',
  gila: '😱',
  oke: '👍',
  rip: '💀',
};

const TIER_LABELS: Record<string, string> = {
  ringan: 'KELAS RINGAN',
  sedang: 'KELAS SEDANG',
  berat: 'KELAS BERAT',
  legendary: 'LEGENDARIS',
};

const TIER_ACCENT: Record<string, string> = {
  ringan: '#4edea3',
  sedang: '#ffd56d',
  berat: '#f87171',
  legendary: '#a855f7',
};

export default function EventCardModal({
  isOpen,
  card,
  drawnBy,
  isTarget = false,
  targetName,
  reactions,
  onReact,
  onAccept,
  onRefuse,
  onDismiss,
  showButtons = true,
}: EventCardModalProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  if (!isOpen) return null;

  const tier = 'tier' in card ? card.tier : 'ringan';
  const name = card.name;
  const flavorText = 'flavorText' in card ? card.flavorText : '';
  const isKegiatan = 'positive' in card;
  const accentColor = TIER_ACCENT[tier] || '#4edea3';

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    onReact?.(reaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001809]/90 backdrop-blur-md">
      <div className="relative z-20 w-full max-w-lg mx-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {/* Card Wrapper - Parchment Style */}
        <div className="rounded-xl bg-[#FBF8EE] text-[#07190F] p-5 shadow-[4px_4px_0_0_#001206] overflow-hidden relative">
          {/* Color Header Strip */}
          <div
            className="flex items-center justify-between pb-3 border-b border-[#07190F]/20 mb-4"
            style={{ borderBottomColor: `${accentColor}40` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ backgroundColor: accentColor, color: '#07190F' }}
              >
                {isKegiatan ? 'KEGIATAN WNI' : 'TAKDIR WNI'}
              </span>
              <span className="text-xs font-semibold text-[#07190F]/70">{TIER_LABELS[tier]}</span>
            </div>
            <span className="text-[#07190F]/50 text-sm">{isKegiatan ? '&#x1F4E6;' : '&#x1F0CF;'}</span>
          </div>

          {/* Card Content */}
          <div className="flex gap-3 items-start mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <span className="text-2xl">{isKegiatan ? '&#x1F4B0;' : '&#x1F3B2;'}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-[#07190F] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                {name}
              </h2>
              {flavorText && (
                <p className="text-xs text-[#07190F]/70 leading-relaxed italic">
                  &quot;{flavorText}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Drawn By */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[#07190F]/5">
            <span className="text-xs text-[#07190F]/60">
              {isTarget ? `Target: ${targetName}` : `Ditarik oleh: ${drawnBy}`}
            </span>
          </div>

          {/* Effect Display */}
          {isKegiatan ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-[#00603b]/10 border border-[#00603b]/30">
                <p className="text-[10px] text-[#00603b] font-semibold uppercase">Positif (+Untung)</p>
                <p className="text-sm font-bold text-[#00603b]">
                  +Rp{(card as KegiatanCard).positive.money.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#b45309]/10 border border-[#b45309]/30">
                <p className="text-[10px] text-[#b45309] font-semibold uppercase">Negatif (-Rugi)</p>
                <p className="text-sm font-bold text-[#b45309]">
                  -Rp{Math.abs((card as KegiatanCard).negative.money).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-[#07190F]/5 mb-4">
              <p className="text-[10px] text-[#07190F]/60 uppercase font-semibold mb-1">Efek Kartu</p>
              <p className="text-sm font-bold text-[#07190F]">
                {'effect' in card && card.effect.type === 'money'
                  ? `${(card.effect.value || 0) >= 0 ? '+' : ''}Rp${(card.effect.value || 0).toLocaleString('id-ID')}`
                  : 'effect' in card ? card.effect.special || 'Efek Khusus' : 'Efek Khusus'}
              </p>
            </div>
          )}

          {/* Luck Modifier */}
          {'luckModifier' in card && card.luckModifier && (
            <div className="p-2 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 mb-4">
              <p className="text-[10px] text-[#a855f7] font-semibold">
                Luck Modifier: {card.luckModifier.amount > 0 ? '+' : ''}{card.luckModifier.amount} Luck
                {card.luckModifier.isPermanent && ' (Permanen)'}
              </p>
            </div>
          )}

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#07190F]/20">
            <div className="flex items-center gap-3">
              {'effect' in card && card.effect && 'value' in card.effect && (card.effect.value || 0) > 0 && (
                <span className="text-xs font-bold text-[#00603b] flex items-center gap-1">
                  &#x1F4B5; +Rp{((card.effect.value || 0)).toLocaleString('id-ID')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#07190F]/40 font-bold">MONOPOLI WNI EDITION</span>
          </div>
        </div>

        {/* Reactions */}
        <div className="px-5 py-3 bg-[#FBF8EE]/90 border-t border-[#07190F]/10">
          <div className="flex gap-2 justify-center">
            {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${
                  selectedReaction === key
                    ? 'bg-[#07190F]/10 border-2 border-[#07190F]/30 scale-105'
                    : 'bg-[#07190F]/5 hover:bg-[#07190F]/10 border-2 border-transparent'
                }`}
              >
                {emoji} {reactions[key]?.length || 0}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {showButtons && (
          <div className="px-5 py-4 bg-[#0a1a11] border-t border-[#203a29]">
            {isTarget ? (
              <div className="flex gap-3">
                <button
                  onClick={onAccept}
                  className="flex-1 py-2.5 bg-[#4edea3] text-[#002b18] font-bold rounded-lg hover:bg-[#6ffbbe] active:scale-95 transition-all text-sm"
                >
                  TERIMA
                </button>
                <button
                  onClick={onRefuse}
                  className="flex-1 py-2.5 bg-[#f87171] text-white font-bold rounded-lg hover:bg-[#ef4444] active:scale-95 transition-all text-sm"
                >
                  TOLAK
                </button>
              </div>
            ) : (
              <button
                onClick={onDismiss}
                className="w-full py-2.5 bg-[#152f1f] text-[#cbead1] font-bold rounded-lg hover:bg-[#203a29] active:scale-95 transition-all text-sm border border-[#203a29]"
              >
                KEMBALI
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
