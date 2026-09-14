import { StatusEffect } from '../types';

// ============================================================
// GLOBAL EVENTS - Chaotic events that affect all players
// Triggered every N rounds at the start of a new round
// ============================================================

export interface GlobalEventEffect {
  type: 'all_money_divide' | 'all_pay_percent' | 'swap_positions' | 'rent_frozen' | 'skip_even' | 'cancel_rent' | 'seize_dirty' | 'rich_penalty' | 'tech_disable' | 'all_bonus' | 'random_fine' | 'property_disable';
  value?: number;
  duration?: number;
  target?: 'all' | 'richest' | 'random' | 'poorest';
  targetCount?: number;
}

export interface SubEvent {
  id: string;
  name: string;
  description: string;
  effect: GlobalEventEffect;
}

export interface GlobalEventDefinition {
  id: string;
  name: string;
  emoji: string;
  flavorText: string;
  triggerRound: number[];
  duration?: number;
  effect: GlobalEventEffect;
  subEvents: SubEvent[];
}

export const GLOBAL_EVENTS: GlobalEventDefinition[] = [
  // 1. Reshuffle Kabinet Dadakan
  {
    id: 'reshuffle_kabinet',
    name: 'Reshuffle Kabinet Dadakan',
    emoji: '🔄',
    flavorText: 'Sistem pemerintahan berubah mendadak! Semua posisi berantakan.',
    triggerRound: [3, 8, 15, 22],
    effect: { type: 'swap_positions', target: 'all' },
    subEvents: [
      {
        id: 'reshuffle_total',
        name: 'Reshuffle Total',
        description: 'Semua pemain dipaksa bertukar posisi bidak secara acak di papan!',
        effect: { type: 'swap_positions', target: 'all' },
      },
    ],
  },

  // 2. Inflasi Gila-gilaan
  {
    id: 'inflasi',
    name: 'Inflasi Gila-gilaan (Redenominasi Gagal)',
    emoji: '💸',
    flavorText: 'Nilai Rupiah anjlok! Semua harga harus dibagi 10.',
    triggerRound: [5, 12, 20],
    duration: 2,
    effect: { type: 'all_money_divide', value: 10, duration: 2 },
    subEvents: [
      {
        id: 'inflasi_ringan',
        name: 'Inflasi Ringan',
        description: 'Nilai Rupiah turun sedikit. Kas semua pemain dibagi 2.',
        effect: { type: 'all_money_divide', value: 2, duration: 2 },
      },
      {
        id: 'inflasi_parah',
        name: 'Redenominasi Gagal',
        description: 'Inflasi parah! Kas semua pemain dibagi 10. Rp 1.000.000 jadi Rp 100.000.',
        effect: { type: 'all_money_divide', value: 10, duration: 2 },
      },
    ],
  },

  // 3. Grebek Judi Online
  {
    id: 'grebek_judi',
    name: 'Grebek Judi Online / Sweeping Satgas',
    emoji: '🚔',
    flavorText: 'Satgas Siber menggerebek! Uang haram disita semua.',
    triggerRound: [4, 10, 18],
    effect: { type: 'seize_dirty', target: 'all' },
    subEvents: [
      {
        id: 'sweeping_biasa',
        name: 'Sweeping Biasa',
        description: 'Satgas menyita uang kotor dari semua pemain. Pool Kas Bebas Parkir dihanguskan!',
        effect: { type: 'seize_dirty', target: 'all' },
      },
      {
        id: 'sweeping_total',
        name: 'Operasi Besar-besaran',
        description: 'Sweeping massal! Semua uang kotor disita + denda Rp 200.000 per pemain.',
        effect: { type: 'seize_dirty', target: 'all', value: 200000 },
      },
    ],
  },

  // 4. Ganjil Genap
  {
    id: 'ganjil_genap',
    name: 'Aturan Ganjil Genap Berlaku',
    emoji: '🚷',
    flavorText: 'Pergub baru! Hanya mobil genap yang boleh jalan.',
    triggerRound: [2, 7, 13, 19],
    duration: 1,
    effect: { type: 'skip_even', duration: 1 },
    subEvents: [
      {
        id: 'gage_normal',
        name: 'Ganjil Genap Normal',
        description: 'Selama 1 babak, pemain hanya boleh jalan kalau dadu Genap! Dadu Ganjil = skip + denda Rp 100.000.',
        effect: { type: 'skip_even', duration: 1 },
      },
      {
        id: 'gage_ketat',
        name: 'Ganjil Genap Ketat',
        description: 'Aturan makin ketat! Dadu Ganjil = skip + denda Rp 200.000.',
        effect: { type: 'skip_even', duration: 1, value: 200000 },
      },
    ],
  },

  // 5. Pembangunan IKN
  {
    id: 'ikn',
    name: 'Pembangunan IKN (Ibu Kota Negara)',
    emoji: '🏗️',
    flavorText: 'Proyek mega raksasa! Semua warga wajib patungan.',
    triggerRound: [6, 14, 22],
    effect: { type: 'all_pay_percent', value: 15 },
    subEvents: [
      {
        id: 'ikn_ringan',
        name: 'IKN Tahap Awal',
        description: 'Semua pemain wajib menyumbang 10% kas ke Bank untuk IKN.',
        effect: { type: 'all_pay_percent', value: 10 },
      },
      {
        id: 'ikn_parah',
        name: 'IKN Mega Proyek',
        description: 'Semua pemain wajib patungan 20% kas! Yang kasnya di bawah Rp 500.000 langsung suspend 1 babak karena "dianggap oposisi".',
        effect: { type: 'all_pay_percent', value: 20 },
      },
    ],
  },

  // 6. Viral Cancel Culture
  {
    id: 'cancel_culture',
    name: 'Viral di X/Twitter (Cancel Culture)',
    emoji: '📱',
    flavorText: 'Dunia maya membara! Seseorang sedang di-"cancel".',
    triggerRound: [4, 9, 16],
    duration: 2,
    effect: { type: 'cancel_rent', target: 'richest', duration: 2 },
    subEvents: [
      {
        id: 'cancel_1',
        name: 'Cancel 1 Pemain Terkaya',
        description: 'Pemain terkaya di-cancel! Tidak bisa mengumpulkan sewa selama 2 babak karena propertinya diboikot.',
        effect: { type: 'cancel_rent', target: 'richest', duration: 2 },
      },
      {
        id: 'cancel_random',
        name: 'Cancel Culture Acak',
        description: 'Random 2 pemain di-cancel! Properti mereka diboikot netizen selama 2 babak.',
        effect: { type: 'cancel_rent', target: 'random', duration: 2, targetCount: 2 },
      },
    ],
  },

  // 7. Isu Tapera
  {
    id: 'tapera',
    name: 'Isu Tapera / Iuran Wajib Massal',
    emoji: '🏦',
    flavorText: 'Dana gaib muncul! Potongan wajib untuk semua.',
    triggerRound: [3, 8, 14, 20],
    effect: { type: 'all_pay_percent', value: 10 },
    subEvents: [
      {
        id: 'tapera_normal',
        name: 'Iuran Tapera',
        description: 'Semua pemain dipotong 10% kas untuk Dana Simpanan Gaib. Uang masuk ke Pool Kas Bebas Parkir.',
        effect: { type: 'all_pay_percent', value: 10 },
      },
      {
        id: 'tapera_besar',
        name: 'Tapera Darurat',
        description: 'Potongan naik 15%! Semua pemain harus bayar ke Pool Kas.',
        effect: { type: 'all_pay_percent', value: 15 },
      },
    ],
  },

  // 8. Fenomena Ormas
  {
    id: 'ormas',
    name: 'Fenomena Ormas (Jatah Uang Keamanan)',
    emoji: '💪',
    flavorText: 'Ormas datang mengetuk pintu! Minta jatah keamanan.',
    triggerRound: [5, 11, 18],
    duration: 2,
    effect: { type: 'all_pay_percent', value: 5 },
    subEvents: [
      {
        id: 'ormas_ringan',
        name: 'Ormas Lokal',
        description: 'Pemain 3+ kavling wajib bayar "Uang Ormas" Rp 100.000 per kavling. Kalau tidak sanggup, 1 kavling disegel 2 babak.',
        effect: { type: 'random_fine', value: 100000 },
      },
      {
        id: 'ormas_parah',
        name: 'Ormas Nasional',
        description: 'Ormas besar datang! Semua pemain 2+ kavling bayar Rp 200.000 per kavling.',
        effect: { type: 'random_fine', value: 200000 },
      },
    ],
  },

  // 9. Mati Lampu Nasional
  {
    id: 'mati_lampu',
    name: 'Mati Lampu Nasional / Gangguan Server',
    emoji: '🔌',
    flavorText: 'Listrik padam total! Sistem digital lumpuh.',
    triggerRound: [6, 13, 21],
    duration: 1,
    effect: { type: 'tech_disable', duration: 1 },
    subEvents: [
      {
        id: 'mati_lampu_ringan',
        name: 'Mati Lampu Sebagian',
        description: 'Mati lampu di beberapa area. Sewa properti digital (kripto, warnet) gratis selama 1 babak.',
        effect: { type: 'tech_disable', duration: 1 },
      },
      {
        id: 'mati_lampu_total',
        name: 'Blackout Total',
        description: 'Listrik padam total! Semua properti tidak bisa disewa selama 1 babak.',
        effect: { type: 'property_disable', duration: 1 },
      },
    ],
  },

  // 10. OTT KPK
  {
    id: 'ott_kpk',
    name: 'Operasi Tangkap Tangan (OTT) KPK',
    emoji: '⚖️',
    flavorText: 'KPK bergerak cepat! Target: yang paling kaya.',
    triggerRound: [7, 15, 23],
    effect: { type: 'rich_penalty', value: 30 },
    subEvents: [
      {
        id: 'ott_ringan',
        name: 'OTT Ringan',
        description: 'Pemain aset tertinggi kehilangan 20% kas karena OTT KPK.',
        effect: { type: 'rich_penalty', value: 20 },
      },
      {
        id: 'ott_parah',
        name: 'OTT Besar-besaran',
        description: 'OTT massal! 2 pemain terkaya masing-masing kehilangan 30% kas.',
        effect: { type: 'rich_penalty', value: 30, targetCount: 2 },
      },
    ],
  },

  // 11. Operasi Yustisi
  {
    id: 'operasi_yustisi',
    name: 'Operasi Yustisi / Razia Satpol PP',
    emoji: '🚨',
    flavorText: 'Satpol PP keluar! Siap-siap kena razia.',
    triggerRound: [2, 9, 16, 24],
    effect: { type: 'random_fine', value: 200000 },
    subEvents: [
      {
        id: 'razia_ringan',
        name: 'Razia Ringan',
        description: 'Random 1 pemain terkena razia! Bayar denda Rp 100.000 atau skip 1 putaran.',
        effect: { type: 'random_fine', value: 100000 },
      },
      {
        id: 'razia_parah',
        name: 'Operasi Yustisi',
        description: 'Razia besar! 2 pemain random kena denda Rp 200.000.',
        effect: { type: 'random_fine', value: 200000, targetCount: 2 },
      },
    ],
  },

  // 12. Demo Mahasiswa
  {
    id: 'demo',
    name: 'Demo Mahasiswa Besar-besaran',
    emoji: '✊',
    flavorText: 'Mahasiswa turun ke jalan! Aktivitas ekonomi lumpuh.',
    triggerRound: [4, 11, 17, 25],
    duration: 1,
    effect: { type: 'property_disable', duration: 1 },
    subEvents: [
      {
        id: 'demo_ringan',
        name: 'Demo Kecil',
        description: 'Demo di satu titik. Sewa properti di Jakarta Pusat gratis selama 1 babak.',
        effect: { type: 'tech_disable', duration: 1 },
      },
      {
        id: 'demo_besar',
        name: 'Demo Nasional',
        description: 'Demo besar-besaran! SEMUA properti tidak bisa disewa selama 1 babak.',
        effect: { type: 'property_disable', duration: 1 },
      },
    ],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getEventsForRound(round: number): GlobalEventDefinition[] {
  if (round < 2) return [];
  const idx = (round * 7 + 3) % GLOBAL_EVENTS.length;
  return [GLOBAL_EVENTS[idx]];
}

export function pickRandomEvent(events: GlobalEventDefinition[]): GlobalEventDefinition {
  return events[Math.floor(Math.random() * events.length)];
}

export function pickRandomSubEvent(event: GlobalEventDefinition): SubEvent {
  return event.subEvents[Math.floor(Math.random() * event.subEvents.length)];
}

export function shouldTriggerGlobalEvent(round: number): boolean {
  return round >= 2;
}

export function getGlobalEventsForRound(round: number): Array<{ event: GlobalEventDefinition; subEvent: SubEvent }> {
  if (round < 2) return [];
  const events = getEventsForRound(round);
  return events.map(event => ({
    event,
    subEvent: pickRandomSubEvent(event),
  }));
}

// ============================================================
// EFFECT EXECUTION (server-side or client-side)
// ============================================================

export interface ExecutedEffect {
  eventId: string;
  eventName: string;
  eventEmoji: string;
  subEventId: string;
  subEventName: string;
  subEventDescription: string;
  affectedPlayers: Array<{
    playerId: string;
    playerName: string;
    moneyChange: number;
    statusEffect?: StatusEffect;
  }>;
}

export function getGlobalEventEffectDescription(subEvent: SubEvent): string {
  return subEvent.description;
}
