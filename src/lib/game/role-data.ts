import { RoleDefinition, MemeRoleBuff } from '../types';

// ============================================================
// ROLE DATA - Normal Roles
// ============================================================

export const NORMAL_ROLES: RoleDefinition[] = [
  {
    id: 'magang',
    name: 'Magang',
    type: 'normal',
    baseIncome: 50000,
    incomeType: 'per_turn',
    baseLuck: 45,
    stats: { negotiation: 3, investigation: 2, persuasion: 4, streetSmart: 2, charm: 5 },
    specialAbility: '10% chance naik level setiap giliran',
    flavorText: 'Semangat 45! Gaji kecil, mimpi besar.',
    progressionChain: ['karyawan', 'manager', 'direktur'],
  },
  {
    id: 'ojol_driver',
    name: 'Ojol Driver',
    type: 'normal',
    baseIncome: 75000,
    incomeType: 'per_steps',
    incomeSteps: 3,
    baseLuck: 55,
    stats: { negotiation: 5, investigation: 3, persuasion: 4, streetSmart: 6, charm: 3 },
    specialAbility: 'Bonus income untuk jarak jauh',
    flavorText: 'Gojek, Grab, atau sembako? Kirim aja.',
    progressionChain: ['kepala_ojol', 'regional_manager'],
  },
  {
    id: 'bartender',
    name: 'Bartender',
    type: 'normal',
    baseIncome: 60000,
    incomeType: 'per_turn',
    baseLuck: 50,
    stats: { negotiation: 7, investigation: 3, persuasion: 6, streetSmart: 5, charm: 7 },
    specialAbility: '20% chance dapat tips bonus',
    flavorText: 'Minumnya ready, dompetnya kosong.',
    progressionChain: ['bar_manager', 'club_owner'],
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    type: 'normal',
    baseIncome: 40000,
    incomeType: 'per_turn',
    baseLuck: 40,
    stats: { negotiation: 5, investigation: 4, persuasion: 5, streetSmart: 4, charm: 4 },
    specialAbility: '30% chance dapat project besar',
    flavorText: 'Deadline? What deadline?',
    progressionChain: ['studio_owner', 'agency_boss'],
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    type: 'normal',
    baseIncome: 30000,
    incomeType: 'per_turn',
    baseLuck: 60,
    stats: { negotiation: 4, investigation: 3, persuasion: 6, streetSmart: 3, charm: 8 },
    specialAbility: '15% chance viral (income x10)',
    flavorText: 'FYP atau nasi goreng?',
    progressionChain: ['influencer', 'brand_owner'],
  },
  {
    id: 'tukang_parkir',
    name: 'Tukang Parkir',
    type: 'normal',
    baseIncome: 55000,
    incomeType: 'per_turn',
    baseLuck: 50,
    stats: { negotiation: 4, investigation: 5, persuasion: 3, streetSmart: 7, charm: 3 },
    specialAbility: 'Boleh minta parkir ke pemain lain',
    flavorText: 'Parkir di sini, bayar di sana.',
    progressionChain: ['parking_lot_owner'],
  },
  {
    id: 'pedagang_kaki_lima',
    name: 'Pedagang Kaki Lima',
    type: 'normal',
    baseIncome: 45000,
    incomeType: 'per_turn',
    baseLuck: 45,
    stats: { negotiation: 6, investigation: 3, persuasion: 5, streetSmart: 6, charm: 4 },
    specialAbility: '25% chance double income',
    flavorText: 'Gorengan, bakso, atau jual beli mimpi.',
    progressionChain: ['warung', 'franchise'],
  },
  {
    id: 'security',
    name: 'Security',
    type: 'normal',
    baseIncome: 50000,
    incomeType: 'per_turn',
    baseLuck: 55,
    stats: { negotiation: 3, investigation: 6, persuasion: 3, streetSmart: 5, charm: 3 },
    specialAbility: '10% chance skip bayar sewa',
    flavorText: 'Satpam gate, jaga gerbang.',
    progressionChain: ['security_manager', 'kepala_keamanan'],
  },
];

// ============================================================
// MEME ROLES (Buff dari Legendary Cards)
// ============================================================

export const MEME_ROLES: MemeRoleBuff[] = [
  {
    id: 'anak_sultan',
    name: 'Anak Sultan',
    effect: { type: 'special', value: 30, special: 'properti_diskon_30' },
    sideEffect: 'Semua pemain lain +Rp100rb per giliranmu',
    luckPenalty: -20,
    toggleable: true,
    flavorText: 'Bapak gue sultan. Mau beli apa?',
  },
  {
    id: 'presiden_gorong_gorong',
    name: 'Presiden Gorong-Gorong',
    effect: { type: 'special', value: 1, special: 'pilih_1_properti_gratis' },
    sideEffect: 'Bisa di-impeach oleh pemain lain (gabung bayar Rp1jt)',
    luckPenalty: -30,
    toggleable: true,
    flavorText: 'Ketika kamu jadi presiden, semua gorong-gorong jadi milikmu.',
  },
  {
    id: 'emak_emak_power',
    name: 'Emak-emak Power',
    effect: { type: 'dice', value: 25, special: 'double_dadu' },
    sideEffect: '10% chance skip giliran (ngomel)',
    luckPenalty: -10,
    toggleable: true,
    flavorText: 'Emak-emak driver? Bisa bisa aja.',
  },
  {
    id: 'bocah_tiktok',
    name: 'Bocah TikTok',
    effect: { type: 'money', value: 5, special: 'x5_income' },
    sideEffect: '15% chance cancel culture -Rp500rb',
    luckPenalty: -15,
    toggleable: true,
    flavorText: 'FYP hari ini, di-cancel besok.',
  },
  {
    id: 'bapak_nongkrong',
    name: 'Bapak Nongkrong',
    effect: { type: 'special', value: 30, special: 'skip_sewa' },
    sideEffect: '20% chance kepanasan bayar 2x sewa',
    luckPenalty: -10,
    toggleable: true,
    flavorText: 'Nongkrong itu seni. Bayar parkir itu wajib.',
  },
  {
    id: 'tukang_gosek',
    name: 'Tukang Gosek',
    effect: { type: 'money', value: 50000, special: 'minta_uang_per_turn' },
    sideEffect: 'Properti beli 2x lipat harga',
    luckPenalty: -25,
    toggleable: true,
    flavorText: 'Sedekah itu indah. Gosek itu profesi.',
  },
  {
    id: 'pns_tiktok',
    name: 'PNS TikTok',
    effect: { type: 'special', special: 'income_immutable' },
    sideEffect: 'Nggak bisa beli properti (status fixed)',
    luckPenalty: -5,
    toggleable: false,
    flavorText: 'Gaji tetap, kerja fleksibel.',
  },
  {
    id: 'ojol_legendary',
    name: 'Ojol Legendary',
    effect: { type: 'special', value: 3, special: 'bonus_jarak_x3' },
    sideEffect: 'Bayar bensin Rp100rb setiap 3 giliran',
    luckPenalty: -15,
    toggleable: true,
    flavorText: '5 bintang, 1000 trip, nol istirahat.',
  },
  {
    id: 'warrior_wfh',
    name: 'Warrior WFH',
    effect: { type: 'special', value: 20, special: 'skip_bayar_20' },
    sideEffect: '10% chance Zoom crash bayar 3x',
    luckPenalty: -10,
    toggleable: true,
    flavorText: 'Meeting 1 jam, kerja 5 menit.',
  },
  {
    id: 'drama_queen',
    name: 'Drama Queen',
    effect: { type: 'interaction', value: 100000, special: 'paksa_bayar' },
    sideEffect: '25% chance burnout skip 1 giliran',
    luckPenalty: -15,
    toggleable: true,
    flavorText: 'Drama itu energi. Energi itu mahal.',
  },
];

// Helper functions
export function getNormalRoleById(id: string): RoleDefinition | undefined {
  return NORMAL_ROLES.find(role => role.id === id);
}

export function getMemeRoleById(id: string): MemeRoleBuff | undefined {
  return MEME_ROLES.find(role => role.id === id);
}

export function getAllRoles(): RoleDefinition[] {
  return NORMAL_ROLES;
}
