import { KegiatanCard } from '../types';

// ============================================================
// KARTU KEGIATAN (100 kartu)
// ============================================================

// --- KATEGORI A: Usaha/Startup (20 kartu) ---
export const KEGIATAN_USAHA: KegiatanCard[] = [
  { id: 'ku_01', name: 'Buka Warung Kopi', category: 'usaha', positive: { money: 300000 }, negative: { money: -100000 }, roleBonus: { pedagang_kaki_lima: 0.5 }, flavorText: 'Warung kopi? Semua orang butuh kopi.' },
  { id: 'ku_02', name: 'Jualan Gorengan', category: 'usaha', positive: { money: 200000 }, negative: { money: -50000 }, roleBonus: { pedagang_kaki_lima: 0.5 }, flavorText: 'Gorengan? Semua orang suka.' },
  { id: 'ku_03', name: 'Buka Laundry Kiloan', category: 'usaha', positive: { money: 250000 }, negative: { money: -80000 }, roleBonus: { freelancer: 0.3 }, flavorText: 'Laundry? Anak kos pasti datang.' },
  { id: 'ku_04', name: 'Reseller Frozen Food', category: 'usaha', positive: { money: 350000 }, negative: { money: -120000 }, roleBonus: { ojol_driver: 0.4 }, flavorText: 'Frozen food? Semua orang butuh makan.' },
  { id: 'ku_05', name: 'Buka Cuci Motor', category: 'usaha', positive: { money: 280000 }, negative: { money: -70000 }, roleBonus: { security: 0.3 }, flavorText: 'Cuci motor? Semua orang butuh bersih.' },
  { id: 'ku_06', name: 'Jualan Es Teh', category: 'usaha', positive: { money: 220000 }, negative: { money: -60000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Es teh viral everywhere.' },
  { id: 'ku_07', name: 'Buka Toko Kelontong', category: 'usaha', positive: { money: 400000 }, negative: { money: -150000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Toko kelontong, semua kebutuhan ada.' },
  { id: 'ku_08', name: 'Freelance Design', category: 'usaha', positive: { money: 350000 }, negative: { money: -90000 }, roleBonus: { freelancer: 0.5 }, flavorText: 'Design? Kreativitas tanpa batas.' },
  { id: 'ku_09', name: 'Buka Jasa Foto', category: 'usaha', positive: { money: 300000 }, negative: { money: -100000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Foto? Semua orang butuh kenang-kenangan.' },
  { id: 'ku_10', name: 'Jualan Snack Viral', category: 'usaha', positive: { money: 280000 }, negative: { money: -80000 }, roleBonus: { content_creator: 0.6 }, flavorText: 'Snack viral? Semua orang suka.' },
  { id: 'ku_11', name: 'Buka Petshop', category: 'usaha', positive: { money: 500000 }, negative: { money: -200000 }, roleBonus: { magang: 0.3 }, flavorText: 'Petshop? Hewan juga butuh perhatian.' },
  { id: 'ku_12', name: 'Reseller Sepatu', category: 'usaha', positive: { money: 450000 }, negative: { money: -180000 }, roleBonus: { anak_sultan: 0.4 }, flavorText: 'Sepatu? Fashion tanpa batas.' },
  { id: 'ku_13', name: 'Buka Barbershop', category: 'usaha', positive: { money: 380000 }, negative: { money: -130000 }, roleBonus: { bartender: 0.3 }, flavorText: 'Barbershop? Semua orang butuh potong rambut.' },
  { id: 'ku_14', name: 'Jualan Kopi Kekinian', category: 'usaha', positive: { money: 320000 }, negative: { money: -110000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Kopi kekinian? Semua orang butuh kafein.' },
  { id: 'ku_15', name: 'Buka Mini Market', category: 'usaha', positive: { money: 600000 }, negative: { money: -250000 }, roleBonus: { pedagang_kaki_lima: 0.3 }, flavorText: 'Mini market? Semua kebutuhan ada.' },
  { id: 'ku_16', name: 'Freelance Developer', category: 'usaha', positive: { money: 500000 }, negative: { money: -150000 }, roleBonus: { freelancer: 0.6 }, flavorText: 'Developer? Kode = uang.' },
  { id: 'ku_17', name: 'Buka Salon Rumahan', category: 'usaha', positive: { money: 280000 }, negative: { money: -90000 }, roleBonus: { bartender: 0.4 }, flavorText: 'Salon? Semua orang butuh kecantikan.' },
  { id: 'ku_18', name: 'Jualan Nasi Goreng', category: 'usaha', positive: { money: 200000 }, negative: { money: -60000 }, roleBonus: { pedagang_kaki_lima: 0.5 }, flavorText: 'Nasi goreng? Makanan sejuta umat.' },
  { id: 'ku_19', name: 'Buka Les Privat', category: 'usaha', positive: { money: 350000 }, negative: { money: -80000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Les privat? Semua orang butuh belajar.' },
  { id: 'ku_20', name: 'Reseller Kosmetik', category: 'usaha', positive: { money: 400000 }, negative: { money: -120000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Kosmetik? Semua orang butuh cantik.' },
];

// --- KATEGORI B: Kerja Sampingan (20 kartu) ---
export const KEGIATAN_KERJA: KegiatanCard[] = [
  { id: 'kk_01', name: 'Jadi Ojol Extra Shift', category: 'kerja_sampingan', positive: { money: 150000 }, negative: { money: -30000 }, roleBonus: { ojol_driver: 0.6 }, flavorText: 'Extra shift, extra income.' },
  { id: 'kk_02', name: 'Antar Paket Sehari', category: 'kerja_sampingan', positive: { money: 100000 }, negative: { money: -20000 }, roleBonus: { ojol_driver: 0.5 }, flavorText: 'Antar paket, semua tepat waktu.' },
  { id: 'kk_03', name: 'Jadi Barista Tampan', category: 'kerja_sampingan', positive: { money: 180000 }, negative: { money: -40000 }, roleBonus: { bartender: 0.6 }, flavorText: 'Barista tampan, semua orang senang.' },
  { id: 'kk_04', name: 'Freelance Content Writer', category: 'kerja_sampingan', positive: { money: 200000 }, negative: { money: -50000 }, roleBonus: { freelancer: 0.5 }, flavorText: 'Content writer? Kata-kata adalah senjata.' },
  { id: 'kk_05', name: 'Jadi MC Acara', category: 'kerja_sampingan', positive: { money: 250000 }, negative: { money: -60000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'MC acara, semua orang tertawa.' },
  { id: 'kk_06', name: 'Jualan di Pasar Pagi', category: 'kerja_sampingan', positive: { money: 150000 }, negative: { money: -40000 }, roleBonus: { pedagang_kaki_lima: 0.6 }, flavorText: 'Pasar pagi, semua orang belanja.' },
  { id: 'kk_07', name: 'Antar Makanan', category: 'kerja_sampingan', positive: { money: 120000 }, negative: { money: -25000 }, roleBonus: { ojol_driver: 0.5 }, flavorText: 'Antar makanan, semua orang lapar.' },
  { id: 'kk_08', name: 'Jadi Resepsionis', category: 'kerja_sampingan', positive: { money: 130000 }, negative: { money: -35000 }, roleBonus: { magang: 0.4 }, flavorText: 'Resepsionis, semua orang datang.' },
  { id: 'kk_09', name: 'Kerja di Cafe', category: 'kerja_sampingan', positive: { money: 160000 }, negative: { money: -45000 }, roleBonus: { bartender: 0.5 }, flavorText: 'Cafe? Semua orang butuh kopi.' },
  { id: 'kk_10', name: 'Jualan Snack Kantoran', category: 'kerja_sampingan', positive: { money: 140000 }, negative: { money: -30000 }, roleBonus: { pedagang_kaki_lima: 0.5 }, flavorText: 'Snack kantoran? Semua orang butuh ngemil.' },
  { id: 'kk_11', name: 'Jadi Freelance Photographer', category: 'kerja_sampingan', positive: { money: 220000 }, negative: { money: -70000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Photographer? Semua orang butuh foto.' },
  { id: 'kk_12', name: 'Kerja Part-time Retail', category: 'kerja_sampingan', positive: { money: 110000 }, negative: { money: -25000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Retail? Semua orang butuh belanja.' },
  { id: 'kk_13', name: 'Jadi Sales Produk', category: 'kerja_sampingan', positive: { money: 180000 }, negative: { money: -50000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Sales? Semua orang butuh produk.' },
  { id: 'kk_14', name: 'Antar Barang Marketplace', category: 'kerja_sampingan', positive: { money: 100000 }, negative: { money: -20000 }, roleBonus: { ojol_driver: 0.6 }, flavorText: 'Marketplace? Semua orang belanja online.' },
  { id: 'kk_15', name: 'Jadi Host Live Shopping', category: 'kerja_sampingan', positive: { money: 250000 }, negative: { money: -80000 }, roleBonus: { content_creator: 0.7 }, flavorText: 'Live shopping? Semua orang tergoda.' },
  { id: 'kk_16', name: 'Kerja di Minimarket', category: 'kerja_sampingan', positive: { money: 90000 }, negative: { money: -15000 }, roleBonus: { pedagang_kaki_lima: 0.3 }, flavorText: 'Minimarket? Semua orang butuh belanja.' },
  { id: 'kk_17', name: 'Jualan Takjil', category: 'kerja_sampingan', positive: { money: 170000 }, negative: { money: -40000 }, roleBonus: { pedagang_kaki_lima: 0.5 }, flavorText: 'Takjil? Semua orang butuh berbuka.' },
  { id: 'kk_18', name: 'Jadi Sound System Operator', category: 'kerja_sampingan', positive: { money: 130000 }, negative: { money: -35000 }, roleBonus: { bartender: 0.4 }, flavorText: 'Sound system? Semua orang butuh musik.' },
  { id: 'kk_19', name: 'Freelance Video Editor', category: 'kerja_sampingan', positive: { money: 200000 }, negative: { money: -60000 }, roleBonus: { freelancer: 0.5 }, flavorText: 'Video editor? Semua orang butuh editing.' },
  { id: 'kk_20', name: 'Jadi Kurir Privat', category: 'kerja_sampingan', positive: { money: 110000 }, negative: { money: -25000 }, roleBonus: { ojol_driver: 0.5 }, flavorText: 'Kurir privat? Semua orang butuh antar.' },
];

// --- KATEGORI C: Investasi Spekulatif (20 kartu) ---
export const KEGIATAN_INVESTASI: KegiatanCard[] = [
  { id: 'ki_01', name: 'Invest Saham Blue Chip', category: 'investasi', positive: { money: 500000 }, negative: { money: -200000 }, roleBonus: { freelancer: 0.3 }, flavorText: 'Saham blue chip? Aman tapi lambat.' },
  { id: 'ki_02', name: 'Beli Crypto Altcoin', category: 'investasi', positive: { money: 800000 }, negative: { money: -400000 }, roleBonus: { content_creator: 0.4 }, flavorText: 'Crypto? To the moon or to zero.' },
  { id: 'ki_03', name: 'Invest Reksadana', category: 'investasi', positive: { money: 300000 }, negative: { money: -80000 }, roleBonus: { magang: 0.5 }, flavorText: 'Reksadana? Aman dan stabil.' },
  { id: 'ki_04', name: 'Trading Harian', category: 'investasi', positive: { money: 600000 }, negative: { money: -300000 }, roleBonus: { freelancer: 0.3 }, flavorText: 'Trading? High risk, high reward.' },
  { id: 'ki_05', name: 'Beli Emas Antam', category: 'investasi', positive: { money: 250000 }, negative: { money: -50000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Emas? Aman dari inflasi.' },
  { id: 'ki_06', name: 'Invest Properti Kecil', category: 'investasi', positive: { money: 700000 }, negative: { money: -250000 }, roleBonus: { pedagang_kaki_lima: 0.3 }, flavorText: 'Properti? Aman tapi mahal.' },
  { id: 'ki_07', name: 'Beli Saham IPO', category: 'investasi', positive: { money: 550000 }, negative: { money: -180000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'IPO? Berani coba, berani untung.' },
  { id: 'ki_08', name: 'Invest Peer-to-Peer', category: 'investasi', positive: { money: 400000 }, negative: { money: -150000 }, roleBonus: { magang: 0.4 }, flavorText: 'P2P? Semua orang bisa invest.' },
  { id: 'ki_09', name: 'Beli Stock Bitcoin', category: 'investasi', positive: { money: 900000 }, negative: { money: -500000 }, roleBonus: { content_creator: 0.3 }, flavorText: 'Bitcoin? Semua orang tergoda.' },
  { id: 'ki_10', name: 'Invest ORI (Sukuk)', category: 'investasi', positive: { money: 200000 }, negative: { money: -30000 }, roleBonus: { magang: 0.6 }, flavorText: 'ORI? Aman dari pemerintah.' },
  { id: 'ki_11', name: 'Trading Komoditas', category: 'investasi', positive: { money: 650000 }, negative: { money: -280000 }, roleBonus: { freelancer: 0.3 }, flavorText: 'Komoditas? Semua orang butuh.' },
  { id: 'ki_12', name: 'Beli Tanah Kavling', category: 'investasi', positive: { money: 800000 }, negative: { money: -350000 }, roleBonus: { pedagang_kaki_lima: 0.3 }, flavorText: 'Tanah? Aman dari inflasi.' },
  { id: 'ki_13', name: 'Invest Startup Lokal', category: 'investasi', positive: { money: 500000 }, negative: { money: -200000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Startup? Berani coba, berani untung.' },
  { id: 'ki_14', name: 'Beli Musik NFT', category: 'investasi', positive: { money: 400000 }, negative: { money: -180000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'NFT? Seni digital.' },
  { id: 'ki_15', name: 'Invest Sawit', category: 'investasi', positive: { money: 350000 }, negative: { money: -120000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Sawit? Indonesia kaya sawit.' },
  { id: 'ki_16', name: 'Beli Obligasi Pemerintah', category: 'investasi', positive: { money: 200000 }, negative: { money: -20000 }, roleBonus: { magang: 0.6 }, flavorText: 'Obligasi? Aman dari pemerintah.' },
  { id: 'ki_17', name: 'Trading Forex', category: 'investasi', positive: { money: 700000 }, negative: { money: -350000 }, roleBonus: { freelancer: 0.2 }, flavorText: 'Forex? High risk, high reward.' },
  { id: 'ki_18', name: 'Invest Kripto DeFi', category: 'investasi', positive: { money: 600000 }, negative: { money: -300000 }, roleBonus: { content_creator: 0.3 }, flavorText: 'DeFi? Semua orang tergoda.' },
  { id: 'ki_19', name: 'Beli Tanah Produktif', category: 'investasi', positive: { money: 550000 }, negative: { money: -200000 }, roleBonus: { pedagang_kaki_lima: 0.3 }, flavorText: 'Tanah produktif? Aman dan menghasilkan.' },
  { id: 'ki_20', name: 'Invest Film Pendek', category: 'investasi', positive: { money: 300000 }, negative: { money: -100000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Film pendek? Seni tanpa batas.' },
];

// --- KATEGORI D: Kegiatan Sosial (20 kartu) ---
export const KEGIATAN_SOSIAL: KegiatanCard[] = [
  { id: 'ks_01', name: 'Acara Arisan', category: 'sosial', positive: { money: 150000 }, negative: { money: -50000 }, roleBonus: { bartender: 0.4 }, flavorText: 'Arisan? Semua orang ikut.' },
  { id: 'ks_02', name: 'Kondangan', category: 'sosial', positive: { money: 200000 }, negative: { money: -100000 }, roleBonus: { bartender: 0.3 }, flavorText: 'Kondangan? Semua orang datang.' },
  { id: 'ks_03', name: 'Reuni Sekolah', category: 'sosial', positive: { money: 100000 }, negative: { money: -30000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Reuni? Semua orang kangen.' },
  { id: 'ks_04', name: 'Buka Bersama', category: 'sosial', positive: { money: 120000 }, negative: { money: -40000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Buka bersama? Semua orang lapar.' },
  { id: 'ks_05', name: 'Donasi Online', category: 'sosial', positive: { money: 80000 }, negative: { money: -20000 }, roleBonus: { content_creator: 0.6 }, flavorText: 'Donasi? Semua orang baik hati.' },
  { id: 'ks_06', name: 'Acara Kantor', category: 'sosial', positive: { money: 250000 }, negative: { money: -80000 }, roleBonus: { magang: 0.5 }, flavorText: 'Acara kantor? Semua orang senang.' },
  { id: 'ks_07', name: 'Main ke Rumah Teman', category: 'sosial', positive: { money: 50000 }, negative: { money: -10000 }, roleBonus: { bartender: 0.5 }, flavorText: 'Main ke rumah teman? Semua orang senang.' },
  { id: 'ks_08', name: 'Nongkrong di Warkop', category: 'sosial', positive: { money: 80000 }, negative: { money: -25000 }, roleBonus: { bartender: 0.4 }, flavorText: 'Warkop? Semua orang nongkrong.' },
  { id: 'ks_09', name: 'Ikut Komunitas', category: 'sosial', positive: { money: 150000 }, negative: { money: -40000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Komunitas? Semua orang ikut.' },
  { id: 'ks_10', name: 'Volunteering', category: 'sosial', positive: { money: 100000 }, negative: { money: -20000 }, roleBonus: { magang: 0.6 }, flavorText: 'Volunteering? Semua orang baik hati.' },
  { id: 'ks_11', name: 'Acara Keluarga', category: 'sosial', positive: { money: 180000 }, negative: { money: -60000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Acara keluarga? Semua orang datang.' },
  { id: 'ks_12', name: 'Camping Ground', category: 'sosial', positive: { money: 120000 }, negative: { money: -40000 }, roleBonus: { freelancer: 0.5 }, flavorText: 'Camping? Semua orang senang.' },
  { id: 'ks_13', name: 'Karaokean', category: 'sosial', positive: { money: 90000 }, negative: { money: -30000 }, roleBonus: { bartender: 0.5 }, flavorText: 'Karaoke? Semua orang bernyanyi.' },
  { id: 'ks_14', name: 'Makan di Restoran', category: 'sosial', positive: { money: 150000 }, negative: { money: -70000 }, roleBonus: { pedagang_kaki_lima: 0.3 }, flavorText: 'Restoran? Semua orang lapar.' },
  { id: 'ks_15', name: 'Pesta Ulang Tahun', category: 'sosial', positive: { money: 200000 }, negative: { money: -80000 }, roleBonus: { content_creator: 0.4 }, flavorText: 'Pesta? Semua orang senang.' },
  { id: 'ks_16', name: 'Workout di Gym', category: 'sosial', positive: { money: 80000 }, negative: { money: -20000 }, roleBonus: { security: 0.5 }, flavorText: 'Gym? Semua orang sehat.' },
  { id: 'ks_17', name: 'Ikut Seminar', category: 'sosial', positive: { money: 180000 }, negative: { money: -50000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Seminar? Semua orang belajar.' },
  { id: 'ks_18', name: 'Main ke Pantai', category: 'sosial', positive: { money: 100000 }, negative: { money: -30000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Pantai? Semua orang senang.' },
  { id: 'ks_19', name: 'Acara Amal', category: 'sosial', positive: { money: 120000 }, negative: { money: -40000 }, roleBonus: { magang: 0.5 }, flavorText: 'Acara amal? Semua orang baik hati.' },
  { id: 'ks_20', name: 'Nonton Konser', category: 'sosial', positive: { money: 200000 }, negative: { money: -100000 }, roleBonus: { content_creator: 0.4 }, flavorText: 'Konser? Semua orang terhibur.' },
];

// --- KATEGORI E: Tantangan & Chance (20 kartu) ---
export const KEGIATAN_TANTANGAN: KegiatanCard[] = [
  { id: 'kt_01', name: 'Lempar Dadu 3x', category: 'tantangan', positive: { money: 0, special: 'hasil_x3' }, negative: { money: 0, special: 'hasil_div3' }, roleBonus: {}, flavorText: 'Lempar dadu? Semua orang beruntung.' },
  { id: 'kt_02', name: 'Tebak Angka', category: 'tantangan', positive: { money: 500000 }, negative: { money: -200000 }, roleBonus: { content_creator: 0.4 }, flavorText: 'Tebak angka? Semua orang jago.' },
  { id: 'kt_03', name: 'Wheel of Fortune', category: 'tantangan', positive: { money: 0, special: 'spin_hadiah' }, negative: { money: 0, special: 'spin_denda' }, roleBonus: {}, flavorText: 'Wheel of Fortune? Semua orang beruntung.' },
  { id: 'kt_04', name: 'Challenge Push-up', category: 'tantangan', positive: { money: 100000 }, negative: { money: -50000 }, roleBonus: { security: 0.6 }, flavorText: 'Push-up? Semua orang kuat.' },
  { id: 'kt_05', name: 'Joget TikTok', category: 'tantangan', positive: { money: 200000 }, negative: { money: -80000 }, roleBonus: { content_creator: 0.7 }, flavorText: 'Joget TikTok? Semua orang jago.' },
  { id: 'kt_06', name: 'Nyanyi Karaoke', category: 'tantangan', positive: { money: 150000 }, negative: { money: -60000 }, roleBonus: { bartender: 0.5 }, flavorText: 'Karaoke? Semua orang jago nyanyi.' },
  { id: 'kt_07', name: 'Masak Indomie', category: 'tantangan', positive: { money: 80000 }, negative: { money: -30000 }, roleBonus: { pedagang_kaki_lima: 0.5 }, flavorText: 'Indomie? Semua orang jago masak.' },
  { id: 'kt_08', name: 'Jual Beli Barang Bekas', category: 'tantangan', positive: { money: 250000 }, negative: { money: -100000 }, roleBonus: { pedagang_kaki_lima: 0.4 }, flavorText: 'Barang bekas? Semua orang punya.' },
  { id: 'kt_09', name: 'Bantu Tetangga', category: 'tantangan', positive: { money: 100000, luckBonus: 5 }, negative: { money: 0, luckPenalty: 3 }, roleBonus: { bartender: 0.5 }, flavorText: 'Bantu tetangga? Semua orang baik hati.' },
  { id: 'kt_10', name: 'Cari Harta Karun', category: 'tantangan', positive: { money: 400000 }, negative: { money: -100000 }, roleBonus: { freelancer: 0.3 }, flavorText: 'Harta karun? Semua orang pencari.' },
  { id: 'kt_11', name: 'Tantangan Puasa Sehari', category: 'tantangan', positive: { money: 200000 }, negative: { money: -80000 }, roleBonus: { magang: 0.5 }, flavorText: 'Puasa? Semua orang kuat.' },
  { id: 'kt_12', name: 'Ikut Lomba', category: 'tantangan', positive: { money: 300000 }, negative: { money: -120000 }, roleBonus: { content_creator: 0.4 }, flavorText: 'Lomba? Semua orang berkompetisi.' },
  { id: 'kt_13', name: 'Pameran Karya', category: 'tantangan', positive: { money: 500000 }, negative: { money: -150000 }, roleBonus: { freelancer: 0.5 }, flavorText: 'Pameran? Semua orang kreatif.' },
  { id: 'kt_14', name: 'Street Performance', category: 'tantangan', positive: { money: 200000 }, negative: { money: -80000 }, roleBonus: { content_creator: 0.6 }, flavorText: 'Street performance? Semua orang jago.' },
  { id: 'kt_15', name: 'Jualan di Marketplace', category: 'tantangan', positive: { money: 300000 }, negative: { money: -120000 }, roleBonus: { freelancer: 0.4 }, flavorText: 'Marketplace? Semua orang belanja online.' },
  { id: 'kt_16', name: 'Ikut Hackathon', category: 'tantangan', positive: { money: 1000000 }, negative: { money: -200000 }, roleBonus: { freelancer: 0.5 }, flavorText: 'Hackathon? Semua orang jago kode.' },
  { id: 'kt_17', name: 'Design Challenge', category: 'tantangan', positive: { money: 400000 }, negative: { money: -100000 }, roleBonus: { freelancer: 0.6 }, flavorText: 'Design challenge? Semua orang kreatif.' },
  { id: 'kt_18', name: 'Foto Produk', category: 'tantangan', positive: { money: 250000 }, negative: { money: -80000 }, roleBonus: { content_creator: 0.5 }, flavorText: 'Foto produk? Semua orang jago foto.' },
  { id: 'kt_19', name: 'Live Streaming', category: 'tantangan', positive: { money: 500000 }, negative: { money: -150000 }, roleBonus: { content_creator: 0.7 }, flavorText: 'Live streaming? Semua orang terhibur.' },
  { id: 'kt_20', name: 'Jackpot Activity', category: 'tantangan', positive: { money: 0, special: 'random_500rb_5jt' }, negative: { money: 0, special: 'random_200rb_2jt' }, roleBonus: {}, flavorText: 'Jackpot? Semua orang beruntung.' },
];

// ============================================================
// SEMUA KARTU KEGIATAN DIGABUNG
// ============================================================

export const ALL_KEGIATAN_CARDS: KegiatanCard[] = [
  ...KEGIATAN_USAHA,
  ...KEGIATAN_KERJA,
  ...KEGIATAN_INVESTASI,
  ...KEGIATAN_SOSIAL,
  ...KEGIATAN_TANTANGAN,
];

// Helper functions
export function getKegiatanByCategory(category: string): KegiatanCard[] {
  return ALL_KEGIATAN_CARDS.filter(card => card.category === category);
}

export function drawRandomKegiatan(): KegiatanCard {
  const categories = ['usaha', 'kerja_sampingan', 'investasi', 'sosial', 'tantangan'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const cards = getKegiatanByCategory(randomCategory);
  return cards[Math.floor(Math.random() * cards.length)];
}

export function drawRandomKegiatanExcluding(excludeIds: string[]): KegiatanCard {
  const categories = ['usaha', 'kerja_sampingan', 'investasi', 'sosial', 'tantangan'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  let cards = getKegiatanByCategory(randomCategory).filter(c => !excludeIds.includes(c.id));

  if (cards.length === 0) {
    cards = ALL_KEGIATAN_CARDS.filter(c => !excludeIds.includes(c.id));
  }
  if (cards.length === 0) {
    cards = getKegiatanByCategory(randomCategory);
  }

  return cards[Math.floor(Math.random() * cards.length)];
}

export function getKegiatanById(cardId: string): KegiatanCard | undefined {
  return ALL_KEGIATAN_CARDS.find(card => card.id === cardId);
}
