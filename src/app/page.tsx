'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [checkingActive, setCheckingActive] = useState(true);

  // Check for active room on load — redirect if found
  useEffect(() => {
    if (authLoading || !user) {
      setCheckingActive(false);
      return;
    }
    async function checkActiveRoom() {
      try {
        await fetch('/api/auto-dissolve', { method: 'POST' });
        const res = await fetch(`/api/active-room?userId=${user.id}`);
        const data = await res.json();
        if (data.activeRoom) {
          sessionStorage.setItem('player', JSON.stringify(data.activeRoom.player));
          window.location.href = `/room/${data.activeRoom.code}`;
          return;
        }
      } catch { /* ignore */ }
      setCheckingActive(false);
    }
    checkActiveRoom();
  }, [user, authLoading, router]);

  if (authLoading || checkingActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-on-surface text-xl mb-4">Loading...</div>
          <div className="w-8 h-8 border-4 border-outline-variant border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const handleCreateRoom = async () => {
    const name = playerName.trim() || profile?.displayName || 'Player';
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name, userId: user?.id || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal membuat room');
      sessionStorage.setItem('player', JSON.stringify(data.player));
      sessionStorage.setItem('room', JSON.stringify(data.room));
      window.location.href = `/room/${data.room.code}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const name = playerName.trim() || profile?.displayName || 'Player';
    if (!roomCode.trim()) {
      setError('Kode room harus diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.trim().toUpperCase(),
          playerName: name,
          userId: user?.id || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal join room');
      sessionStorage.setItem('player', JSON.stringify(data.player));
      sessionStorage.setItem('room', JSON.stringify(data.room));
      window.location.href = `/room/${data.room.code}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Profile Bar - Top Right */}
      <div className="fixed top-0 left-0 w-full z-40 bg-surface-container-low/90 backdrop-blur-xl border-b border-outline-variant/50">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center">
              <span className="text-primary text-lg">&#127920;</span>
            </div>
            <div>
              <span className="font-bold text-primary text-sm tracking-tight">MONOPOLI WNI</span>
              <span className="text-[10px] text-on-surface-variant block tracking-wide">Arena Meja Nusantara</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/achievements')}
              className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded-full px-3 py-1.5 transition-all"
            >
              <span className="text-primary text-sm">🏆</span>
              <span className="text-on-surface text-xs font-semibold hidden sm:block">Pencapaian</span>
            </button>
            {user ? (
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded-full px-3 py-1.5 transition-all"
            >
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-7 h-7 rounded-full border border-outline-variant" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                {profile?.displayName?.charAt(0).toUpperCase() || 'P'}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-on-surface text-xs font-semibold leading-tight">{profile?.displayName}</p>
              <p className="text-secondary text-[10px] leading-tight">Lv.{profile?.level}</p>
            </div>
          </button>
            ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded-full px-3 py-1.5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-outline-variant flex items-center justify-center text-on-surface-variant text-xs font-bold">
                ?
              </div>
              <span className="text-on-surface text-xs font-semibold hidden sm:block">Login</span>
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-8">
        <div className="max-w-md w-full relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant mb-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-primary">EDISI RESMI</span>
              <span className="w-1 h-1 rounded-full bg-secondary" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-secondary">WARGA +62</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
              MONOPOLI{' '}
              <span className="bg-gradient-to-r from-primary via-primary-fixed to-primary-container bg-clip-text text-transparent">
                WNI
              </span>
            </h1>
            <p className="text-primary text-sm font-semibold mt-2 tracking-wide">
              Versi Indonesia yang kekinian & penuh intrik
            </p>
            <p className="text-on-surface-variant text-xs mt-1">
              Kocok dadu, kuasai kavling ibukota, hindari razia pajak Satpol PP
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {mode === 'home' && (
              <div className="space-y-3">
                <button
                  onClick={() => setMode('create')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary font-bold text-sm tracking-wide transition-all active:scale-95 shadow-[0_4px_16px_rgba(255,213,109,0.3)] hover:brightness-110"
                >
                  BUAT ROOM BARU
                </button>
                <button
                  onClick={() => setMode('join')}
                  className="w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-semibold text-sm transition-all active:scale-95"
                >
                  JOIN ROOM
                </button>
              </div>
            )}

            {mode === 'create' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-on-surface text-center">Buat Room Baru</h3>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Nama Pemain</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={profile?.displayName}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline"
                    maxLength={20}
                  />
                  <p className="text-[11px] text-outline mt-1">Kosongkan jika pakai nama: {profile?.displayName}</p>
                </div>
                {error && <p className="text-error text-sm text-center">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setMode('home'); setError(''); }}
                    className="flex-1 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface-variant font-semibold text-sm transition-colors"
                  >
                    KEMBALI
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleCreateRoom}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary font-bold text-sm transition-all active:scale-95 shadow-[0_4px_16px_rgba(255,213,109,0.3)] disabled:opacity-50"
                  >
                    {loading ? 'MEMBUAT...' : 'BUAT'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'join' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-on-surface text-center">Join Room</h3>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Nama Pemain</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={profile?.displayName}
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline"
                    maxLength={20}
                  />
                  <p className="text-[11px] text-outline mt-1">Kosongkan jika pakai nama: {profile?.displayName}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Kode Room</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode room"
                    className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-on-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline uppercase tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-error text-sm text-center">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setMode('home'); setError(''); }}
                    className="flex-1 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface-variant font-semibold text-sm transition-colors"
                  >
                    KEMBALI
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleJoinRoom}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary font-bold text-sm transition-all active:scale-95 shadow-[0_4px_16px_rgba(255,213,109,0.3)] disabled:opacity-50"
                  >
                    {loading ? 'MASUK...' : 'JOIN'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 text-center text-on-surface-variant text-xs space-y-1">
            <p>2-8 Pemain | Real-time Multiplayer | 200+ Kartu</p>
            <p>XP & Level System | Meme Culture Indonesia</p>
          </div>
        </div>
      </main>
    </div>
  );
}
