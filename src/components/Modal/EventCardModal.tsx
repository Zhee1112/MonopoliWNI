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

const EFFECT_DESCRIPTIONS: Record<string, string> = {
  bayar_30_persen_duit_kotor: 'Bayar 30% uang kotor',
  bayar_20persen_saldo: 'Bayar 20% saldo',
  bayar_pajak_30persen: 'Bayar pajak 30%',
  semua_pemain_plus500rb: 'Semua pemain +Rp500.000',
  semua_pemain_plus300rb: 'Semua pemain +Rp300.000',
  semua_pemain_plus200rb: 'Semua pemain +Rp200.000',
  semua_pemain_plus1jt: 'Semua pemain +Rp1.000.000',
  semua_pemain_plus400rb: 'Semua pemain +Rp400.000',
  semua_pemain_minus_1jt: 'Semua pemain -Rp1.000.000',
  semua_dirty_money_disita_plus_denda_100rb: 'Semua uang kotor disita + denda Rp100rb',
  random_1_pemain_sita_50_duit_kotor: 'Random 1 pemain disita 50% uang kotor',
  semua_pemain_bayar_10_saldo: 'Semua pemain bayar 10% saldo',
  pemain_duit_kotor_terbanyak_sita_semua: 'Pemain terkaya disita semua uang kotor',
  random_2_pemain_sita_75_duit_kotor: '2 pemain disita 75% uang kotor',
  random_1_pemain_bayar_20_duit_kotor: 'Random 1 pemain bayar 20% uang kotor',
  presiden_tiktok_unlimited_income_3_turn: 'Income unlimited 3 giliran',
  income_x2_permanen: 'Income x2 permanen',
  kembali_0_plus_3jt: 'Kembali ke Start +Rp3jt',
  '1_pemain_bankrupt_minus_5jt_luck_20': '1 pemain bankrupt!',
  sembunyikan_kas_3_babak: 'Sembunyikan kas 3 babak',
  negotiation_plus2_permanen: 'Negotiation +2 permanen',
  lihat_3_kartu_pilih_1: 'Lihat 3 kartu, pilih 1',
  properti_premium_naik_10: 'Properti premium naik 10%',
  pilih_1_properti_gratis: 'Ambil 1 properti gratis',
  diskon_15persen: 'Diskon 15% properti',
  '3_properti_nilai_0': '3 properti nilainya jadi 0',
  semua_properti_murah_gratis: 'Semua properti murah/gratis',
  target_bayar_ke_draw: 'Target bayar ke penarik kartu',
  target_mundur_3_langkah: 'Target mundur 3 langkah',
  target_rent_freeze_2_babak: 'Properti target sewa gratis 2 babak',
  curi_30_persen_kas_target: 'Curi 30% kas dari target',
  target_bayar_50_persen_kas_ke_kamu: 'Target bayar 50% kas ke kamu',
  curi_20_persen_kas_dari_pemain_kaya: 'Curi 20% kas dari pemain kaya',
  target_skip_1_turn: 'Target skip 1 giliran',
  target_skip_1_plus_bayar_200rb: 'Target skip + bayar Rp200rb',
  target_skip_plus_minus_100rb_luck: 'Target skip + bayar Rp100rb + luck -5',
  target_bayar_500rb_atau_skip: 'Target bayar Rp500rb atau skip',
  target_bayar_300rb_plus_skip: 'Target bayar Rp300rb + skip',
  target_bayar_200rb_plus_luck_5: 'Target bayar Rp200rb + luck -5',
  target_bayar_300rb_plus_luck_10: 'Target bayar Rp300rb + luck -10',
  target_bayar_400rb_plus_luck_8: 'Target bayar Rp400rb + luck -8',
  target_luck_15_permanen: 'Target luck -15 permanen',
  target_luck_10_permanen: 'Target luck -10 permanen',
  target_luck_20_permanen: 'Target luck -20 permanen',
  target_luck_12_permanen: 'Target luck -12 permanen',
  target_income_50_3_turn: 'Target income -50% 3 giliran',
  '1_properti_dijual_50': '1 properti dijual 50%',
  target_pindah_random: 'Target pindah ke posisi random',
  properti_level_min_1: 'Properti tetangga level min 1',
  ambil_1_properti_gratis: 'Ambil 1 properti gratis',
  properti_nggak_disewa_1_turn: 'Properti nggak disewa 1 giliran',
  target_nggak_beli_properti_1_turn: 'Target nggak boleh beli properti',
  '1_properti_hilang': '1 properti hilang',
  sewa_min_50_1_turn: 'Sewa minimal 50% 1 giliran',
  semua_bayar_300rb_ke_kamu: 'Semua bayar Rp300rb ke kamu',
  bayar_200rb: 'Bayar Rp200.000',
  dapat_500rb: 'Dapat Rp500.000',
  minus_200rb: 'Kehilangan Rp200.000',
  atau_skip_1: 'Bayar atau skip 1 giliran',
  genap_x2_ganjil_80persen: 'Dadu genap x2, ganjil -80%',
  genap_plus3jt_ganjil_minus2jt: 'Genap +Rp3jt, Ganjil -Rp2jt',
  roll_2x_pilih_terbaik: 'Roll 2x, pilih terbaik',
  ganda_x2_tapi_gagal_bayar_200rb: 'Dadu x2, gagal bayar Rp200rb',
  batalkan_dadu_pemain_lain: 'Batalkan dadu pemain lain',
  '3x_dadu_permanen': 'Dadu x3 permanen',
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
            <span className="text-[#07190F]/50 text-sm">{isKegiatan ? '📦' : '🃏'}</span>
          </div>

          {/* Card Content */}
          <div className="flex gap-3 items-start mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <span className="text-2xl">{isKegiatan ? '💰' : '🎲'}</span>
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
                  : 'effect' in card && card.effect.type === 'skip'
                    ? `Skip ${card.effect.value || 1} giliran`
                    : 'effect' in card && card.effect.type === 'dice'
                      ? (EFFECT_DESCRIPTIONS[card.effect.special || ''] || card.effect.special || 'Efek Dadu')
                      : 'effect' in card && card.effect.special
                        ? (EFFECT_DESCRIPTIONS[card.effect.special] || card.effect.special.replace(/_/g, ' '))
                        : 'Efek Khusus'}
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
                    💵 +Rp{((card.effect.value || 0)).toLocaleString('id-ID')}
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
