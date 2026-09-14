'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { ACHIEVEMENTS, AchievementDef } from '@/lib/game/achievements';

const CATEGORIES = [
  { id: 'all', label: 'Semua', emoji: '🏆' },
  { id: 'placement', label: 'Penempatan', emoji: '🏅' },
  { id: 'money', label: 'Uang', emoji: '💰' },
  { id: 'property', label: 'Properti', emoji: '🏠' },
  { id: 'combat', label: 'Combat', emoji: '⚔️' },
  { id: 'luck', label: 'Keberuntungan', emoji: '🎲' },
];

const CATEGORY_BG: Record<string, string> = {
  placement: 'from-[#ffd56d]/10 to-[#ffd56d]/5',
  money: 'from-[#4edea3]/10 to-[#4edea3]/5',
  property: 'from-purple-500/10 to-purple-500/5',
  combat: 'from-cyan-400/10 to-cyan-400/5',
  luck: 'from-rose-500/10 to-rose-500/5',
};

export default function AchievementsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchAchievements() {
      const { data } = await supabase
        .from('player_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);
      if (data) setUnlockedAchievements(data.map(a => a.achievement_id));
    }
    fetchAchievements();
  }, [user]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-[#05190d] flex items-center justify-center">
        <div className="text-[#d1fae5] text-xl">Loading...</div>
      </div>
    );
  }

  const filteredAchievements = activeCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === activeCategory);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

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
            <span>Kembali ke Lobi</span>
          </button>
          <div className="text-center hidden md:block">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#0a2c19] border border-[#1d4b30] text-[11px] font-bold text-[#4edea3] tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
              Edisi 2025 &bull; Republik Monopoli WNI
            </div>
            <h1 className="font-bold text-lg text-[#ffd56d] tracking-wide mt-0.5">🏆 PENCAPAIAN WARGA</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0a2416] border border-[#143722] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#4edea3] text-sm">🏆</span>
                <span className="text-[#93c5a7]">Terkunci:</span>
                <span className="font-semibold text-[#4edea3]">{unlockedCount}/{totalCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pl-1 py-1 pr-3 rounded-full bg-[#0d281a] border border-[#1d4b30]">
              <div className="w-7 h-7 rounded-full bg-[#ffd56d] flex items-center justify-center font-extrabold text-[#1a2e05] text-xs shadow-inner">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#d1fae5] leading-tight">{profile.displayName}</span>
                <span className="text-[10px] text-[#4edea3] font-medium leading-none">Lv {profile.level}</span>
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
          <h1 className="font-bold text-xl text-[#ffd56d]">🏆 PENCAPAIAN WARGA</h1>
        </div>

        {/* Progress Overview */}
        <div className="rounded-2xl bg-[#0d281a] border border-[#1d4b30] p-5 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#ffd56d] text-lg">📊</span>
              <h3 className="font-bold text-base text-[#d1fae5]">Total Pencapaian</h3>
            </div>
            <span className="text-[11px] text-[#588568] uppercase font-medium">{progressPercent}% Selesai</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#0a2817] overflow-hidden p-0.5 mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#4edea3] to-[#ffd56d] rounded-full shadow-[0_0_8px_#4edea3] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#588568]">
            <span>{unlockedCount} dari {totalCount} pencapaian terbuka</span>
            <span className="text-[#ffd56d] font-semibold">{totalCount - unlockedCount} lagi untuk 100%</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const catCount = cat.id === 'all'
              ? unlockedCount
              : ACHIEVEMENTS.filter(a => a.category === cat.id && unlockedAchievements.includes(a.id)).length;
            const catTotal = cat.id === 'all'
              ? totalCount
              : ACHIEVEMENTS.filter(a => a.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#4edea3] text-[#001809] shadow-[0_0_15px_rgba(78,222,163,0.3)]'
                    : 'bg-[#0a2416] border border-[#143722] text-[#93c5a7] hover:bg-[#0e311d] hover:border-[#4edea3]/40'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id
                    ? 'bg-[#001809]/30 text-[#001809]'
                    : 'bg-[#143722] text-[#588568]'
                }`}>
                  {catCount}/{catTotal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAchievements.map((ach) => {
            const unlocked = unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                  unlocked
                    ? `${ach.bgColor} ${ach.borderColor} shadow-lg`
                    : 'bg-[#082013] border-[#143722] opacity-50'
                }`}
              >
                {unlocked && (
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#ffd56d]/10 rounded-full blur-xl pointer-events-none" />
                )}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`text-3xl shrink-0 ${unlocked ? '' : 'grayscale'}`}>
                    {ach.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-bold truncate ${unlocked ? ach.color : 'text-[#588568]'}`}>
                      {ach.name}
                    </div>
                    <div className="text-[11px] text-[#588568] mt-0.5 line-clamp-2">{ach.description}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    unlocked ? 'bg-[#ffd56d]/20 text-[#ffd56d]' : 'bg-[#143722] text-[#588568]'
                  }`}>
                    +{ach.xp} XP
                  </span>
                  {unlocked && (
                    <span className="text-[10px] text-[#4edea3] font-semibold">✓ Tercapai</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-[#588568]">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">Tidak ada pencapaian di kategori ini</div>
          </div>
        )}
      </main>
    </div>
  );
}
