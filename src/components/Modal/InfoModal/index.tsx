'use client'

import { useState } from 'react'

interface InfoModalProps {
  onClose: () => void
}

const ROLE_STATS = [
  {
    emoji: '🐸',
    title: 'Kodok WFH',
    stats: { strategy: 'C+ / B', luck: 'B', negotiation: 'A' },
    passive: 'Sewa lokasi Pinggiran -10% sewa',
    playstyle: 'Defensif',
    tier: 'Tier B',
  },
  {
    emoji: '💹',
    title: 'Anak Kos Saham',
    stats: { strategy: 'B+', luck: 'A', negotiation: 'C' },
    passive: '+20% hasil takdir (laba dividen/untung)',
    playstyle: 'High Risk',
    tier: 'Tier A',
  },
  {
    emoji: '🧑‍💼',
    title: 'PNS Level 7',
    stats: { strategy: 'A', luck: 'C', negotiation: 'B+' },
    passive: 'Bebas biaya admin bank selama 3 giliran',
    playstyle: 'Control',
    tier: 'Tier A',
  },
  {
    emoji: '🫠',
    title: 'Emak-emak Sirkel',
    stats: { strategy: 'C', luck: 'B', negotiation: 'A' },
    passive: 'Denda turun 20% → ganti rugi naik 20%',
    playstyle: 'Nego King',
    tier: 'Tier B',
  },
  {
    emoji: '🧘',
    title: 'Dukun Digital',
    stats: { strategy: 'C', luck: 'A', negotiation: 'B' },
    passive: 'Efek takdir buruk bisa "tolak" 1x per 3 giliran',
    playstyle: 'High Risk',
    tier: 'Tier S',
  },
  {
    emoji: '🐍',
    title: 'Teman Kos Toxic',
    stats: { strategy: 'B', luck: 'C', negotiation: 'A' },
    passive: 'Setiap kena denda → 50% bayar, 50% lempar ke pemain terdekat',
    playstyle: 'Agresif',
    tier: 'Tier S',
  },
  {
    emoji: '🏎️',
    title: 'Anak Sultan',
    stats: { strategy: 'C', luck: 'C', negotiation: 'S' },
    passive: 'Awal game: +Rp100.000 bonus kas. Sewa lokasi Premium -15%',
    playstyle: 'Agro',
    tier: 'Tier A',
  },
  {
    emoji: '⚖️',
    title: 'Warga Lokal',
    stats: { strategy: 'B', luck: 'A', negotiation: 'B+' },
    passive: 'Sewa lokasi Pinggiran +20% untuk pemain lain',
    playstyle: 'Nego',
    tier: 'Tier A',
  },
]

const STAT_INFO = {
  'Strategy (C → S)': 'Menentukan stat bonus saat DnD check. Strategi tinggi = lebih mudah lolos.',
  'Luck (C → S)': 'Modifikator hoki (45% dari luck). Luck tinggi = lebih sering dapat efek bagus.',
  'Negotiation (C → S)': 'Menentukan kemampuan negosiasi sewa dan interaksi pemain lain.',
}

const TIMELINE = [
  { icon: '1️⃣', title: 'Buat / Masuk Room', desc: 'Undang teman atau tambah bot (2-8 pemain)' },
  { icon: '2️⃣', title: 'Pilih Mode', desc: 'BUNDIR (bertahan hidup), KAYA RAYA (20 babak), atau KILAT (10 babak)' },
  { icon: '3️⃣', title: 'Pilih Role', desc: '8 role unik dengan stat & passive berbeda' },
  { icon: '4️⃣', title: 'Roll Dadu (1x per turn)', desc: 'Kocok dadu 2d6 untuk menentukan langkah. Hanya boleh roll sekali!' },
  { icon: '5️⃣', title: 'Bergerak di Peta', desc: 'Pion bergerak sejumlah langkah. Lewat Start = +Rp100.000' },
  { icon: '6️⃣', title: 'Hadapi Petak', desc: 'Properti, Event, Takdir, Kegiatan, atau Pajak — setiap petak punya efek beda' },
  { icon: '7️⃣', title: 'DnD Check', desc: 'Roll 1d6 + stat + bukti warga vs DC. PASS = sukses, FAIL = penalty + bisa sogok!' },
  { icon: '8️⃣', title: 'Upgrade Properti', desc: 'Upgrade sampai Level 4, atau jadikan Landmark (Level 5, tak bisa ditakeover)' },
  { icon: '9️⃣', title: 'Event Global', desc: 'Setiap babak (mulai babak 2) ada event chaos yang mempengaruhi semua pemain' },
  { icon: '🔟', title: 'Kumpulkan Bukti', desc: 'Dari kartu audit/koruptor. Pakai saat DnD untuk bonus skor' },
  { icon: '💰', title: 'Koleksi Pot', desc: 'Mendarat di Bebas Parkir = ambil seluruh pool dana kas + Rp100.000' },
  { icon: '👑', title: 'Menang!', desc: 'BUNDIR: terakhir bertahan. KAYA RAYA: terkaya di babak 20. KILAT: terkaya di babak 10.' },
]

const ZONES = [
  {
    color: 'bg-[#1a1a2e]',
    name: 'Jakarta Pinggiran',
    range: 'Rp80.000 - 140.000',
    role: 'PNS',
    desc: 'Area suburban yang terjangkau untuk pekerja keras.',
  },
  {
    color: 'bg-[#1a1a2e]',
    name: 'Jakarta Perkotaan',
    range: 'Rp180.000 - 380.000',
    role: 'Teman Kos Toxic',
    desc: 'Area komersial yang sibuk dan strategis.',
  },
  {
    color: 'bg-[#1a1a2e]',
    name: 'Jakarta Elite',
    range: 'Rp450.000 - 700.000',
    role: 'Kodok WFH',
    desc: 'Area perkantoran modern dan gedung tinggi.',
  },
  {
    color: 'bg-[#1a1a2e]',
    name: 'Jakarta Premium',
    range: 'Rp900.000 - 950.000',
    role: 'Anak Sultan',
    desc: 'Area premium untuk elite Jakarta.',
  },
]

export default function InfoModal({ onClose }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState('cara-main')

  const tabs = [
    { id: 'cara-main', label: 'Cara Bermain' },
    { id: 'role-stats', label: '8 Role & Stats' },
    { id: 'peraturan', label: 'Aturan & Mekanik' },
    { id: 'peta', label: 'Peta Jakarta' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative flex h-[85vh] w-full max-w-[800px] flex-col rounded-2xl border border-[#203a29] bg-[#0a1a11] shadow-[0_0_40px_rgba(78,222,163,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl border-b border-[#203a29] bg-[#0c1f14] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4edea3]/20 text-lg">📖</span>
            <div>
              <h2 className="font-sans text-lg font-bold text-[#e4e4e7]">Panduan & Ensiklopedia</h2>
              <p className="text-xs text-[#777]">Semua info game di satu tempat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-[#888] hover:border-[#4edea3] hover:text-[#4edea3]"
            >
              <span className="text-sm">📥</span>
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-[#888] hover:border-[#ff4757] hover:text-[#ff4757]"
            >
              <span className="text-sm">✕</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#203a29] bg-[#0a1510] px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#4edea3] text-[#001809] shadow-[0_0_15px_rgba(78,222,163,0.3)]'
                  : 'text-[#777] hover:bg-[#1a2a22] hover:text-[#e4e4e7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'cara-main' && (
            <div className="space-y-4">
              <div className="mb-6 rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-2 text-base font-bold text-[#e4e4e7]">Cara Bermain</h3>
                <p className="text-xs leading-relaxed text-[#777]">
                  Monopoli WNI adalah board game 2-8 pemain bergaya Monopoly dengan mekanik DnD.
                  Setiap langkah menentukan nasibmu berdasarkan Role, Stat, dan Keberuntungan.
                  Ada 3 mode: BUNDIR (bertahan hidup 999 babak), KAYA RAYA (terkaya di babak 20), KILAT (10 babak, 2x uang).
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TIMELINE.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-[#203a29] bg-[#0a1510] p-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#4edea3]/10 text-sm">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#e4e4e7]">{step.title}</h4>
                      <p className="text-xs text-[#777]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'role-stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {ROLE_STATS.map((role, i) => (
                  <div key={i} className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4edea3]/20 text-2xl">
                        {role.emoji}
                      </span>
                      <div>
                        <h3 className="font-bold text-[#e4e4e7]">{role.title}</h3>
                        <span className="text-xs text-[#4edea3]">{role.tier}</span>
                      </div>
                    </div>
                    <div className="mb-3 space-y-1">
                      {Object.entries(role.stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between text-xs">
                          <span className="text-[#777] capitalize">{stat}</span>
                          <span className="font-mono font-bold text-[#ffd56d]">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-[#4edea3]/10 p-2">
                      <p className="text-xs text-[#4edea3]">
                        <span className="font-bold">Passive:</span> {role.passive}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Stat Legend</h3>
                <p className="mb-3 text-xs text-[#777]">3 Stat utama yang menentukan keberhasilan DnD check:</p>
                <div className="space-y-2">
                  {Object.entries(STAT_INFO).map(([stat, desc]) => (
                    <div key={stat} className="flex gap-3 rounded-lg bg-[#0a1510] p-2">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#4edea3]/20 text-xs">📊</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#ffd56d]">{stat}</h4>
                        <p className="text-xs text-[#777]">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-2 font-bold text-[#e4e4e7]">Tier Legend</h3>
                <p className="text-xs text-[#777]">Setiap role direkomendasikan untuk playstyle tertentu:</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-[#ffd56d]/10 p-2 text-center text-[#ffd56d]">Tier S - Agro & Carry</div>
                  <div className="rounded-lg bg-[#4edea3]/10 p-2 text-center text-[#4edea3]">Tier A - Control & Support</div>
                  <div className="rounded-lg bg-[#777]/10 p-2 text-center text-[#888]">Tier B - Defensif & Niche</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'peraturan' && (
            <div className="space-y-6">
              {/* Roll Dadu */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🎲 Roll Dadu</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Satu Roll per Turn:</strong> Setiap pemain hanya boleh roll dadu <strong className="text-[#ffd56d]">SEKALI</strong> per giliran. Setelah roll, tombol berubah jadi &quot;SUDAH ROLL&quot;.</p>
                  <p><strong className="text-[#e4e4e7]">Dadu 2d6:</strong> Dua dadu dilempar, total menentukan langkah (2-12). Lewat Start = bonus Rp100.000.</p>
                  <p><strong className="text-[#e4e4e7]">Bot Auto-Play:</strong> Bot akan roll + end turn otomatis.</p>
                </div>
              </div>

              {/* DnD System */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">⚔️ Sistem DnD (Dungeons & Dragons)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Kapan DnD?</strong> Saat kartu Takdir/Kegiatan & event cell (Tagihan PLN, Macet, Kripto).</p>
                  <p><strong className="text-[#e4e4e7]">Roll 1d6:</strong> Dadu tunggal (1-6) sebagai DnD dice.</p>
                  <p><strong className="text-[#e4e4e7]">Total Skor = 1d6 + Stat Bonus + Hoki + Bukti Warga</strong></p>
                  <p><strong className="text-[#e4e4e7]">DC (Difficulty Class) = 4</strong> — Skor harus ≥ DC untuk PASS.</p>
                  <p><strong className="text-[#4edea3]">PASS ✅:</strong> Dapat buff / lolos dari efek buruk.</p>
                  <p><strong className="text-[#f87171]">FAIL ❌:</strong> Kena penalty / efek buruk diterapkan.</p>
                </div>
              </div>

              {/* Card Types + DnD */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🃏 Tipe Kartu & DnD</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[#4edea3]/10 p-2">
                      <h4 className="font-bold text-[#4edea3]">Buff 🟢</h4>
                      <p>PASS = efek bagus aktif. FAIL = tidak terjadi apa-apa.</p>
                    </div>
                    <div className="rounded-lg bg-[#f87171]/10 p-2">
                      <h4 className="font-bold text-[#f87171]">Debuff 🔴</h4>
                      <p>FAIL = efek buruk aktif. PASS = lolos, aman!</p>
                    </div>
                    <div className="rounded-lg bg-[#ffd56d]/10 p-2">
                      <h4 className="font-bold text-[#ffd56d]">Takdir 🟡</h4>
                      <p>Selalu aktif, tidak ada DnD check.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bribe System */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">💰 Sistem Sogokan (Bribe)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#ffd56d]">Kapan?</strong> Saat DnD GAGAL di event cell (Tagihan PLN, Macet, Kripto).</p>
                  <p><strong className="text-[#ffd56d]">Biaya:</strong> 15% CleanMoney (min Rp50.000). Dibayarkan ke bank.</p>
                  <p><strong className="text-[#4edea3]">Efek:</strong> Mengubah hasil DnD dari FAIL → PASS. Efek bagus diterapkan.</p>
                  <p><strong className="text-[#f87171]">Tombol:</strong> Muncul di modal DnD saat gagal. Klik &quot;Sogok&quot; untuk auto-pass.</p>
                </div>
              </div>

              {/* Event Cells */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">⚡ Event Cells (Petak Event)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Petak 13 — Tagihan PLN:</strong> PASS = bayar Rp100k. FAIL = bayar Rp400k.</p>
                  <p><strong className="text-[#e4e4e7]">Petak 16 — Macet Tomang:</strong> PASS = bayar Rp50k. FAIL = skip 2 putaran.</p>
                  <p><strong className="text-[#e4e4e7]">Petak 28 — FOMO Kripto:</strong> PASS = profit 200%. FAIL = rugpull -90%.</p>
                  <p><strong className="text-[#ffd56d]">Semua pakai DnD!</strong> Roll 1d6 + stat + hoki vs DC 4. Bisa sogok jika gagal.</p>
                </div>
              </div>

              {/* Global Events */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🌍 Event Global (Mulai Babak 2)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Trigger:</strong> Setiap babak mulai babak 2, 1 event global random terjadi.</p>
                  <p><strong className="text-[#e4e4e7]">Durasi:</strong> Efek hanya berlaku 1 babak, habis di babak berikutnya.</p>
                  <p><strong className="text-[#e4e4e7]">Contoh event:</strong> Reshuffle posisi, Inflasi, Ganjil Genap, Grebek Judi, IKN, Cancel Culture, OTT KPK, dll.</p>
                  <p><strong className="text-[#f87171]">12 event chaotik</strong> — Semua pemain terkena dampak!</p>
                </div>
              </div>

              {/* Property System */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🏠 Sistem Properti</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Beli:</strong> Mendarat di petak kosong = beli seharga harga dasar.</p>
                  <p><strong className="text-[#e4e4e7]">Upgrade:</strong> Klik properti sendiri → Upgrade (Level 1-4). Biaya = 50% harga dasar × level.</p>
                  <p><strong className="text-[#4edea3]">Landmark:</strong> Level 5 = Landmark. Tidak bisa ditakeover. Sewa 5x lipat.</p>
                  <p><strong className="text-[#f87171]">Takeover:</strong> Mendarat di properti lawan (Level &lt; 5) = bisa takeover seharga 200% harga dasar.</p>
                  <p><strong className="text-[#ffd56d]">Sewa Scaling:</strong> Lv0=1x, Lv1=1.5x, Lv2=2x, Lv3=2.5x, Lv4=3x, Lv5=5x. Monopoly = +1.5x bonus.</p>
                </div>
              </div>

              {/* Sewa */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">💳 Bayar Sewa</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Langsung Bayar:</strong> Mendarat di properti orang = bayar sewa langsung (tidak ada DnD).</p>
                  <p><strong className="text-[#f87171]">Takeover:</strong> Jika properti bukan Landmark (Lv &lt; 5), bisa takeover 200% harga ke pemilik.</p>
                  <p><strong className="text-[#4edea3]">Landmark:</strong> Tidak bisa ditakeover. Hanya bayar sewa 5x lipat.</p>
                  <p><strong className="text-[#ffd56d]">Rent Frozen:</strong> Jika kena event global property_disable, sewa dibekukan 1 babak.</p>
                </div>
              </div>

              {/* Free Parking */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🅿️ Free Parking (Pool Dana)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Pool:</strong> 10% dari semua duit yang keluar (sewa, pajak, denda event global) masuk pool.</p>
                  <p><strong className="text-[#4edea3]">Koleksi:</strong> Mendarat di posisi 20 = ambil SELURUH pool + Rp100.000 bonus.</p>
                  <p><strong className="text-[#ffd56d]">Strategi:</strong> Semakin lama pool terkumpul, semakin besar hadiahnya!</p>
                </div>
              </div>

              {/* Bukti Warga */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">📋 Bukti Warga (Evidence)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">Dari mana?</strong> Kartu Takdir bertipe Audit/Koruptor (gacha roll ≥ 3).</p>
                  <p><strong className="text-[#e4e4e7]">Fungsi:</strong> Dipilih saat DnD → menambah bonus skor DnD.</p>
                  <p><strong className="text-[#e4e4e7]">Jenis:</strong> Kwitansi Pajak (+1), Rekaman Oknum (+2), Mutasi Rekening (+1), Screenshot Viral (+2), Saksi Mata (+3), Dokumen Resmi (+4), Rekening Koran (+5), Bukti Viral (+3).</p>
                  <p><strong className="text-[#4edea3]">Tip:</strong> Kumpulkan bukti sebanyak mungkin, pakai saat DnD kritis!</p>
                </div>
              </div>

              {/* Duit Kotor vs Bersih */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">💵 Duit Kotor vs Duit Bersih</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">Duit Bersih (CleanMoney)</h4>
                    <p className="text-[#777]">Uang tunai yang dipegang. Digunakan untuk beli properti, bayar sewa, denda, sogok, pinjaman.</p>
                  </div>
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#f87171]">Duit Kotor (DirtyMoney)</h4>
                    <p className="text-[#777]">Uang dari sumber ilegal (korupsi, judi). Bisa disita oleh event global OTT KPK / Grebek Judi.</p>
                  </div>
                </div>
              </div>

              {/* Bank vs Pinjol */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🏦 Pinjaman: Bank vs Pinjol</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">Bank BUMN</h4>
                    <ul className="space-y-1 text-[#777]">
                      <li>✅ Bunga rendah (10%)</li>
                      <li>✅ Perlu jaminan properti (max 50% aset)</li>
                      <li>✅ Aman & terpercaya</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#f87171]">Pinjol Ilegal</h4>
                    <ul className="space-y-1 text-[#777]">
                      <li>❌ Bunga tinggi (25%)</li>
                      <li>❌ Tanpa jaminan</li>
                      <li>❌ 15% risiko properti disita otomatis</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pajak */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🏛️ Pajak</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#e4e4e7]">PBB Jakarta:</strong> Denda tetap Rp100.000.</p>
                  <p><strong className="text-[#e4e4e7]">Uji Emisi:</strong> Denda tetap Rp150.000.</p>
                  <p><strong className="text-[#e4e4e7]">PPN 12%:</strong> 12% dari total harta (CleanMoney + nilai properti). Pakai DnD untuk lolos!</p>
                </div>
              </div>

              {/* BunDIR */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">💀 Kondisi Kalah (Bundir)</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p><strong className="text-[#f87171]">Bangkrut:</strong> CleanMoney ≤ 0 + DirtyMoney ≤ 0 = BANGKRUT.</p>
                  <p><strong className="text-[#f87171]">Properti Disita:</strong> Semua properti dilepas ke bank.</p>
                  <p><strong className="text-[#f87171]">Menyerah:</strong> Bisa menyerah kapan saja via tombol &quot;Menyerah&quot; di toolbar.</p>
                  <p><strong className="text-[#4edea3]">Menang:</strong> BUNDIR = terakhir bertahan. KAYA RAYA = terkaya di babak 20. KILAT = terkaya di babak 10.</p>
                </div>
              </div>

              {/* Game Modes */}
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">🎮 3 Mode Permainan</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#f87171]">💀 BUNDIR</h4>
                    <p className="text-[#777]">Bertahan hidup. 999 babak. Terakhir menang.</p>
                  </div>
                  <div className="rounded-lg bg-[#ffd56d]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#ffd56d]">👑 KAYA RAYA</h4>
                    <p className="text-[#777]">20 babak. Pemain terkaya di akhir menang.</p>
                  </div>
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#4edea3]">⚡ KILAT</h4>
                    <p className="text-[#777]">10 babak. 2x uang awal. Sewa naik 50%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'peta' && (
            <div className="space-y-4">
              <div className="mb-4 rounded-xl border border-[#203a29] bg-[#0c1f14] p-4 text-center">
                <h3 className="mb-2 font-bold text-[#e4e4e7]">Peta Jakarta 11×11</h3>
                <p className="text-xs text-[#777]">40 petak di sekeliling papan, 4 zona tematik Jakarta</p>
              </div>
              <div className="space-y-3">
                {ZONES.map((zone, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${zone.color} text-xl font-bold text-[#ffd56d]`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-bold text-[#e4e4e7]">{zone.name}</h4>
                        <span className="rounded bg-[#4edea3]/20 px-2 py-0.5 text-xs text-[#4edea3]">{zone.role}</span>
                      </div>
                      <p className="text-xs text-[#777]">{zone.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#777]">Harga</p>
                      <p className="font-bold text-[#ffd56d]">{zone.range}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Petak Khusus</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">🏁 Start (Pos 0)</h4>
                    <p className="text-[#777]">Lewat Start = bonus Rp100.000. Gaji UMR Jakarta cair.</p>
                  </div>
                  <div className="rounded-lg bg-[#ffd56d]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#ffd56d]">🅿️ Bebas Parkir (Pos 20)</h4>
                    <p className="text-[#777]">Ambil SELURUH pool dana + Rp100.000 bonus. Pool = 10% dari semua duit keluar.</p>
                  </div>
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#f87171]">🚨 Tahanan KPK (Pos 10)</h4>
                    <p className="text-[#777]">Kena OTT KPK! Skip 2 putaran berikutnya.</p>
                  </div>
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#f87171]">⛓️ Masuk Sel (Pos 30)</h4>
                    <p className="text-[#777]">Bui! Skip 3 putaran berikutnya.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Petak Event</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#a78bfa]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#a78bfa]">⚡ Tagihan PLN (Pos 13)</h4>
                    <p className="text-[#777]">DnD: PASS = -Rp100k, FAIL = -Rp400k. Bisa sogok.</p>
                  </div>
                  <div className="rounded-lg bg-[#a78bfa]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#a78bfa]">🚦 Macet Tomang (Pos 16)</h4>
                    <p className="text-[#777]">DnD: PASS = -Rp50k, FAIL = skip 2 putaran. Bisa sogok.</p>
                  </div>
                  <div className="rounded-lg bg-[#a78bfa]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#a78bfa]">📈 FOMO Kripto (Pos 28)</h4>
                    <p className="text-[#777]">DnD: PASS = profit 200%, FAIL = rugpull -90%. Bisa sogok.</p>
                  </div>
                  <div className="rounded-lg bg-[#a78bfa]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#a78bfa]">🃏 Takdir / Kegiatan</h4>
                    <p className="text-[#777]">Ambil kartu. Buff/Debuff pakai DnD. Takdir selalu aktif.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Petak Pajak</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#f87171]">🏛️ PBB Jakarta</h4>
                    <p className="text-[#777]">Denda tetap Rp100.000.</p>
                  </div>
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#f87171]">🚗 Uji Emisi</h4>
                    <p className="text-[#777]">Denda tetap Rp150.000.</p>
                  </div>
                  <div className="rounded-lg bg-[#f87171]/10 p-3">
                    <h4 className="mb-1 font-bold text-[#f87171]">💰 PPN 12%</h4>
                    <p className="text-[#777]">12% total harta. DnD untuk lolos!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-b-2xl border-t border-[#203a29] bg-[#0c1f14] px-6 py-3">
          <p className="text-xs text-[#777]">Monopoli WNI © 2026 — Bangga jadi WNI!</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#4edea3] px-4 py-2 text-xs font-bold text-[#001809] hover:bg-[#3bc991]"
          >
            Mengerti, Lanjut Main!
          </button>
        </div>
      </div>
    </div>
  )
}
