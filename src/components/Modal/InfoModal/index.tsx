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
    passive: 'Denda/Blacklist turun 20% → ganti rugi naik 20%',
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
  'Strategy (C → A)': 'Mengurangi DC pinjaman & biaya blacklist → menambah peluang lolos denda',
  'Luck (C → A)': 'Mengurangi risiko event negatif (gagal DC, kena penipuan, denda) → menambah peluang menang undian/event positif',
  'Negotiation (C → S)': 'Memperbesar peluang sukses nego → memperkecil peluang pemain lain lolos dari denda',
}

const TIMELINE = [
  { icon: '1️⃣', title: 'Membuat/Masuk Room', desc: 'Tentukan jumlah pemain (2-8) & mode permainan' },
  { icon: '2️⃣', title: 'Memilih Role', desc: 'Setiap role punya skill & stat yang beda' },
  { icon: '3️⃣', title: 'Roll The Dice', desc: 'Kocok dadu untuk menentukan jumlah langkah' },
  { icon: '4️⃣', title: 'Mulai Perjalanan', desc: 'Jalanin petualangan di peta Jakarta meme' },
  { icon: '5️⃣', title: 'Ambil Kartu', desc: 'Ketemu petak = ambil kartu Takdir/Kegiatan' },
  { icon: '6️⃣', title: 'Tantangan DnD', desc: 'Roll dadu + stat karakter vs Difficulty Class' },
  { icon: '7️⃣', title: 'Denda & Blacklist', desc: 'Kalau gagal = bayar denda. 3x gagal = blacklist!' },
  { icon: '8️⃣', title: 'Beli Properti', desc: 'Beli tanah/bangunan sebagai sumber passive income' },
  { icon: '9️⃣', title: 'Bayar Sewa', desc: 'Kalau hoki tanah orang = harus bayar sewa' },
  { icon: '🔟', title: 'Strategi & Nego', desc: 'Negosiasi, gertak, atau manfaatin role ability' },
  { icon: '🏃', title: 'Pemain Kalah', desc: 'Kalau bangkrut = Bundir (keluar dari game)' },
  { icon: '👑', title: 'Menang!', desc: 'Pemain terakhir yang bertahan = Sultan Monopoli WNI!' },
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
    { id: 'peraturan', label: 'Peraturan & Finansial' },
    { id: 'peta', label: 'Peta Jakarta 11x11' },
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
            <button className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-[#888] hover:border-[#4edea3] hover:text-[#4edea3]">
              <span className="text-sm">📥</span>
              Download PDF
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
                <h3 className="mb-2 text-base font-bold text-[#e4e4e7]">How to Play</h3>
                <p className="text-xs leading-relaxed text-[#777]">
                  Monopoli WNI adalah board game 2-8 pemain bergaya Monopoly dengan mekanik DnD.
                  Setiap langkah menentukan nasibmu berdasarkan Role, Stat, dan Keberuntungan.
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
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Basic Rules</h3>
                <div className="space-y-2 text-xs text-[#777]">
                  <p>🎲 <strong className="text-[#e4e4e7]">Roll Dadu:</strong> Klik tombol roll untuk mendapatkan angka 2-12. Angka menentukan langkah.</p>
                  <p>🚶 <strong className="text-[#e4e4e7]">Bergerak:</strong> Pion bergerak sejumlah langkah di peta. Lewat Start = bonus Rp100.000.</p>
                  <p>🏠 <strong className="text-[#e4e4e7]">Beli Properti:</strong> Mendarat di petak kosong = bisa beli. Harga bervariasi per zona.</p>
                  <p>💳 <strong className="text-[#e4e4e7]">Bayar Sewa:</strong> Mendarat di properti orang = harus bayar sewa. Nego bisa dilakukan.</p>
                  <p>🃏 <strong className="text-[#e4e4e7]">Kartu:</strong> Mendarat di petak Takdir/Kegiatan = ambil kartu. Efek langsung aktif.</p>
                  <p>💀 <strong className="text-[#e4e4e7]">Bundir:</strong> Uang habis = bangkrut = keluar dari game. Pemain terakhir menang.</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Blacklist System</h3>
                <p className="mb-3 text-xs text-[#777]">Sistem Blacklist Monopoli WNI:</p>
                <div className="space-y-2 text-xs text-[#777]">
                  <p>⚠️ <strong className="text-[#e4e4e7]">1x Gagal DnD:</strong> Dapat peringatan (warning)</p>
                  <p>🚫 <strong className="text-[#e4e4e7]">2x Gagal DnD:</strong> Denda naik 20%</p>
                  <p>💀 <strong className="text-[#e4e4e7]">3x Gagal DnD:</strong> BLACKLIST! Uang dibekukan 3 putaran & aset disita 20%</p>
                  <p>🔄 <strong className="text-[#e4e4e7]">Reset:</strong> Lewat Start = reset blacklist counter</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Duit Kotor vs Duit Bersih</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#ff4757]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#ff4757]">Duit Kotor</h4>
                    <p className="text-[#777]">Total seluruh uang & aset pemain termasuk properti & investasi.</p>
                  </div>
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">Duit Bersih</h4>
                    <p className="text-[#777]">Uang tunai saja, tidak termasuk properti. Yang ini dipegang pemain.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Bank vs Pinjol</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">Bank BUMN</h4>
                    <ul className="space-y-1 text-[#777]">
                      <li>✅ Bunga rendah (10%)</li>
                      <li>✅ Perlu jaminan properti</li>
                      <li>✅ Aman & terpercaya</li>
                      <li>⚠️ Proses agak lama</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-[#ff4757]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#ff4757]">Pinjol Ilegal</h4>
                    <ul className="space-y-1 text-[#777]">
                      <li>❌ Bunga tinggi (25%)</li>
                      <li>❌ Tanpa jaminan</li>
                      <li>❌ 15% risiko aset disita</li>
                      <li>✅ Cair instan</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#203a29] bg-[#0c1f14] p-4">
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Mata Uang Ganda</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#ffd56d]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#ffd56d]">Rupiah Tunai</h4>
                    <p className="text-[#777]">Uang tunai utama. Digunakan untuk beli properti, bayar sewa, denda.</p>
                  </div>
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">Koin Emas</h4>
                    <p className="text-[#777]">Premium currency. Dapat dari event khusus, bisa beli role skill upgrade.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'peta' && (
            <div className="space-y-4">
              <div className="mb-4 rounded-xl border border-[#203a29] bg-[#0c1f14] p-4 text-center">
                <h3 className="mb-2 font-bold text-[#e4e4e7]">Peta Jakarta 11×11</h3>
                <p className="text-xs text-[#777]">Monopoli WNI menggunakan peta berbasis grid Jakarta dengan 4 zona tematik</p>
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
                <h3 className="mb-3 font-bold text-[#e4e4e7]">Special Zones</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">🏁 Start</h4>
                    <p className="text-[#777]">Lewat Start = bonus Rp100.000 & reset blacklist</p>
                  </div>
                  <div className="rounded-lg bg-[#ff4757]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#ff4757]">💀 Free Parking</h4>
                    <p className="text-[#777]">Istirahat 1 putaran. Tidak kena efek apapun.</p>
                  </div>
                  <div className="rounded-lg bg-[#ffd56d]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#ffd56d]">🏠 Go To Jail</h4>
                    <p className="text-[#777]">Bayar Rp50.000 atau lewati 2 putaran. Blacklist reset.</p>
                  </div>
                  <div className="rounded-lg bg-[#4edea3]/10 p-3">
                    <h4 className="mb-2 font-bold text-[#4edea3]">🌳 Monas</h4>
                    <p className="text-[#777]">Bonus Rp150.000 + free kartu Takdir premium</p>
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
