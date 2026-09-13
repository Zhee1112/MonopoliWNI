'use client';

import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Board from '@/components/Board/Board';
import PlayerPanel from '@/components/Player/PlayerPanel';
import DiceRollModal from '@/components/Modal/DiceRollModal';
import EventCardModal from '@/components/Modal/EventCardModal';
import BuyPropertyModal from '@/components/Modal/BuyPropertyModal';
import GameModal from '@/components/Modal/GameModal';
import { useRealtimeRoom, useRealtimePlayers, useRealtimeCard } from '@/hooks/useRealtime';
import { getCellByIndex, getPropertyCells } from '@/lib/game/board-data';
import { drawRandomCard, getCardById } from '@/lib/game/takdir-cards';
import { NORMAL_ROLES } from '@/lib/game/role-data';
import { Player, Room, BoardCell } from '@/lib/types';

const TOKEN_COLORS = ['#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#94a3b8'];

export default function GameRoom({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code: roomCode } = use(params);

  // State
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<BoardCell | null>(null);
  const [lastRoll, setLastRoll] = useState<{ dice1: number; dice2: number; total: number } | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [showRegulations, setShowRegulations] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [gameModalTab, setGameModalTab] = useState<'players' | 'status' | 'chat' | 'settings'>('players');

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Realtime hooks
  const { room, setRoom } = useRealtimeRoom(roomCode);
  const { players, setPlayers } = useRealtimePlayers(room?.id || '');
  const { activeCard, broadcastCard, broadcastReaction, broadcastDismiss } = useRealtimeCard();

  // Load player from sessionStorage
  useEffect(() => {
    const storedPlayer = sessionStorage.getItem('player');
    const storedRoom = sessionStorage.getItem('room');

    if (storedPlayer && storedRoom) {
      const player = JSON.parse(storedPlayer);
      setCurrentPlayer(player);
    } else {
      router.push('/login');
    }
  }, [router]);

  // Sync currentPlayer with realtime players
  useEffect(() => {
    if (currentPlayer && players.length > 0) {
      const updated = players.find((p) => p.id === currentPlayer.id);
      if (updated) {
        setCurrentPlayer(updated);
        sessionStorage.setItem('player', JSON.stringify(updated));
      }
    }
  }, [players, currentPlayer]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Check if it's current player's turn
  const isMyTurn = room && currentPlayer && room.turnOrder[room.currentTurn] === currentPlayer.id;
  const isHost = room && currentPlayer && room.hostId === currentPlayer.id;

  // Check if all players have selected roles
  const allRolesSelected = players.every((p) => p.selectedRole);
  const allReady = players.every((p) => p.isReady);
  const canStart = isHost && players.length >= 2 && allRolesSelected;

  // Get role info for a player
  const getRoleInfo = (roleId: string | null) => {
    if (!roleId) return null;
    return NORMAL_ROLES.find((r) => r.id === roleId) || null;
  };

  // ---- LOBBY HANDLERS ----

  const handleSelectRole = useCallback(async (roleId: string) => {
    if (!currentPlayer || !room) return;
    setError('');
    try {
      const response = await fetch('/api/select-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, roleId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal memilih role');
        return;
      }
      setCurrentPlayer(data.player);
      sessionStorage.setItem('player', JSON.stringify(data.player));
      setSelectedRoleId(null);
      setRoleModalOpen(false);
    } catch {
      setError('Gagal memilih role');
    }
  }, [currentPlayer, room]);

  const handleToggleReady = useCallback(async () => {
    if (!currentPlayer) return;
    try {
      const response = await fetch('/api/toggle-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayer.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentPlayer(data.player);
        sessionStorage.setItem('player', JSON.stringify(data.player));
      }
    } catch {
      // silent
    }
  }, [currentPlayer]);

  const handleStartGame = useCallback(async () => {
    if (!room || !currentPlayer) return;
    setStarting(true);
    setError('');
    try {
      const response = await fetch('/api/start-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, hostId: currentPlayer.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal memulai game');
        setStarting(false);
        return;
      }
      // Game started - realtime will update room.status to 'playing'
    } catch {
      setError('Gagal memulai game');
      setStarting(false);
    }
  }, [room, currentPlayer]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim() || !currentPlayer) return;
    setChatMessages((prev) => [...prev, { sender: currentPlayer.name, text: chatInput.trim() }]);
    setChatInput('');
  }, [chatInput, currentPlayer]);

  // ---- BOT HANDLERS ----

  const handleAddBot = useCallback(async () => {
    if (!room || !currentPlayer) return;
    setError('');
    try {
      const response = await fetch('/api/add-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, hostId: currentPlayer.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menambah bot');
      }
    } catch {
      setError('Gagal menambah bot');
    }
  }, [room, currentPlayer]);

  const handleAddBots = useCallback(async (count: number) => {
    if (!room || !currentPlayer) return;
    setError('');
    for (let i = 0; i < count; i++) {
      try {
        await fetch('/api/add-bot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, hostId: currentPlayer.id }),
        });
      } catch {
        break;
      }
    }
  }, [room, currentPlayer]);

  // ---- GAME HANDLERS ----

  const handleRollDice = useCallback(async () => {
    if (!currentPlayer || !room) return;
    setShowDiceModal(true);
  }, [currentPlayer, room]);

  const handleDiceRollComplete = useCallback(
    async (result: { dice1: number; dice2: number; total: number }) => {
      if (!currentPlayer || !room) return;
      setLastRoll(result);
      try {
        const response = await fetch('/api/roll-dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCurrentPlayer((prev) =>
          prev ? { ...prev, position: data.newPosition, luck: data.newLuck, cleanMoney: prev.cleanMoney + data.moneyChange } : null
        );
        const cell = getCellByIndex(data.newPosition);
        if (cell.type === 'property') {
          const property = getPropertyCells().find((p) => p.index === data.newPosition);
          if (property) { setSelectedCell(property); setShowBuyModal(true); }
        } else if (cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan') {
          const card = drawRandomCard();
          broadcastCard({ cardId: card.id, drawnBy: currentPlayer.id, playerName: currentPlayer.name });
        }
      } catch (err) { console.error('Roll dice error:', err); }
    },
    [currentPlayer, room, broadcastCard]
  );

  const handleBuyProperty = useCallback(async () => {
    if (!currentPlayer || !room || !selectedCell) return;
    try {
      const response = await fetch('/api/buy-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, boardIndex: selectedCell.index }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCurrentPlayer((prev) =>
        prev ? { ...prev, cleanMoney: data.newBalance, properties: [...(prev.properties || []), data.property.id] } : null
      );
      setShowBuyModal(false);
      setSelectedCell(null);
    } catch (err) { console.error('Buy property error:', err); }
  }, [currentPlayer, room, selectedCell]);

  const handleEndTurn = useCallback(async () => {
    if (!currentPlayer || !room) return;
    try {
      const response = await fetch('/api/end-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: data.newBalance } : null);
      setLastRoll(null);
    } catch (err) { console.error('End turn error:', err); }
  }, [currentPlayer, room]);

  const handleReaction = useCallback(
    (reaction: string) => { if (currentPlayer) broadcastReaction(currentPlayer.id, reaction); },
    [currentPlayer, broadcastReaction]
  );

  const handleDismissCard = useCallback(() => { broadcastDismiss(); }, [broadcastDismiss]);

  const handleCellClick = useCallback((cell: BoardCell) => { setSelectedCell(cell); }, []);

  // ---- BOT AUTO-PLAY ENGINE ----
  const botPlayLock = useRef(false);

  useEffect(() => {
    if (!room || room.status !== 'playing' || !players.length) return;

    const activePlayerId = room.turnOrder[room.currentTurn];
    const activePlayer = players.find((p) => p.id === activePlayerId);

    if (!activePlayer || !activePlayer.isBot || botPlayLock.current) return;

    const runBotTurn = async () => {
      botPlayLock.current = true;

      // Step 1: Roll dice (with delay for visual)
      await new Promise((r) => setTimeout(r, 1200));
      try {
        const rollRes = await fetch('/api/roll-dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, playerId: activePlayerId }),
        });
        const rollData = await rollRes.json();
        if (!rollRes.ok) { botPlayLock.current = false; return; }

        // Step 2: Check if landed on property
        const cell = getCellByIndex(rollData.newPosition);
        if (cell.type === 'property') {
          const property = getPropertyCells().find((p) => p.index === rollData.newPosition);
          // Bot decision: buy if has enough money and price < 40% of cleanMoney
          const botMoney = (activePlayer.cleanMoney || 0) + (rollData.moneyChange || 0);
          if (property && property.price && botMoney >= property.price && property.price < botMoney * 0.4) {
            await new Promise((r) => setTimeout(r, 800));
            await fetch('/api/buy-property', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roomId: room.id, playerId: activePlayerId, boardIndex: property.index }),
            });
          }
        }

        // Step 3: End turn (with delay)
        await new Promise((r) => setTimeout(r, 1000));
        await fetch('/api/end-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, playerId: activePlayerId }),
        });
      } catch (e) {
        console.error('Bot play error:', e);
      }

      botPlayLock.current = false;
    };

    runBotTurn();
  }, [room?.currentTurn, room?.status, players]);

  // ---- LOADING STATE ----
  if (!currentPlayer || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-surface text-xl">Loading...</div>
      </div>
    );
  }

  // ---- LOBBY / WAITING ROOM ----
  if (room.status === 'waiting') {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="fixed top-0 left-0 w-full z-40 bg-surface-container-low/90 backdrop-blur-xl border-b border-outline-variant/50">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="text-on-surface-variant hover:text-primary text-sm font-semibold transition-colors flex items-center gap-1">
              <span>&#8592;</span> Keluar
            </button>
            <h1 className="text-sm font-bold text-primary tracking-tight">LOBBY</h1>
            <div className="w-16" />
          </div>
        </div>

        <main className="pt-20 pb-8 px-4">
          <div className="max-w-lg mx-auto space-y-4">

            {/* Room Code Card */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 text-center">
              <p className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-2">KODE ROOM</p>
              <p className="text-3xl font-extrabold text-primary tracking-[0.3em] font-mono">{roomCode}</p>
              <p className="text-[10px] text-outline mt-1">Bagikan kode ini ke teman</p>
            </div>

            {/* Player Slots */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-on-surface">Pemain ({players.length}/8)</h3>
                {isHost && <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">HOST</span>}
              </div>
              <div className="space-y-2">
                {players.map((player, idx) => {
                  const role = getRoleInfo(player.selectedRole);
                  return (
                    <div key={player.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${player.id === currentPlayer.id ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container border border-outline-variant/50'}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: TOKEN_COLORS[idx] || '#94a3b8' }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{player.name}</p>
                        <p className="text-[10px] text-outline">{role ? role.name : 'Belum pilih role'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {player.isBot && <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full font-bold">BOT</span>}
                        {player.isReady && <span className="text-[9px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-bold">READY</span>}
                        {player.id === currentPlayer.id && <span className="text-[9px] text-outline">(kamu)</span>}
                      </div>
                    </div>
                  );
                })}
                {Array.from({ length: 8 - players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/30 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-outline text-xs">+</div>
                    <p className="text-sm text-outline">Menunggu pemain...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bot Controls (Host Only) */}
            {isHost && (
              <div className="flex gap-2">
                <button
                  onClick={handleAddBot}
                  disabled={players.length >= 8}
                  className="flex-1 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Tambah Bot
                </button>
                <button
                  onClick={() => handleAddBots(3)}
                  disabled={players.length >= 6}
                  className="flex-1 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Tambah 3 Bot
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-error/10 border border-error/30 rounded-xl p-3 text-center">
                <span className="text-error text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
              <h3 className="text-sm font-bold text-on-surface mb-3">Pilih Role</h3>
              {currentPlayer.selectedRole ? (
                <div className="bg-surface-container rounded-xl p-3 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary text-lg font-bold">
                      {getRoleInfo(currentPlayer.selectedRole)?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{getRoleInfo(currentPlayer.selectedRole)?.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{getRoleInfo(currentPlayer.selectedRole)?.specialAbility}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRoleModalOpen(true)}
                    className="mt-2 w-full py-1.5 text-[10px] text-on-surface-variant bg-surface-container-high rounded-lg font-semibold hover:bg-surface-container-highest transition-colors"
                  >
                    GANTI ROLE
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRoleModalOpen(true)}
                  className="w-full py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
                >
                  PILIH ROLE
                </button>
              )}
            </div>

            {/* Ready Toggle */}
            <button
              onClick={handleToggleReady}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                currentPlayer.isReady
                  ? 'bg-secondary text-on-primary shadow-[0_4px_16px_rgba(78,222,163,0.3)]'
                  : 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {currentPlayer.isReady ? '✓ SIAP' : 'TANDAI SIAP'}
            </button>

            {/* Start Game (Host Only) */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStart || starting}
                className="w-full py-3 bg-gradient-to-r from-primary-container via-primary to-primary-container text-on-primary font-bold text-sm rounded-xl transition-all active:scale-95 shadow-[0_4px_16px_rgba(255,213,109,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {starting ? 'MEMULAI...' : canStart ? 'MULAI GAME' : 'Belum semua siap'}
              </button>
            )}

            {/* Regulations */}
            <button
              onClick={() => setShowRegulations(!showRegulations)}
              className="w-full py-2.5 text-on-surface-variant text-[10px] font-semibold hover:text-primary transition-colors"
            >
              {showRegulations ? 'Sembunyikan Peraturan ▲' : 'Lihat Peraturan ▼'}
            </button>
            {showRegulations && (
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 text-[11px] text-on-surface-variant space-y-1.5">
                <p>1. Minimal 2 pemain, maksimal 8 pemain</p>
                <p>2. Semua pemain harus memilih role sebelum memulai</p>
                <p>3. Role yang sama tidak boleh dipilih lebih dari 1 pemain</p>
                <p>4. Hanya host yang bisa memulai game</p>
                <p>5. Dadu ditentukan oleh sistem (DnD)</p>
                <p>6. Uang kotor harus dilaporkan jika terkena audit</p>
                <p>7. Pemain yang bangkrut keluar dari game</p>
                <p>8. Pemenang adalah pemain terkaya di akhir game</p>
              </div>
            )}
          </div>
        </main>

        {/* Role Selection Modal */}
        {roleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-bold text-on-surface text-sm">Pilih Role</h3>
                <button onClick={() => { setRoleModalOpen(false); setSelectedRoleId(null); }} className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors text-sm">✕</button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
                {NORMAL_ROLES.map((role) => {
                  const isTaken = players.some((p) => p.selectedRole === role.id && p.id !== currentPlayer.id);
                  const isSelected = currentPlayer.selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      disabled={isTaken}
                      onClick={() => handleSelectRole(role.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-2 border-primary'
                          : isTaken
                            ? 'bg-surface-container-low border border-outline-variant/30 opacity-40 cursor-not-allowed'
                            : 'bg-surface-container border border-outline-variant hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                          isSelected ? 'bg-gradient-to-br from-primary to-secondary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {role.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                            {role.name}
                            {isTaken && <span className="text-[9px] text-error ml-2">DIPILIH</span>}
                            {isSelected && <span className="text-[9px] text-primary ml-2">KAMU</span>}
                          </p>
                          <p className="text-[10px] text-outline truncate">{role.specialAbility}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-secondary font-bold">Rp{role.baseIncome.toLocaleString('id-ID')}/turn</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- GAME STATE ----
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between select-none">
      {/* Ambient glows */}
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP APP HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/80 h-16 sm:h-20 flex items-center px-4 lg:px-8 justify-between shadow-lg">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-primary text-2xl">casino</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-primary text-lg sm:text-xl tracking-tight">MONOPOLI WNI</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-outline-variant text-secondary">V2.4</span>
            </div>
            <span className="text-xs text-on-surface-variant block tracking-wide font-medium">Arena Meja Nusantara</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-md bg-background-lowest border border-outline-variant">
            <span className="text-[10px] text-outline font-semibold">KAMAR:</span>
            <span className="text-xs font-mono font-bold text-secondary">#{roomCode}</span>
          </div>
        </div>

        {/* Center Turn status */}
        <div className="flex items-center gap-3 px-3 sm:px-4 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl animate-pulse">hourglass_top</span>
            <div className="text-left leading-tight hidden md:block">
              <span className="text-xs font-bold text-primary block">
                Giliran {players.find((p) => p.id === room.turnOrder[room.currentTurn])?.name || '...'}
                {isMyTurn && ' (Anda)'}
              </span>
              <span className="text-[10px] text-on-surface-variant">Sisa Waktu Lempar Dadu</span>
            </div>
          </div>
          <div className="px-2.5 py-0.5 rounded-md bg-background-lowest border border-primary/20 font-mono font-bold text-primary text-base">
            38s
          </div>
        </div>

        {/* Right Header Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 rounded-full text-on-primary font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-primary/30" style={{ backgroundColor: currentPlayer.tokenColor }}>
            {currentPlayer.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* MAIN BOARD ARENA */}
      <main className="w-full pt-20 pb-20 px-2 sm:px-4 lg:px-6 flex items-center justify-center flex-1">
        <Board
          players={players.map((p) => ({ id: p.id, position: p.position, tokenColor: p.tokenColor || '#3b82f6', name: p.name }))}
          onCellClick={handleCellClick}
        />
      </main>

      {/* FLOATING BOTTOM TOOLBAR */}
      <aside className="fixed bottom-0 left-0 right-0 h-14 z-40 bg-surface-container-low/95 backdrop-blur-md border-t border-outline-variant px-3 sm:px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.7)]">
        <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Quick Modals Triggers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('players'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-primary flex items-center gap-1.5 transition-all"
              title="Daftar Pemain"
            >
              <span className="material-symbols-outlined text-lg">person</span>
              <span className="hidden md:inline text-xs font-bold">Pemain</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('status'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-secondary flex items-center gap-1.5 transition-all"
              title="Status & Kavling"
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              <span className="hidden md:inline text-xs font-bold">Status</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('chat'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-sky-400 flex items-center gap-1.5 transition-all relative"
              title="Obrolan Meja"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              <span className="hidden md:inline text-xs font-bold">Chat</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('settings'); }}
              className="h-9 w-9 sm:w-auto sm:px-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface-variant flex items-center justify-center gap-1 transition-all"
              title="Pengaturan"
            >
              <span className="material-symbols-outlined text-lg">tune</span>
            </button>
          </div>

          {/* Center Status Label (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-on-surface-variant">
            <span>{currentPlayer.name} &bull; Kavling {currentPlayer.properties?.length || 0}</span>
            <span className="text-primary font-bold">Kas Dompet: Rp {(currentPlayer.cleanMoney || 0).toLocaleString('id-ID')}</span>
          </div>

          {/* Right Action Area: Kocok Dadu & Selesai Giliran */}
          <div className="flex items-center gap-2">
            {isMyTurn && (
              <button
                onClick={handleRollDice}
                className="h-9 px-4 sm:px-5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_16px_rgba(37,99,235,0.5)] transition-all active:scale-95"
              >
                <span className="text-sm animate-spin" style={{ animationDuration: '4s' }}>🎲</span>
                <span className="tracking-wide">KOCOK DADU</span>
              </button>
            )}
            <button
              onClick={handleEndTurn}
              className="h-9 px-2.5 sm:px-3 rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-base">skip_next</span>
              <span className="hidden sm:inline">SELESAI</span>
            </button>
          </div>
        </div>
      </aside>

      {/* BOTTOM TICKER WARTA MEJA */}
      <footer className="w-full bg-background-lowest border-t border-outline-variant py-2 px-4 text-xs shadow-inner hidden md:block fixed bottom-14 left-0 z-30">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-bold text-[10px] tracking-wider uppercase shrink-0">WARTA MEJA</span>
            <p className="text-on-surface-variant truncate text-xs">
              <span className="text-secondary font-semibold">{players[1]?.name || 'Pemain 2'}</span> membeli <span className="text-primary font-medium">Menteng VIP</span> seharga <span className="font-mono text-on-surface">Rp 750.000</span> &bull; Bank menyalurkan dividen Kas Keliling
            </p>
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant shrink-0 text-xs font-mono">
            <span className="flex items-center gap-1 text-secondary"><span className="w-2 h-2 rounded-full bg-secondary" /> 18ms</span>
            <span>Babak {(room.currentTurn || 0) + 1} / 20</span>
            <span>Pool Kas: <strong className="text-primary">Rp {(room.potMoney || 0).toLocaleString('id-ID')}</strong></span>
          </div>
        </div>
      </footer>

      {/* GAME MODAL */}
      <GameModal
        isOpen={gameModalOpen}
        onClose={() => setGameModalOpen(false)}
        defaultTab={gameModalTab}
        players={players}
        currentPlayer={currentPlayer}
        roomCode={roomCode}
        chatMessages={chatMessages}
        onSendChat={(text) => setChatMessages((prev) => [...prev, { sender: currentPlayer.name, text }])}
      />

      {/* OTHER MODALS */}
      <DiceRollModal isOpen={showDiceModal} onClose={() => setShowDiceModal(false)} onRollComplete={handleDiceRollComplete} />
      {selectedCell && (
        <BuyPropertyModal
          isOpen={showBuyModal}
          cell={selectedCell}
          playerMoney={currentPlayer.cleanMoney}
          onBuy={handleBuyProperty}
          onSkip={() => { setShowBuyModal(false); setSelectedCell(null); }}
        />
      )}
      {activeCard && (
        <EventCardModal
          isOpen={true}
          card={getCardById(activeCard.cardId) || drawRandomCard()}
          drawnBy={activeCard.playerName || players.find((p) => p.id === activeCard.drawnBy)?.name || 'Unknown'}
          reactions={activeCard.reactions}
          onReact={handleReaction}
          onDismiss={handleDismissCard}
          showButtons={activeCard.drawnBy !== currentPlayer.id}
        />
      )}
    </div>
  );
}
