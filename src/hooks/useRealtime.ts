'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Player, Room, mapPlayerFromDB, mapRoomFromDB } from '@/lib/types';

// ============================================================
// REALTIME HOOKS
// ============================================================

export function useRealtimeRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) return;

    // Initial fetch
    const fetchRoom = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single();

        if (data && !error) {
          setRoom(mapRoomFromDB(data as Record<string, unknown>));
        }
      } catch (e) {
        console.error('Failed to fetch room:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(mapRoomFromDB(payload.new as Record<string, unknown>));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return { room, setRoom, loading };
}

export function useRealtimePlayers(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (data && !error) {
          setPlayers(data.map((p) => mapPlayerFromDB(p as Record<string, unknown>)));
        }
      } catch (e) {
        console.error('Failed to fetch players:', e);
      }
    };

    fetchPlayers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => {
              const newPlayer = mapPlayerFromDB(payload.new as Record<string, unknown>);
              if (prev.some(p => p.id === newPlayer.id)) return prev;
              return [...prev, newPlayer];
            });
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev.map((p) => (p.id === payload.new.id ? mapPlayerFromDB(payload.new as Record<string, unknown>) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, setPlayers };
}

export function useRealtimeCard() {
  const [activeCard, setActiveCard] = useState<{
    cardId: string;
    drawnBy: string;
    playerName: string;
    targetId?: string;
    targetName?: string;
    reactions: Record<string, string[]>;
  } | null>(null);

  useEffect(() => {
    const channel = supabase.channel('cards');

    channel
      .on('broadcast', { event: 'card_drawn' }, (payload) => {
        setActiveCard({
          ...payload.payload,
          reactions: {},
        });
      })
      .on('broadcast', { event: 'card_reaction' }, (payload) => {
        setActiveCard((prev) => {
          if (!prev) return null;
          const { playerId, reaction } = payload.payload;
          const newReactions = { ...prev.reactions };
          if (!newReactions[reaction]) {
            newReactions[reaction] = [];
          }
          if (!newReactions[reaction].includes(playerId)) {
            newReactions[reaction].push(playerId);
          }
          return { ...prev, reactions: newReactions };
        });
      })
      .on('broadcast', { event: 'card_dismissed' }, () => {
        setActiveCard(null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const broadcastCard = useCallback(
    async (cardData: {
      cardId: string;
      drawnBy: string;
      playerName: string;
      targetId?: string;
      targetName?: string;
    }) => {
      await supabase.channel('cards').send({
        type: 'broadcast',
        event: 'card_drawn',
        payload: cardData,
      });
    },
    []
  );

  const broadcastReaction = useCallback(
    async (playerId: string, reaction: string) => {
      await supabase.channel('cards').send({
        type: 'broadcast',
        event: 'card_reaction',
        payload: { playerId, reaction },
      });
    },
    []
  );

  const broadcastDismiss = useCallback(async () => {
    await supabase.channel('cards').send({
      type: 'broadcast',
      event: 'card_dismissed',
      payload: {},
    });
  }, []);

  return {
    activeCard,
    setActiveCard,
    broadcastCard,
    broadcastReaction,
    broadcastDismiss,
  };
}
