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

    async function handleCallback() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(hash.substring(1));
      const accessToken = urlParams.get('access_token');

      setDebug(`code=${!!code}, hash=${!!hash}, url=${url.pathname}`);

      // Method 1: Exchange PKCE code
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setDebug(`exchangeCode error: ${error.message}`);
          } else if (data.session) {
            goHome();
            return;
          }
        } catch (e: any) {
          setDebug(`exchangeCode exception: ${e.message}`);
        }
      }

      // Method 2: Check hash tokens (implicit flow)
      if (accessToken) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: urlParams.get('refresh_token') || '',
          });
          if (data.session) {
            goHome();
            return;
          }
        } catch (e: any) {
          setDebug(`setSession exception: ${e.message}`);
        }
      }

      // Method 3: Poll getSession
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const { data: { session } } = await supabase.auth.getSession();
        setDebug(`poll ${attempts}: session=${!!session}`);
        if (session) {
          clearInterval(interval);
          goHome();
        } else if (attempts >= 15) {
          clearInterval(interval);
          goLogin('Timeout: sesi tidak ditemukan');
        }
      }, 500);
    }

    handleCallback();
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
