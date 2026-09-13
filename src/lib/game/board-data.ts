import { BoardCell } from '../types';

// ============================================================
// BOARD DATA - 40 Petak Monopoli WNI (Jakarta Megapolis Edition)
// Layout: 11x11 grid, cells counter-clockwise from bottom-right
// Map Zones: Jakarta Pusat, Selatan, Barat, Timur, Utara, Tangerang
// ============================================================

export const BOARD_CELLS: BoardCell[] = [
  // === START ===
  {
    index: 0, name: 'GAJI UMR JAKARTA', subtitle: 'Lewat Start', type: 'corner', group: null,
    price: null, rent: null, description: 'Lewat start, gaji UMR Jakarta Rp 5.3 juta',
    color: '#152f1f', groupColor: '#ffd56d', emoji: '⭐',
  },

  // === ZONA 1: JAKARTA PUSAT (Brown) ===
  // Cell 1 - Tanah Abang (Pasar Tradisional)
  {
    index: 1, name: 'Pasar Tanah Abang', subtitle: 'Pasar Tekstil', type: 'property', group: 'coklat',
    price: 150000, rent: 30000, description: 'Pasar tekstil terbesar se-Asia Tenggara',
    color: '#052011', groupColor: '#8B4513', emoji: '🏪',
  },
  // Cell 2 - Pajak Bumi (Tax)
  {
    index: 2, name: 'PBB Jakarta', subtitle: 'Pajak Bumi', type: 'tax', group: null,
    price: null, rent: null, description: 'Bayar PBB tahunan -Rp 100.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '📋',
  },
  // Cell 3 - Kos Gambir (Brown)
  {
    index: 3, name: 'Kos Gambir', subtitle: 'Dekat Istana', type: 'property', group: 'coklat',
    price: 180000, rent: 35000, description: 'Kos eksklusif Gambir, langganan PNS',
    color: '#052011', groupColor: '#8B4513', emoji: '🏠',
  },
  // Cell 4 - Kartu WNI (Takdir)
  {
    index: 4, name: 'Kartu WNI', subtitle: 'Ambil Kartu', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir WNI',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 5 - Warteg Senen (Brown)
  {
    index: 5, name: 'Warteg Senen', subtitle: 'Nasi Kuning', type: 'property', group: 'coklat',
    price: 200000, rent: 40000, description: 'Warteg legendaris Senen, lauk 12 macam',
    color: '#052011', groupColor: '#8B4513', emoji: '🍜',
  },
  // Cell 6 - KRL Commuter (Transport)
  {
    index: 6, name: 'Stasiun Senen', subtitle: 'KRL Commuter', type: 'property', group: 'transport',
    price: 300000, rent: 60000, description: 'Stasiun Senen, transit KRL commuter',
    color: '#052011', groupColor: '#4edea3', emoji: '🚆',
  },
  // Cell 7 - Dana Bansos (Kegiatan)
  {
    index: 7, name: 'Dana Bansos', subtitle: 'Ambil Kartu', type: 'draw_kegiatan', group: null,
    price: null, rent: null, description: 'Ambil kartu Dana Bansos',
    color: '#052011', groupColor: '#4edea3', emoji: '📦',
  },
  // Cell 8 - Indomaret Pusat (Cyan)
  {
    index: 8, name: 'Indomaret HQ', subtitle: 'Kantor Pusat', type: 'property', group: 'cyan',
    price: 220000, rent: 45000, description: 'Kantor pusat Indomaret, franchise terbesar',
    color: '#052011', groupColor: '#0ea5e9', emoji: '🏢',
  },

  // === ZONA 2: JAKARTA SELATAN (Cyan) ===
  // Cell 9 - Tebet Eco Park (Cyan)
  {
    index: 9, name: 'Tebet Eco Park', subtitle: 'Hijau Kota', type: 'property', group: 'cyan',
    price: 280000, rent: 55000, description: 'Taman hijau Tebet, viral Instagram',
    color: '#052011', groupColor: '#0ea5e9', emoji: '🌳',
  },
  // Cell 10 - TAHANAN KPK (Corner - Penjara)
  {
    index: 10, name: 'TAHANAN KPK', subtitle: 'OTT Mencengangkan', type: 'corner', group: null,
    price: null, rent: null, description: 'Kena razia OTT KPK, masuk tahanan',
    color: '#152f1f', groupColor: '#d1c5af', emoji: '🔒',
  },
  // Cell 11 - MRT Bundaran HI (Transport)
  {
    index: 11, name: 'MRT Bundaran HI', subtitle: 'Stasiun Elite', type: 'property', group: 'transport',
    price: 350000, rent: 70000, description: 'MRT Bundaran HI, jantung Jakarta',
    color: '#052011', groupColor: '#4edea3', emoji: '🚇',
  },
  // Cell 12 - Mall Senayan City (Kuning)
  {
    index: 12, name: 'Senayan City', subtitle: 'Mall Elite', type: 'property', group: 'kuning',
    price: 400000, rent: 80000, description: 'Senayan City, mall elite favorit sultan',
    color: '#052011', groupColor: '#eab308', emoji: '🏬',
  },
  // Cell 13 - Token Listrik (Event)
  {
    index: 13, name: 'Tagihan PLN', subtitle: 'Listrik Naik', type: 'event', group: null,
    price: null, rent: null, description: 'Tagihan PLN naik 30%, bayar -Rp 200.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '⚡',
  },
  // Cell 14 - SCBD Sudirman (Kuning)
  {
    index: 14, name: 'SCBD Sudirman', subtitle: 'Gedung Emas', type: 'property', group: 'kuning',
    price: 450000, rent: 90000, description: 'SCBD, gedung perkantoran termahal',
    color: '#052011', groupColor: '#eab308', emoji: '🏢',
  },
  // Cell 15 - Kebayoran Residence (Kuning)
  {
    index: 15, name: 'Kebayoran Baru', subtitle: 'Hunian Elit', type: 'property', group: 'kuning',
    price: 500000, rent: 100000, description: 'Kebayoran Baru, hunian diplomat',
    color: '#052011', groupColor: '#eab308', emoji: '🏛️',
  },

  // === ZONA 3: JAKARTA BARAT (Orange) ===
  // Cell 16 - Lampu Merah (Event)
  {
    index: 16, name: 'Macet Tomang', subtitle: 'Skip Putaran', type: 'event', group: null,
    price: null, rent: null, description: 'Macet parah Tomang, skip 1 putaran',
    color: '#052011', groupColor: '#ff6b6b', emoji: '🚦',
  },
  // Cell 17 - Dana Bansos (Kegiatan)
  {
    index: 17, name: 'Dana Bansos', subtitle: 'Ambil Kartu', type: 'draw_kegiatan', group: null,
    price: null, rent: null, description: 'Ambil kartu Dana Bansos',
    color: '#052011', groupColor: '#4edea3', emoji: '📦',
  },
  // Cell 18 - Mall Taman Anggrek (Orange)
  {
    index: 18, name: 'Taman Anggrek', subtitle: 'Mall Raksasa', type: 'property', group: 'orange',
    price: 550000, rent: 110000, description: 'Mall Taman Anggrek, ice skating legendaris',
    color: '#052011', groupColor: '#f97316', emoji: '🏬',
  },
  // Cell 19 - Grogol Plaza (Orange)
  {
    index: 19, name: 'Grogol Plaza', subtitle: 'Pusat Elektronik', type: 'property', group: 'orange',
    price: 580000, rent: 115000, description: 'Grogol, pusat elektronik dan gadget',
    color: '#052011', groupColor: '#f97316', emoji: '🖥️',
  },
  // Cell 20 - BEBAS PARKIR (Corner)
  {
    index: 20, name: 'BEBAS PARKIR', subtitle: 'Rest Area', type: 'corner', group: null,
    price: null, rent: null, description: 'Parkir gratis, istirahat sejenak',
    color: '#152f1f', groupColor: '#4edea3', emoji: '🅿️',
  },

  // === ZONA 4: JAKARTA TIMUR (Red) ===
  // Cell 21 - Cijantung Coffee (Red)
  {
    index: 21, name: 'Cijantung Kopi', subtitle: 'Kopi Viral', type: 'property', group: 'merah',
    price: 620000, rent: 125000, description: 'Kopi viral Cijantung, nongkrong anak muda',
    color: '#052011', groupColor: '#ef4444', emoji: '☕',
  },
  // Cell 22 - Kartu WNI (Takdir)
  {
    index: 22, name: 'Kartu WNI', subtitle: 'Ambil Kartu', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir WNI',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 23 - Pondok Indah Mall (Red)
  {
    index: 23, name: 'Pondok Indah', subtitle: 'Mall Premium', type: 'property', group: 'merah',
    price: 700000, rent: 140000, description: 'Pondok Indah Mall, surganya belanja',
    color: '#052011', groupColor: '#ef4444', emoji: '🏬',
  },
  // Cell 24 - Halte Transjakarta (Transport)
  {
    index: 24, name: 'Transjakarta', subtitle: 'Busway', type: 'property', group: 'transport',
    price: 400000, rent: 80000, description: 'Halte Transjakarta, transportasi umum',
    color: '#052011', groupColor: '#4edea3', emoji: '🚌',
  },
  // Cell 25 - Cawang Roundabout (Red)
  {
    index: 25, name: 'Bundaran Cawang', subtitle: 'Simpang Siur', type: 'property', group: 'merah',
    price: 650000, rent: 130000, description: 'Bundaran Cawang, simpang 5 Jakarta',
    color: '#052011', groupColor: '#ef4444', emoji: '🏗️',
  },
  // Cell 26 - Uji Emisi DKI (Tax)
  {
    index: 26, name: 'Uji Emisi DKI', subtitle: 'Tilang', type: 'tax', group: null,
    price: null, rent: null, description: 'Kena tilang uji emisi -Rp 150.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '💨',
  },
  // Cell 27 - Kemang Village (Red)
  {
    index: 27, name: 'Kemang Village', subtitle: 'Apartemen Elite', type: 'property', group: 'merah',
    price: 750000, rent: 150000, description: 'Kemang Village, apartemen ekspat',
    color: '#052011', groupColor: '#ef4444', emoji: '🏢',
  },

  // === ZONA 5: JAKARTA UTARA (Green) ===
  // Cell 28 - FOMO Kripto (Event)
  {
    index: 28, name: 'FOMO Kripto', subtitle: 'Volatile', type: 'event', group: null,
    price: null, rent: null, description: 'FOMO kripto! Bisa naik 200% atau turun 90%',
    color: '#052011', groupColor: '#4edea3', emoji: '🪙',
  },
  // Cell 29 - PIK 2 Beach (Green)
  {
    index: 29, name: 'PIK 2 Beach', subtitle: 'Villa Pantai', type: 'property', group: 'hijau',
    price: 800000, rent: 160000, description: 'PIK 2, villa pantai privat sultan',
    color: '#052011', groupColor: '#22c55e', emoji: '🏖️',
  },
  // Cell 30 - MASUK SEL (Corner - Penjara)
  {
    index: 30, name: 'MASUK SEL', subtitle: 'OTT KPK', type: 'corner', group: null,
    price: null, rent: null, description: 'Kena OTT KPK, langsung bui',
    color: '#2b1013', groupColor: '#ff6b6b', emoji: '⚖️',
  },
  // Cell 31 - Kelapa Gading Mall (Green)
  {
    index: 31, name: 'Mall Kelapa Gading', subtitle: 'Mall Terbesar', type: 'property', group: 'hijau',
    price: 850000, rent: 170000, description: 'Mall Kelapa Gading, mall terbesar Jakarta',
    color: '#052011', groupColor: '#22c55e', emoji: '🏬',
  },
  // Cell 32 - Pajak PPN 12% (Tax)
  {
    index: 32, name: 'PPN 12%', subtitle: 'Pajak', type: 'tax', group: null,
    price: null, rent: null, description: 'Bayar PPN 12% -Rp 250.000',
    color: '#052011', groupColor: '#ff6b6b', emoji: '📋',
  },
  // Cell 33 - Pantai Priok (Green)
  {
    index: 33, name: 'Tanjung Priok', subtitle: 'Pelabuhan', type: 'property', group: 'hijau',
    price: 780000, rent: 155000, description: 'Pelabuhan Tanjung Priok, gerbang perdagangan',
    color: '#052011', groupColor: '#22c55e', emoji: '⚓',
  },
  // Cell 34 - Kartu WNI (Takdir)
  {
    index: 34, name: 'Kartu WNI', subtitle: 'Ambil Kartu', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir WNI',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },

  // === ZONA 6: TANGERANG / BEKASI (Ungu - Premium) ===
  // Cell 35 - BSD City (Ungu)
  {
    index: 35, name: 'BSD City', subtitle: 'Kota Mandiri', type: 'property', group: 'ungu',
    price: 900000, rent: 180000, description: 'BSD City, kota mandiri terbesar',
    color: '#052011', groupColor: '#6366f1', emoji: '🏘️',
  },
  // Cell 36 - Dana Bansos (Kegiatan)
  {
    index: 36, name: 'Dana Bansos', subtitle: 'Ambil Kartu', type: 'draw_kegiatan', group: null,
    price: null, rent: null, description: 'Ambil kartu Dana Bansos',
    color: '#052011', groupColor: '#4edea3', emoji: '📦',
  },
  // Cell 37 - Monas (Ungu - Premium)
  {
    index: 37, name: 'Monas Ikon', subtitle: 'Lapangan Banteng', type: 'property', group: 'ungu',
    price: 1200000, rent: 240000, description: 'Monas, ikon Jakarta yang legendaris',
    color: '#052011', groupColor: '#6366f1', emoji: '🏛️',
  },
  // Cell 38 - Kartu WNI (Takdir)
  {
    index: 38, name: 'Kartu WNI', subtitle: 'Ambil Kartu', type: 'draw_takdir', group: null,
    price: null, rent: null, description: 'Ambil kartu Takdir WNI',
    color: '#052011', groupColor: '#ffcec9', emoji: '❓',
  },
  // Cell 39 - Bandara Soetta (Ungu - Premium)
  {
    index: 39, name: 'Soekarno-Hatta', subtitle: 'Bandara Internasional', type: 'property', group: 'ungu',
    price: 1100000, rent: 220000, description: 'Bandara Soekarno-Hatta, gerbang Indonesia',
    color: '#052011', groupColor: '#6366f1', emoji: '✈️',
  },
];

// ============================================================
// JAKARTA MAP ZONES - Visual Reference
// ============================================================
export const JAKARTA_ZONES = {
  'Jakarta Pusat': {
    color: '#8B4513',
    cells: [1, 3, 5],
    description: 'Pasar Tanah Abang, Gambir, Senen',
    emoji: '🏛️',
  },
  'Jakarta Selatan': {
    color: '#0ea5e9',
    cells: [9, 12, 14, 15],
    description: 'Tebet, Senayan, SCBD, Kebayoran',
    emoji: '🏙️',
  },
  'Jakarta Barat': {
    color: '#f97316',
    cells: [18, 19],
    description: 'Taman Anggrek, Grogol',
    emoji: '🌆',
  },
  'Jakarta Timur': {
    color: '#ef4444',
    cells: [21, 23, 25, 27],
    description: 'Cijantung, Pondok Indah, Cawang, Kemang',
    emoji: '🌇',
  },
  'Jakarta Utara': {
    color: '#22c55e',
    cells: [29, 31, 33],
    description: 'PIK 2, Kelapa Gading, Tanjung Priok',
    emoji: '🏖️',
  },
  'Tangerang & Bekasi': {
    color: '#6366f1',
    cells: [35, 37, 39],
    description: 'BSD City, Monas, Bandara Soetta',
    emoji: '✈️',
  },
};

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
