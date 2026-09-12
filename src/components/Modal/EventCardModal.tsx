'use client';

import { useState } from 'react';
import { Card, KegiatanCard } from '@/lib/types';

// ============================================================
// EVENT CARD MODAL - For all players to see
// ============================================================

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

const TIER_COLORS = {
  ringan: 'from-green-400 to-emerald-500',
  sedang: 'from-yellow-400 to-orange-500',
  berat: 'from-red-400 to-pink-500',
  legendary: 'from-purple-400 to-indigo-500',
};

const TIER_BG = {
  ringan: 'bg-green-50 border-green-200',
  sedang: 'bg-yellow-50 border-yellow-200',
  berat: 'bg-red-50 border-red-200',
  legendary: 'bg-purple-50 border-purple-200',
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

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    onReact?.(reaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl overflow-hidden">
        {/* Gradient Header */}
        <div
          className={`bg-gradient-to-r ${TIER_COLORS[tier]} p-6 text-center`}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            {'💰' in card ? '🎯 KEGIATAN SERU!' : '🎴 TAKDIR NETIZEN!'}
          </h2>
          <p className="text-white/80 text-sm">
            {isTarget ? `Target: ${targetName}` : `Ditarik oleh: ${drawnBy}`}
          </p>
        </div>

        {/* Card Content */}
        <div className={`p-6 border-4 ${TIER_BG[tier]} m-4 rounded-xl`}>
          {/* Card Name */}
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
            {name}
          </h3>

          {/* Tier Badge */}
          <div className="flex justify-center mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                tier === 'legendary'
                  ? 'bg-purple-500'
                  : tier === 'berat'
                  ? 'bg-red-500'
                  : tier === 'sedang'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            >
              {tier.toUpperCase()}
            </span>
          </div>

          {/* Flavor Text */}
          {flavorText && (
            <p className="text-gray-600 italic text-center mb-4">
              &quot;{flavorText}&quot;
            </p>
          )}

          {/* Effect Display */}
          <div className="bg-white/80 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">Efek:</p>
            {'positive' in card ? (
              // Kegiatan card
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-center">
                  <p className="text-xs text-green-600">Positif (+Untung)</p>
                  <p className="font-bold text-green-700">
                    +Rp{card.positive.money.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg text-center">
                  <p className="text-xs text-red-600">Negatif (-Rugi)</p>
                  <p className="font-bold text-red-700">
                    -Rp{Math.abs(card.negative.money).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ) : (
              // Takdir card
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">
                  {card.effect.type === 'money'
                    ? `Rp${(card.effect.value || 0).toLocaleString('id-ID')}`
                    : card.effect.special || 'Efek Khusus'}
                </p>
              </div>
            )}
          </div>

          {/* Luck Modifier */}
          {('luckModifier' in card && card.luckModifier) && (
            <div className="bg-purple-100 p-3 rounded-lg mb-4">
              <p className="text-xs text-purple-600">Luck Modifier:</p>
              <p className="font-bold text-purple-700">
                {card.luckModifier.amount > 0 ? '+' : ''}
                {card.luckModifier.amount} Luck
                {card.luckModifier.isPermanent && ' (Permanen)'}
              </p>
            </div>
          )}
        </div>

        {/* Reactions */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 mb-2">Reactions:</p>
          <div className="flex gap-2 justify-center">
            {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedReaction === key
                    ? 'bg-blue-100 border-2 border-blue-400 scale-110'
                    : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {emoji} {reactions[key]?.length || 0}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {showButtons && (
          <div className="p-6 pt-0">
            {isTarget ? (
              <div className="flex gap-3">
                <button
                  onClick={onAccept}
                  className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
                >
                  TERIMA
                </button>
                <button
                  onClick={onRefuse}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  TOLAK
                </button>
              </div>
            ) : (
              <button
                onClick={onDismiss}
                className="w-full py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
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
