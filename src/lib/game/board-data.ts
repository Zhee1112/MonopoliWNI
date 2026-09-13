import { BoardCell } from '../types';

// ============================================================
// BOARD DATA - 40 Petak Monopoli WNI (Jakarta Edition)
// Layout: 11x11 grid, cells counter-clockwise from bottom-right
// ============================================================

export const BOARD_CELLS: BoardCell[] = [
  // Cell 0 - START / GAJIAN UMR (Bottom-Right Corner)
  {
    index: 0, name: 'GAJIAN UMR', subtitle: 'Lewat Petak', type: 'corner', group: null,
    price: null, rent: null, description: 'Lewat start, dapat gaji UMR',
    color: '#152f1f', groupColor: '#ffd56d', emoji: '⭐',
  },
  // Cell 1 - Pos Ronda / Siskamling
  {
    index: 1, name: 'Pos Ronda', subtitle: 'Aman', type: 'event', group: null,
    price: null, rent: null, description: 'Pos ronda warga, aman sentosa',
    color: '#052011', groupColor: '#4edea3', emoji: '☕',
  },
  // Cell 2 - Iuran RW (Tax)
  {
    index: 2, name: 'Iuran RW', subtitle: 'Retribusi', type: 'tax', group: null,
    price: null, rent: null, description: 'Bayar iuran warga -Rp 50.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '🧹',
  },
  // Cell 3 - Kontrakan 3 Petak (Brown)
  {
    index: 3, name: 'Kontrakan', subtitle: '3 Petak', type: 'property', group: 'coklat',
    price: 100000, rent: 20000, description: 'Kontrakan 3 petak murah meriah',
    color: '#052011', groupColor: '#8B4513', emoji: '🏠',
  },
  // Cell 4 - Dana Bansos
  {
    index: 4, name: 'Beras 10kg', subtitle: 'Ambil', type: 'draw_kegiatan', group: null,
    price: null, rent: null, description: 'Ambil kartu Dana Bansos',
    color: '#052011', groupColor: '#4edea3', emoji: '🍚',
  },
  // Cell 5 - Warkop 24 Jam (Brown)
  {
    index: 5, name: 'Warkop 24 Jam', subtitle: 'Indomie Telur', type: 'property', group: 'coklat',
    price: 120000, rent: 30000, description: 'Warkop buka 24 jam, Indomie telur hits',
    color: '#052011', groupColor: '#8B4513', emoji: '☕',
  },
  // Cell 6 - Stasiun Manggarai (Transport)
  {
    index: 6, name: 'Manggarai', subtitle: 'Transit KRL', type: 'property', group: 'transport',
    price: 200000, rent: 40000, description: 'Stasiun transit KRL pusat',
    color: '#052011', groupColor: '#4edea3', emoji: '🚆',
  },
  // Cell 7 - Takdir Netizen
  {
    index: 7, name: 'Netizen Nyinyir', subtitle: 'Takdir', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir Netizen',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 8 - Angkringan (Cyan)
  {
    index: 8, name: 'Angkringan', subtitle: 'Nasi Kucing', type: 'property', group: 'cyan',
    price: 140000, rent: 35000, description: 'Angkringan nasi kucing legendaris',
    color: '#052011', groupColor: '#0ea5e9', emoji: '🍜',
  },
  // Cell 9 - Warnet Jadul (Cyan)
  {
    index: 9, name: 'Warnet Jadul', subtitle: 'Billing Malam', type: 'property', group: 'cyan',
    price: 160000, rent: 40000, description: 'Warnet billing semalam suntuk',
    color: '#052011', groupColor: '#0ea5e9', emoji: '💻',
  },
  // Cell 10 - TAHANAN KPK (Corner - Penjara)
  {
    index: 10, name: 'TAHANAN KPK', subtitle: 'Hanya Mampir', type: 'corner', group: null,
    price: null, rent: null, description: 'Kena razia OTT KPK, masuk tahanan',
    color: '#152f1f', groupColor: '#d1c5af', emoji: '🔒',
  },
  // Cell 11 - MRT Bundaran HI (Transport)
  {
    index: 11, name: 'MRT Bundaran', subtitle: 'Transit MRT', type: 'property', group: 'transport',
    price: 200000, rent: 40000, description: 'Stasiun MRT Bundaran Hotel Indonesia',
    color: '#052011', groupColor: '#4edea3', emoji: '🚇',
  },
  // Cell 12 - Bakso Oplosan (Yellow)
  {
    index: 12, name: 'Bakso Oplosan', subtitle: 'Kaki Lima', type: 'property', group: 'kuning',
    price: 200000, rent: 45000, description: 'Bakso oplosan viral TikTok',
    color: '#052011', groupColor: '#eab308', emoji: '🍜',
  },
  // Cell 13 - Token Listrik (Event)
  {
    index: 13, name: 'Token Listrik', subtitle: 'Bayar Listrik', type: 'event', group: null,
    price: null, rent: null, description: 'Bayar token listrik Rp 150.000',
    color: '#052011', groupColor: '#4edea3', emoji: '⚡',
  },
  // Cell 14 - Es Teh Jumbo (Yellow)
  {
    index: 14, name: 'Es Teh Jumbo', subtitle: 'Manis Murah', type: 'property', group: 'kuning',
    price: 220000, rent: 45000, description: 'Es teh jumbo Rp 5.000 sepuasnya',
    color: '#052011', groupColor: '#eab308', emoji: '🧋',
  },
  // Cell 15 - Minimarket (Yellow)
  {
    index: 15, name: 'Minimarket', subtitle: '24 Jam', type: 'property', group: 'kuning',
    price: 250000, rent: 50000, description: 'Minimarket buka 24 jam',
    color: '#052011', groupColor: '#eab308', emoji: '🏪',
  },
  // Cell 16 - Lampu Merah (Skip Turn)
  {
    index: 16, name: 'Lampu Merah', subtitle: 'Lewat Putaran', type: 'event', group: null,
    price: null, rent: null, description: 'Kena lampu merah, skip 1 putaran',
    color: '#052011', groupColor: '#ff6b6b', emoji: '🚦',
  },
  // Cell 17 - Dana Bansos
  {
    index: 17, name: 'Bansos', subtitle: 'Ambil Kartu', type: 'draw_kegiatan', group: null,
    price: null, rent: null, description: 'Ambil kartu Dana Bansos',
    color: '#052011', groupColor: '#4edea3', emoji: '📦',
  },
  // Cell 18 - Kos Tebet (Orange)
  {
    index: 18, name: 'Kos Tebet', subtitle: 'Eksklusif', type: 'property', group: 'orange',
    price: 360000, rent: 70000, description: 'Kos eksklusif Tebet, full furnitur',
    color: '#052011', groupColor: '#f97316', emoji: '🏢',
  },
  // Cell 19 - SPBU Shell (Orange)
  {
    index: 19, name: 'SPBU Shell', subtitle: 'Premium', type: 'property', group: 'orange',
    price: 400000, rent: 80000, description: 'SPBU Shell premium, Pertamaxplus',
    color: '#052011', groupColor: '#f97316', emoji: '⛽',
  },
  // Cell 20 - BEBAS PARKIR (Top-Left Corner)
  {
    index: 20, name: 'BEBAS PARKIR', subtitle: 'Rest Area Angkot', type: 'corner', group: null,
    price: null, rent: null, description: 'Parkir gratis, istirahat sejenak',
    color: '#152f1f', groupColor: '#4edea3', emoji: '🅿️',
  },
  // Cell 21 - Senopati Hub (Red)
  {
    index: 21, name: 'Senopati Hub', subtitle: 'Cafe Cozy', type: 'property', group: 'merah',
    price: 480000, rent: 95000, description: 'Cafe cozy Senopati, nongkrong anak gaul',
    color: '#052011', groupColor: '#ef4444', emoji: '☕',
  },
  // Cell 22 - Takdir Netizen
  {
    index: 22, name: 'Netizen Nyinyir', subtitle: 'Takdir', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir Netizen',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 23 - Mall Senayan (Red)
  {
    index: 23, name: 'Mall Senayan', subtitle: 'Plaza Elite', type: 'property', group: 'merah',
    price: 520000, rent: 105000, description: 'Mall elite Senayan, belanja sepuasnya',
    color: '#052011', groupColor: '#ef4444', emoji: '🏬',
  },
  // Cell 24 - Bandara Soetta (Transport)
  {
    index: 24, name: 'Soekarno-Hatta', subtitle: 'Terminal 3', type: 'property', group: 'transport',
    price: 500000, rent: 100000, description: 'Bandara Internasional Soekarno-Hatta',
    color: '#052011', groupColor: '#4edea3', emoji: '✈️',
  },
  // Cell 25 - Sudirman SCBD (Yellow)
  {
    index: 25, name: 'Sudirman SCBD', subtitle: 'Gedung Emas', type: 'property', group: 'kuning',
    price: 600000, rent: 120000, description: 'SCBD Sudirman, gedung perkantoran emas',
    color: '#052011', groupColor: '#eab308', emoji: '🏢',
  },
  // Cell 26 - Uji Emisi DKI (Tax)
  {
    index: 26, name: 'Uji Emisi DKI', subtitle: 'Tilang', type: 'tax', group: null,
    price: null, rent: null, description: 'Kena tilang uji emisi -Rp 150.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '💨',
  },
  // Cell 27 - Menteng VIP (Yellow)
  {
    index: 27, name: 'Menteng VIP', subtitle: 'Hunian Elite', type: 'property', group: 'kuning',
    price: 750000, rent: 150000, description: 'Hunian elite Menteng, rumah pejabat',
    color: '#052011', groupColor: '#eab308', emoji: '🏛️',
  },
  // Cell 28 - Kripto Corner (Event)
  {
    index: 28, name: 'Kripto Corner', subtitle: 'FOMO', type: 'event', group: null,
    price: null, rent: null, description: 'FOMO kripto, volatile! Bisa naik atau turun',
    color: '#052011', groupColor: '#4edea3', emoji: '🪙',
  },
  // Cell 29 - PIK Ruko (Yellow)
  {
    index: 29, name: 'PIK Ruko', subtitle: 'Pusat Bisnis', type: 'property', group: 'kuning',
    price: 620000, rent: 125000, description: 'Ruko PIK, pusat bisnis anak Jaksel',
    color: '#052011', groupColor: '#eab308', emoji: '🏪',
  },
  // Cell 30 - RAZIA OTT KPK (Corner - Penjara)
  {
    index: 30, name: 'MASUK SEL', subtitle: 'Razia OTT KPK', type: 'corner', group: null,
    price: null, rent: null, description: 'Kena razia OTT KPK, langsung bui',
    color: '#2b1013', groupColor: '#ff6b6b', emoji: '⚖️',
  },
  // Cell 31 - Pajak PPN 12% (Tax)
  {
    index: 31, name: 'PPN 12%', subtitle: 'Pajak', type: 'tax', group: null,
    price: null, rent: null, description: 'Bayar PPN 12% -Rp 200.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '📋',
  },
  // Cell 32 - PIK 2 Resort (Green)
  {
    index: 32, name: 'PIK 2 Resort', subtitle: 'Villa Pantai', type: 'property', group: 'hijau',
    price: 680000, rent: 135000, description: 'Villa PIK 2, resort pantai privat',
    color: '#052011', groupColor: '#22c55e', emoji: '🏖️',
  },
  // Cell 33 - Pinjol Ilegal (Event)
  {
    index: 33, name: 'Pinjol Ilegal', subtitle: 'Tagih', type: 'event', group: null,
    price: null, rent: null, description: 'Pinjol ilegal nagih, bayar -Rp 300.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '💸',
  },
  // Cell 34 - Takdir Viral
  {
    index: 34, name: 'Takdir Viral', subtitle: 'Klarifikasi', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir Viral',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 35 - BSD City (Green)
  {
    index: 35, name: 'BSD City', subtitle: 'Kota Mandiri', type: 'property', group: 'hijau',
    price: 700000, rent: 140000, description: 'BSD City kota mandiri terbesar',
    color: '#052011', groupColor: '#22c55e', emoji: '🏘️',
  },
  // Cell 36 - Dana Bansos
  {
    index: 36, name: 'Kasos Warga', subtitle: 'Bansos', type: 'draw_kegiatan', group: null,
    price: null, rent: null, description: 'Ambil kartu Dana Bansos',
    color: '#052011', groupColor: '#4edea3', emoji: '📦',
  },
  // Cell 37 - Istana Garuda (Indigo/Premium)
  {
    index: 37, name: 'Istana Garuda', subtitle: 'Ibu Kota', type: 'property', group: 'ungu',
    price: 1000000, rent: 200000, description: 'Istana Garuda IKN, proyek mega masal',
    color: '#052011', groupColor: '#6366f1', emoji: '🏛️',
  },
  // Cell 38 - Takdir Netizen
  {
    index: 38, name: 'Takdir Netizen', subtitle: 'Nyinyir', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir Netizen',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 39 - IKN Kavling (Indigo/Premium)
  {
    index: 39, name: 'IKN Kavling', subtitle: 'Ibu Kota Baru', type: 'property', group: 'ungu',
    price: 900000, rent: 180000, description: 'Kavling IKN ibu kota baru',
    color: '#052011', groupColor: '#6366f1', emoji: '🏗️',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCellByIndex(index: number): BoardCell {
  return BOARD_CELLS[index] || BOARD_CELLS[0];
}

export function getPropertyCells(): BoardCell[] {
  return BOARD_CELLS.filter((cell) => cell.type === 'property');
}

export function getPropertyGroupColor(group: string): string {
  const colorMap: Record<string, string> = {
    coklat: '#8B4513',
    cyan: '#0ea5e9',
    kuning: '#eab308',
    orange: '#f97316',
    merah: '#ef4444',
    hijau: '#22c55e',
    ungu: '#6366f1',
    transport: '#4edea3',
  };
  return colorMap[group] || '#94a3b8';
}

// ============================================================
// GRID POSITIONS - Maps cell index to 11x11 grid position
// Board goes counter-clockwise from bottom-right
// ============================================================

export interface GridPosition {
  col: number;
  row: number;
  side: 'top' | 'bottom' | 'left' | 'right';
}

export function getGridPosition(index: number): GridPosition {
  // Bottom row (Row 11): Cells 0-10, right to left (Col 11 to Col 1)
  if (index >= 0 && index <= 10) {
    return { col: 11 - index, row: 11, side: 'bottom' };
  }
  // Left column (Col 1): Cells 11-19, bottom to top (Row 10 to Row 2)
  if (index >= 11 && index <= 19) {
    return { col: 1, row: 10 - (index - 11), side: 'left' };
  }
  // Top row (Row 1): Cells 20-30, left to right (Col 1 to Col 11)
  if (index >= 20 && index <= 30) {
    return { col: (index - 20) + 1, row: 1, side: 'top' };
  }
  // Right column (Col 11): Cells 31-39, top to bottom (Row 2 to Row 10)
  if (index >= 31 && index <= 39) {
    return { col: 11, row: (index - 31) + 2, side: 'right' };
  }
  return { col: 11, row: 11, side: 'bottom' };
}

export function isCornerCell(index: number): boolean {
  return [0, 10, 20, 30].includes(index);
}

export function getGroupCells(group: string): BoardCell[] {
  return BOARD_CELLS.filter((cell) => cell.group === group && cell.type === 'property');
}

export function calculateRent(baseRent: number, houseLevel: number, hasMonopoly: boolean): number {
  let rent = baseRent;
  rent += houseLevel * baseRent * 0.5;
  if (hasMonopoly) rent *= 1.5;
  return Math.round(rent);
}
