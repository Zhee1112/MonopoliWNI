'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  rank: string;
  totalGames: number;
  totalWins: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function calculateLevel(xp: number): { level: number; rank: string } {
  const level = Math.floor(xp / 1000) + 1;

  const ranks: Record<number, string> = {
    1: '🟢 Magang',
    2: '🔵 Karyawan',
    3: '🟡 Supervisor',
    4: '🟠 Manager',
    5: '🔴 Senior Manager',
    6: '🟣 Director',
    7: '⭐ VP',
    8: '💎 C-Suite',
    9: '👑 Sultan',
    10: '🏆 Legenda',
  };

  const rankLevel = Math.min(Math.floor(level / 2) + 1, 10);
  return { level, rank: ranks[rankLevel] || '🟢 Magang' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchOrCreateProfile(newSession.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchOrCreateProfile(currentSession.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchOrCreateProfile(userData: User) {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (existing && !fetchError) {
        const { level, rank } = calculateLevel(existing.xp || 0);
        setProfile({
          id: existing.id,
          userId: existing.user_id,
          displayName: existing.display_name || userData.user_metadata?.full_name || 'Player',
          avatarUrl: existing.avatar_url || userData.user_metadata?.avatar_url || null,
          xp: existing.xp || 0,
          level,
          rank,
          totalGames: existing.total_games || 0,
          totalWins: existing.total_wins || 0,
          createdAt: existing.created_at,
        });
        setLoading(false);
        return;
      }

      const newProfile = {
        user_id: userData.id,
        display_name: userData.user_metadata?.full_name || 'Player',
        avatar_url: userData.user_metadata?.avatar_url || null,
        xp: 0,
        total_games: 0,
        total_wins: 0,
      };

      const { data: created, error: insertError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (created && !insertError) {
        setProfile({
          id: created.id,
          userId: created.user_id,
          displayName: created.display_name,
          avatarUrl: created.avatar_url,
          xp: 0,
          level: 1,
          rank: '🟢 Magang',
          totalGames: 0,
          totalWins: 0,
          createdAt: created.created_at,
        });
      } else {
        setProfile({
          id: 'temp',
          userId: userData.id,
          displayName: userData.user_metadata?.full_name || 'Player',
          avatarUrl: userData.user_metadata?.avatar_url || null,
          xp: 0,
          level: 1,
          rank: '🟢 Magang',
          totalGames: 0,
          totalWins: 0,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      setProfile({
        id: 'temp',
        userId: userData.id,
        displayName: userData.user_metadata?.full_name || 'Player',
        avatarUrl: userData.user_metadata?.avatar_url || null,
        xp: 0,
        level: 1,
        rank: '🟢 Magang',
        totalGames: 0,
        totalWins: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setLoading(false);
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
