'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Memproses login...');

  useEffect(() => {
    let done = false;

    function goHome() {
      if (done) return;
      done = true;
      setStatus('Login berhasil! Mengalihkan...');
      window.location.replace('/');
    }

    function goLogin(msg: string) {
      if (done) return;
      done = true;
      setStatus(msg);
      setTimeout(() => window.location.replace('/login'), 2000);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && sess) {
          goHome();
        }
      }
    );

    // Fallback: poll for session
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        clearInterval(interval);
        goHome();
      } else if (attempts >= 20) {
        clearInterval(interval);
        goLogin('Timeout: sesi tidak ditemukan');
      }
    }, 500);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
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
