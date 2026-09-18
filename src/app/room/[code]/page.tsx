'use client';

import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import Board from '@/components/Board/Board';
import DiceRollModal from '@/components/Modal/DiceRollModal';
import EventCardModal from '@/components/Modal/EventCardModal';
import BuyPropertyModal from '@/components/Modal/BuyPropertyModal';
import GameModal from '@/components/Modal/GameModal';
import InfoModal from '@/components/Modal/InfoModal';
import LoanModal from '@/components/Modal/LoanModal';
import GameEventModal from '@/components/Modal/GameEventModal';
import GachaRollModal from '@/components/Modal/GachaRollModal';
import GlobalEventModal from '@/components/Modal/GlobalEventModal';
import PostGameModal from '@/components/Modal/PostGameModal';
import UpgradePropertyModal from '@/components/Modal/UpgradePropertyModal';
import DefenseModal from '@/components/Modal/DefenseModal';
import BankruptcyModal from '@/components/Modal/BankruptcyModal';
import { useRealtimeRoom, useRealtimePlayers, useRealtimeCard, useRealtimeChat, useRealtimeAnnouncement, useRealtimeProperties, PropertyRow } from '@/hooks/useRealtime';
import { usePionAnimation } from '@/hooks/usePionAnimation';
import { getCellByIndex, getPropertyCells, JAKARTA_ZONES } from '@/lib/game/board-data';
import { drawRandomCard, getCardById, drawRandomCardExcluding } from '@/lib/game/takdir-cards';
import { drawRandomKegiatan, drawRandomKegiatanExcluding, getKegiatanById } from '@/lib/game/kegiatan-cards';
import { NORMAL_ROLES } from '@/lib/game/role-data';
import { Loan } from '@/lib/game/loan-system';
import { SoundEffects } from '@/lib/game/sound-effects';
import { BackgroundMusic } from '@/lib/game/background-music';
import { processCardEffect, processKegiatanEffect, getCardType, CardEffectResult, KegiatanEffectResult } from '@/lib/game/game-logic';
import { Player, Room, BoardCell, GameMode, GAME_MODES, Card, KegiatanCard } from '@/lib/types';
import { BoardThemeId } from '@/lib/game/board-themes';

const TOKEN_COLORS = ['#ef4444', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#06b6d4', '#f97316', '#94a3b8'];

export default function GameRoom({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { code: roomCode } = use(params);

  // State
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [needsJoin, setNeedsJoin] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<BoardCell | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCellInfo, setShowCellInfo] = useState(false);
  const [cellInfoData, setCellInfoData] = useState<BoardCell | null>(null);
  const [lastRoll, setLastRoll] = useState<{ dice1: number; dice2: number; total: number } | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [showRegulations, setShowRegulations] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [gameModalTab, setGameModalTab] = useState<'players' | 'status' | 'log' | 'chat' | 'settings'>('players');
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalCell, setUpgradeModalCell] = useState<BoardCell | null>(null);
  const [upgradeModalIsOwn, setUpgradeModalIsOwn] = useState(true);
  const [showDefenseModal, setShowDefenseModal] = useState(false);
  const [defenseAuditAmount, setDefenseAuditAmount] = useState(0);
  const [defenseCallback, setDefenseCallback] = useState<((option: string, success: boolean) => void) | null>(null);
  const [showBankruptcyModal, setShowBankruptcyModal] = useState(false);
  const [showGameEventModal, setShowGameEventModal] = useState(false);
  const [gameEventCell, setGameEventCell] = useState<BoardCell | null>(null);
  const [gameEventDice, setGameEventDice] = useState<{ dice1: number; dice2: number; total: number } | undefined>(undefined);
  const [gameEventRollResult, setGameEventRollResult] = useState<{
    baseDice: number;
    statBonus: number;
    luckBonus: number;
    evidenceBonus: number;
    totalScore: number;
    dcTarget: number;
    passed: boolean;
    margin: number;
  } | undefined>(undefined);
  const [drawnTakdirCard, setDrawnTakdirCard] = useState<Card | undefined>(undefined);
  const [drawnKegiatanCard, setDrawnKegiatanCard] = useState<KegiatanCard | undefined>(undefined);
  const [drawnCardIds, setDrawnCardIds] = useState<string[]>([]);
  const [ppnAmount, setPpnAmount] = useState<number>(0);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('bundir');
  const [gameOver, setGameOver] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [surrendered, setSurrendered] = useState(false);
  const [surrenderedWinnerName, setSurrenderedWinnerName] = useState<string | null>(null);
  const [gameRankings, setGameRankings] = useState<Array<{
    playerId: string; playerName: string; placement: number; totalAssets: number;
    cleanMoney: number; properties: string[]; isBot: boolean; isBankrupt: boolean;
  }>>([]);
  const [gameAchievements, setGameAchievements] = useState<Array<{
    playerId: string; achievementId: string; xp: number;
  }>>([]);

  // Gacha roll state
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [gachaCellName, setGachaCellName] = useState('');
  const [gachaCellEmoji, setGachaCellEmoji] = useState('');
  const [pendingGachaEffect, setPendingGachaEffect] = useState<((gachaRoll: number) => void) | null>(null);
  const [lastGachaRoll, setLastGachaRoll] = useState<number>(0);
  const [lastCellPosition, setLastCellPosition] = useState<number>(0);
  const [pendingEventOutcome, setPendingEventOutcome] = useState<{ cellPosition: number; passed: boolean; gachaRoll: number } | null>(null);
  const [bribedThisEvent, setBribedThisEvent] = useState(false);

  // Global event state
  const [showGlobalEventModal, setShowGlobalEventModal] = useState(false);
  const [globalEventName, setGlobalEventName] = useState('');
  const [globalEventEmoji, setGlobalEventEmoji] = useState('');
  const [globalEventDescription, setGlobalEventDescription] = useState('');

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [musicOn, setMusicOn] = useState(false);
  const [boardTheme, setBoardTheme] = useState<BoardThemeId>('default');

  // Refs for avoiding stale closures in animation callbacks
  const drawnCardIdsRef = useRef<string[]>([]);
  const currentPlayerRef = useRef<Player | null>(null);

  // Realtime hooks
  const { room, setRoom, loading: roomLoading, notFound: roomNotFound } = useRealtimeRoom(roomCode);
  const { players, setPlayers } = useRealtimePlayers(room?.id || '');
  const { activeCard, broadcastCard, broadcastReaction, broadcastDismiss } = useRealtimeCard(roomCode);
  const { chatMessages, sendChatMessage } = useRealtimeChat(roomCode, currentPlayer?.id);
  const { announcements, broadcastAnnouncement } = useRealtimeAnnouncement(roomCode);
  const { properties: dbProperties } = useRealtimeProperties(room?.id || '');
  const { animatePion, getPionPosition } = usePionAnimation();

  // Load player from sessionStorage, fallback to DB relog
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      sessionStorage.setItem('returnTo', `/room/${roomCode}`);
      router.push('/login');
      return;
    }

    const storedPlayer = sessionStorage.getItem('player');
    const storedRoom = sessionStorage.getItem('room');

    if (storedPlayer && storedRoom) {
      const player = JSON.parse(storedPlayer);
      setCurrentPlayer(player);
    } else {
      // Relog from DB
      async function relogFromDB() {
        try {
          const res = await fetch(`/api/active-room?userId=${user.id}`);
          const data = await res.json();
          if (data.activeRoom && data.activeRoom.code === roomCode && data.activeRoom.player) {
            const player = data.activeRoom.player;
            setCurrentPlayer(player);
            sessionStorage.setItem('player', JSON.stringify(player));
          } else if (data.activeRoom) {
            // User has a different active room, redirect there
            window.location.href = `/room/${data.activeRoom.code}`;
          } else {
            // No active room — show join form
            setNeedsJoin(true);
          }
        } catch {
          setNeedsJoin(true);
        }
      }
      relogFromDB();
    }
  }, [router, roomCode, user, authLoading]);

  // Sync currentPlayer with realtime players
  useEffect(() => {
    if (currentPlayer && players.length > 0) {
      const updated = players.find((p) => p.id === currentPlayer.id);
      if (updated) {
        setCurrentPlayer(updated);
        currentPlayerRef.current = updated;
        sessionStorage.setItem('player', JSON.stringify(updated));
      }
    }
  }, [players, currentPlayer]);

  // Sync refs for stale closure prevention
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);
  useEffect(() => { drawnCardIdsRef.current = drawnCardIds; }, [drawnCardIds]);

  // Reset dice roll tracking when turn changes — but check server status_effects for accuracy
  useEffect(() => {
    if (currentPlayer) {
      const hasRolled = (currentPlayer.statusEffects || []).some(
        (e: { type: string; duration: number }) => e.type === 'has_rolled'
      );
      setHasRolledThisTurn(hasRolled);
    } else {
      setHasRolledThisTurn(false);
    }
  }, [room?.currentTurn, currentPlayer?.statusEffects]);

  // Play sound when it's my turn
  useEffect(() => {
    if (isMyTurn && room?.status === 'playing') {
      SoundEffects.turnStart();
    }
  }, [room?.currentTurn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect game end while surrendered — show final results
  useEffect(() => {
    if (surrendered && room?.status === 'finished') {
      setSurrendered(false);
      SoundEffects.gameOver();
      setGameOver(true);
      refreshProfile();
      // Fetch final results
      fetch(`/api/active-room?userId=${user?.id || ''}`)
        .then(r => r.json())
        .catch(() => {});
    }
  }, [surrendered, room?.status]);

  // Detect game end via realtime for ALL players (not just the one who triggered it)
  useEffect(() => {
    if (room?.status === 'finished' && !gameOver && currentPlayer) {
      SoundEffects.gameOver();
      setGameOver(true);
      refreshProfile();
      // Fetch rankings from API
      fetch('/api/end-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id }),
      }).then(() => {
        // The end-turn will return rankings, but since game is already finished,
        // we construct rankings from the current players state
        const rankingsFromPlayers = players.map((p, i) => ({
          playerId: p.id,
          playerName: p.name,
          placement: i + 1,
          totalAssets: (p.cleanMoney || 0) + (p.dirtyMoney || 0),
          cleanMoney: p.cleanMoney || 0,
          properties: p.properties || [],
          isBot: p.isBot,
          isBankrupt: p.isBankrupt,
        }));
        setGameRankings(rankingsFromPlayers);
      }).catch(() => {
        // Fallback: construct from players
        const rankingsFromPlayers = players.map((p, i) => ({
          playerId: p.id,
          playerName: p.name,
          placement: i + 1,
          totalAssets: (p.cleanMoney || 0) + (p.dirtyMoney || 0),
          cleanMoney: p.cleanMoney || 0,
          properties: p.properties || [],
          isBot: p.isBot,
          isBankrupt: p.isBankrupt,
        }));
        setGameRankings(rankingsFromPlayers);
      });
    }
  }, [room?.status, gameOver, currentPlayer, players]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Show global event modal for ALL players when broadcast is received
  useEffect(() => {
    if (!announcements || announcements.length === 0) return;
    const latest = announcements[announcements.length - 1];
    if (latest?.globalEventData && latest.playerName === 'SYSTEM') {
      setGlobalEventName(latest.globalEventData.name);
      setGlobalEventEmoji(latest.globalEventData.emoji);
      setGlobalEventDescription(latest.globalEventData.description);
      setShowGlobalEventModal(true);
    }
  }, [announcements]);

  // Check if it's current player's turn
  const isMyTurn = room && currentPlayer && room.turnOrder[room.currentTurn] === currentPlayer.id;
  const isHost = room && currentPlayer && room.hostId === currentPlayer.id;

  // Check if all players have selected roles
  const allRolesSelected = players.every((p) => p.selectedRole);
  const allReady = players.every((p) => p.isReady);
  const notReadyPlayers = players.filter((p) => !p.isReady);
  const canStart = isHost && players.length >= 2 && allRolesSelected && allReady;

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
    const notReady = players.filter((p) => !p.isReady);
    if (notReady.length > 0) {
      setError(`Masih ada ${notReady.length} pemain yang belum siap: ${notReady.map((p) => p.name).join(', ')}`);
      return;
    }
    setStarting(true);
    setError('');
    try {
      const response = await fetch('/api/start-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, hostId: currentPlayer.id, gameMode: selectedGameMode }),
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
  }, [room, currentPlayer, players, selectedGameMode]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim() || !currentPlayer) return;
    sendChatMessage(currentPlayer.name, chatInput.trim());
    setChatInput('');
  }, [chatInput, currentPlayer, sendChatMessage]);

  // ---- JOIN FROM LINK HANDLER ----
  const handleJoinFromLink = useCallback(async () => {
    const name = joinName.trim() || user?.user_metadata?.full_name || 'Player';
    if (!room) return;
    setJoinLoading(true);
    setJoinError('');
    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.toUpperCase(),
          playerName: name,
          userId: user?.id || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal join room');
      sessionStorage.setItem('player', JSON.stringify(data.player));
      sessionStorage.setItem('room', JSON.stringify(data.room));
      setCurrentPlayer(data.player);
      setNeedsJoin(false);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Gagal join room');
    } finally {
      setJoinLoading(false);
    }
  }, [joinName, room, roomCode, user]);

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

  const handleRemoveBot = useCallback(async (playerId: string) => {
    if (!room || !currentPlayer) return;
    setError('');
    try {
      const response = await fetch('/api/remove-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, hostId: currentPlayer.id, playerId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Gagal menghapus bot');
        return;
      }
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    } catch {
      setError('Gagal menghapus bot');
    }
  }, [room, currentPlayer, setPlayers]);

  // ---- GAME HANDLERS ----

  const handleRollDice = useCallback(async () => {
    if (!currentPlayer || !room) return;
    SoundEffects.diceRoll();
    setShowDiceModal(true);
  }, [currentPlayer, room]);

  const handleDiceRollComplete = useCallback(
    async (result: { dice1: number; dice2: number; total: number }) => {
      if (!currentPlayerRef.current || !room) return;
      setLastRoll(result);
      SoundEffects.diceResult(result.total);
      try {
        const response = await fetch('/api/roll-dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, dice1: result.dice1, dice2: result.dice2 }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Handle skip turn (ganjil-genap or skip_turn status)
        if (data.skipTurn) {
          setHasRolledThisTurn(true);
          setLastRoll({ dice1: data.dice1, dice2: data.dice2, total: data.total });
          broadcastAnnouncement({
            type: 'skip',
            playerName: currentPlayerRef.current?.name || 'Pemain',
            message: data.skipReason || 'Skip putaran',
            detail: '',
          });
          setShowDiceModal(false);
          return;
        }
        
        // Close dice modal BEFORE animation starts so user can see the board
        setShowDiceModal(false);
        
        // Animate pion step by step — use ref for fresh position
        const freshPlayer = currentPlayerRef.current;
        if (!freshPlayer) return;
        const oldPosition = freshPlayer.position;
        const newPosition = data.newPosition;
        const playerId = freshPlayer.id;
        const rolledDice = { dice1: result.dice1, dice2: result.dice2 };
        
        animatePion(playerId, oldPosition, newPosition, () => {
          // Use refs inside callback to avoid stale closures
          const player = currentPlayerRef.current;
          if (!player) return;
          
          // After animation completes, update state
          setCurrentPlayer((prev) =>
            prev ? { ...prev, position: newPosition, luck: data.newLuck, cleanMoney: prev.cleanMoney + data.moneyChange, roleLevel: data.newRoleLevel || prev.roleLevel } : null
          );
          setHasRolledThisTurn(true);
          const cell = getCellByIndex(newPosition);
          const freshName = currentPlayerRef.current?.name || 'Pemain';
          
          // Luck fluctuation announcement
          let luckDetail = '';
          if (data.luckFluctuation && data.luckFluctuation !== 0) {
            const sign = data.luckFluctuation > 0 ? '+' : '';
            luckDetail = ` | Hoki ${sign}${data.luckFluctuation} → ${data.newLuck}`;
          }

          // Level-up announcement
          if (data.levelUpMessage) {
            broadcastAnnouncement({
              type: 'event',
              playerName: freshName,
              message: 'NAIK LEVEL!',
              detail: data.levelUpMessage,
            });
          }
          
          broadcastAnnouncement({
            type: 'roll',
            playerName: freshName,
            message: `melempar dadu ${result.dice1} + ${result.dice2} = ${result.dice1 + result.dice2}`,
            detail: `mendarat di ${cell.name} ${cell.emoji || ''}${luckDetail}`,
          });
          
          // Trigger GachaRollModal for special petaks (tax, takdir, kegiatan)
          if (cell.type === 'tax' || cell.type === 'draw_takdir' || cell.type === 'draw_kegiatan') {
            setGameEventCell(cell);
            setGameEventDice({ dice1: result.dice1, dice2: result.dice2, total: result.dice1 + result.dice2 });

            // Set event card for draw types (drawn but not yet shown)
            let drawnTakdir = drawnTakdirCard;
            let drawnKegiatan = drawnKegiatanCard;
            let ppnAmt = 0;

            if (cell.type === 'draw_takdir') {
              const card = drawRandomCardExcluding(drawnCardIdsRef.current);
              drawnTakdir = card;
              setDrawnTakdirCard(card);
              setDrawnKegiatanCard(undefined);
              setDrawnCardIds((prev) => [...prev, card.id]);
              SoundEffects.cardDraw();
            } else if (cell.type === 'draw_kegiatan') {
              const card = drawRandomKegiatanExcluding(drawnCardIdsRef.current);
              drawnKegiatan = card;
              setDrawnKegiatanCard(card);
              setDrawnTakdirCard(undefined);
              setDrawnCardIds((prev) => [...prev, card.id]);
              SoundEffects.cardDraw();
            } else if (cell.type === 'tax') {
              // Flat tax or percentage-based tax depending on cell
              if (cell.taxAmount) {
                ppnAmt = cell.taxAmount;
              } else {
                // PPN 12%: percentage of total assets
                const propPrices = getPropertyCells();
                const ownedPropTotal = (currentPlayerRef.current?.properties || []).reduce((sum, propName) => {
                  const prop = propPrices.find(p => p.name === propName);
                  return sum + (prop?.price || 0);
                }, 0);
                const totalHarta = (currentPlayerRef.current?.cleanMoney || 0) + ownedPropTotal;
                ppnAmt = Math.floor(totalHarta * 0.12);
              }
              setPpnAmount(ppnAmt);
              setDrawnTakdirCard(undefined);
              setDrawnKegiatanCard(undefined);
            }

            // Store the effect to apply after gacha (use refs to avoid stale closures)
            const cellForGacha = cell;

            setPendingGachaEffect(() => (gachaRoll: number) => {
              const freshPlayer = currentPlayerRef.current;
              if (!freshPlayer) return;
              
              // Store gacha roll and position for onCardContinue
              setLastGachaRoll(gachaRoll);
              setLastCellPosition(newPosition);

              // Apply gacha modifier to the event
              const statBonus = gachaRoll; // gacha dice value IS the stat bonus
              const luckBonus = freshPlayer.luck ? Math.floor(freshPlayer.luck * 0.45) : 0;
              const baseDice = rolledDice.dice1 + rolledDice.dice2;
              const totalScore = baseDice + statBonus + luckBonus;
              const dcTarget = 10;
              const passed = totalScore >= dcTarget;

              setGameEventRollResult({
                baseDice,
                statBonus,
                luckBonus,
                evidenceBonus: 0,
                totalScore,
                dcTarget,
                passed,
                margin: totalScore - dcTarget,
              });
              setShowGameEventModal(true);
            });
            setGachaCellName(cell.name);
            setGachaCellEmoji(cell.emoji);
            setShowGachaModal(true);
          } else if (cell.type === 'event') {
            // Event cells — DnD system: gacha roll = DnD roll, pass/fail determines outcome
            setGameEventCell(cell);
            setGameEventDice({ dice1: rolledDice.dice1, dice2: rolledDice.dice2, total: rolledDice.dice1 + rolledDice.dice2 });

            const newPos = newPosition;

            // Store DnD outcomes for this cell
            setPendingGachaEffect(() => (gachaRoll: number) => {
              const freshPlayer = currentPlayerRef.current;
              if (!freshPlayer) return;

              // DnD calculation: gacha roll = DnD dice, statBonus = player level, DC = 4
              const statBonus = Math.floor((freshPlayer.roleLevel || 1) * 1.5);
              const luckBonus = freshPlayer.luck ? Math.floor(freshPlayer.luck * 0.45) : 0;
              const totalScore = gachaRoll + statBonus + luckBonus;
              const dcTarget = 4;
              const passed = totalScore >= dcTarget;

              setGameEventRollResult({
                baseDice: gachaRoll,
                statBonus,
                luckBonus,
                evidenceBonus: 0,
                totalScore,
                dcTarget,
                passed,
                margin: totalScore - dcTarget,
              });

              // Store cell position + outcomes for onCardContinue to apply
              setPendingEventOutcome({ cellPosition: newPos, passed, gachaRoll });
              setDrawnTakdirCard(undefined);
              setDrawnKegiatanCard(undefined);
              setPpnAmount(0);
              setShowGameEventModal(true);
            });
            setGachaCellName(cell.name);
            setGachaCellEmoji(cell.emoji);
            setShowGachaModal(true);
          } else if (cell.type === 'corner') {
            // Corner cells — apply effect
            let eventDescription = '';
            let skipTurns = 0;
            let moneyChange = 0;

            if (newPosition === 0) {
              // GAJI UMR — handled by roll-dice API (passedStart bonus)
              eventDescription = 'Lewat Start! Gaji UMR Jakarta cair.';
            } else if (newPosition === 10) {
              // TAHANAN KPK — skip 2 turns
              skipTurns = 2;
              eventDescription = 'Kena OTT KPK! Kamu ditahan selama 2 putaran.';
            } else if (newPosition === 20) {
              // BEBAS PARKIR — collect pot money from pool
              moneyChange = 100000;
              eventDescription = 'Bebas Parkir! Istirahat sejenak, dapat Rp 100.000 dari parkir liar.';
              fetch('/api/update-player', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: room.id, playerId: 'pot_collect', potCollect: true }),
              }).then(res => res.json()).then(potData => {
                const potAmount = potData.potAmount || 0;
                if (potAmount > 0) {
                  const totalBonus = 100000 + potAmount;
                  setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: prev.cleanMoney + potAmount } : null);
                  fetch('/api/update-player', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId: room.id, playerId: currentPlayerRef.current?.id, cleanMoneyDelta: potAmount }),
                  }).catch(() => {});
                  broadcastAnnouncement({
                    type: 'system',
                    playerName: currentPlayerRef.current?.name || 'Pemain',
                    message: `mengambil pool dana Rp ${potAmount.toLocaleString('id-ID')} dari Bebas Parkir!`,
                    detail: `Total: Rp ${totalBonus.toLocaleString('id-ID')}`,
                  });
                }
              }).catch(() => {});
            } else if (newPosition === 30) {
              // MASUK SEL — skip 3 turns
              skipTurns = 3;
              eventDescription = 'Masuk Sel! OTT KPK, langsung bui 3 putaran.';
            }

            if (skipTurns > 0 || moneyChange !== 0) {
              const freshPlayer = currentPlayerRef.current;
              if (freshPlayer) {
                const newMoney = Math.max(0, (freshPlayer.cleanMoney || 0) + moneyChange);
                const newEffects = [...(freshPlayer.statusEffects || [])];
                if (skipTurns > 0) {
                  newEffects.push({ type: 'skip_turn', duration: skipTurns, effect: eventDescription });
                }
                setCurrentPlayer((prev) => prev ? {
                  ...prev,
                  cleanMoney: newMoney,
                  statusEffects: newEffects,
                } : null);
                // Sync corner effects to DB
                fetch('/api/update-player', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    roomId: room.id,
                    playerId: freshPlayer.id,
                    cleanMoneyDelta: moneyChange,
                    statusEffects: newEffects,
                  }),
                }).catch(() => {});
              }
            }

            // Announce corner cell effect
            broadcastAnnouncement({
              type: 'system',
              playerName: currentPlayerRef.current?.name || 'Pemain',
              message: eventDescription,
              detail: '',
            });

            // Show GameEventModal with corner info
            setGameEventCell(cell);
            setGameEventDice({ dice1: rolledDice.dice1, dice2: rolledDice.dice2, total: rolledDice.dice1 + rolledDice.dice2 });
            setGameEventRollResult({
              baseDice: 0, statBonus: 0, luckBonus: 0, evidenceBonus: 0,
              totalScore: 0, dcTarget: 0, passed: true, margin: 0,
            });
            setDrawnTakdirCard(undefined);
            setDrawnKegiatanCard(undefined);
            setPpnAmount(0);
            setShowGameEventModal(true);
          } else if (cell.type === 'property') {
            // Property cell — check ownership
            const property = getPropertyCells().find((p) => p.index === newPosition);
            const dbProp = dbProperties.find((p) => p.board_index === newPosition);

            if (!property) return;

            if (!dbProp || !dbProp.owner_id) {
              // Unowned — show buy modal
              setSelectedCell(property);
              setShowBuyModal(true);
            } else if (dbProp.owner_id === currentPlayerRef.current?.id) {
              // Owned by self — show upgrade modal
              setUpgradeModalCell(property);
              setUpgradeModalIsOwn(true);
              setShowUpgradeModal(true);
            } else {
              // Owned by another player — pay rent, then offer takeover if not landmark
              const rentPayload = {
                roomId: room.id,
                payerId: currentPlayerRef.current?.id,
                propertyId: dbProp.id,
              };
              fetch('/api/buy-property', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rentPayload),
              })
                .then(r => r.json().then(data => ({ ok: r.ok, data })))
                .then(({ ok, data: rentData }) => {
                  if (!ok) throw new Error(rentData.error);

                  if (rentData.isBankrupt) {
                    // Truly bankrupt — no properties left to sell
                    SoundEffects.gameOver();
                    setCurrentPlayer((prev) => prev ? {
                      ...prev, cleanMoney: 0, dirtyMoney: 0, properties: [], isBankrupt: true, statusEffects: [],
                    } : null);
                    broadcastAnnouncement({
                      type: 'bankrupt',
                      playerName: currentPlayerRef.current?.name || 'Pemain',
                      message: `BANKRUP! Tidak bisa bayar sewa ke ${rentData.ownerName}`,
                      detail: `Sewa Rp ${rentData.rent.toLocaleString('id-ID')}`,
                    });
                  } else if (rentData.needsSelling) {
                    // Can't pay rent but has properties — show BankruptcyModal
                    setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: rentData.newPayerBalance || 0 } : null);
                    setShowBankruptcyModal(true);
                    broadcastAnnouncement({
                      type: 'rent',
                      playerName: currentPlayerRef.current?.name || 'Pemain',
                      message: `tidak sanggup bayar sewa Rp ${rentData.rent.toLocaleString('id-ID')} ke ${rentData.ownerName}`,
                      detail: `Sisa utang: Rp ${(rentData.shortfall || 0).toLocaleString('id-ID')} — Jual properti atau ambil pinjaman`,
                    });
                  } else {
                    SoundEffects.payRent();
                    setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: rentData.newPayerBalance } : null);
                    broadcastAnnouncement({
                      type: 'rent',
                      playerName: currentPlayerRef.current?.name || 'Pemain',
                      message: `membayar sewa ke ${rentData.ownerName}`,
                      detail: `-Rp ${rentData.rent.toLocaleString('id-ID')} (pemilik terima Rp ${rentData.ownerShare.toLocaleString('id-ID')})`,
                    });
                  }
                  // If property is not landmark (level < 5), show takeover modal
                  if (!rentData.isBankrupt && !rentData.needsSelling && !dbProp.is_landmark && dbProp.house_level < 5) {
                    setUpgradeModalCell(property);
                    setUpgradeModalIsOwn(false);
                    setShowUpgradeModal(true);
                  } else if (!rentData.isBankrupt && !rentData.needsSelling) {
                    // Landmark — just show rent info
                    setGameEventCell(cell);
                    setGameEventDice({ dice1: 0, dice2: 0, total: 0 });
                    setGameEventRollResult({
                      baseDice: 0, statBonus: 0, luckBonus: 0, evidenceBonus: 0,
                      totalScore: rentData.rent, dcTarget: 0, passed: true, margin: 0,
                    });
                    setDrawnTakdirCard(undefined);
                    setDrawnKegiatanCard(undefined);
                    setPpnAmount(rentData.rent);
                    setShowGameEventModal(true);
                  }
                })
                .catch(err => console.error('Rent payment error:', err));
            }
          }
        });
      } catch (err) {
        console.error('Roll dice error:', err);
        setShowDiceModal(false);
        setHasRolledThisTurn(true);
      }
    },
    [room, broadcastCard, animatePion]
  );

  const handleBuyProperty = useCallback(async () => {
    if (!currentPlayer || !room || !selectedCell || actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/buy-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, boardIndex: selectedCell.index }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      SoundEffects.success();
      // Store property NAME (not UUID) to match server-side storage
      setCurrentPlayer((prev) =>
        prev ? { ...prev, cleanMoney: data.newBalance, properties: [...(prev.properties || []), selectedCell.name] } : null
      );
      broadcastAnnouncement({
        type: 'buy',
        playerName: currentPlayer.name,
        message: `membeli ${selectedCell.name}`,
        detail: `-Rp ${(data.price || 0).toLocaleString('id-ID')}`,
      });
      setShowBuyModal(false);
      setSelectedCell(null);
    } catch (err) { console.error('Buy property error:', err); }
    setActionLoading(false);
  }, [currentPlayer, room, selectedCell, broadcastAnnouncement, actionLoading]);

  const handleUpgradeProperty = useCallback(async (boardIndex: number) => {
    if (!currentPlayer || !room || actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/upgrade-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, boardIndex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      SoundEffects.buyProperty();
      setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: data.newBalance } : null);
      broadcastAnnouncement({
        type: 'buy',
        playerName: currentPlayer.name,
        message: data.isLandmark
          ? `mengubah ${data.propertyName} menjadi LANDMARK!`
          : `upgrade ${data.propertyName} ke level ${data.newLevel}`,
        detail: `-Rp ${data.upgradeCost.toLocaleString('id-ID')}`,
      });
      setShowUpgradeModal(false);
      setUpgradeModalCell(null);
    } catch (err) {
      console.error('Upgrade property error:', err);
      SoundEffects.error();
    }
    setActionLoading(false);
  }, [currentPlayer, room, broadcastAnnouncement, actionLoading]);

  const handleTakeoverProperty = useCallback(async (boardIndex: number) => {
    if (!currentPlayer || !room || actionLoading) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/takeover-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, buyerId: currentPlayer.id, boardIndex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      SoundEffects.buyProperty();
      setCurrentPlayer((prev) => prev ? {
        ...prev,
        cleanMoney: data.newBalance,
        properties: [...(prev.properties || []), data.propertyName],
      } : null);
      broadcastAnnouncement({
        type: 'buy',
        playerName: currentPlayer.name,
        message: `takeover ${data.propertyName} dari ${data.ownerName}`,
        detail: `-Rp ${data.takeoverCost.toLocaleString('id-ID')} (pemilik terima Rp ${data.ownerReceived.toLocaleString('id-ID')})`,
      });
      setShowUpgradeModal(false);
      setUpgradeModalCell(null);
    } catch (err) {
      console.error('Takeover property error:', err);
      SoundEffects.error();
    }
    setActionLoading(false);
  }, [currentPlayer, room, broadcastAnnouncement, actionLoading]);

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
      broadcastAnnouncement({
        type: 'turn',
        playerName: currentPlayer.name,
        message: `mengakhiri giliran`,
        detail: `Gaji: +Rp ${(data.income || 0).toLocaleString('id-ID')}`,
      });
      if (data.gameOver) {
        SoundEffects.gameOver();
        setGameOver(true);
        setWinnerName(data.winnerName || 'Tidak ada');
        broadcastAnnouncement({
          type: 'system',
          playerName: 'SYSTEM',
          message: `GAME OVER! Pemenang: ${data.winnerName || 'Tidak ada'}`,
          detail: '',
        });
        if (data.rankings) setGameRankings(data.rankings);
        if (data.achievements) {
          setGameAchievements(data.achievements);
          if (data.achievements.length > 0) {
            setTimeout(() => SoundEffects.achievementUnlock(), 500);
          }
        }
      }
      // Check for global event
      if (data.globalEventTriggered) {
        setGlobalEventName(data.globalEventName);
        setGlobalEventEmoji(data.globalEventEmoji);
        setGlobalEventDescription(data.globalEventDescription);
        setShowGlobalEventModal(true);
        broadcastAnnouncement({
          type: 'event',
          playerName: 'SYSTEM',
          message: `${data.globalEventEmoji} Event Global: ${data.globalEventName}`,
          detail: data.globalEventDescription,
          globalEventData: {
            name: data.globalEventName,
            emoji: data.globalEventEmoji,
            description: data.globalEventDescription,
          },
        });
      }
    } catch (err) { console.error('End turn error:', err); }
  }, [currentPlayer, room]);

  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);

  const handleSurrender = useCallback(async () => {
    if (!currentPlayer || !room) return;
    setShowSurrenderConfirm(true);
  }, [currentPlayer, room]);

  const confirmSurrender = useCallback(async () => {
    if (!currentPlayer || !room) return;
    setShowSurrenderConfirm(false);
    try {
      const response = await fetch('/api/surrender-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomId: room.id,
          playerId: currentPlayer.id,
          userId: user?.id || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Gagal menyerah');
        return;
      }
      if (data.gameOver) {
        sessionStorage.removeItem('player');
        sessionStorage.removeItem('room');
        SoundEffects.gameOver();
        setGameOver(true);
        setWinnerName(data.winnerName || 'Tidak ada');
        if (data.rankings) setGameRankings(data.rankings);
        if (data.achievements) {
          setGameAchievements(data.achievements);
          if (data.achievements.length > 0) {
            setTimeout(() => SoundEffects.achievementUnlock(), 500);
          }
        }
      } else {
        // Game not over — show eliminated screen, player can still watch or leave
        SoundEffects.gameOver();
        setSurrendered(true);
        setSurrenderedWinnerName(null);
      }
    } catch (err) {
      console.error('Surrender error:', err);
      alert('Terjadi kesalahan jaringan');
    }
  }, [currentPlayer, room, user]);

  const handleReaction = useCallback(
    (reaction: string) => { if (currentPlayer) broadcastReaction(currentPlayer.id, reaction); },
    [currentPlayer, broadcastReaction]
  );

  const handleDismissCard = useCallback(() => { broadcastDismiss(); }, [broadcastDismiss]);

  const handleCellClick = useCallback((cell: BoardCell) => {
    setCellInfoData(cell);
    setShowCellInfo(true);
  }, []);

  // ---- LOAN HANDLER ----
  const handleBorrow = useCallback((loan: Loan, amount: number) => {
    if (!currentPlayer) return;
    setActiveLoans((prev) => [...prev, loan]);
    setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: prev.cleanMoney + amount } : null);
  }, [currentPlayer]);

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
      let rollSuccess = false;
      try {
        const rollRes = await fetch('/api/roll-dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, playerId: activePlayerId, dice1: Math.ceil(Math.random() * 6), dice2: Math.ceil(Math.random() * 6) }),
        });
        const rollData = await rollRes.json();
        if (!rollRes.ok) {
          console.error('Bot roll failed:', rollData.error);
        } else {
          rollSuccess = true;
          // Step 2: Handle property cells
          const cell = getCellByIndex(rollData.newPosition);
          if (cell.type === 'property') {
            const property = getPropertyCells().find((p) => p.index === rollData.newPosition);
            const botMoney = (activePlayer.cleanMoney || 0) + (rollData.moneyChange || 0);

            // First try to pay rent (property owned by another player)
            try {
              const dbProp = dbProperties.find((p) => p.board_index === rollData.newPosition);
              if (dbProp && dbProp.owner_id && dbProp.owner_id !== activePlayerId) {
                const rentRes = await fetch('/api/buy-property', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId: room.id, payerId: activePlayerId, propertyId: dbProp.id }),
                });
                if (rentRes.ok) {
                  // Rent paid successfully
                } else if (property && property.price && botMoney >= property.price && property.price < botMoney * 0.4) {
                  // Unowned — try to buy
                  await fetch('/api/buy-property', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId: room.id, playerId: activePlayerId, boardIndex: property.index }),
                  });
                }
              } else if (property && property.price && botMoney >= property.price && property.price < botMoney * 0.4) {
                // Unowned — try to buy
                await fetch('/api/buy-property', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId: room.id, playerId: activePlayerId, boardIndex: property.index }),
                });
              }
            } catch {
              // Rent failed — try to buy if affordable
              if (property && property.price && botMoney >= property.price && property.price < botMoney * 0.4) {
                await fetch('/api/buy-property', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId: room.id, playerId: activePlayerId, boardIndex: property.index }),
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Bot roll/buy error:', e);
      }

      // Step 3: Always try to end turn (even if roll failed, to unblock the game)
      try {
        await new Promise((r) => setTimeout(r, 1000));
        await fetch('/api/end-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.id, playerId: activePlayerId }),
        });
      } catch (e) {
        console.error('Bot end-turn error:', e);
      }

      botPlayLock.current = false;
    };

    runBotTurn();
  }, [room?.currentTurn, room?.status, players]);

  // ---- ROOM NOT FOUND ----
  if (roomNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#001809' }}>
        <div className="text-6xl mb-4">🔍</div>
        <div className="text-xl font-bold mb-2" style={{ color: '#cbead1' }}>Room Tidak Ditemukan</div>
        <p className="text-sm mb-6" style={{ color: '#9a907c' }}>Kode <span className="font-mono font-bold" style={{ color: '#ffd56d' }}>{roomCode}</span> tidak valid atau room sudah ditutup.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
          style={{ background: 'linear-gradient(to right, #2d5a3d, #3a7a4f, #2d5a3d)', color: '#ffd56d' }}
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  // ---- JOIN FROM LINK (needs room loaded) ----
  if (needsJoin && room) {
    return (
      <div className="min-h-screen bg-[#001809] flex items-center justify-center px-4">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,213,109,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(78,222,163,0.05) 0%, transparent 70%)' }} />

        <div className="max-w-md w-full relative z-10 space-y-4">
          {/* Room Code Card */}
          <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#d1c5af] mb-2">KODE ROOM</p>
            <p className="text-3xl font-extrabold text-[#ffd56d] tracking-[0.3em] font-mono">{roomCode}</p>
            <p className="text-[10px] text-[#9a907c] mt-1">Kamu diundang ke meja ini</p>
          </div>

          {/* Player Slots Preview */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
            <h3 className="text-sm font-bold text-[#cbead1] mb-3">Pemain ({players.length}/8)</h3>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player, idx) => (
                <div key={player.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#092515', border: '1px solid rgba(32,58,41,0.5)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: TOKEN_COLORS[idx] || '#94a3b8' }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#cbead1] truncate">{player.name}</p>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl opacity-50" style={{ backgroundColor: '#052011', border: '1px dashed rgba(32,58,41,0.3)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#152f1f', color: '#9a907c' }}>+</div>
                  <p className="text-[10px] text-[#9a907c]">Menunggu...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Join Form */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
            <h3 className="text-sm font-bold text-[#cbead1] mb-3 text-center">Gabung ke Meja</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#d1c5af] mb-1.5">Nama Pemain</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder={user?.user_metadata?.full_name || 'Masukkan nama'}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-[#cbead1] outline-none transition-all"
                  style={{ backgroundColor: '#092515', border: '1px solid #203a29' }}
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinFromLink()}
                  autoFocus
                />
                <p className="text-[10px] text-[#9a907c] mt-1">Kosongkan jika pakai nama: {user?.user_metadata?.full_name || 'Player'}</p>
              </div>
              {joinError && <p className="text-[#ff4757] text-xs text-center">{joinError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{ backgroundColor: '#092515', border: '1px solid #203a29', color: '#d1c5af' }}
                >
                  KEMBALI
                </button>
                <button
                  disabled={joinLoading}
                  onClick={handleJoinFromLink}
                  className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right, #2d5a3d, #3a7a4f, #2d5a3d)', color: '#ffd56d', boxShadow: '0 4px 16px rgba(78,222,163,0.3)' }}
                >
                  {joinLoading ? 'MASUK...' : 'GABUNG'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- LOADING STATE ----
  if (!currentPlayer || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#001809' }}>
        <div className="text-center">
          <div className="text-xl mb-3" style={{ color: '#cbead1' }}>Loading...</div>
          {!authLoading && !user && (
            <p className="text-sm" style={{ color: '#9a907c' }}>Mengalihkan ke login...</p>
          )}
        </div>
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
                <div className="flex items-center gap-2">
                  {isHost && players.length < 8 && (
                    <button
                      onClick={handleAddBot}
                      className="text-[10px] px-2 py-1 rounded-full font-bold transition-all active:scale-95"
                      style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}
                    >
                      + Bot
                    </button>
                  )}
                  {isHost && <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,213,109,0.1)', color: '#ffd56d' }}>HOST</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player, idx) => {
                  const role = getRoleInfo(player.selectedRole);
                  return (
                    <div key={player.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors`} style={{ backgroundColor: player.id === currentPlayer.id ? 'rgba(255,213,109,0.1)' : '#092515', border: player.id === currentPlayer.id ? '1px solid rgba(255,213,109,0.2)' : '1px solid rgba(32,58,41,0.5)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: TOKEN_COLORS[idx] || '#94a3b8' }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#cbead1] truncate">{player.name}</p>
                        <p className="text-[9px] text-[#9a907c] truncate">{role ? role.name : 'Belum pilih role'}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {player.isBot && <span className="text-[8px] px-1 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>BOT</span>}
                        {player.isReady
                          ? <span className="text-[8px] px-1 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(78,222,163,0.1)', color: '#4edea3' }}>✓ SIAP</span>
                          : <span className="text-[8px] px-1 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,71,87,0.1)', color: '#ff4757' }}>• BELUM</span>
                        }
                        {isHost && player.isBot && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveBot(player.id); }}
                            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all active:scale-90"
                            style={{ backgroundColor: 'rgba(255,71,87,0.2)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.4)' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {Array.from({ length: 8 - players.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl opacity-40" style={{ backgroundColor: '#092515', border: '1px solid rgba(32,58,41,0.3)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#152f1f', color: '#9a907c' }}>+</div>
                    <p className="text-[10px] text-[#9a907c]">Menunggu...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Mode Selection (Host Only) */}
            {isHost && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
                <h3 className="text-sm font-bold text-[#cbead1] mb-3">Pilih Mode Permainan</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(GAME_MODES) as GameMode[]).map((modeId) => {
                    const mode = GAME_MODES[modeId];
                    const isSelected = selectedGameMode === modeId;
                    return (
                      <button
                        key={modeId}
                        onClick={() => setSelectedGameMode(modeId)}
                        className="text-left rounded-xl p-3 transition-all"
                        style={isSelected
                          ? { backgroundColor: 'rgba(255,213,109,0.1)', border: `2px solid ${mode.color}` }
                          : { backgroundColor: '#092515', border: '1px solid #203a29' }
                        }
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg" style={{ color: mode.color }}>
                            {mode.icon}
                          </span>
                          {isSelected && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,213,109,0.15)', color: '#ffd56d' }}>DIPILIH</span>}
                        </div>
                        <p className="text-sm font-extrabold mb-0.5" style={{ color: isSelected ? mode.color : '#cbead1' }}>{mode.title}</p>
                        <p className="text-xs text-[#9a907c] italic mb-1.5">{mode.subtitle}</p>
                        <p className="text-[10px] text-[#d1c5af] leading-snug">{mode.description}</p>
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(32,58,41,0.5)' }}>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mode.color }}>{mode.winCondition}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map Selection (Host Only) */}
            {isHost && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
                <h3 className="text-sm font-bold text-[#cbead1] mb-3">Pilih Peta</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className="rounded-xl p-3 transition-all"
                    style={{ backgroundColor: 'rgba(255,213,109,0.1)', border: '2px solid #ffd56d' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#152f1f] flex items-center justify-center">
                        <span className="text-xl">🗺️</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-[#ffd56d]">JAKARTA MEGAPOLIS</p>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,213,109,0.15)', color: '#ffd56d' }}>DIPILIH</span>
                        </div>
                        <p className="text-[10px] text-[#9a907c]">40 Petak &bull; 6 Zona &bull; Monas sampai Bandara</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-3 opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#092515', border: '1px solid #203a29' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#152f1f] flex items-center justify-center">
                        <span className="text-xl">🔒</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-extrabold text-[#9a907c]">BALI PARADISE</p>
                        <p className="text-[10px] text-[#9a907c]">Segera hadir &bull; Kuta sampai Ubud</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Map Legend - Jakarta Zones */}
            {isHost && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#052011', border: '1px solid #203a29' }}>
                <h3 className="text-sm font-bold text-[#cbead1] mb-3">Peta Zona Jakarta</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(JAKARTA_ZONES).map(([zoneName, zone]) => (
                    <div key={zoneName} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#092515' }}>
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#cbead1] truncate">{zoneName}</p>
                        <p className="text-[9px] text-[#9a907c] truncate">{zone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                {starting ? 'MEMULAI...' : canStart ? 'MULAI GAME' : notReadyPlayers.length > 0 ? `${notReadyPlayers.length} Pemain Belum Siap` : 'Belum semua siap'}
              </button>
            )}

            {/* Info & Regulations */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowInfoModal(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(255,213,109,0.1)', border: '1px solid rgba(255,213,109,0.3)', color: '#ffd56d' }}
              >
                <span>📖</span> INFO
              </button>
              <button
                onClick={() => setShowRegulations(!showRegulations)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.3)', color: '#4edea3' }}
              >
                <span>📋</span> PERATURAN {showRegulations ? '▲' : '▼'}
              </button>
            </div>
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

        {/* Info Modal */}
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}

      </div>
    );
  }

  // ---- GAME OVER STATE ----
  if (room.status === 'finished' || gameOver) {
    return (
      <>
        <PostGameModal
          isOpen={true}
          onClose={() => { sessionStorage.removeItem('player'); sessionStorage.removeItem('room'); router.push('/'); }}
          rankings={gameRankings}
          achievements={gameAchievements}
          currentPlayerId={currentPlayer?.id || ''}
          gameMode={room.gameMode || 'bundir'}
          winnerId={gameRankings.find(p => p.placement === 1)?.playerId}
          winnerName={winnerName}
          onPlayAgain={() => { sessionStorage.removeItem('player'); sessionStorage.removeItem('room'); window.location.reload(); }}
          onBackToLobby={() => { sessionStorage.removeItem('player'); sessionStorage.removeItem('room'); router.push('/'); }}
        />
        <div className="min-h-screen bg-[#001809]" />
      </>
    );
  }

  // ---- SURRENDERED / ELIMINATED STATE ----
  if (surrendered) {
    return (
      <div className="min-h-screen bg-[#001809] flex items-center justify-center">
        <div className="max-w-md w-full mx-4 rounded-xl p-8 text-center border" style={{ backgroundColor: '#0a2014', borderColor: '#203a29' }}>
          <span className="text-5xl block mb-4">&#x1F6AA;</span>
          <h2 className="text-xl font-bold text-[#f87171] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>KAMU MENYERAH</h2>
          <p className="text-sm text-[#9a907c] mb-6">Kamu telah keluar dari permainan. Tunggu pemain lain selesai, atau kembali ke lobby.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                SoundEffects.click();
                router.push('/');
              }}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#152f1f', color: '#4edea3', border: '1px solid #203a29' }}
            >
              Kembali ke Lobby
            </button>
          </div>
        </div>
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
              <span className="font-bold text-[#ffd56d] text-lg sm:text-xl tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>MONOPOLI WNI</span>
            </div>
            <span className="text-[10px] text-[#d1c5af] block tracking-widest uppercase font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>Arena Meja Nusantara</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded" style={{ backgroundColor: '#001206' }}>
            <span className="text-[10px] text-[#9a907c] font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>KAMAR:</span>
            <span className="text-sm font-mono font-bold text-[#4edea3]">#{roomCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('players'); }}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#152f1f] hover:text-[#cbead1] transition-colors"
            >
              Pemain
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('status'); }}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#152f1f] hover:text-[#cbead1] transition-colors"
            >
              Status
            </button>
            <button
              onClick={() => setShowInfoModal(true)}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#152f1f] hover:text-[#cbead1] transition-colors"
            >
              Aturan
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('log'); }}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#152f1f] hover:text-[#cbead1] transition-colors"
            >
              Log
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('chat'); }}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#152f1f] hover:text-[#cbead1] transition-colors"
            >
              Chat
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('settings'); }}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#152f1f] hover:text-[#cbead1] transition-colors"
            >
              Setelan
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-2.5 py-1.5 rounded text-xs font-medium text-[#d1c5af] hover:bg-[#ff4757]/20 hover:text-[#ff4757] transition-colors"
            >
              Keluar
            </button>
          </nav>
          <div className="w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-md" style={{ backgroundColor: currentPlayer.tokenColor, boxShadow: '0 0 0 2px rgba(255,213,109,0.3)' }}>
            {currentPlayer.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* MAIN BOARD ARENA */}
      <main className="w-full pt-20 pb-20 px-2 sm:px-4 lg:px-6 flex items-center justify-center flex-1">
        <Board
          players={players.map((p) => ({ 
            id: p.id, 
            position: getPionPosition(p.id, p.position), 
            tokenColor: p.tokenColor || '#3b82f6', 
            name: p.name 
          }))}
          currentPlayer={currentPlayer}
          activePlayerName={players.find((p) => p.id === room.turnOrder[room.currentTurn])?.name}
          activePlayerTokenColor={players.find((p) => p.id === room.turnOrder[room.currentTurn])?.tokenColor}
          potMoney={room.potMoney || 0}
          round={room.roundNumber || 1}
          totalRounds={room.totalRounds || 20}
          boardTheme={boardTheme}
          propertyInfo={dbProperties.map((dp) => {
            const owner = players.find(p => p.id === dp.owner_id);
            return {
              boardIndex: dp.board_index,
              ownerId: dp.owner_id,
              ownerName: owner?.name || null,
              ownerColor: owner?.tokenColor || null,
              houseLevel: dp.house_level,
              isLandmark: dp.is_landmark,
            };
          })}
          onCellClick={handleCellClick}
        />
      </main>

      {/* FLOATING BOTTOM TOOLBAR */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t px-3 sm:px-6 shadow-[0_-4px_24px_rgba(0,0,0,0.7)]" style={{ backgroundColor: 'rgba(5,32,17,0.95)', borderColor: '#203a29' }}>
        <div className="h-14 max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
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
              onClick={() => { setGameModalOpen(true); setGameModalTab('log'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 transition-all relative"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }}
              title="Log Permainan"
            >
              <span className="text-lg">&#x1F4CB;</span>
              <span className="hidden md:inline text-xs font-bold">Log</span>
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
              onClick={() => setShowLoanModal(true)}
              className="h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#ffd56d' }}
              title="Pinjaman"
            >
              <span className="text-lg">&#x1F3E6;</span>
              <span className="hidden md:inline text-xs font-bold">Pinjam</span>
            </button>
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('settings'); }}
              className="h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 transition-all"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#a78bfa' }}
              title="Pengaturan"
            >
              <span className="text-lg">&#x2699;&#xFE0F;</span>
              <span className="hidden md:inline text-xs font-bold">Setelan</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-[#d1c5af]">
            <span>{currentPlayer.name} &bull; Kavling {currentPlayer.properties?.length || 0}</span>
            <span className="text-[#ffd56d] font-bold">Kas Dompet: Rp {(currentPlayer.cleanMoney || 0).toLocaleString('id-ID')}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentPlayer.isBankrupt ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 rounded-lg text-xs font-bold bg-[#2a0f0f] text-[#f87171] border border-[#5c2020]">
                  💀 BANKRUP — Hanya Menonton
                </span>
              </div>
            ) : (
              <>
                {isMyTurn && !hasRolledThisTurn && (
                  <button
                    onClick={handleRollDice}
                    className="h-9 px-4 sm:px-5 rounded-lg bg-[#ffd56d] hover:bg-[#eec14a] text-[#3e2e00] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[2px_2px_0_0_#000] transition-all active:scale-95"
                  >
                    <span className="text-sm" style={{ animationDuration: '4s' }}>&#x1F3B2;</span>
                    <span className="tracking-wide">KOCOK DADU</span>
                  </button>
                )}
                {isMyTurn && hasRolledThisTurn && (
                  <span className="h-9 px-4 sm:px-5 rounded-lg bg-[#203a29] text-[#9a907c] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-not-allowed border border-[#4e4635]">
                    <span className="text-sm">&#x1F3B2;</span>
                    <span className="tracking-wide">SUDAH ROLL</span>
                  </span>
                )}
                {isMyTurn && hasRolledThisTurn && (
                  <button
                    onClick={handleEndTurn}
                    className="h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold transition-colors"
                    style={{ backgroundColor: '#052011', border: '1px solid #203a29', color: '#d1c5af' }}
                  >
                    Selesai
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleSurrender}
              className="h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: '#2a0f0f', border: '1px solid #5c2020', color: '#f87171' }}
              title="Menyerah & keluar dari permainan"
            >
              &#x1F6AA; Menyerah
            </button>
          </div>
        </div>
      </aside>

      {/* BOTTOM TICKER WARTA MEJA */}
      {/* ROUND + POT INFO BAR */}
      <footer className="w-full py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] hidden md:block fixed bottom-14 left-0 z-30" style={{ backgroundColor: '#001206' }}>
        <div className="w-full px-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-[#d1c5af] text-xs">
            <span>Babak <strong className="text-[#ffd56d]">{room.roundNumber || 1}</strong> / {room.totalRounds || 20}</span>
            <span>|</span>
            <span>Giliran: <strong className="text-[#4edea3]">{players.find((p) => p.id === room.turnOrder[room.currentTurn])?.name || '...'}</strong></span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => { setGameModalOpen(true); setGameModalTab('log'); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors"
              style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }}
              title="Lihat Log"
            >
              <span className="text-sm">📋</span>
              <span className="hidden lg:inline">Log</span>
              {announcements.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold" style={{ backgroundColor: '#ffd56d', color: '#3e2e00' }}>
                  {announcements.length}
                </span>
              )}
            </button>
            <span>Pool: <strong className="text-[#ffd56d] font-mono">Rp {(room.potMoney || 0).toLocaleString('id-ID')}</strong></span>
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
        announcements={announcements}
        round={room.roundNumber || 1}
        totalRounds={room.totalRounds || 20}
        potMoney={room.potMoney || 0}
        boardTheme={boardTheme}
        onThemeChange={setBoardTheme}
        onSendChat={(text) => {
          if (currentPlayer) {
            sendChatMessage(currentPlayer.name, text);
          }
        }}
        musicOn={musicOn}
        onToggleMusic={() => {
          if (musicOn) {
            BackgroundMusic.stop();
            setMusicOn(false);
          } else {
            BackgroundMusic.start();
            setMusicOn(true);
          }
        }}
        onLeaveRoom={handleSurrender}
      />

      {/* OTHER MODALS */}
      <DiceRollModal
        isOpen={showDiceModal}
        onClose={() => setShowDiceModal(false)}
        onRollComplete={handleDiceRollComplete}
        isJailed={(currentPlayer.statusEffects || []).some((e: { type: string }) => e.type === 'skip_turn')}
        sogokCost={Math.max(100000, Math.floor((currentPlayer.cleanMoney || 0) * 0.2))}
        onSogok={() => {
          const cost = Math.max(100000, Math.floor((currentPlayer.cleanMoney || 0) * 0.2));
          if ((currentPlayer.cleanMoney || 0) < cost) {
            SoundEffects.error();
            broadcastAnnouncement({ type: 'system', playerName: currentPlayer.name, message: 'Gagal sogok — uang tidak cukup!', detail: `Butuh Rp ${cost.toLocaleString('id-ID')}` });
            return;
          }
          const newMoney = Math.max(0, currentPlayer.cleanMoney - cost);
          const newEffects = (currentPlayer.statusEffects || []).filter((e: { type: string }) => e.type !== 'skip_turn');
          setCurrentPlayer((prev) => prev ? { ...prev, cleanMoney: newMoney, statusEffects: newEffects } : null);
          fetch('/api/update-player', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, cleanMoneyDelta: -cost, statusEffects: newEffects }),
          }).catch(() => {});
          broadcastAnnouncement({ type: 'system', playerName: currentPlayer.name, message: 'Menyogok petugas KPK! Bebas dari penjara.', detail: `-Rp ${cost.toLocaleString('id-ID')}` });
          setShowDiceModal(false);
        }}
      />
      {selectedCell && (
        <BuyPropertyModal
          isOpen={showBuyModal}
          cell={selectedCell}
          playerMoney={currentPlayer.cleanMoney}
          onBuy={handleBuyProperty}
          onSkip={() => { setShowBuyModal(false); setSelectedCell(null); }}
          isLoading={actionLoading}
        />
      )}
      <GachaRollModal
        isOpen={showGachaModal}
        cellName={gachaCellName}
        cellEmoji={gachaCellEmoji}
        onRollComplete={(gachaRoll) => {
          setShowGachaModal(false);
          if (pendingGachaEffect) {
            pendingGachaEffect(gachaRoll);
            setPendingGachaEffect(null);
          }
        }}
      />
      <GlobalEventModal
        isOpen={showGlobalEventModal}
        eventName={globalEventName}
        eventEmoji={globalEventEmoji}
        eventDescription={globalEventDescription}
        onContinue={() => setShowGlobalEventModal(false)}
      />
      {activeCard && (
        <EventCardModal
          isOpen={true}
          card={getCardById(activeCard.cardId) || getKegiatanById(activeCard.cardId) || drawRandomCard()}
          drawnBy={activeCard.playerName || players.find((p) => p.id === activeCard.drawnBy)?.name || 'Unknown'}
          reactions={activeCard.reactions}
          onReact={handleReaction}
          onDismiss={handleDismissCard}
          showButtons={activeCard.drawnBy !== currentPlayer.id}
        />
      )}
      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onBorrow={handleBorrow}
        playerId={currentPlayer.id}
        currentTurn={room.currentTurn || 0}
        cleanMoney={currentPlayer.cleanMoney || 0}
        properties={(currentPlayer.properties || []).map((propName) => {
          const cell = getPropertyCells().find(c => c.name === propName);
          return cell ? { id: String(cell.index), name: cell.name, price: cell.price } : null;
        }).filter(Boolean) as Array<{ id: string; name: string; price?: number }>}
        existingLoans={activeLoans}
      />
      <UpgradePropertyModal
        isOpen={showUpgradeModal}
        cell={upgradeModalCell!}
        dbProperty={upgradeModalCell ? dbProperties.find(p => p.board_index === upgradeModalCell.index) || null : null}
        playerMoney={currentPlayer.cleanMoney || 0}
        onUpgrade={handleUpgradeProperty}
        onTakeover={handleTakeoverProperty}
        onClose={() => { setShowUpgradeModal(false); setUpgradeModalCell(null); }}
        isOwnProperty={upgradeModalIsOwn}
        isLoading={actionLoading}
      />
      <DefenseModal
        isOpen={showDefenseModal}
        auditAmount={defenseAuditAmount}
        playerStats={currentPlayer.stats}
        playerMoney={currentPlayer.cleanMoney || 0}
        dirtyMoney={currentPlayer.dirtyMoney || 0}
        onDefense={(option, rollResult) => {
          setShowDefenseModal(false);
          defenseCallback?.(option.name, rollResult?.success ?? false);
        }}
        onClose={() => {
          setShowDefenseModal(false);
          defenseCallback?.('accept', false);
        }}
      />
      {gameEventCell && (
        <GameEventModal
          isOpen={showGameEventModal}
          onClose={() => setShowGameEventModal(false)}
          onEvidenceSelect={(bonus) => {
            // Recalculate DnD score with evidence bonus
            setGameEventRollResult(prev => {
              if (!prev) return prev;
              const newTotal = prev.baseDice + prev.statBonus + prev.luckBonus + bonus;
              const passed = newTotal >= prev.dcTarget;
              return { ...prev, evidenceBonus: bonus, totalScore: newTotal, passed, margin: newTotal - prev.dcTarget };
            });
          }}
          onBribe={() => {
            const bribeCost = Math.max(50000, Math.floor((currentPlayer.cleanMoney || 0) * 0.15));
            if ((currentPlayer.cleanMoney || 0) < bribeCost) {
              SoundEffects.error();
              broadcastAnnouncement({ type: 'system', playerName: currentPlayer.name, message: 'gagal sogok — uang tidak cukup!', detail: `Butuh Rp ${bribeCost.toLocaleString('id-ID')}, punya Rp ${(currentPlayer.cleanMoney || 0).toLocaleString('id-ID')}` });
              return;
            }
            const newMoney = Math.max(0, currentPlayer.cleanMoney - bribeCost);
            setCurrentPlayer(prev => prev ? { ...prev, cleanMoney: newMoney } : null);
            setBribedThisEvent(true);
            // Update roll result to passed
            setGameEventRollResult(prev => prev ? { ...prev, passed: true, margin: prev.totalScore - prev.dcTarget + 99 } : prev);
            fetch('/api/update-player', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ roomId: room.id, playerId: currentPlayer.id, cleanMoneyDelta: -bribeCost }),
            }).catch(() => {});
            SoundEffects.payRent();
            broadcastAnnouncement({
              type: 'event',
              playerName: currentPlayer.name,
              message: `mensogok petugas untuk lolos!`,
              detail: `-Rp ${bribeCost.toLocaleString('id-ID')}`,
            });
          }}
          onContinue={() => {
            setShowGameEventModal(false);
      if (!currentPlayerRef.current || !room) return;

            // Apply card effects
            let effectApplied = false;
            let updatedPlayerData: Player | null = null;

            if (gameEventCell?.type === 'draw_takdir' && drawnTakdirCard) {
              SoundEffects.cardDraw();
              const rollResult = gameEventRollResult;
              const cardType = getCardType(drawnTakdirCard);
              const passed = rollResult?.passed ?? true;

              // DnD logic: debuff=only apply if FAILED; buff=only apply if PASSED; takdir=always apply
              const shouldApply = cardType === 'debuff' ? !passed : cardType === 'buff' ? passed : true;

              if (shouldApply) {
                const result = processCardEffect(drawnTakdirCard, currentPlayer, lastGachaRoll, players);
                updatedPlayerData = result.updatedPlayer;
                setCurrentPlayer(result.updatedPlayer);
                broadcastAnnouncement({
                  type: 'card',
                  playerName: currentPlayer.name,
                  message: `menarik kartu ${drawnTakdirCard.name}`,
                  detail: result.statusMessages.join(', '),
                });
                for (const change of result.moneyChanges) {
                  if (change.playerId !== currentPlayer.id) {
                    fetch('/api/update-player', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ roomId: room.id, playerId: change.playerId, cleanMoneyDelta: change.amount }),
                    }).catch(() => {});
                  }
                }
                effectApplied = true;
              } else {
                // Card negated by DnD result
                broadcastAnnouncement({
                  type: 'card',
                  playerName: currentPlayer.name,
                  message: cardType === 'debuff'
                    ? `berhasil menangkis ${drawnTakdirCard.name}! (DnD PASSED)`
                    : `gagal mendapat buff dari ${drawnTakdirCard.name} (DnD GAGAL)`,
                  detail: passed ? `Skor ${rollResult?.totalScore} ≥ DC ${rollResult?.dcTarget}` : `Skor ${rollResult?.totalScore} < DC ${rollResult?.dcTarget}`,
                });
              }
            } else if (gameEventCell?.type === 'draw_kegiatan' && drawnKegiatanCard) {
              SoundEffects.cardDraw();
              const rollResult = gameEventRollResult;
              const passed = rollResult?.passed ?? true;
              const result = processKegiatanEffect(drawnKegiatanCard, currentPlayer, lastGachaRoll, passed);
              updatedPlayerData = result.updatedPlayer;
              setCurrentPlayer(result.updatedPlayer);
              broadcastAnnouncement({
                type: 'card',
                playerName: currentPlayer.name,
                message: `menarik kartu ${drawnKegiatanCard.name} — ${passed ? 'LOLOS!' : 'GAGAL!'}`,
                detail: result.statusMessage,
              });
              effectApplied = true;
            } else if (gameEventCell?.type === 'tax' && ppnAmount > 0 && gameEventRollResult && !gameEventRollResult.passed) {
              SoundEffects.payRent();
              const newMoney = Math.max(0, currentPlayer.cleanMoney - ppnAmount);
              updatedPlayerData = { ...currentPlayer, cleanMoney: newMoney };
              setCurrentPlayer(updatedPlayerData);
              broadcastAnnouncement({
                type: 'tax',
                playerName: currentPlayer.name,
                message: 'gagal menghindari pajak',
                detail: `-Rp ${ppnAmount.toLocaleString('id-ID')}`,
              });
              effectApplied = true;
            } else if (gameEventCell?.type === 'event' && pendingEventOutcome) {
              // Event cell — apply outcome based on DnD pass/fail (or bribe)
              const { cellPosition, passed: dndPassed } = pendingEventOutcome;
              const isBribed = bribedThisEvent;
              const outcomePassed = dndPassed || isBribed;
              SoundEffects.payRent();
              let moneyChange = 0;
              let skipTurns = 0;
              let eventDescription = '';

              if (cellPosition === 13) {
                // Tagihan PLN — pass = small bill, fail = big bill
                if (outcomePassed) {
                  moneyChange = -100000;
                  eventDescription = 'Tagihan PLN sedikit naik. Bayar -Rp 100.000';
                } else {
                  moneyChange = -400000;
                  eventDescription = 'Tagihan PLN naik gila-gilaan! Bayar -Rp 400.000';
                }
              } else if (cellPosition === 16) {
                // Macet Tomang — pass = pay small, fail = skip turns
                if (outcomePassed) {
                  moneyChange = -50000;
                  eventDescription = 'Macet Tomang tapi berhasil lewat! Bayar -Rp 50.000 untuk ojol.';
                } else {
                  skipTurns = 2;
                  eventDescription = 'Macet parah Tomang! Skip 2 putaran.';
                }
              } else if (cellPosition === 28) {
                // FOMO Kripto — pass = profit, fail = rugpull
                const baseAmount = 100000 + Math.floor(Math.random() * 500000);
                if (outcomePassed) {
                  moneyChange = baseAmount * 2;
                  eventDescription = `FOMO Kripto moonshot! Investasi naik 200%! +Rp ${(baseAmount * 2).toLocaleString('id-ID')}`;
                } else {
                  moneyChange = -Math.floor(baseAmount * 0.9);
                  eventDescription = `FOMO Kripto rugpull! Investasi turun 90%! -Rp ${Math.floor(baseAmount * 0.9).toLocaleString('id-ID')}`;
                }
              }

              const newMoney = Math.max(0, (currentPlayer.cleanMoney || 0) + moneyChange);
              const newEffects = [...(currentPlayer.statusEffects || [])];
              if (skipTurns > 0) {
                newEffects.push({ type: 'skip_turn', duration: skipTurns, effect: eventDescription });
              }
              updatedPlayerData = { ...currentPlayer, cleanMoney: newMoney, statusEffects: newEffects };
              setCurrentPlayer(updatedPlayerData);

              broadcastAnnouncement({
                type: 'event',
                playerName: currentPlayer.name,
                message: isBribed ? `mensogok untuk lolos! ${eventDescription}` : (outcomePassed ? `berhasil! ${eventDescription}` : `gagal! ${eventDescription}`),
                detail: isBribed ? 'DNGAN SOGOKAN' : `DnD: ${gameEventRollResult?.totalScore} vs DC ${gameEventRollResult?.dcTarget}`,
              });

              effectApplied = true;
              setPendingEventOutcome(null);
              setBribedThisEvent(false);
            }

            // Sync card effects to DB
            if (effectApplied && updatedPlayerData) {
              fetch('/api/update-player', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId: room.id,
                  playerId: currentPlayer.id,
                  cleanMoneyDelta: updatedPlayerData.cleanMoney - currentPlayer.cleanMoney,
                  dirtyMoneyDelta: (updatedPlayerData.dirtyMoney || 0) - (currentPlayer.dirtyMoney || 0),
                  properties: updatedPlayerData.properties,
                  statusEffects: updatedPlayerData.statusEffects,
                  luck: updatedPlayerData.luck,
                  isBankrupt: updatedPlayerData.isBankrupt,
                  evidence: updatedPlayerData.evidence,
                }),
              }).catch(() => {});
            }

            // Check bankruptcy after card effects
            if (updatedPlayerData && updatedPlayerData.cleanMoney <= 0 && updatedPlayerData.dirtyMoney <= 0 && !updatedPlayerData.isBankrupt) {
              // Show bankruptcy modal instead of immediately marking as bankrupt
              setShowBankruptcyModal(true);
            }

            // Broadcast the SAME card that was drawn (no second draw!)
            if (gameEventCell?.type === 'draw_takdir' && drawnTakdirCard) {
              broadcastCard({ cardId: drawnTakdirCard.id, drawnBy: currentPlayer.id, playerName: currentPlayer.name });
            } else if (gameEventCell?.type === 'draw_kegiatan' && drawnKegiatanCard) {
              broadcastCard({ cardId: drawnKegiatanCard.id, drawnBy: currentPlayer.id, playerName: currentPlayer.name });
            }

            // Clear drawn card state
            setDrawnTakdirCard(undefined);
            setDrawnKegiatanCard(undefined);
            setPpnAmount(0);
            setLastGachaRoll(0);
          }}
          cell={gameEventCell}
          diceResult={gameEventDice}
          playerName={currentPlayer.name}
          playerLevel={currentPlayer.roleLevel || 1}
          playerRank={currentPlayer.selectedRole || 'Magang'}
          playerEvidence={currentPlayer.evidence || []}
          rollResult={gameEventRollResult}
          takdirCard={drawnTakdirCard}
          kegiatanCard={drawnKegiatanCard}
          ppnAmount={gameEventCell.type === 'tax' ? ppnAmount : 0}
          turnNumber={(room.currentTurn || 0) + 1}
          playerCleanMoney={currentPlayer.cleanMoney || 0}
          bribed={bribedThisEvent}
        />
      )}

      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}

      {/* SURRENDER CONFIRMATION MODAL */}
      {showSurrenderConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-6 sm:p-8 max-w-sm w-full mx-4 shadow-2xl border" style={{ backgroundColor: '#0a2014', borderColor: '#203a29' }}>
            <div className="text-center mb-6">
              <span className="text-4xl block mb-3">&#x1F6AA;</span>
              <h3 className="text-lg font-bold text-[#f87171] mb-2">Menyerah dari Permainan?</h3>
              <p className="text-sm text-[#9a907c]">Kamu akan keluar dari permainan ini. Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSurrenderConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#152f1f', color: '#4edea3', border: '1px solid #203a29' }}
              >
                Batalkan
              </button>
              <button
                onClick={confirmSurrender}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#3d1111', color: '#f87171', border: '1px solid #5c2020' }}
              >
                Ya, Menyerah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELL INFO MODAL - Info Only */}
      {showCellInfo && cellInfoData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCellInfo(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div
              className="rounded-xl p-4 mb-4 text-center"
              style={{ backgroundColor: cellInfoData.color }}
            >
              <h2 className="text-xl font-bold text-white">{cellInfoData.name}</h2>
              <p className="text-white/80 text-xs mt-1">{cellInfoData.description}</p>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Tipe:</span>
                <span className="font-semibold text-gray-800 text-sm capitalize">{cellInfoData.type}</span>
              </div>
              {cellInfoData.price !== undefined && cellInfoData.price > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Harga Beli:</span>
                  <span className="font-bold text-green-600">Rp{(cellInfoData.price || 0).toLocaleString('id-ID')}</span>
                </div>
              )}
              {cellInfoData.rent !== undefined && cellInfoData.rent > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Sewa Dasar:</span>
                  <span className="font-semibold text-gray-800 text-sm">Rp{(cellInfoData.rent || 0).toLocaleString('id-ID')}</span>
                </div>
              )}
              {cellInfoData.group && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Grup:</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: cellInfoData.color }}>{cellInfoData.group}</span>
                </div>
              )}
              {cellInfoData.buildingCost !== undefined && cellInfoData.buildingCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Biaya Bangun:</span>
                  <span className="font-semibold text-gray-800 text-sm">Rp{(cellInfoData.buildingCost || 0).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowCellInfo(false)}
              className="w-full py-2.5 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* BANKRUPTCY MODAL */}
      {showBankruptcyModal && currentPlayer && (
        <BankruptcyModal
          isOpen={showBankruptcyModal}
          player={currentPlayer}
          otherPlayers={players}
          onSellToBank={async (propertyName: string) => {
            try {
              const response = await fetch('/api/bankrupt-sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId: room?.id,
                  sellerId: currentPlayer.id,
                  propertyName,
                }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              SoundEffects.success();
              setCurrentPlayer((prev) => prev ? {
                ...prev,
                cleanMoney: data.newSellerBalance,
                properties: (prev.properties || []).filter(p => p !== propertyName),
              } : null);
              broadcastAnnouncement({
                type: 'sell',
                playerName: currentPlayer.name,
                message: `menjual ${propertyName} ke Bank`,
                detail: `+Rp ${data.sellPrice.toLocaleString('id-ID')}`,
              });
            } catch (err) {
              console.error('Sell to bank error:', err);
            }
          }}
          onSellToPlayer={async (propertyName: string, buyerId: string, amount: number) => {
            try {
              const response = await fetch('/api/bankrupt-sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId: room?.id,
                  sellerId: currentPlayer.id,
                  propertyName,
                  buyerId,
                }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              SoundEffects.success();
              const buyer = players.find(p => p.id === buyerId);
              setCurrentPlayer((prev) => prev ? {
                ...prev,
                cleanMoney: data.newSellerBalance,
                properties: (prev.properties || []).filter(p => p !== propertyName),
              } : null);
              broadcastAnnouncement({
                type: 'sell',
                playerName: currentPlayer.name,
                message: `menjual ${propertyName} ke ${buyer?.name || 'pemain'}`,
                detail: `+Rp ${data.sellPrice.toLocaleString('id-ID')}`,
              });
            } catch (err) {
              console.error('Sell to player error:', err);
            }
          }}
          onTakeLoan={async (amount: number) => {
            try {
              const response = await fetch('/api/bankrupt-loan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roomId: room?.id,
                  playerId: currentPlayer.id,
                  amount,
                }),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error);
              SoundEffects.success();
              setCurrentPlayer((prev) => prev ? {
                ...prev,
                cleanMoney: data.newBalance,
                statusEffects: [...(prev.statusEffects || []), {
                  type: 'loan',
                  duration: 999,
                  effect: `Pinjaman Rp ${amount.toLocaleString('id-ID')}`,
                }],
              } : null);
              broadcastAnnouncement({
                type: 'loan',
                playerName: currentPlayer.name,
                message: `mengambil pinjaman bank`,
                detail: `+Rp ${amount.toLocaleString('id-ID')}`,
              });
              setShowBankruptcyModal(false);
            } catch (err) {
              console.error('Take loan error:', err);
            }
          }}
          onDeclineLoan={() => {
            // Player accepts bankruptcy — clear ALL status effects including DND
            setCurrentPlayer((prev) => prev ? {
              ...prev, cleanMoney: 0, dirtyMoney: 0, properties: [], isBankrupt: true, statusEffects: [],
            } : null);
            SoundEffects.gameOver();
            broadcastAnnouncement({
              type: 'bankrupt',
              playerName: currentPlayer.name,
              message: 'BANKRUP! Semua properti disita bank.',
              detail: '',
            });
            setShowBankruptcyModal(false);
            // Notify server
            fetch('/api/update-player', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId: room?.id,
                playerId: currentPlayer.id,
                cleanMoneyDelta: -currentPlayer.cleanMoney,
                dirtyMoneyDelta: -currentPlayer.dirtyMoney,
                properties: [],
                isBankrupt: true,
                statusEffects: [],
              }),
            }).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
