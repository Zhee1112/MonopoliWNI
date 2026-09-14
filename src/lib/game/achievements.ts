// ============================================================
// ACHIEVEMENT DEFINITIONS - 25 Achievements for Monopoli WNI
// ============================================================

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xp: number;
  color: string;
  bgColor: string;
  borderColor: string;
  category: 'placement' | 'money' | 'property' | 'combat' | 'luck';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---- PLACEMENT (5) ----
  {
    id: 'winner',
    name: 'Raja Ordal',
    description: 'Penguasa absolut meja Monopoli WNI. Semua kavling tunduk, semua kas mengalir.',
    emoji: '👑',
    xp: 150,
    color: 'text-[#ffd56d]',
    bgColor: 'bg-[#ffd56d]/20',
    borderColor: 'border-[#ffd56d]/40',
    category: 'placement',
  },
  {
    id: 'runner_up',
    name: 'Warga Desil 10',
    description: 'Top 10% kekayaan meja. Hampir Sultan, tapi beda dikit.',
    emoji: '📊',
    xp: 100,
    color: 'text-slate-300',
    bgColor: 'bg-slate-400/20',
    borderColor: 'border-slate-400/40',
    category: 'placement',
  },
  {
    id: 'third_place',
    name: 'Dewan Pengawas',
    description: 'Finish di peringkat ketiga dengan portofolio aset sehat.',
    emoji: '🥉',
    xp: 75,
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/20',
    borderColor: 'border-amber-600/40',
    category: 'placement',
  },
  {
    id: 'participation',
    name: 'Warga Aktif',
    description: 'Berpartisipasi aktif dalam sesi Monopoli WNI sampai selesai.',
    emoji: '🤝',
    xp: 30,
    color: 'text-[#4edea3]',
    bgColor: 'bg-[#4edea3]/20',
    borderColor: 'border-[#4edea3]/40',
    category: 'placement',
  },
  {
    id: 'survivor',
    name: 'Survivor Bundir',
    description: 'Selamat hingga akhir tanpa bangkrut di mode Bundir.',
    emoji: '🛡️',
    xp: 35,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
    borderColor: 'border-emerald-400/40',
    category: 'placement',
  },

  // ---- MONEY (5) ----
  {
    id: 'millionaire',
    name: 'Jutawan Dadakan',
    description: 'Punya Rp 5 juta+ kas bersih sekaligus. Tiba-tiba kaya!',
    emoji: '💰',
    xp: 40,
    color: 'text-[#ffd56d]',
    bgColor: 'bg-[#ffd56d]/20',
    borderColor: 'border-[#ffd56d]/40',
    category: 'money',
  },
  {
    id: 'cash_king',
    name: 'Raja Kas Tunai',
    description: 'Akhiri giliran dengan Rp 3 juta+ kas bersih. Dompet tebal.',
    emoji: '💵',
    xp: 30,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/20',
    borderColor: 'border-emerald-400/40',
    category: 'money',
  },
  {
    id: 'broke_to_rich',
    name: 'Dari Nol Ke Hero',
    description: 'Dari Rp 100 ribu ke Rp 2 juta+ dalam satu sesi. Rags to riches!',
    emoji: '📈',
    xp: 50,
    color: 'text-[#4edea3]',
    bgColor: 'bg-[#4edea3]/20',
    borderColor: 'border-[#4edea3]/40',
    category: 'money',
  },
  {
    id: 'debt_slave',
    name: 'Budak Pinjaman',
    description: 'Ambil 2+ pinjaman dalam satu sesi. Hidup berhutang.',
    emoji: '🔗',
    xp: 20,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    borderColor: 'border-red-400/40',
    category: 'money',
  },
  {
    id: 'debt_free',
    name: 'Bebas Hutang',
    description: 'Berhasil melunasi pinjaman. Merdeka dari jeratan bunga!',
    emoji: '🕊️',
    xp: 25,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/20',
    borderColor: 'border-sky-400/40',
    category: 'money',
  },

  // ---- PROPERTY (5) ----
  {
    id: 'first_buyer',
    name: 'Pembeli Perdana',
    description: 'Beli kavling pertama. Selamat datang di dunia properti!',
    emoji: '🔑',
    xp: 15,
    color: 'text-[#4edea3]',
    bgColor: 'bg-[#4edea3]/20',
    borderColor: 'border-[#4edea3]/40',
    category: 'property',
  },
  {
    id: 'treasure_hunter',
    name: 'Juragan Ruko SCBD',
    description: 'Kuasai 5 kavling atau lebih secara bersamaan.',
    emoji: '🏢',
    xp: 40,
    color: 'text-amber-300',
    bgColor: 'bg-amber-300/20',
    borderColor: 'border-amber-300/40',
    category: 'property',
  },
  {
    id: 'property_mogul',
    name: 'Mogul Properti',
    description: 'Kuasai 8 kavling atau lebih. Monopoli terserah gue.',
    emoji: '🏦',
    xp: 45,
    color: 'text-[#ffd56d]',
    bgColor: 'bg-[#ffd56d]/20',
    borderColor: 'border-[#ffd56d]/40',
    category: 'property',
  },
  {
    id: 'monopoly_king',
    name: 'Raja Monopoli',
    description: 'Kuasai SEMUA kavling dalam satu warna grup. Monopoli sesungguhnya!',
    emoji: '👑',
    xp: 60,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/40',
    category: 'property',
  },
  {
    id: 'land_grab',
    name: 'Tanah Abang Tycoon',
    description: 'Beli 3+ kavling dalam satu giliran. Borong habis!',
    emoji: '🏠',
    xp: 35,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    borderColor: 'border-orange-400/40',
    category: 'property',
  },

  // ---- COMBAT/SOCIAL (5) ----
  {
    id: 'bankrupt_maker',
    name: 'Tukang Sita Lahan',
    description: 'Mengakibatkan pemain lain bangkrut karena kavling Anda.',
    emoji: '💀',
    xp: 75,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    borderColor: 'border-red-400/40',
    category: 'combat',
  },
  {
    id: 'double_bust',
    name: 'Kembar Sial',
    description: 'Lempar dadu kembar 3x berturut-turut dan masuk penjara.',
    emoji: '🎲',
    xp: 20,
    color: 'text-red-300',
    bgColor: 'bg-red-300/20',
    borderColor: 'border-red-300/40',
    category: 'combat',
  },
  {
    id: 'jail_escape',
    name: 'Buronan Ulung',
    description: 'Berhasil kabur dari penjara (roll kembar atau bayar denda).',
    emoji: '⛓️',
    xp: 25,
    color: 'text-slate-300',
    bgColor: 'bg-slate-300/20',
    borderColor: 'border-slate-300/40',
    category: 'combat',
  },
  {
    id: 'tax_evasion',
    name: 'Pengemplang Pajak',
    description: 'Lolos uji PPN 12% sebanyak 3x. Kreatif cari celah!',
    emoji: '🏴',
    xp: 30,
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/20',
    borderColor: 'border-slate-400/40',
    category: 'combat',
  },
  {
    id: 'tipiring_survivor',
    name: 'Korban Tipiring',
    description: 'Gagal uji DnD tapi tetap survive. Kena denda tapi gak bangkrut.',
    emoji: '⚖️',
    xp: 20,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/20',
    borderColor: 'border-amber-400/40',
    category: 'combat',
  },

  // ---- LUCK/CARD (5) ----
  {
    id: 'legendary_card',
    name: 'Penarik Kartu Legendaris',
    description: 'Mendapatkan kartu dengan tier Legendaris. Dewi fortuna berpihak!',
    emoji: '✨',
    xp: 50,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/40',
    category: 'luck',
  },
  {
    id: 'lucky_streak',
    name: 'Hoki Angka Kembar',
    description: 'Lempar dadu kembar (double) 3x beruntun tanpa masuk penjara.',
    emoji: '🎯',
    xp: 30,
    color: 'text-[#4edea3]',
    bgColor: 'bg-[#4edea3]/20',
    borderColor: 'border-[#4edea3]/40',
    category: 'luck',
  },
  {
    id: 'card_collector',
    name: 'Kolektor Kartu WNI',
    description: 'Ambil 5+ kartu (takdir atau kegiatan) dalam satu sesi.',
    emoji: '🃏',
    xp: 35,
    color: 'text-[#ffd56d]',
    bgColor: 'bg-[#ffd56d]/20',
    borderColor: 'border-[#ffd56d]/40',
    category: 'luck',
  },
  {
    id: 'workaholic',
    name: 'Gila Kerja',
    description: 'Lolos 5+ uji DnD dalam satu sesi permainan.',
    emoji: '🔥',
    xp: 25,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    borderColor: 'border-orange-400/40',
    category: 'luck',
  },
  {
    id: 'speed_demon',
    name: 'Kilat Rider',
    description: 'Menangkan sesi mode Kilat. Cepat, gesit, menghancurkan.',
    emoji: '⚡',
    xp: 40,
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-300/20',
    borderColor: 'border-yellow-300/40',
    category: 'luck',
  },
];

// Helper: get achievement by ID
export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper: get all achievements for a category
export function getAchievementsByCategory(category: AchievementDef['category']): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

// Helper: calculate placement XP
export function getPlacementXp(placement: number, totalRealPlayers: number): { achievementId: string; xp: number } | null {
  if (placement === 1) return { achievementId: 'winner', xp: 150 };
  if (placement === 2 && totalRealPlayers >= 5) return { achievementId: 'runner_up', xp: 100 };
  if (placement === 3 && totalRealPlayers >= 5) return { achievementId: 'third_place', xp: 75 };
  if (placement >= 4) return { achievementId: 'participation', xp: 30 };
  return null;
}

// Helper: get dynamic placement achievements based on real player count
export function getPlacementAchievements(realPlayerCount: number): string[] {
  const achievements = ['winner'];
  if (realPlayerCount >= 5) achievements.push('runner_up');
  return achievements;
}

// Total achievement count
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;
