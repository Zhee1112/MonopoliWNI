'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Memproses login...');
  const [debug, setDebug] = useState('');

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
      setTimeout(() => window.location.replace('/login'), 3000);
    }

    // Log URL for debugging
    setDebug(window.location.href);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, sess) => {
        if (sess) {
          goHome();
        }
      }
    );

    // Poll session
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const { data: { session }, error } = await supabase.auth.getSession();
      setDebug(`Attempt ${attempts}: session=${!!session}, error=${error?.message || 'none'}, url=${window.location.href.substring(0, 80)}`);
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
      <div className="text-center max-w-md">
        <div className="text-white text-xl mb-4">{status}</div>
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        {debug && <p className="text-green-300 text-xs break-all bg-black/30 p-2 rounded">{debug}</p>}
      </div>
    </div>
  );
}
