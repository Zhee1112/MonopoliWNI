import { Card, KegiatanCard } from '../types';

// ============================================================
// KARTU TAKDIR - Event Normal (27 kartu)
// ============================================================

export const EVENT_NORMAL_CARDS: Card[] = [
  // RINGAN (16 kartu)
  { id: 'en_01', name: 'Iuran RT', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -50000 }, frequency: 3, flavorText: 'Iuran RT naik terus, gaji nggak naik-naik.' },
  { id: 'en_02', name: 'Pungli Parkir 2 Ribu', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -75000 }, frequency: 3, flavorText: 'Parkir 2 ribu, tapi dompet nangis.' },
  { id: 'en_03', name: 'Dapat Sumbangan Tetangga', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 100000 }, frequency: 2, flavorText: 'Tetangga baik hati, semoga panjang umur.' },
  { id: 'en_04', name: 'Bonus Gajian Kecil', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 150000 }, frequency: 2, flavorText: 'Bonus kecil tapi bikin semangat.' },
  { id: 'en_05', name: 'Kena Tagihan Listrik', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -80000 }, frequency: 2, flavorText: 'Listrik naik, dompet turun.' },
  { id: 'en_06', name: 'Dapat Refund GoPay', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 50000 }, frequency: 2, flavorText: 'Refund? Langsung happy!' },
  { id: 'en_07', name: 'Parkir Liar', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -100000 }, frequency: 1, flavorText: 'Parkir liar, kena denda.' },
  { id: 'en_08', name: 'Jajan Sepuasnya', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -60000 }, frequency: 1, flavorText: 'Jajan enak, dompet kosong.' },
  { id: 'en_09', name: 'Dapat Cashback', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 75000 }, frequency: 2, flavorText: 'Cashback! Langsung beli lagi.' },
  { id: 'en_10', name: 'Bayar WiFi', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -55000 }, frequency: 2, flavorText: 'WiFi wajib, dunia tanpa internet = dunia tanpa warna.' },
  { id: 'en_11', name: 'Dapat Hadiah Ulang Tahun', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 200000 }, frequency: 1, flavorText: 'Happy birthday! Dapat duit, bukan doa.' },
  { id: 'en_12', name: 'Kena Denda Tilang', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -120000 }, frequency: 1, flavorText: 'Tilang? Siapa suruh nggak pakai helm.' },
  { id: 'en_13', name: 'Bayar Parkir Mall', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -45000 }, frequency: 2, flavorText: 'Parkir mall = mall dompet.' },
  { id: 'en_14', name: 'Dapat Tips dari Pelanggan', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 80000 }, frequency: 1, flavorText: 'Tips? Langsung jadi Sultan sesaat.' },
  { id: 'en_15', name: 'Bayar Sewa Kost', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: -90000 }, frequency: 2, flavorText: 'Sewa kost naik terus, gaji nggak naik.' },
  { id: 'en_16', name: 'Dapat Bonus Referral', tier: 'ringan', category: 'event_normal', effect: { type: 'money', value: 120000 }, frequency: 1, flavorText: 'Referral? Langsung kaya raya!' },

  // SEDANG (7 kartu)
  { id: 'en_17', name: 'FOMO Konser', tier: 'sedang', category: 'event_normal', effect: { type: 'money', value: -500000, special: 'atau_skip_1' }, frequency: 2, flavorText: 'Konser? Tiket habis, dompet nangis.' },
  { id: 'en_18', name: 'Kena Tilang', tier: 'sedang', category: 'event_normal', effect: { type: 'money', value: -750000 }, frequency: 2, flavorText: 'Tilang? Siapa suruh nggak bawa SIM.' },
  { id: 'en_19', name: 'Motor Mogok', tier: 'sedang', category: 'event_normal', effect: { type: 'skip', value: 1, special: 'bayar_200rb' }, frequency: 1, flavorText: 'Motor mogok, dompet juga mogok.' },
  { id: 'en_20', name: 'Dapat THR Kecil', tier: 'sedang', category: 'event_normal', effect: { type: 'money', value: 1000000 }, frequency: 1, flavorText: 'THR kecil tapi bikin happy!' },
  { id: 'en_21', name: 'HP Rusak', tier: 'sedang', category: 'event_normal', effect: { type: 'money', value: -1000000, special: 'atau_skip_1' }, frequency: 1, flavorText: 'HP rusak, mau beli baru mahal.' },
  { id: 'en_22', name: 'Kena Phising', tier: 'sedang', category: 'event_normal', effect: { type: 'money', value: -400000 }, frequency: 1, flavorText: 'Klik link sembarangan, dompet melayang.' },
  { id: 'en_23', name: 'Dapat Bonus Proyek', tier: 'sedang', category: 'event_normal', effect: { type: 'money', value: 800000 }, frequency: 1, flavorText: 'Proyek baru, dompet baru!' },

  // BERAT (4 kartu)
  { id: 'en_24', name: 'Investasi Bodong', tier: 'berat', category: 'event_normal', effect: { type: 'dice', special: 'genap_x2_ganjil_80persen' }, frequency: 1, flavorText: 'Investasi bodong? Semoga berhasil.' },
  { id: 'en_25', name: 'Crypto Pom-Pom', tier: 'berat', category: 'event_normal', effect: { type: 'dice', special: 'genap_plus3jt_ganjil_minus2jt' }, frequency: 1, flavorText: 'To the moon or to zero?' },
  { id: 'en_26', name: 'Pinjaman Darurat', tier: 'berat', category: 'event_normal', effect: { type: 'money', value: -1000000, target: 'all', special: 'semua_pemain_plus500rb' }, frequency: 1, flavorText: 'Pinjaman darurat, semua dapat jatah.' },
  { id: 'en_27', name: 'Byone dari Atasan', tier: 'berat', category: 'event_normal', effect: { type: 'money', value: 2000000, special: 'bayar_pajak_30persen' }, frequency: 1, flavorText: 'Byone? Siapa bilang gratis?' },
];

// ============================================================
// KARTU TAKDIR - Event Meme (20 kartu)
// ============================================================

export const EVENT_MEME_CARDS: Card[] = [
  // STEREOTIP KEHIDUPAN (10 kartu)
  { id: 'em_01', name: 'Anak Sultan', tier: 'berat', category: 'event_meme', effect: { type: 'money', value: 2000000, target: 'all', special: 'semua_plus500rb' }, luckModifier: { source: 'anak_sultan', amount: 10, isPermanent: true }, frequency: 1, flavorText: 'Anak sultan? Semua orang dapat jatah.' },
  { id: 'em_02', name: 'Emak-emak Driver', tier: 'sedang', category: 'event_meme', effect: { type: 'skip', value: 1, special: 'dapat_500rb' }, luckModifier: { source: 'emak_driver', amount: 5, isPermanent: false }, frequency: 1, flavorText: 'Emak-emak driver? Bisa bisa aja.' },
  { id: 'em_03', name: 'Ojol Rating 4.9', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: 200000, special: '10persen_n level' }, luckModifier: { source: 'ojol_rating', amount: 3, isPermanent: false }, frequency: 1, flavorText: 'Rating 4.9, semangat 100!' },
  { id: 'em_04', name: 'PNS Scrolling HP', tier: 'ringan', category: 'event_meme', effect: { type: 'skip', value: 1 }, luckModifier: { source: 'pns_scroll', amount: -2, isPermanent: false }, frequency: 1, flavorText: 'PNS scrolling HP, kerjaan numpuk.' },
  { id: 'em_05', name: 'Tukang Parkir Professional', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: 50000, special: 'semua_radius3_bayar' }, luckModifier: { source: 'tukang_parkir', amount: 2, isPermanent: false }, frequency: 1, flavorText: 'Parkir pro, semua harus bayar.' },
  { id: 'em_06', name: 'Security Mall Power Trip', tier: 'sedang', category: 'event_meme', effect: { type: 'interaction', value: 300000, special: 'pilih_pemain_bayar_atau_skip' }, luckModifier: { source: 'security_trip', amount: 5, isPermanent: false }, frequency: 1, flavorText: 'Security gate, semua harus tunduk.' },
  { id: 'em_07', name: 'Ibu RT Gossip', tier: 'ringan', category: 'event_meme', effect: { type: 'special', special: 'lihat_3_kartu_pilih_1' }, luckModifier: { source: 'ibu_rt', amount: 3, isPermanent: false }, frequency: 1, flavorText: 'Ibu RT gossip, semua orang tahu.' },
  { id: 'em_08', name: 'Bapak-bapak Sendal Jepit', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: 100000 }, luckModifier: { source: 'bapak_sandal', amount: 2, isPermanent: false }, frequency: 1, flavorText: 'Bapak-bapak santai, dompet happy.' },
  { id: 'em_09', name: 'Pedagang Lima Ribu', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: 150000, special: '20persen_plus500rb' }, luckModifier: { source: 'pedagang_5rb', amount: 2, isPermanent: false }, frequency: 1, flavorText: 'Jualan lima ribu, untung jutaan.' },
  { id: 'em_10', name: 'Anak Kos World Problems', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: -100000 }, luckModifier: { source: 'anak_kos', amount: -3, isPermanent: false }, frequency: 1, flavorText: 'Anak kos, dunia penuh masalah.' },

  // MEME VIRAL (6 kartu)
  { id: 'em_11', name: 'FYP TikTok', tier: 'sedang', category: 'event_meme', effect: { type: 'money', value: 1000000, special: 'buka_info_semua_pemain' }, luckModifier: { source: 'fyp_tiktok', amount: 8, isPermanent: false }, frequency: 1, flavorText: 'FYP! Semua orang tahu posisimu.' },
  { id: 'em_12', name: 'Viral Challenge', tier: 'sedang', category: 'event_meme', effect: { type: 'dice', special: 'roll_2x_pilih_terbaik' }, luckModifier: { source: 'viral_challenge', amount: 5, isPermanent: false }, frequency: 1, flavorText: 'Viral challenge? Semua orang ikut.' },
  { id: 'em_13', name: 'Ghosting', tier: 'sedang', category: 'event_meme', effect: { type: 'skip', value: 1, special: 'minus_200rb' }, luckModifier: { source: 'ghosting', amount: -5, isPermanent: false }, frequency: 1, flavorText: 'Ghosting? Dompet juga di-ghost.' },
  { id: 'em_14', name: 'Ditagih Invoice', tier: 'berat', category: 'event_meme', effect: { type: 'money', special: 'bayar_20persen_saldo' }, luckModifier: { source: 'ditagih', amount: -8, isPermanent: false }, frequency: 1, flavorText: 'Ditagih invoice, dompet menangis.' },
  { id: 'em_15', name: 'Bapakmu Presiden', tier: 'berat', category: 'event_meme', effect: { type: 'property', special: 'pilih_1_properti_gratis' }, luckModifier: { source: 'presiden', amount: 15, isPermanent: true }, frequency: 1, flavorText: 'Bapakmu presiden? Privilege activated.' },
  { id: 'em_16', name: 'Main HP di Rapat', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: -50000 }, luckModifier: { source: 'main_hp', amount: -2, isPermanent: false }, frequency: 1, flavorText: 'Main HP di rapat, ketahuan bos.' },

  // REALITA EKONOMI (4 kartu)
  { id: 'em_17', name: 'Guru Honorer Mengajar', tier: 'sedang', category: 'event_meme', effect: { type: 'money', value: 500000, special: 'skip_1_giliran' }, luckModifier: { source: 'guru_honorer', amount: 5, isPermanent: false }, frequency: 1, flavorText: 'Guru honorer? Semangat mengajar!' },
  { id: 'em_18', name: 'Anak Jaksel Bilingual', tier: 'ringan', category: 'event_meme', effect: { type: 'special', special: 'properti_premium_naik_10' }, luckModifier: { source: 'jaksel', amount: 3, isPermanent: false }, frequency: 1, flavorText: 'Anak Jaksel, dunia berubah.' },
  { id: 'em_19', name: 'Emak-emak Pasar Tradisional', tier: 'ringan', category: 'event_meme', effect: { type: 'property', special: 'diskon_15persen' }, luckModifier: { source: 'emak_pasar', amount: 3, isPermanent: false }, frequency: 1, flavorText: 'Emak-emak pasar, harga pasti murah.' },
  { id: 'em_20', name: 'Bapak Warung Nongkrong', tier: 'ringan', category: 'event_meme', effect: { type: 'money', value: 75000 }, luckModifier: { source: 'bapak_warung', amount: 2, isPermanent: false }, frequency: 1, flavorText: 'Bapak warung, semua orang kenal.' },
];

// ============================================================
// KARTU TAKDIR - Interaksi (32 kartu)
// ============================================================

export const INTERAKSI_CARDS: Card[] = [
  // UANG/TRANSFER (10 kartu)
  { id: 'int_01', name: 'Ditagih Invoice', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', value: 500000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Ditagih terus, dompet nangis.' },
  { id: 'int_02', name: 'Pungli Parkir', tier: 'ringan', category: 'interaksi', effect: { type: 'interaction', value: 200000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Parkir berbayar, semua harus taat.' },
  { id: 'int_03', name: 'Emak-emak Minta Sumbangan', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', value: 300000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Iuran RT naik terus, gaji nggak naik.' },
  { id: 'int_04', name: 'Ojol Cancel', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', value: 200000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Ojol cancel? Siapa suruh buru-buru.' },
  { id: 'int_05', name: 'Pedagang Naik Harga', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_bayar_2x_harga_beli' }, frequency: 1, flavorText: 'Inflasi, semua harga naik.' },
  { id: 'int_06', name: 'Ghosting Invoice', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', value: 400000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Ditagih tapi di-ghost, dompet nangis.' },
  { id: 'int_07', name: 'Anak Sultan Flexing', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', value: 300000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Sultan flexing, semua harus bayar.' },
  { id: 'int_08', name: 'Tukang Parkir Pro', tier: 'ringan', category: 'interaksi', effect: { type: 'interaction', value: 150000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Parkir pro, semua harus taat.' },
  { id: 'int_09', name: 'Ibu RT Gossip', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', value: 250000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'Gossip RT, semua orang tahu.' },
  { id: 'int_10', name: 'PNS Scrolling', tier: 'ringan', category: 'interaksi', effect: { type: 'interaction', value: 200000, special: 'target_bayar_ke_draw' }, frequency: 1, flavorText: 'PNS main HP, kerjaan numpuk.' },

  // PROPERTI (8 kartu)
  { id: 'int_11', name: 'Sita Properti', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: '1_properti_dijual_50' }, frequency: 1, flavorText: 'Disita, semuanya hilang.' },
  { id: 'int_12', name: 'Pindah Kosan', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_pindah_random' }, frequency: 1, flavorText: 'Pindah kosan, semua berubah.' },
  { id: 'int_13', name: 'Anak Kos Ugal-ugalan', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'properti_level_min_1' }, frequency: 1, flavorText: 'Anak kos rusuh, semua kena.' },
  { id: 'int_14', name: 'Tukang Gosek', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'ambil_1_properti_gratis' }, frequency: 1, flavorText: 'Gosek mode, semua gratis.' },
  { id: 'int_15', name: 'Emak-emak Parkir Liar', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'properti_nggak_disewa_1_turn' }, frequency: 1, flavorText: 'Parkir liar, semuanya nggak jalan.' },
  { id: 'int_16', name: 'Security Gate', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_nggak_beli_properti_1_turn' }, frequency: 1, flavorText: 'Security gate, semua harus izin.' },
  { id: 'int_17', name: 'Kontrakan Digusur', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: '1_properti_hilang' }, frequency: 1, flavorText: 'Digusur, semuanya ludes.' },
  { id: 'int_18', name: 'Tetangga Rewel', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'sewa_min_50_1_turn' }, frequency: 1, flavorText: 'Tetangga rese, semua terpengaruh.' },

  // GILIRAN/STATUS (8 kartu)
  { id: 'int_19', name: 'Ghosting', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_skip_1_turn' }, frequency: 1, flavorText: 'Di-ghosting, semua hilang.' },
  { id: 'int_20', name: 'Emak-emak Marah', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_skip_1_plus_bayar_200rb' }, frequency: 1, flavorText: 'Emak marah, semua kena.' },
  { id: 'int_21', name: 'Bapak-bapak Ngomel', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_skip_plus_minus_100rb_luck' }, frequency: 1, flavorText: 'Bapak ngomel, semua panas.' },
  { id: 'int_22', name: 'FOMO Konser', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_bayar_500rb_atau_skip' }, frequency: 1, flavorText: 'FOMO? Semua orang harus bayar.' },
  { id: 'int_23', name: 'Kena Tilang', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_bayar_300rb_plus_skip' }, frequency: 1, flavorText: 'Tilang? Semua harus taat.' },
  { id: 'int_24', name: 'WFH Zoom Crash', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_bayar_200rb_plus_luck_5' }, frequency: 1, flavorText: 'Zoom crash, semua nganggur.' },
  { id: 'int_25', name: 'Drama Queen Burnout', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_bayar_300rb_plus_luck_10' }, frequency: 1, flavorText: 'Burnout, semua lelah.' },
  { id: 'int_26', name: 'Bocah TikTok Cancel', tier: 'sedang', category: 'interaksi', effect: { type: 'interaction', special: 'target_bayar_400rb_plus_luck_8' }, frequency: 1, flavorText: 'Cancel culture, semua kena.' },

  // LUCK/DADU (6 kartu)
  { id: 'int_27', name: 'Boneso', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'target_luck_15_permanen' }, frequency: 1, flavorText: 'Boneso sial, semua berubah.' },
  { id: 'int_28', name: 'Mercury Retrograde', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'target_luck_10_permanen' }, frequency: 1, flavorText: 'Retrograde, semua kacau.' },
  { id: 'int_29', name: 'Dukun Digital', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'target_luck_20_permanen' }, frequency: 1, flavorText: 'Dukun online, semua berubah.' },
  { id: 'int_30', name: 'Kena Kuping', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'target_luck_10_permanen' }, frequency: 1, flavorText: 'Kena kuping, semua mendengar.' },
  { id: 'int_31', name: 'Horoskop Sial', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'target_luck_12_permanen' }, frequency: 1, flavorText: 'Zodiak sial, semua terpengaruh.' },
  { id: 'int_32', name: 'Tuyul Digital', tier: 'berat', category: 'interaksi', effect: { type: 'interaction', special: 'target_income_50_3_turn' }, frequency: 1, flavorText: 'Tuyul digital, semua kehilangan.' },
];

// ============================================================
// KARTU TAKDIR - Koruptor (8 kartu)
// ============================================================

export const KORUPTOR_CARDS: Card[] = [
  { id: 'kor_01', name: 'Money Printer Go Brrr', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 5000000, special: 'luck_30_semua_plus500rb_bisa_impeach' }, frequency: 1, flavorText: 'BI: *klik* Money printer: 🖨️💵💵💵' },
  { id: 'kor_02', name: 'Proyek Gajah Putih', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 8000000, special: 'luck_35_2_properti_50_semua_plus300rb' }, frequency: 1, flavorText: 'Proyeknya fiktif, tapi RAB-nya real banget.' },
  { id: 'kor_03', name: 'Dana Desa Raib Misterius', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 3000000, special: 'luck_20_bayar_1jt_semua_plus200rb' }, frequency: 1, flavorText: 'Dana desa raib, ditemukan di rekening orang ganteng.' },
  { id: 'kor_04', name: 'Paket Sembako Buat Pacar', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 4000000, special: 'luck_25_semua_dapat_properti_gratis' }, frequency: 1, flavorText: 'Bansos harusnya buat rakyat, tapi ini buat jajan gebetan.' },
  { id: 'kor_05', name: 'Kursi Panas Dijual di Shopee', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 6000000, special: 'luck_30_bayar_2jt_ke_pemain_luck_tertinggi' }, frequency: 1, flavorText: 'Jabatan = barang dagangan. COD juga boleh.' },
  { id: 'kor_06', name: 'Zakatnya Ketuker Sama Amal', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 10000000, special: 'luck_40_semua_plus1jt_bisa_dilapor' }, frequency: 1, flavorText: 'Niatnya zakat, ujung-ujungnya jadi amal jariyah ke rekening sendiri.' },
  { id: 'kor_07', name: 'Token PLN Gratis Seumur Hidup', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 2000000, special: 'luck_15_bayar_500rb_3_pemain_random' }, frequency: 1, flavorText: 'Listrik gratis? Cuma ada di mimpi dan di korupsi.' },
  { id: 'kor_08', name: 'Bantuan Hilang di Jalan', tier: 'berat', category: 'koruptor', effect: { type: 'money', value: 7000000, special: 'luck_35_1_properti_disita_semua_plus400rb' }, frequency: 1, flavorText: 'Bantuan hilang di jalan, ketemu di dompet sendiri. Alhamdulillah.' },
];

// ============================================================
// KARTU TAKDIR - Audit (5 kartu)
// ============================================================

export const AUDIT_CARDS: Card[] = [
  { id: 'audit_01', name: 'Audit Mendadak', tier: 'sedang', category: 'audit', effect: { type: 'special', special: 'random_1_pemain_sita_50_duit_kotor' }, frequency: 1, flavorText: 'Audit mendadak, semua kaget.' },
  { id: 'audit_02', name: 'Tax Audit', tier: 'berat', category: 'audit', effect: { type: 'special', special: 'semua_pemain_bayar_10_saldo' }, frequency: 1, flavorText: 'Tax audit, semua harus bayar.' },
  { id: 'audit_03', name: 'KPK Datang', tier: 'berat', category: 'audit', effect: { type: 'special', special: 'pemain_duit_kotor_terbanyak_sita_semua' }, frequency: 1, flavorText: 'KPK datang, semua panik.' },
  { id: 'audit_04', name: 'Sidak BPK', tier: 'sedang', category: 'audit', effect: { type: 'special', special: 'random_2_pemain_sita_75_duit_kotor' }, frequency: 1, flavorText: 'Sidak BPK, semua diawasi.' },
  { id: 'audit_05', name: 'Inspeksi Dadakan', tier: 'ringan', category: 'audit', effect: { type: 'special', special: 'random_1_pemain_bayar_20_duit_kotor' }, frequency: 1, flavorText: 'Inspeksi dadakan, semua harus siap.' },
];

// ============================================================
// KARTU TAKDIR - Legendaris (10 kartu)
// ============================================================

export const LEGENDARY_CARDS: Card[] = [
  { id: 'leg_01', name: 'Gorong-Gorong Legendaris', tier: 'legendary', category: 'legendary', effect: { type: 'role', special: 'presiden_gorong_gorong' }, luckModifier: { source: 'gorong_gorong', amount: -30, isPermanent: true }, frequency: 1, flavorText: 'Ketika kamu jadi presiden, semua gorong-gorong jadi milikmu. Tapi rakyat bisa impeach.' },
  { id: 'leg_02', name: 'KTP Anak Sultan', tier: 'legendary', category: 'legendary', effect: { type: 'money', value: 5000000, special: 'anak_sultan_role' }, luckModifier: { source: 'ktp_sultan', amount: -20, isPermanent: true }, frequency: 1, flavorText: 'KTP gold plated, semua diskon. Tapi pajaknya bikin nangis.' },
  { id: 'leg_03', name: 'Dukun Political', tier: 'legendary', category: 'legendary', effect: { type: 'money', value: 0, special: 'semua_pemain_minus_1jt' }, luckModifier: { source: 'dukun_political', amount: -15, isPermanent: true }, frequency: 1, flavorText: 'Dukun political, semua kena.' },
  { id: 'leg_04', name: 'Tuyul Digital', tier: 'legendary', category: 'legendary', effect: { type: 'special', special: 'income_x2_permanen' }, luckModifier: { source: 'tuyul_digital', amount: -25, isPermanent: true }, frequency: 1, flavorText: 'Tuyul versi digital, income x2. Tapi kadang tuyulnya kabur ke blockchain.' },
  { id: 'leg_05', name: 'Mogul Gosek', tier: 'legendary', category: 'legendary', effect: { type: 'property', special: 'semua_properti_murah_gratis' }, luckModifier: { source: 'mogul_gosek', amount: -30, isPermanent: true }, frequency: 1, flavorText: 'Mogul gosek, semua gratis.' },
  { id: 'leg_06', name: 'Presiden TikTok', tier: 'legendary', category: 'legendary', effect: { type: 'interaction', special: 'semua_bayar_300rb_ke_kamu' }, luckModifier: { source: 'presiden_tiktok', amount: -20, isPermanent: true }, frequency: 1, flavorText: 'Presiden TikTok, semua harus like.' },
  { id: 'leg_07', name: 'Sultan Miskin', tier: 'legendary', category: 'legendary', effect: { type: 'money', value: 10000000, special: 'saldo_langsung_10jt' }, luckModifier: { source: 'sultan_miskin', amount: -35, isPermanent: true }, frequency: 1, flavorText: 'Sultan miskin, kaya raya tapi sial.' },
  { id: 'leg_08', name: 'Time Traveler', tier: 'legendary', category: 'legendary', effect: { type: 'special', special: 'kembali_0_plus_3jt' }, luckModifier: { source: 'time_traveler', amount: -10, isPermanent: true }, frequency: 1, flavorText: 'Time traveler, kembali ke masa lalu.' },
  { id: 'leg_09', name: 'Black Hole', tier: 'legendary', category: 'legendary', effect: { type: 'special', special: '1_pemain_bankrupt_minus_5jt_luck_20' }, luckModifier: { source: 'black_hole', amount: -40, isPermanent: true }, frequency: 1, flavorText: 'Black hole, semuanya hilang.' },
  { id: 'leg_10', name: 'Infinity Stone', tier: 'legendary', category: 'legendary', effect: { type: 'dice', special: '3x_dadu_permanen' }, luckModifier: { source: 'infinity_stone', amount: -25, isPermanent: true }, frequency: 1, flavorText: 'Infinity stone, 3x dadu. Tapi 10% properti hancur.' },
];

// ============================================================
// SEMUA KARTU TAKDIR DIGABUNG
// ============================================================

export const ALL_TAKDIR_CARDS: Card[] = [
  ...EVENT_NORMAL_CARDS,
  ...EVENT_MEME_CARDS,
  ...INTERAKSI_CARDS,
  ...KORUPTOR_CARDS,
  ...AUDIT_CARDS,
  ...LEGENDARY_CARDS,
];

// Helper functions
export function getCardsByCategory(category: string): Card[] {
  return ALL_TAKDIR_CARDS.filter(card => card.category === category);
}

export function getCardsByTier(tier: string): Card[] {
  return ALL_TAKDIR_CARDS.filter(card => card.tier === tier);
}

export function drawRandomCard(): Card {
  const roll = Math.random() * 100;
  let category: string;

  if (roll < 35) category = 'event_normal';
  else if (roll < 55) category = 'event_meme';
  else if (roll < 80) category = 'interaksi';
  else if (roll < 88) category = 'koruptor';
  else if (roll < 93) category = 'audit';
  else category = 'legendary';

  const cards = getCardsByCategory(category);
  return cards[Math.floor(Math.random() * cards.length)];
}

export function drawRandomCardExcluding(excludeIds: string[]): Card {
  const roll = Math.random() * 100;
  let category: string;

  if (roll < 35) category = 'event_normal';
  else if (roll < 55) category = 'event_meme';
  else if (roll < 80) category = 'interaksi';
  else if (roll < 88) category = 'koruptor';
  else if (roll < 93) category = 'audit';
  else category = 'legendary';

  let cards = getCardsByCategory(category).filter(c => !excludeIds.includes(c.id));

  if (cards.length === 0) {
    cards = ALL_TAKDIR_CARDS.filter(c => !excludeIds.includes(c.id));
  }
  if (cards.length === 0) {
    cards = getCardsByCategory(category);
  }

  return cards[Math.floor(Math.random() * cards.length)];
}

export function getCardById(cardId: string): Card | undefined {
  return ALL_TAKDIR_CARDS.find(card => card.id === cardId);
}
