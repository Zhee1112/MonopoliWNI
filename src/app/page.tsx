'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/UI';
import { useAuth } from '@/lib/auth/AuthProvider';

// ============================================================
// LANDING PAGE
// ============================================================

export default function Home() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    const name = playerName.trim() || profile?.displayName || 'Player';
    if (!name) {
      setError('Nama harus diisi');
      return;
    }

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

      router.push(`/room/${data.room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const name = playerName.trim() || profile?.displayName || 'Player';
    if (!name || !roomCode.trim()) {
      setError('Nama dan kode room harus diisi');
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

      router.push(`/room/${data.room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">MONOPOLI</h1>
          <h2 className="text-3xl font-bold text-yellow-400">WNI</h2>
          <p className="text-green-200 mt-2">Versi Indonesia yang kekinian</p>
        </div>

        {/* User Profile / Auth */}
        {authLoading ? (
          <div className="text-center text-white/60 mb-4">Loading...</div>
        ) : user && profile ? (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4 flex items-center gap-3">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{profile.displayName}</p>
              <p className="text-green-300 text-xs">{profile.rank} • Level {profile.level} • {profile.xp} XP</p>
              <p className="text-green-400/60 text-xs">{profile.totalGames} game • {profile.totalWins} menang</p>
            </div>
            <button onClick={signOut} className="text-green-300/60 hover:text-white text-xs">Logout</button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login dengan Google
            </button>
          </div>
        )}

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur">
          {mode === 'home' && (
            <div className="space-y-4">
              <Button
                fullWidth
                size="lg"
                onClick={() => {
                  if (!user) { signInWithGoogle(); return; }
                  setMode('create');
                }}
              >
                BUAT ROOM
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="secondary"
                onClick={() => {
                  if (!user) { signInWithGoogle(); return; }
                  setMode('join');
                }}
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
                  placeholder={profile?.displayName || 'Masukkan nama kamu'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika pakai nama Google</p>
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
                  placeholder={profile?.displayName || 'Masukkan nama kamu'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                />
                <p className="text-xs text-gray-400 mt-1">Kosongkan jika pakai nama Google</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest font-mono"
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
