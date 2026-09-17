'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Player, Room, mapPlayerFromDB, mapRoomFromDB } from '@/lib/types';

// ============================================================
// REALTIME HOOKS - Room-scoped, isolated per meja
// ============================================================

export function useRealtimeRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!roomCode) return;

    const fetchRoom = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single();

        if (data && !error) {
          setRoom(mapRoomFromDB(data as Record<string, unknown>));
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        console.error('Failed to fetch room:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    // Subscribe ONLY to this room's changes
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = mapRoomFromDB(payload.new as Record<string, unknown>);
            // Guard: only update if this is actually our room
            if (updated.code === roomCode) {
              setRoom(updated);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  return { room, setRoom, loading, notFound };
}

export function useRealtimePlayers(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!roomId) return;

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

// ============================================================
// REALTIME CARD - Room-scoped (not global)
// ============================================================

export function useRealtimeCard(roomCode: string) {
  const [activeCard, setActiveCard] = useState<{
    cardId: string;
    drawnBy: string;
    playerName: string;
    targetId?: string;
    targetName?: string;
    reactions: Record<string, string[]>;
  } | null>(null);

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase.channel(`cards:${roomCode}`);

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
  }, [roomCode]);

  const broadcastCard = useCallback(
    async (cardData: {
      cardId: string;
      drawnBy: string;
      playerName: string;
      targetId?: string;
      targetName?: string;
    }) => {
      await supabase.channel(`cards:${roomCode}`).send({
        type: 'broadcast',
        event: 'card_drawn',
        payload: cardData,
      });
    },
    [roomCode]
  );

  const broadcastReaction = useCallback(
    async (playerId: string, reaction: string) => {
      await supabase.channel(`cards:${roomCode}`).send({
        type: 'broadcast',
        event: 'card_reaction',
        payload: { playerId, reaction },
      });
    },
    [roomCode]
  );

  const broadcastDismiss = useCallback(async () => {
    await supabase.channel(`cards:${roomCode}`).send({
      type: 'broadcast',
      event: 'card_dismissed',
      payload: {},
    });
  }, [roomCode]);

  return {
    activeCard,
    setActiveCard,
    broadcastCard,
    broadcastReaction,
    broadcastDismiss,
  };
}

// ============================================================
// REALTIME PROPERTIES - Room-scoped property ownership
// ============================================================

export interface PropertyRow {
  id: string;
  room_id: string;
  board_index: number;
  owner_id: string | null;
  house_level: number;
  is_mortgaged: boolean;
  is_landmark: boolean;
}

export function useRealtimeProperties(roomId: string) {
  const [properties, setProperties] = useState<PropertyRow[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('room_id', roomId)
          .order('board_index', { ascending: true });

        if (data && !error) {
          setProperties(data as PropertyRow[]);
        }
      } catch (e) {
        console.error('Failed to fetch properties:', e);
      }
    };

    fetchProperties();

    const channel = supabase
      .channel(`properties:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProperties((prev) => [...prev, payload.new as PropertyRow]);
          } else if (payload.eventType === 'UPDATE') {
            setProperties((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as PropertyRow) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setProperties((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { properties, setProperties };
}

// ============================================================
// REALTIME CHAT HOOK - Room-scoped
// ============================================================

export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  senderId?: string;
}

export function useRealtimeChat(roomCode: string, currentUserId?: string) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase.channel(`chat:${roomCode}`);

    channel
      .on('broadcast', { event: 'chat_message' }, (payload) => {
        const msg = payload.payload as ChatMessage;
        if (msg.senderId && currentUserId && msg.senderId === currentUserId) return;
        setChatMessages((prev) => [...prev, msg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, currentUserId]);

  const sendChatMessage = useCallback(
    async (sender: string, text: string) => {
      const msg: ChatMessage = {
        sender,
        text,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        senderId: currentUserId,
      };
      setChatMessages((prev) => [...prev, msg]);
      await supabase.channel(`chat:${roomCode}`).send({
        type: 'broadcast',
        event: 'chat_message',
        payload: msg,
      });
    },
    [roomCode, currentUserId]
  );

  return { chatMessages, setChatMessages, sendChatMessage };
}

// ============================================================
// REALTIME ANNOUNCEMENTS - Room-scoped Warta Meja
// ============================================================

export interface Announcement {
  id: string;
  type: 'roll' | 'buy' | 'rent' | 'card' | 'event' | 'tax' | 'loan' | 'bankrupt' | 'turn' | 'round' | 'system' | 'skip';
  playerName: string;
  message: string;
  detail?: string;
  time: string;
}

export function useRealtimeAnnouncement(roomCode: string) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    const channel = supabase.channel(`announcements:${roomCode}`);

    channel
      .on('broadcast', { event: 'game_announcement' }, (payload) => {
        const ann = payload.payload as Announcement;
        setAnnouncements((prev) => {
          const next = [...prev, ann];
          // Keep last 20 announcements
          return next.length > 20 ? next.slice(-20) : next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode]);

  const broadcastAnnouncement = useCallback(
    async (ann: Omit<Announcement, 'id' | 'time'>) => {
      const full: Announcement = {
        ...ann,
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      // Add to local state immediately so sender sees its own announcements
      setAnnouncements((prev) => {
        const next = [...prev, full];
        return next.length > 20 ? next.slice(-20) : next;
      });
      await supabase.channel(`announcements:${roomCode}`).send({
        type: 'broadcast',
        event: 'game_announcement',
        payload: full,
      });
    },
    [roomCode]
  );

  return { announcements, broadcastAnnouncement };
}
