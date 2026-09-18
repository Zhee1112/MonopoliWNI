'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { ACHIEVEMENTS, getAchievement } from '@/lib/game/achievements';


const RANKS: Record<number, { name: string; emoji: string; color: string; dotColor: string; ability: string; subtitle: string }> = {
  1: { name: 'Magang', emoji: '🟢', color: 'text-[#4edea3]', dotColor: 'bg-[#4edea3]', ability: 'Hoki +5 saat pegang bukti kas', subtitle: 'Pangkat Pemula Sipil Republik' },
  2: { name: 'Karyawan', emoji: '🔵', color: 'text-cyan-400', dotColor: 'bg-cyan-400', ability: 'Sewa properti -10%', subtitle: 'Karyawan Kontrak Korporasi' },
  3: { name: 'Supervisor', emoji: '🟢', color: 'text-emerald-400', dotColor: 'bg-emerald-400', ability: 'Roll ulang 1x per giliran', subtitle: 'Pengawas Lapangan Wilayah' },
  4: { name: 'Manager', emoji: '🟡', color: 'text-amber-400', dotColor: 'bg-amber-400', ability: 'Bebas 1x denda razia per babak', subtitle: 'Kepala Cabang Regional' },
  5: { name: 'Senior Manager', emoji: '🔴', color: 'text-rose-400', dotColor: 'bg-rose-400', ability: 'Beli kavling -15%', subtitle: 'Manajer Eksekutif Wilayah' },
  6: { name: 'Director', emoji: '🟣', color: 'text-purple-400', dotColor: 'bg-purple-400', ability: 'Sewa premium +25%', subtitle: 'Dewan Direksi Kavling' },
  7: { name: 'Vice President', emoji: '⭐', color: 'text-[#ffd56d]', dotColor: 'bg-[#ffd56d]', ability: '2x lipat dividen kavling', subtitle: 'Wakil Presiden Sindikat Bisnis' },
  8: { name: 'C-Suite', emoji: '💎', color: 'text-cyan-400', dotColor: 'bg-cyan-400', ability: 'Imunitas razia 2x', subtitle: 'Petinggi Korporasi Utama' },
  9: { name: 'Sultan', emoji: '👑', color: 'text-[#ffd56d]', dotColor: 'bg-[#ffd56d]', ability: 'Beli 2 kavling sekaligus', subtitle: 'Konglomerat Monopoli Indonesia' },
  10: { name: 'Legenda Meja', emoji: '🏆', color: 'text-[#ffd56d]', dotColor: 'bg-[#ffd56d]', ability: 'Semua stat dasar +2', subtitle: 'Status Abadi Tak Tertandingi' },
};

function getRankInfo(level: number) {
  const idx = Math.min(Math.floor(level / 2) + 1, 10);
  return RANKS[idx] || RANKS[1];
}

function getXpForNextLevel(level: number): number {
  return level * 1000;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [gameHistory, setGameHistory] = useState<Array<{
    game_room_id: string; placement: number; final_total_assets: number;
    xp_earned: number; is_winner: boolean; game_mode: string; created_at: string;
  }>>([]);
  const [achievements, setAchievements] = useState<Array<{
    achievement_id: string; xp_granted: number; game_room_id: string;
  }>>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    async function fetchUserData() {
      const { data: histData } = await supabase
        .from('game_results')
        .select('game_room_id, placement, final_total_assets, xp_earned, is_winner, game_mode, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (histData) setGameHistory(histData);

      const { data: achData } = await supabase
        .from('player_achievements')
        .select('achievement_id, xp_granted, game_room_id')
        .eq('user_id', user.id);
      if (achData) setAchievements(achData);
    }
    fetchUserData();
  }, [user]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-[#05190d] flex items-center justify-center">
        <div className="text-[#d1fae5] text-xl">Loading...</div>
      </div>
    );
  }

  const level = profile.level;
  const xp = profile.xp;
  const nextLevelXp = getXpForNextLevel(level);
  const currentLevelXp = (level - 1) * 1000;
  const progress = Math.min(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100, 100);
  const rank = getRankInfo(level);
  const winRate = profile.totalGames > 0 ? Math.round((profile.totalWins / profile.totalGames) * 100) : 0;
  const highestCash = profile.highestCash || 2500000;
  const propertiesOwned = profile.propertiesOwned || 0;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) { alert('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.'); return; }
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) { console.error('Upload error:', uploadError); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(newUrl);
    await supabase.from('user_profiles').update({ avatar_url: newUrl }).eq('user_id', user.id);
    setUploading(false);
    setSuccess('Foto profil berhasil diupdate!');
    refreshProfile?.();
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setSaving(true);
    await supabase.from('user_profiles').update({ display_name: displayName.trim() }).eq('user_id', user.id);
    setSaving(false);
    setSuccess('Nama berhasil diupdate!');
    refreshProfile?.();
    setTimeout(() => setSuccess(''), 3000);
  }

  const RANK_LIST = Object.entries(RANKS).map(([lvl, r]) => ({
    level: parseInt(lvl),
    ...r,
    levelRange: `${(parseInt(lvl) - 1) * 2 + 1}-${parseInt(lvl) * 2}`,
  }));

  return (
    <div className="min-h-screen bg-[#05190d] text-[#d1fae5] font-sans antialiased relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a2f1c] via-[#05190d] to-[#020b06]">
      {/* Ambient glows */}
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#ffd56d]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#143722]/80 bg-[#05190d]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#143722] bg-[#082012] hover:bg-[#0e311d] hover:border-[#4edea3]/40 text-[#d1fae5] hover:text-[#4edea3] text-sm font-medium transition-all duration-150 shadow-sm">
            <span>&#8592;</span>
            <span>Kembali ke Meja / Lobi</span>
          </button>
          <div className="text-center hidden md:block">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0a2c19] border border-[#1d4b30] text-[11px] font-bold text-[#4edea3] tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
              Edisi 2025 &bull; Republik Monopoli WNI
            </div>
            <h1 className="font-bold text-lg text-[#ffd56d] tracking-wide mt-0.5">PROFIL WARGA &amp; BIROKRASI</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0a2416] border border-[#143722] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#4edea3] text-sm">&#x1F4B0;</span>
                <span className="text-[#93c5a7]">Kas:</span>
                <span className="font-semibold text-[#4edea3]">Rp {(profile.cleanMoney || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="w-px h-3.5 bg-[#143722]" />
              <div className="flex items-center gap-1">
                <span className="text-[#93c5a7]">Kamar:</span>
                <span className="font-mono text-[#ffd56d] font-bold">#--</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pl-1 py-1 pr-3 rounded-full bg-[#0d281a] border border-[#1d4b30]">
              <div className="w-7 h-7 rounded-full bg-[#ffd56d] flex items-center justify-center font-extrabold text-[#1a2e05] text-xs shadow-inner">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#d1fae5] leading-tight">{profile.displayName}</span>
                <span className="text-[10px] text-[#4edea3] font-medium leading-none">Lv {level} &bull; {rank.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Mobile Title */}
        <div className="md:hidden mb-5 text-center">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0a2c19] border border-[#1d4b30] text-[10px] font-bold text-[#4edea3] tracking-wide uppercase mb-1">
            Edisi 2025 &bull; Republik Monopoli WNI
          </div>
          <h1 className="font-bold text-xl text-[#ffd56d]">PROFIL WARGA &amp; BIROKRASI</h1>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* KTP Digital Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c291b] via-[#092215] to-[#06190e] border-2 border-[#225738] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.45)]">
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-[#4edea3]/20 via-[#ffd56d]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-48 h-24 bg-[#4edea3]/5 blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between border-b border-[#143722]/70 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#ffd56d] text-sm">&#x2714;&#xFE0F;</span>
                    <span className="text-[11px] font-extrabold text-[#ffd56d] tracking-widest uppercase">KARTU TANDA PENDUDUK DIGITAL</span>
                  </div>
                  <p className="text-[11px] text-[#93c5a7] mt-0.5">Republik Monopoli Indonesia &bull; Edisi Sipil 2025</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#133722] border border-[#1d4b30] text-[10px] text-[#4edea3] font-bold uppercase tracking-wider">
                  &#x1F4B3; Chip NIK
                </div>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="relative shrink-0">
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#4edea3]/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#4edea3] to-[#ffd56d] flex items-center justify-center text-[#1a2e05] text-2xl font-bold">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-1 bg-[#4edea3] text-[#021f11] font-extrabold text-[10px] px-1.5 py-0.5 rounded shadow-md uppercase">
                    LV {level}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#588568] uppercase tracking-wider">NIK: {user.id.slice(0, 8).toUpperCase()}-WNI</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" /> AKTIF
                    </span>
                  </div>
                  <h2 className="font-bold text-xl text-white truncate mt-1">{profile.displayName}</h2>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#ffd56d]/15 border border-[#ffd56d]/30 text-[#ffd56d] text-[11px] font-bold uppercase">{rank.name}</span>
                    <span className="text-[11px] text-[#93c5a7] truncate">&bull; Bebas Kasus Pajak</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#061a10] border border-[#143722] p-3.5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#93c5a7]">Progress Karir</span>
                  <span className="font-mono font-bold text-[#4edea3]">{xp} <span className="text-[#588568] font-normal">/ {nextLevelXp} XP</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0a2817] overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-[#4edea3] to-[#6ffbbe] rounded-full shadow-[0_0_8px_#4edea3] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-[#588568]">
                  <span>{nextLevelXp - xp} XP lagi menuju {RANKS[Math.min(level + 1, 10)]?.name || 'Legenda'}</span>
                  <span className="text-[#ffd56d] font-semibold">Target Lv {level + 1}</span>
                </div>
              </div>
            </div>

            {/* Stats Bento */}
            <div className="rounded-2xl bg-[#0d281a] border border-[#1d4b30] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd56d] text-lg">&#x1F4CA;</span>
                  <h3 className="font-bold text-base text-[#d1fae5]">Buku Catatan Pertandingan</h3>
                </div>
                <span className="text-[11px] text-[#588568] uppercase font-medium">Musim 2025</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-xl bg-[#082013] border border-[#143722] p-3.5">
                  <span className="text-[11px] text-[#588568] block uppercase font-medium">Tingkat Kemenangan</span>
                  <div className="font-bold text-2xl text-[#ffd56d] mt-0.5">{winRate}%</div>
                  <span className="text-[11px] text-[#93c5a7] mt-1 block">{profile.totalWins} Menang dari {profile.totalGames} Game</span>
                </div>
                <div className="rounded-xl bg-[#082013] border border-[#143722] p-3.5">
                  <span className="text-[11px] text-[#588568] block uppercase font-medium">Total Pertandingan</span>
                  <div className="font-bold text-2xl text-[#4edea3] mt-0.5">{profile.totalGames}</div>
                  <span className="text-[11px] text-[#93c5a7] mt-1 block">Akumulasi Semua Musim</span>
                </div>
                <div className="rounded-xl bg-[#082013] border border-[#143722] p-3.5">
                  <span className="text-[11px] text-[#588568] block uppercase font-medium">Kas Tertinggi</span>
                  <div className="font-bold text-base text-[#ffd56d] mt-1 truncate">Rp {highestCash.toLocaleString('id-ID')}</div>
                  <span className="text-[11px] text-[#93c5a7] mt-1 block">Rekor Saldo Terbesar</span>
                </div>
                <div className="rounded-xl bg-[#082013] border border-[#143722] p-3.5">
                  <span className="text-[11px] text-[#588568] block uppercase font-medium">Kavling Dikuasai</span>
                  <div className="font-bold text-2xl text-[#4edea3] mt-0.5">{propertiesOwned}</div>
                  <span className="text-[11px] text-[#93c5a7] mt-1 block">{propertiesOwned} Sertifikat Hak Milik</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#061b0f] border border-[#143722]">
                <div className="flex items-center gap-2">
                  <span className="text-[#4edea3] text-lg">&#x1F3B2;</span>
                  <div className="text-left">
                    <span className="text-[10px] uppercase text-[#588568] block font-semibold leading-tight">Indeks Efisiensi Dadu</span>
                    <span className="text-xs font-bold text-[#d1fae5]">Netral &bull; 50.0 Poin</span>
                  </div>
                </div>
                <svg className="w-24 h-6 text-[#4edea3]" fill="none" viewBox="0 0 100 24">
                  <path d="M0 18 L20 15 L40 17 L65 10 L85 12 L100 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <circle className="fill-[#ffd56d]" cx="100" cy="6" r="3" />
                </svg>
              </div>
            </div>

            {/* Account Settings */}
            <div className="rounded-2xl bg-[#0d281a] border border-[#1d4b30] p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#ffd56d] text-lg">&#x2699;&#xFE0F;</span>
                <h3 className="font-bold text-base text-[#d1fae5]">Pengaturan Identitas &amp; Akun</h3>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#93c5a7] uppercase tracking-wider mb-1.5">Nama Tampilan Warga</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 bg-[#071d11] border border-[#1d4b30] focus:border-[#4edea3] text-white text-sm rounded-xl px-3.5 py-2 focus:outline-none transition-colors font-medium"
                    maxLength={20}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving || displayName === profile.displayName}
                    className="px-4 py-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#002b18] font-bold text-sm rounded-xl shadow-md hover:shadow-[#4edea3]/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? '...' : 'Simpan'}
                  </button>
                </div>
                {success && (
                  <p className="text-xs text-[#4edea3] mt-1.5 flex items-center gap-1">
                    &#x2705; {success}
                  </p>
                )}
              </div>
              <div className="p-3.5 rounded-xl bg-[#082013] border border-[#143722] flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#113320] flex items-center justify-center text-[#4edea3]">
                    &#x1F4E7;
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#588568] block font-semibold">Email Terdaftar</span>
                    <span className="text-xs font-semibold text-white">{user.email}</span>
                    <span className="text-[11px] text-[#4edea3] block">&#x2713; Terverifikasi Akun Google</span>
                  </div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full py-2.5 px-4 rounded-xl border border-[#451b1b] bg-[#260e0e]/50 hover:bg-[#381414] text-[#f87171] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>&#x1F6AA;</span>
                <span>Logout / Keluar Sesi Meja</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Career Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0d281a] via-[#0f2e1e] to-[#0d281a] border border-[#1d4b30] p-5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-[#ffd56d]">
                    <span className="text-lg">&#x1F3C6;</span>
                    <span className="text-xs font-extrabold uppercase tracking-widest">HIERARKI &amp; HAK ISTIMEWA</span>
                  </div>
                  <h2 className="font-bold text-xl text-white mt-1">Jenjang Karir Monopoli WNI</h2>
                </div>
                <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#ffd56d]/15 border border-[#ffd56d]/30 text-[#ffd56d] text-xs font-bold uppercase tracking-wider">
                  10 Tingkat Pangkat
                </span>
              </div>
              <p className="text-xs text-[#93c5a7] mt-2 leading-relaxed">
                Setiap kenaikan jenjang membuka hak istimewa moneter, diskon kavling, dan imunitas audit razia di atas papan permainan.
              </p>
            </div>

            {/* Career Ranks */}
            <div className="flex flex-col gap-2.5">
              {RANK_LIST.map((r) => {
                const isCurrentRank = level >= r.level * 2 - 1 && level <= r.level * 2;
                const isHighestTier = r.level === 10;

                return (
                  <div
                    key={r.level}
                    className={`rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                      isHighestTier
                        ? 'bg-gradient-to-r from-[#173824] via-[#102b1c] to-[#173824] border border-[#ffd56d]/40 shadow-md'
                        : isCurrentRank
                          ? 'bg-[#0e311f] border-2 border-[#4edea3] shadow-[0_0_15px_rgba(78,222,163,0.18)]'
                          : 'bg-[#092215]/80 hover:bg-[#0c2b1a] border border-[#143722]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isHighestTier
                          ? 'bg-[#ffd56d]/20 border border-[#ffd56d]'
                          : isCurrentRank
                            ? 'bg-[#4edea3]/20 border border-[#4edea3]'
                            : 'bg-[#06180d] border border-[#143722]'
                      }`}>
                        {isHighestTier ? (
                          <span className="text-[#ffd56d] text-lg">&#x1F3C6;</span>
                        ) : isCurrentRank ? (
                          <span className={`w-3 h-3 rounded-full ${r.dotColor} shadow-[0_0_10px_currentColor]`} />
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full ${r.dotColor}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${isCurrentRank ? 'text-white' : isHighestTier ? 'text-[#ffd56d]' : 'text-[#d1fae5]'}`}>
                            Lv {r.levelRange} &mdash; {r.name}
                          </span>
                          {isCurrentRank && (
                            <span className="px-2 py-0.5 rounded-full bg-[#4edea3] text-[#012614] font-extrabold text-[10px] tracking-wider uppercase">
                              SEKARANG
                            </span>
                          )}
                          {!isCurrentRank && (
                            <span className="text-[#588568] text-sm">&#x1F512;</span>
                          )}
                        </div>
                        <span className={`text-[11px] ${isCurrentRank ? 'text-[#93c5a7]' : 'text-[#588568]'}`}>{r.subtitle}</span>
                      </div>
                    </div>
                    <div className="sm:text-right pl-12 sm:pl-0">
                      <span className={`text-[10px] uppercase font-semibold block ${isCurrentRank ? 'text-[#4edea3]' : isHighestTier ? 'text-[#ffd56d]' : 'text-[#588568]'}`}>Skill Pasif</span>
                      <span className={`text-xs font-semibold ${isCurrentRank ? 'text-[#4edea3]' : isHighestTier ? 'text-[#ffd56d]' : 'text-[#93c5a7]'}`}>{r.ability}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Game History Section */}
            <div className="rounded-2xl bg-[#0d281a] border border-[#1d4b30] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd56d] text-lg">&#x1F4DC;</span>
                  <h3 className="font-bold text-base text-[#d1fae5]">Riwayat Permainan</h3>
                </div>
                <span className="text-[11px] text-[#588568] uppercase font-medium">{gameHistory.length} Sesi</span>
              </div>
              {gameHistory.length === 0 ? (
                <div className="text-center py-8 text-[#588568]">
                  <div className="text-3xl mb-2">&#x1F3B2;</div>
                  <div className="text-sm">Belum ada riwayat permainan</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {gameHistory.map((g, i) => (
                    <div
                      key={`${g.game_room_id}-${i}`}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        g.is_winner
                          ? 'bg-[#ffd56d]/5 border-[#ffd56d]/20'
                          : 'bg-[#082013] border-[#143722]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        g.placement === 1 ? 'bg-[#ffd56d]/20 text-[#ffd56d]' :
                        g.placement === 2 ? 'bg-slate-400/20 text-slate-300' :
                        g.placement === 3 ? 'bg-amber-600/20 text-amber-600' :
                        'bg-[#0a2817] text-[#588568]'
                      }`}>
                        #{g.placement}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${g.is_winner ? 'text-[#ffd56d]' : 'text-[#d1fae5]'}`}>
                            {g.game_mode === 'bundir' ? '💀 BUNDIR' : g.game_mode === 'sultan' ? '💎 KAYA RAYA' : '⚡ KILAT'}
                          </span>
                          {g.is_winner && <span className="text-[10px] text-[#ffd56d]">&#x1F451; MENANG</span>}
                        </div>
                        <div className="text-[10px] text-[#588568]">
                          Aset: Rp {(g.final_total_assets || 0).toLocaleString('id-ID')} &bull; +{g.xp_earned || 0} XP
                        </div>
                      </div>
                      <div className="text-[10px] text-[#588568] shrink-0">
                        {new Date(g.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div className="rounded-2xl bg-[#0d281a] border border-[#1d4b30] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#ffd56d] text-lg">&#x1F3C6;</span>
                  <h3 className="font-bold text-base text-[#d1fae5]">Pencapaian</h3>
                </div>
                <span className="text-[11px] text-[#588568] uppercase font-medium">{achievements.length} / {ACHIEVEMENTS.length} Terbuka</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = achievements.some(a => a.achievement_id === ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        unlocked
                          ? 'border-[#4edea3]/40 bg-[#4edea3]/10 shadow-[0_0_12px_rgba(78,222,163,0.15)]'
                          : 'border-[#143722] bg-[#082013] opacity-50'
                      }`}
                    >
                      <div className={`text-xl mb-1 ${unlocked ? '' : 'grayscale'}`}>{ach.emoji}</div>
                      <div className={`text-[10px] font-bold leading-tight ${unlocked ? 'text-[#4edea3]' : 'text-[#588568]'}`}>{ach.name}</div>
                      <div className="text-[9px] text-[#588568] mt-0.5">{ach.xp} XP</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
