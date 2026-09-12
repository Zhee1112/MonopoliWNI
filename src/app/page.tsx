'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/UI';
import { useAuth } from '@/lib/auth/AuthProvider';

// ============================================================
// LANDING PAGE
// ============================================================

export default function Home() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Show loading while auth is resolving (prevents redirect loop after OAuth)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading...</div>
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // If not logged in after auth resolved, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Mengalihkan ke login...</div>
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
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
        body: JSON.stringify({ playerName: name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat room');
      }

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal join room');
      }

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
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Profile Bar - Top Right */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 bg-white/10 backdrop-blur hover:bg-white/20 rounded-full px-3 py-1.5 transition-all"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-8 h-8 rounded-full border-2 border-white/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold border-2 border-white/30">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-tight">{profile.displayName}</p>
              <p className="text-green-300 text-[10px] leading-tight">Lv.{profile.level} • {profile.xp} XP</p>
            </div>
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">MONOPOLI</h1>
          <h2 className="text-3xl font-bold text-yellow-400">WNI</h2>
          <p className="text-green-200 mt-2">Versi Indonesia yang kekinian</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur">
          {mode === 'home' && (
            <div className="space-y-4">
              <Button
                fullWidth
                size="lg"
                onClick={() => setMode('create')}
              >
                BUAT ROOM
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="secondary"
                onClick={() => setMode('join')}
              >
                JOIN ROOM
              </Button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center mb-4">Buat Room Baru</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemain
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={profile.displayName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={20}
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika pakai nama: {profile.displayName}</p>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    setMode('home');
                    setError('');
                  }}
                >
                  KEMBALI
                </Button>
                <Button
                  fullWidth
                  loading={loading}
                  onClick={handleCreateRoom}
                >
                  BUAT
                </Button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center mb-4">Join Room</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pemain
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={profile.displayName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={20}
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika pakai nama: {profile.displayName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Room
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode room"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => {
                    setMode('home');
                    setError('');
                  }}
                >
                  KEMBALI
                </Button>
                <Button
                  fullWidth
                  loading={loading}
                  onClick={handleJoinRoom}
                >
                  JOIN
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Features */}
        <div className="mt-8 text-center text-green-200 text-sm">
          <p>2-8 Pemain | Real-time Multiplayer | 200+ Kartu</p>
        </div>
      </div>
    </div>
  );
}
