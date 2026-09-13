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
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);

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

  // Reset dice roll tracking when turn changes
  useEffect(() => {
    setHasRolledThisTurn(false);
  }, [room?.currentTurn]);

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
        setHasRolledThisTurn(true);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#001809' }}>
        <div className="text-xl" style={{ color: '#cbead1' }}>Loading...</div>
      </div>
    );
  }

  // ---- LOBBY / WAITING ROOM ----
  if (room.status === 'waiting') {
    return (
      <div className="min-h-screen bg-[#001809]">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,213,109,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(78,222,163,0.05) 0%, transparent 70%)' }} />

        {/* Header */}
        <div className="fixed top-0 left-0 w-full z-40 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(5,32,17,0.9)', borderColor: 'rgba(32,58,41,0.5)' }}>
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="text-[#d1c5af] hover:text-[#ffd56d] text-sm font-semibold transition-colors flex items-center gap-1">
              <span>&#8592;</span> Keluar
            </button>
            <h1 className="text-sm font-bold text-[#ffd56d] tracking-tighter">LOBBY</h1>
            <div className="w-16" />
          </div>
        </div>

        <main className="pt-20 pb-8 px-4">
          <div className="max-w-lg mx-auto space-y-4">

            {/* Room Code Card */}
            <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#d1c5af] mb-2">KODE ROOM</p>
              <p className="text-3xl font-extrabold text-[#ffd56d] tracking-[0.3em] font-mono">{roomCode}</p>
              <p className="text-[10px] text-[#9a907c] mt-1">Bagikan kode ini ke teman</p>
            </div>

            {/* Player Slots */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#cbead1]">Pemain ({players.length}/8)</h3>
                {isHost && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,213,109,0.1)', color: '#ffd56d' }}>HOST</span>}
              </div>
              <div className="space-y-2">
                {players.map((player, idx) => {
                  const role = getRoleInfo(player.selectedRole);
                  return (
                    <div key={player.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors`} style={{ backgroundColor: player.id === currentPlayer.id ? 'rgba(255,213,109,0.1)' : '#092515', border: player.id === currentPlayer.id ? '1px solid rgba(255,213,109,0.2)' : '1px solid rgba(32,58,41,0.5)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: TOKEN_COLORS[idx] || '#94a3b8' }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#cbead1] truncate">{player.name}</p>
                        <p className="text-[10px] text-[#9a907c]">{role ? role.name : 'Belum pilih role'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {player.isBot && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>BOT</span>}
                        {player.isReady && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(78,222,163,0.1)', color: '#4edea3' }}>READY</span>}
                        {player.id === currentPlayer.id && <span className="text-[9px] text-[#9a907c]">(kamu)</span>}
                      </div>
                    </div>
                  );
                })}
                {Array.from({ length: 8 - players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-50" style={{ backgroundColor: '#052011', border: '1px dashed rgba(32,58,41,0.3)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#152f1f', color: '#9a907c' }}>+</div>
                    <p className="text-sm text-[#9a907c]">Menunggu pemain...</p>
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
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}
                >
                  + Tambah Bot
                </button>
                <button
                  onClick={() => handleAddBots(3)}
                  disabled={players.length >= 6}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}
                >
                  + Tambah 3 Bot
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.3)' }}>
                <span className="text-sm font-semibold" style={{ color: '#ffb4ab' }}>{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
              <h3 className="text-sm font-bold text-[#cbead1] mb-3">Pilih Role</h3>
              {currentPlayer.selectedRole ? (
                <div className="rounded-xl p-3" style={{ backgroundColor: '#092515', border: '1px solid rgba(255,213,109,0.2)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd56d] to-[#4edea3] flex items-center justify-center text-[#3e2e00] text-lg font-bold">
                      {getRoleInfo(currentPlayer.selectedRole)?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#cbead1]">{getRoleInfo(currentPlayer.selectedRole)?.name}</p>
                      <p className="text-[10px] text-[#d1c5af]">{getRoleInfo(currentPlayer.selectedRole)?.specialAbility}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRoleModalOpen(true)}
                    className="mt-2 w-full py-1.5 text-[10px] rounded-lg font-semibold transition-colors"
                    style={{ backgroundColor: '#152f1f', color: '#d1c5af' }}
                  >
                    GANTI ROLE
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRoleModalOpen(true)}
                  className="w-full py-3 rounded-xl text-[#ffd56d] text-sm font-bold transition-colors"
                  style={{ backgroundColor: 'rgba(255,213,109,0.1)', border: '1px solid rgba(255,213,109,0.2)' }}
                >
                  PILIH ROLE
                </button>
              )}
            </div>

            {/* Ready Toggle */}
            <button
              onClick={handleToggleReady}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
              style={currentPlayer.isReady
                ? { backgroundColor: '#4edea3', color: '#003824', boxShadow: '0 4px 16px rgba(78,222,163,0.3)' }
                : { backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }
              }
            >
              {currentPlayer.isReady ? '✓ SIAP' : 'TANDAI SIAP'}
            </button>

            {/* Start Game (Host Only) */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStart || starting}
                className="w-full py-3 bg-gradient-to-r from-[#e5b842] via-[#ffd56d] to-[#e5b842] text-[#3e2e00] font-bold text-sm rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 4px 16px rgba(255,213,109,0.3)' }}
              >
                {starting ? 'MEMULAI...' : canStart ? 'MULAI GAME' : 'Belum semua siap'}
              </button>
            )}

            {/* Regulations */}
            <button
              onClick={() => setShowRegulations(!showRegulations)}
              className="w-full py-2.5 text-[10px] font-semibold transition-colors"
              style={{ color: '#d1c5af' }}
            >
              {showRegulations ? 'Sembunyikan Peraturan ▲' : 'Lihat Peraturan ▼'}
            </button>
            {showRegulations && (
              <div className="rounded-2xl p-4 text-[11px] space-y-1.5" style={{ backgroundColor: '#052011', border: '1px solid #203a29', color: '#d1c5af' }}>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setRoleModalOpen(false); setSelectedRoleId(null); }}>
            <div className="w-full max-w-lg max-h-[80vh] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-2xl flex flex-col" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }} onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #203a29' }}>
                <h3 className="font-bold text-[#cbead1] text-sm">Pilih Role</h3>
                <button onClick={() => { setRoleModalOpen(false); setSelectedRoleId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors" style={{ backgroundColor: '#152f1f', color: '#d1c5af' }}>✕</button>
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
                      className="w-full text-left px-4 py-3 rounded-xl transition-all"
                      style={isSelected
                        ? { backgroundColor: 'rgba(255,213,109,0.1)', border: '2px solid #ffd56d' }
                        : isTaken
                          ? { backgroundColor: '#052011', border: '1px solid rgba(32,58,41,0.3)', opacity: 0.4 }
                          : { backgroundColor: '#092515', border: '1px solid #203a29' }
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                          style={isSelected
                            ? { background: 'linear-gradient(135deg, #ffd56d, #4edea3)', color: '#3e2e00' }
                            : { backgroundColor: '#152f1f', color: '#d1c5af' }
                          }>
                          {role.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: isSelected ? '#ffd56d' : '#cbead1' }}>
                            {role.name}
                            {isTaken && <span className="text-[9px] ml-2" style={{ color: '#ffb4ab' }}>DIPILIH</span>}
                            {isSelected && <span className="text-[9px] ml-2" style={{ color: '#ffd56d' }}>KAMU</span>}
                          </p>
                          <p className="text-[10px] text-[#9a907c] truncate">{role.specialAbility}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold" style={{ color: '#4edea3' }}>Rp{role.baseIncome.toLocaleString('id-ID')}/turn</p>
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
    <div className="min-h-screen bg-[#001809] flex flex-col justify-between select-none">
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,213,109,0.05) 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(78,222,163,0.05) 0%, transparent 70%)' }} />

      {/* TOP APP HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 backdrop-blur-md border-b h-16 sm:h-20 flex items-center px-4 lg:px-8 justify-between shadow-lg" style={{ backgroundColor: 'rgba(5,32,17,0.95)', borderColor: '#203a29' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-inner" style={{ backgroundColor: '#152f1f', border: '1px solid rgba(255,213,109,0.3)' }}>
            <span className="text-2xl">&#x1F3B2;</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#ffd56d] text-lg sm:text-xl tracking-tighter">MONOPOLI WNI</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: '#203a29', color: '#4edea3' }}>V2.4</span>
            </div>
            <span className="text-xs text-[#d1c5af] block tracking-wide font-medium">Arena Meja Nusantara</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-md" style={{ backgroundColor: '#001206', border: '1px solid #203a29' }}>
            <span className="text-[10px] text-[#9a907c] font-semibold">KAMAR:</span>
            <span className="text-xs font-mono font-bold text-[#4edea3]">#{roomCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 sm:px-4 py-1.5 rounded-xl shadow-md" style={{ backgroundColor: '#152f1f', border: '1px solid #203a29' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">&#x23F3;</span>
            <div className="text-left leading-tight hidden md:block">
              <span className="text-xs font-bold text-[#ffd56d] block">
                Giliran {players.find((p) => p.id === room.turnOrder[room.currentTurn])?.name || '...'}
                {isMyTurn && ' (Anda)'}
              </span>
              <span className="text-[10px] text-[#d1c5af]">Sisa Waktu Lempar Dadu</span>
            </div>
          </div>
          <div className="px-2.5 py-0.5 rounded-md font-mono font-bold text-[#ffd56d] text-base" style={{ backgroundColor: '#001206', border: '1px solid rgba(255,213,109,0.2)' }}>
            38s
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-md" style={{ backgroundColor: currentPlayer.tokenColor, boxShadow: '0 0 0 2px rgba(255,213,109,0.3)' }}>
            {currentPlayer.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* MAIN BOARD ARENA */}
      <main className="w-full pt-20 pb-20 px-2 sm:px-4 lg:px-6 flex items-center justify-center flex-1">
        <Board
          players={players.map((p) => ({ id: p.id, position: p.position, tokenColor: p.tokenColor || '#3b82f6', name: p.name }))}
          currentPlayer={currentPlayer}
          activePlayerName={players.find((p) => p.id === room.turnOrder[room.currentTurn])?.name}
          activePlayerTokenColor={players.find((p) => p.id === room.turnOrder[room.currentTurn])?.tokenColor}
          potMoney={room.potMoney || 0}
          round={1}
          totalRounds={20}
          onCellClick={handleCellClick}
        />
      </main>

      {/* FLOATING BOTTOM TOOLBAR */}
      <aside className="fixed bottom-0 left-0 right-0 h-14 z-40 backdrop-blur-md border-t px-3 sm:px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.7)]" style={{ backgroundColor: 'rgba(5,32,17,0.95)', borderColor: '#203a29' }}>
        <div className="h-full max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('players'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#ffd56d' }}
              title="Daftar Pemain"
            >
              <span className="text-lg">&#x1F465;</span>
              <span className="hidden md:inline text-xs font-bold">Pemain</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('status'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#4edea3' }}
              title="Status & Kavling"
            >
              <span className="text-lg">&#x1F4CA;</span>
              <span className="hidden md:inline text-xs font-bold">Status</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('chat'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 transition-all relative"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#38bdf8' }}
              title="Obrolan Meja"
            >
              <span className="text-lg">&#x1F4AC;</span>
              <span className="hidden md:inline text-xs font-bold">Chat</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('settings'); }}
              className="h-9 w-9 sm:w-auto sm:px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }}
              title="Pengaturan"
            >
              <span className="text-lg">&#x2699;&#xFE0F;</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-[#d1c5af]">
            <span>{currentPlayer.name} &bull; Kavling {currentPlayer.properties?.length || 0}</span>
            <span className="text-[#ffd56d] font-bold">Kas Dompet: Rp {(currentPlayer.cleanMoney || 0).toLocaleString('id-ID')}</span>
          </div>

          <div className="flex items-center gap-2">
            {isMyTurn && !hasRolledThisTurn && (
              <button
                onClick={handleRollDice}
                className="h-9 px-4 sm:px-5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_16px_rgba(37,99,235,0.5)] transition-all active:scale-95"
              >
                <span className="text-sm animate-spin" style={{ animationDuration: '4s' }}>&#x1F3B2;</span>
                <span className="tracking-wide">KOCOK DADU</span>
              </button>
            )}
            {isMyTurn && hasRolledThisTurn && (
              <span className="h-9 px-4 sm:px-5 rounded-lg bg-blue-600/50 text-white/60 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-not-allowed">
                <span className="text-sm">&#x1F3B2;</span>
                <span className="tracking-wide">SUDAH ROLL</span>
              </span>
            )}
            <button
              onClick={handleEndTurn}
              className="h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: '#052011', border: '1px solid #203a29', color: '#d1c5af' }}
            >
              Selesai
            </button>
          </div>
        </div>
      </aside>

      {/* BOTTOM TICKER WARTA MEJA */}
      <footer className="w-full py-2 px-4 text-xs shadow-inner hidden md:block fixed bottom-14 left-0 z-30" style={{ backgroundColor: '#001206', borderTop: '1px solid #203a29' }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase shrink-0" style={{ backgroundColor: '#092515', color: '#ffd56d' }}>WARTA MEJA</span>
            <p className="text-[#d1c5af] truncate text-xs">
              <span className="text-[#4edea3] font-semibold">{players[1]?.name || 'Pemain 2'}</span> membeli <span className="text-[#ffd56d] font-medium">Menteng VIP</span> seharga <span className="font-mono text-[#cbead1]">Rp 750.000</span> &bull; Bank menyalurkan dividen Kas Keliling
            </p>
          </div>
          <div className="flex items-center gap-4 text-[#d1c5af] shrink-0 text-xs font-mono">
            <span className="flex items-center gap-1 text-[#4edea3]"><span className="w-2 h-2 rounded-full bg-[#4edea3]" /> 18ms</span>
            <span>Babak {(room.currentTurn || 0) + 1} / 20</span>
            <span>Pool Kas: <strong className="text-[#ffd56d]">Rp {(room.potMoney || 0).toLocaleString('id-ID')}</strong></span>
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
