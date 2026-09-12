'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Memproses login...');

  useEffect(() => {
    let redirected = false;

    function goHome() {
      if (redirected) return;
      redirected = true;
      setStatus('Login berhasil! Mengalihkan...');
      window.location.href = '/';
    }

    function goLogin() {
      if (redirected) return;
      redirected = true;
      setStatus('Sesi tidak ditemukan. Kembali ke login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }

    // Listen for auth state change (most reliable)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) goHome();
      }
    );

    // Wait 2s for Supabase to process URL hash, then check session
    const checkTimer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          goHome();
        } else {
          goLogin();
        }
      }).catch(() => goLogin());
    }, 2000);

    // Hard timeout
    const hardTimer = setTimeout(() => goLogin(), 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(checkTimer);
      clearTimeout(hardTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-xl mb-4">{status}</div>
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
