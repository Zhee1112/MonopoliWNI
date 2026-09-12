'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

const RANKS: Record<number, string> = {
  1: '🟢 Magang',
  2: '🟢 Magang',
  3: '🔵 Karyawan',
  4: '🔵 Karyawan',
  5: '🟡 Supervisor',
  6: '🟡 Supervisor',
  7: '🟠 Manager',
  8: '🟠 Manager',
  9: '🔴 Senior Manager',
  10: '🔴 Senior Manager',
  11: '🟣 Director',
  12: '🟣 Director',
  13: '⭐ VP',
  14: '⭐ VP',
  15: '💎 C-Suite',
  16: '💎 C-Suite',
  17: '👑 Sultan',
  18: '👑 Sultan',
  19: '🏆 Legenda',
  20: '🏆 Legenda',
};

function getRank(level: number): string {
  const rankLevel = Math.min(Math.floor(level / 2) + 1, 20);
  return RANKS[rankLevel] || '🟢 Magang';
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
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl);
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const level = profile.level;
  const xp = profile.xp;
  const nextLevelXp = getXpForNextLevel(level);
  const currentLevelXp = (level - 1) * 1000;
  const progress = Math.min(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100, 100);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(newUrl);

    await supabase
      .from('user_profiles')
      .update({ avatar_url: newUrl })
      .eq('user_id', user.id);

    setUploading(false);
    setSuccess('Foto profil berhasil diupdate!');
    setTimeout(() => setSuccess(''), 3000);
  }

  async function handleSaveName() {
    if (!displayName.trim()) return;

    setSaving(true);
    await supabase
      .from('user_profiles')
      .update({ display_name: displayName.trim() })
      .eq('user_id', user.id);
    setSaving(false);
    setSuccess('Nama berhasil diupdate!');
    setTimeout(() => setSuccess(''), 3000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/')} className="text-green-300 hover:text-white text-sm">
            ← Kembali
          </button>
          <h1 className="text-xl font-bold text-white">Profil Saya</h1>
          <div className="w-16" />
        </div>

        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-2xl">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div
                className="w-28 h-28 rounded-full overflow-hidden border-4 border-green-500 shadow-lg cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-white text-sm font-medium">
                  {uploading ? 'Uploading...' : 'Ganti Foto'}
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            {uploading && <p className="text-blue-500 text-sm mt-2">Mengupload...</p>}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">Nama Tampilan</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={20}
              />
              <button
                onClick={handleSaveName}
                disabled={saving || displayName === profile.displayName}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Level & XP */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-800">
                Level {level} — {getRank(level)}
              </span>
              <span className="text-sm text-gray-500">
                {xp} / {nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {nextLevelXp - xp} XP lagi ke Level {level + 1}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{profile.totalGames}</p>
              <p className="text-sm text-green-600">Total Game</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{profile.totalWins}</p>
              <p className="text-sm text-yellow-600">Kemenangan</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">
                {profile.totalGames > 0 ? Math.round((profile.totalWins / profile.totalGames) * 100) : 0}%
              </p>
              <p className="text-sm text-blue-600">Win Rate</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{getRank(level).split(' ').slice(1).join(' ')}</p>
              <p className="text-sm text-purple-600">Pangkat</p>
            </div>
          </div>

          {/* Rank Progress */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-gray-700 mb-3">Jenjang Pangkat</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(RANKS).filter(([k], i, arr) => i === arr.findIndex(([kk]) => kk === k) || parseInt(k) % 2 === 1).map(([lvl, rank]) => {
                const levelNum = parseInt(lvl);
                const isActive = level >= levelNum && (levelNum + 1 > level || !RANKS[levelNum + 1] || RANKS[levelNum + 1] !== rank);
                const isCurrent = getRank(level) === rank;
                return (
                  <div key={lvl} className={`flex items-center gap-2 ${isCurrent ? 'text-green-700 font-bold' : level > levelNum ? 'text-gray-500' : 'text-gray-300'}`}>
                    <span className="w-6 text-center">{levelNum}</span>
                    <span>{rank}</span>
                    {isCurrent && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">SEKARANG</span>}
                    {!isCurrent && level > levelNum && <span className="text-xs text-gray-400 ml-auto">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-800">{user.email}</p>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
