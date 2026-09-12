'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading...</div>
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (user) {
    router.replace('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">MONOPOLI</h1>
          <h2 className="text-3xl font-bold text-yellow-400">WNI</h2>
          <p className="text-green-200 mt-2">Versi Indonesia yang kekinian</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-6">Masuk ke Permainan</h3>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Login dengan Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              Dengan login, kamu setuju dengan syarat & ketentuan
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center text-green-200 text-sm space-y-1">
          <p>2-8 Pemain | Real-time Multiplayer | 200+ Kartu</p>
          <p>XP & Level System | Meme Culture Indonesia</p>
        </div>
      </div>
    </div>
  );
}
