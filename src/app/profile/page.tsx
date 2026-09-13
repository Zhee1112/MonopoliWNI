'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

const RANKS: Record<number, { name: string; emoji: string; color: string; ability: string }> = {
  1: { name: 'Magang', emoji: '🟢', color: 'text-secondary', ability: 'Hoki +5 saat pegang bukti' },
  2: { name: 'Karyawan', emoji: '🔵', color: 'text-blue-400', ability: 'Sewa properti -10%' },
  3: { name: 'Supervisor', emoji: '🟡', color: 'text-primary', ability: 'Roll ulang 1x per giliran' },
  4: { name: 'Manager', emoji: '🟠', color: 'text-orange-400', ability: 'Bebas 1x denda per babak' },
  5: { name: 'Senior Manager', emoji: '🔴', color: 'text-red-400', ability: 'Beli properti -15%' },
  6: { name: 'Director', emoji: '🟣', color: 'text-purple-400', ability: 'Sewa premium +25%' },
  7: { name: 'VP', emoji: '⭐', color: 'text-yellow-300', ability: '2x lipat dividene' },
  8: { name: 'C-Suite', emoji: '💎', color: 'text-cyan-300', ability: 'Imunitas razia 2x' },
  9: { name: 'Sultan', emoji: '👑', color: 'text-primary', ability: 'Beli 2 properti sekaligus' },
  10: { name: 'Legenda', emoji: '🏆', color: 'text-amber-300', ability: 'Semua stat +2' },
};

function getRankInfo(level: number) {
  const idx = Math.min(Math.ceil(level / 2), 10);
  return RANKS[idx] || RANKS[1];
}

function getXpForNextLevel(level: number): number {
  return level * 1000;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-surface text-xl">Loading...</div>
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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
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
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setSaving(true);
    await supabase.from('user_profiles').update({ display_name: displayName.trim() }).eq('user_id', user.id);
    setSaving(false);
    setSuccess('Nama berhasil diupdate!');
    setTimeout(() => setSuccess(''), 3000);
  }

  const RANK_LIST = Object.entries(RANKS).map(([lvl, r]) => ({
    level: parseInt(lvl),
    ...r,
    levelRange: `${(parseInt(lvl) - 1) * 2 + 1}-${parseInt(lvl) * 2}`,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glows */}
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-40 bg-surface-container-low/90 backdrop-blur-xl border-b border-outline-variant/50">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors flex items-center gap-1">
            <span>&#8592;</span> Kembali
          </button>
          <h1 className="text-sm font-bold text-primary tracking-tight">Profil Saya</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto space-y-4">

          {/* Digital KTP Card */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="bg-surface-container px-4 py-3 border-b border-outline-variant flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">DIGITAL KTP WNI</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-primary">EDISI 2025</span>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 border-outline-variant cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary text-2xl font-bold">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-white text-[10px] font-bold">{uploading ? '...' : 'GANTI'}</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

                {/* Name & Level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-on-surface-variant">NIK:</span>
                    <span className="text-xs font-mono text-on-surface">{user.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="text-sm font-bold text-on-surface mb-0.5">{profile.displayName}</div>
                  <div className="text-[11px] text-on-surface-variant">Lv {level} {rank.name}</div>
                </div>

                {/* Level Badge */}
                <div className="shrink-0 text-center">
                  <div className={`w-12 h-12 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center text-xl`}>
                    {rank.emoji}
                  </div>
                  <div className="text-[9px] text-outline mt-1 uppercase font-bold">Level {level}</div>
                </div>
              </div>

              {/* XP Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-on-surface-variant font-semibold uppercase">Progress XP</span>
                  <span className="text-[10px] text-primary font-bold font-mono">{xp} / {nextLevelXp}</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-outline mt-1">{nextLevelXp - xp} XP lagi ke Level {level + 1}</p>
              </div>
            </div>
          </div>

          {/* Stat Bento Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
              <div className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Win Rate</div>
              <div className="text-2xl font-extrabold text-primary">{winRate}%</div>
              <div className="text-[10px] text-on-surface-variant">{profile.totalWins} kemenangan dari {profile.totalGames} game</div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
              <div className="text-[10px] text-on-surface-variant uppercase font-semibold mb-1">Total Game</div>
              <div className="text-2xl font-extrabold text-secondary">{profile.totalGames}</div>
              <div className="text-[10px] text-on-surface-variant">Semua musim</div>
            </div>
          </div>

          {/* Edit Name */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
            <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Nama Tampilan</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-3 py-2 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                maxLength={20}
              />
              <button
                onClick={handleSaveName}
                disabled={saving || displayName === profile.displayName}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 text-center">
              <span className="text-secondary text-sm font-semibold">{success}</span>
            </div>
          )}

          {/* Rank Progression */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
            <h4 className="font-bold text-on-surface text-sm mb-3">Jenjang Karir</h4>
            <div className="space-y-1.5">
              {RANK_LIST.map((r) => {
                const isActive = level >= r.level * 2 - 1 && level <= r.level * 2;
                const isDone = level > r.level * 2;
                return (
                  <div key={r.level} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isActive ? 'bg-surface-container-high border border-primary/30' : ''}`}>
                    <span className="text-sm">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold ${isActive ? 'text-primary' : isDone ? 'text-on-surface-variant' : 'text-outline'}`}>
                        Lv {r.levelRange} — {r.name}
                      </span>
                      {isActive && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-2 font-bold">SEKARANG</span>}
                    </div>
                    <span className={`text-[9px] ${isActive ? 'text-secondary' : 'text-outline'}`}>{r.ability}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email & Logout */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Email</p>
                <p className="text-sm text-on-surface">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full py-2.5 bg-error-container/30 hover:bg-error-container/50 border border-error/30 text-error rounded-lg text-sm font-bold transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
