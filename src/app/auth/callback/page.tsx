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
      setStatus('Login berhasil!');
      setTimeout(() => window.location.replace('/'), 500);
    }

    async function handleCallback() {
      const fullUrl = window.location.href;
      const url = new URL(fullUrl);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDesc = url.searchParams.get('error_description');
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      const debugParts = [
        `url_has_code: ${!!code}`,
        `url_has_error: ${error || 'none'}`,
        `hash_has_token: ${!!accessToken}`,
        `full_url: ${fullUrl.substring(0, 120)}`,
      ];
      setDebug(debugParts.join(' | '));

      if (error) {
        setStatus(`Error dari Google: ${errorDesc || error}`);
        return;
      }

      // Try PKCE code exchange
      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setDebug(prev => prev + ` | exchange_error: ${exchangeError.message}`);
          } else if (data.session) {
            goHome();
            return;
          }
        } catch (e: any) {
          setDebug(prev => prev + ` | exchange_exception: ${e.message}`);
        }
      }

      // Try hash tokens (implicit flow)
      if (accessToken && refreshToken) {
        try {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!sessionError && data.session) {
            goHome();
            return;
          }
        } catch (e: any) {
          setDebug(prev => prev + ` | hash_exception: ${e.message}`);
        }
      }

      // Try getSession (already stored)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        goHome();
        return;
      }

      // Final: maybe redirect to home and let AuthProvider handle it
      setStatus('Tidak ada token di URL. Mencoba langsung...');
      setTimeout(() => window.location.replace('/'), 1000);
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
      <div className="text-center max-w-lg">
        <div className="text-white text-xl mb-4">{status}</div>
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        {debug && (
          <div className="bg-black/30 p-3 rounded text-left">
            {debug.split(' | ').map((line, i) => (
              <p key={i} className="text-green-300 text-xs break-all">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
