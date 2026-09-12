'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Memproses login...');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setStatus('Login berhasil! Mengalihkan...');
          setTimeout(() => router.replace('/'), 500);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setStatus('Login berhasil! Mengalihkan...');
          setTimeout(() => router.replace('/'), 500);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('Login berhasil! Mengalihkan...');
        setTimeout(() => router.replace('/'), 500);
      }
    });

    const timer = setTimeout(() => {
      setStatus('Sesi tidak ditemukan, coba login ulang...');
      setTimeout(() => router.replace('/login'), 1500);
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-xl mb-4">{status}</div>
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
