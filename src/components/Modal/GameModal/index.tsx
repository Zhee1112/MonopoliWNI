'use client';

import { useState, useRef, useEffect } from 'react';
import { Player } from '@/lib/types';
import { NORMAL_ROLES } from '@/lib/game/role-data';
import { BoardTheme, BoardThemeId, BOARD_THEMES } from '@/lib/game/board-themes';
import { Announcement } from '@/hooks/useRealtime';

// ============================================================
// GAME MODAL - 5 Tabs: Pemain, Status, Log, Chat, Pengaturan
// ============================================================

type TabKey = 'players' | 'status' | 'log' | 'chat' | 'settings';

interface ChatMessage {
  sender: string;
  text: string;
  time?: string;
}

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabKey;
  players: Player[];
  currentPlayer: Player;
  roomCode: string;
  ownedCells?: Record<number, string>;
  chatMessages?: ChatMessage[];
  onSendChat?: (text: string) => void;
  onLeaveRoom?: () => void;
  musicOn?: boolean;
  onToggleMusic?: () => void;
  announcements?: Announcement[];
  round?: number;
  totalRounds?: number;
  potMoney?: number;
  boardTheme?: BoardThemeId;
  onThemeChange?: (theme: BoardThemeId) => void;
}

const TAB_CONFIG = [
  { key: 'players' as TabKey, label: 'Pemain', icon: '👥' },
  { key: 'status' as TabKey, label: 'Status', icon: '📊' },
  { key: 'log' as TabKey, label: 'Log', icon: '📋' },
  { key: 'chat' as TabKey, label: 'Chat', icon: '💬' },
  { key: 'settings' as TabKey, label: 'Pengaturan', icon: '⚙️' },
];

const CHAT_PLAYER_COLORS = ['#ffd56d', '#4edea3', '#38bdf8', '#f472b6', '#fb923c', '#a78bfa', '#facc15', '#f87171'];

function getPlayerColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CHAT_PLAYER_COLORS[Math.abs(hash) % CHAT_PLAYER_COLORS.length];
}

function formatChatTime(time?: string): string {
  if (!time) return '';
  return time;
}

export default function GameModal({
  isOpen, onClose, defaultTab = 'players', players, currentPlayer, roomCode,
  chatMessages = [], onSendChat, onLeaveRoom, musicOn = false, onToggleMusic,
  announcements = [], round = 1, totalRounds = 20, potMoney = 0,
  boardTheme, onThemeChange,
}: GameModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [announcements]);

  if (!isOpen) return null;

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return 'Belum pilih role';
    return NORMAL_ROLES.find((r) => r.id === roleId)?.name || roleId;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    onSendChat?.(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]" style={{ backgroundColor: '#0a2514', border: '1px solid #203a29' }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#0d2e1a', borderBottom: '1px solid #203a29' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#152f1f', border: '1px solid #203a29' }}>
              <span className="text-lg">{TAB_CONFIG.find((t) => t.key === activeTab)?.icon || '👥'}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight" style={{ color: '#ffd56d' }}>
                {activeTab === 'players' && 'Pemain Meja'}
                {activeTab === 'status' && 'Status Pemain'}
                {activeTab === 'log' && 'Log Permainan'}
                {activeTab === 'chat' && 'Log Chat Meja'}
                {activeTab === 'settings' && 'Pengaturan'}
              </h2>
              <span className="text-[10px]" style={{ color: '#7a9a7a' }}>#{roomCode} &bull; {players.length}/8 Pemain</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }}>
            <span className="text-sm">✕</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto" style={{ backgroundColor: '#0d2e1a', borderBottom: '1px solid #203a29' }}>
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
              style={activeTab === tab.key
                ? { backgroundColor: '#ffd56d', color: '#3e2e00', fontWeight: 700 }
                : { backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }
              }
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === 'players' && <span style={{ color: activeTab === tab.key ? '#3e2e00' : '#ffd56d', fontWeight: 700 }}>({players.length})</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#071d10' }}>

          {/* PANEL: PEMAIN */}
          {activeTab === 'players' && (
            <div className="p-3 space-y-2">
              {players.map((player) => {
                const isActive = player.id === currentPlayer.id;
                const isTurn = players.findIndex((p) => p.id === player.id) === (players.length > 0 ? 0 : -1);
                const pColor = player.tokenColor || '#3b82f6';
                return (
                  <div key={player.id} className="rounded-xl p-3 transition-all" style={{
                    backgroundColor: isActive ? '#152f1f' : '#0d2e1a',
                    border: `1px solid ${isActive ? '#ffd56d40' : '#203a29'}`,
                    boxShadow: isActive ? '0 0 12px rgba(255,213,109,0.1)' : 'none'
                  }}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md relative" style={{ backgroundColor: pColor, color: '#fff', boxShadow: `0 0 0 2px ${pColor}33` }}>
                        {player.name.charAt(0).toUpperCase()}
                        {isActive && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]" style={{ backgroundColor: '#ffd56d', color: '#3e2e00', border: '2px solid #071d10' }}>
                            ★
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate" style={{ color: '#e0d8c8' }}>{player.name}</span>
                          {isActive && <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold" style={{ backgroundColor: '#ffd56d20', color: '#ffd56d' }}>YOU</span>}
                          {player.isBot && <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold" style={{ backgroundColor: '#a78bfa20', color: '#a78bfa' }}>BOT</span>}
                        </div>
                        <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>Lv {player.roleLevel} {getRoleName(player.role)} &bull; Hoki: {player.luck}/100</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xs block" style={{ color: '#ffd56d' }}>Rp {(player.cleanMoney || 0).toLocaleString('id-ID')}</span>
                        <span className="text-[9px] block" style={{ color: '#7a9a7a' }}>{player.properties?.length || 0} kavling</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PANEL: STATUS */}
          {activeTab === 'status' && (
            <div className="p-3 space-y-3">
              {/* Room Info */}
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-semibold" style={{ color: '#7a9a7a' }}>Kode Meja</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(roomCode)}
                    className="px-2.5 py-1 rounded-md text-xs flex items-center gap-1 transition-colors"
                    style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#4edea3' }}
                  >
                    <span className="text-sm">📋</span>
                    <span>Salin</span>
                  </button>
                </div>
                <span className="font-mono font-bold text-sm" style={{ color: '#ffd56d' }}>#{roomCode}</span>
                <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: '#7a9a7a' }}>
                  <span>Babak <strong style={{ color: '#ffd56d' }}>{round}</strong>/{totalRounds}</span>
                  <span>Pool: <strong style={{ color: '#ffd56d' }}>Rp {potMoney.toLocaleString('id-ID')}</strong></span>
                </div>
              </div>

              {/* Ringkasan Pemain */}
              <div>
                <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Ringkasan Pemain</span>
                <div className="space-y-1.5">
                  {players.map((p) => {
                    const isActive = p.id === currentPlayer.id;
                    return (
                      <div key={p.id} className="p-2.5 rounded-lg flex items-center justify-between" style={{ backgroundColor: isActive ? '#152f1f' : '#0d2e1a', border: `1px solid ${isActive ? '#ffd56d30' : '#203a29'}` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.tokenColor || '#3b82f6' }} />
                          <span className="text-xs font-bold" style={{ color: isActive ? '#ffd56d' : '#e0d8c8' }}>
                            {p.name} {isActive && <span className="text-[9px]" style={{ color: '#7a9a7a' }}>(kamu)</span>}
                          </span>
                          {p.isBot && <span className="text-[9px] px-1 rounded" style={{ backgroundColor: '#a78bfa20', color: '#a78bfa' }}>BOT</span>}
                          {p.isBankrupt && <span className="text-[9px] px-1 rounded" style={{ backgroundColor: '#f8717120', color: '#f87171' }}>BANGKRUT</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[11px] font-bold block" style={{ color: '#ffd56d' }}>Rp {(p.cleanMoney || 0).toLocaleString('id-ID')}</span>
                          <span className="text-[9px]" style={{ color: '#7a9a7a' }}>{p.properties?.length || 0} kavling</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Effects */}
              {currentPlayer.statusEffects && currentPlayer.statusEffects.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Status Aktif</span>
                  <div className="space-y-1">
                    {currentPlayer.statusEffects.map((eff, i) => (
                      <div key={i} className="p-2 rounded-lg text-[11px]" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29', color: '#f87171' }}>
                        ⏳ {eff.effect || eff.type} {eff.duration > 0 && <span style={{ color: '#7a9a7a' }}>({eff.duration} giliran)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bukti Warga */}
              {currentPlayer.evidence && currentPlayer.evidence.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Bukti Warga</span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPlayer.evidence.map((ev, i) => (
                      <span key={i} className="px-2 py-1 rounded text-[10px] font-bold" style={{ backgroundColor: '#4edea315', color: '#4edea3', border: '1px solid #4edea330' }}>
                        📄 {ev.id || `Bukti ${i + 1}`} (+{ev.bonusModifier || 1})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PANEL: LOG PERMAINAN */}
          {activeTab === 'log' && (
            <div className="flex flex-col" style={{ minHeight: '350px', maxHeight: '450px' }}>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5" style={{ minHeight: 0 }}>
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-3xl block mb-2">📋</span>
                    <span className="text-xs block" style={{ color: '#7a9a7a' }}>Belum ada aktivitas</span>
                    <span className="text-[10px] block mt-1" style={{ color: '#4a6a4a' }}>Semua aksi permainan akan tercatat di sini.</span>
                  </div>
                ) : (
                  [...announcements].reverse().map((ann) => {
                    const typeColors: Record<string, string> = {
                      roll: '#a78bfa',
                      buy: '#4edea3',
                      rent: '#fb923c',
                      card: '#ffd56d',
                      event: '#f472b6',
                      tax: '#f87171',
                      loan: '#38bdf8',
                      bankrupt: '#f87171',
                      turn: '#9a907c',
                      round: '#ffd56d',
                      system: '#d1c5af',
                      skip: '#a78bfa',
                    };
                    const typeIcons: Record<string, string> = {
                      roll: '🎲', buy: '🏠', rent: '💸', card: '🃏', event: '⚡',
                      tax: '🏛️', loan: '🏦', bankrupt: '💀', turn: '🔄', round: '📅',
                      system: '📢', skip: '⏭️',
                    };
                    const color = typeColors[ann.type] || '#d1c5af';
                    const icon = typeIcons[ann.type] || '•';
                    return (
                      <div key={ann.id} className="flex items-start gap-2 py-1.5 px-2 rounded-lg" style={{ backgroundColor: '#0d2e1a' }}>
                        <span className="text-sm shrink-0 mt-0.5">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold" style={{ color }}>{ann.playerName}</span>
                            <span className="text-[10px]" style={{ color: '#d1c5af' }}>{ann.message}</span>
                          </div>
                          {ann.detail && (
                            <span className="text-[10px] font-medium block" style={{ color: '#ffd56d' }}>{ann.detail}</span>
                          )}
                        </div>
                        <span className="text-[9px] shrink-0 mt-0.5" style={{ color: '#4a6a4a' }}>{ann.time}</span>
                      </div>
                    );
                  })
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* PANEL: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: '250px', maxHeight: '400px' }}>
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-3xl block mb-2">💬</span>
                    <span className="text-xs block" style={{ color: '#7a9a7a' }}>Belum ada obrolan</span>
                    <span className="text-[10px] block mt-1" style={{ color: '#4a6a4a' }}>Mulai ngobrol santai bareng pemain lain!</span>
                  </div>
                )}
                {chatMessages.map((msg, idx) => {
                  const isMe = msg.sender === currentPlayer.name;
                  const pColor = getPlayerColor(msg.sender);
                  return (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: pColor + '20', color: pColor, border: `1px solid ${pColor}33` }}>
                        {msg.sender.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[11px] font-bold" style={{ color: pColor }}>{msg.sender}</span>
                          {isMe && <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: '#ffd56d20', color: '#ffd56d' }}>Anda</span>}
                          {msg.time && <span className="text-[9px]" style={{ color: '#4a6a4a' }}>{formatChatTime(msg.time)}</span>}
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#c0d0c0' }}>{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3" style={{ borderTop: '1px solid #203a29', backgroundColor: '#0d2e1a' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    className="flex-1 text-xs px-3 py-2 rounded-lg focus:outline-none transition-colors"
                    style={{ backgroundColor: '#071d10', border: '1px solid #203a29', color: '#e0d8c8' }}
                    placeholder="Ketik pesan..."
                  />
                  <button
                    onClick={handleSendChat}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{ backgroundColor: chatInput.trim() ? '#ffd56d' : '#152f1f', color: chatInput.trim() ? '#3e2e00' : '#4a6a4a', border: '1px solid #203a29' }}
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PANEL: PENGATURAN */}
          {activeTab === 'settings' && (
            <div className="p-3 max-h-[450px] overflow-y-auto">
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                {/* Round Info */}
                <div className="p-3 rounded-xl shrink-0 min-w-[180px]" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29', scrollSnapAlign: 'start' }}>
                  <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Babak</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">📅</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm" style={{ color: '#ffd56d' }}>{round}/{totalRounds}</span>
                      <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>{roomCode}</span>
                    </div>
                  </div>
                </div>
                {/* Music Toggle */}
                <div className="p-3 rounded-xl shrink-0 min-w-[180px]" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29', scrollSnapAlign: 'start' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{musicOn ? '🎵' : '🔇'}</span>
                      <div>
                        <span className="text-xs font-bold block" style={{ color: '#e0d8c8' }}>Musik Latar</span>
                        <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>{musicOn ? 'On' : 'Off'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleMusic?.()}
                      className="w-12 h-6 rounded-full relative transition-all"
                      style={{
                        backgroundColor: musicOn ? '#4edea3' : '#152f1f',
                        border: `1px solid ${musicOn ? '#4edea3' : '#203a29'}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                        style={{
                          backgroundColor: musicOn ? '#fff' : '#7a9a7a',
                          left: musicOn ? '26px' : '2px',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Sound Effects */}
                <div className="p-3 rounded-xl shrink-0 min-w-[180px]" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29', scrollSnapAlign: 'start' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔊</span>
                      <div>
                        <span className="text-xs font-bold block" style={{ color: '#e0d8c8' }}>Efek Suara</span>
                        <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>Dadu, kartu, beli</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: '#4edea320', color: '#4edea3' }}>AKTIF</span>
                  </div>
                </div>

                {/* Room Info */}
                <div className="p-3 rounded-xl shrink-0 min-w-[180px]" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29', scrollSnapAlign: 'start' }}>
                  <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Info Kamar</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: '#93c5a7' }}>Kode</span>
                      <span className="font-mono text-xs font-bold" style={{ color: '#ffd56d' }}>#{roomCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: '#93c5a7' }}>Pemain</span>
                      <span className="text-xs font-bold" style={{ color: '#4edea3' }}>{players.length}/8</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Board Theme Selector */}
              <div className="mt-3">
                <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Tema Papan</span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.values(BOARD_THEMES) as BoardTheme[]).map((t) => {
                    const isActive = (boardTheme || 'default') === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onThemeChange?.(t.id)}
                        className="p-3 rounded-xl text-center transition-all cursor-pointer"
                        style={{
                          backgroundColor: isActive ? '#152f1f' : '#0d2e1a',
                          border: `2px solid ${isActive ? '#ffd56d' : '#203a29'}`,
                          boxShadow: isActive ? '0 0 12px rgba(255,213,109,0.15)' : 'none',
                        }}
                      >
                        <span className="text-2xl block mb-1">{t.preview}</span>
                        <span className="text-xs font-bold block" style={{ color: isActive ? '#ffd56d' : '#e0d8c8' }}>{t.name}</span>
                        <span className="text-[9px] block mt-0.5" style={{ color: '#7a9a7a' }}>{t.description}</span>
                        {/* Color preview dots */}
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.boardBg }} />
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.cellBg }} />
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.priceText }} />
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.startBg }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Catalog */}
              <div className="mt-3">
                <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Katalog Kartu</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29' }}>
                    <span className="text-lg block mb-1">🃏</span>
                    <span className="text-xs font-bold block" style={{ color: '#ffd56d' }}>140 Kartu</span>
                    <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>Kartu Takdir</span>
                    <div className="mt-1.5 space-y-0.5">
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🎲 Normal (35)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🃏 Meme (30)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🤝 Interaksi (32)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>💣 Sabotase (20)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>💰 Koruptor (8)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🔍 Audit (5)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>👑 Legendaris (10)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29' }}>
                    <span className="text-lg block mb-1">📦</span>
                    <span className="text-xs font-bold block" style={{ color: '#4edea3' }}>100 Kartu</span>
                    <span className="text-[10px] block" style={{ color: '#7a9a7a' }}>Kartu Kegiatan</span>
                    <div className="mt-1.5 space-y-0.5">
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🏪 Usaha (20)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>💼 Kerja (20)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>📈 Investasi (20)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🤝 Sosial (20)</span>
                      <span className="text-[9px] block" style={{ color: '#93c5a7' }}>🎯 Tantangan (20)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: '#0d2e1a', borderTop: '1px solid #203a29' }}>
          <span className="text-[10px] font-mono" style={{ color: '#7a9a7a' }}>Room Aktif &bull; {players.length}/8</span>
          {onLeaveRoom && (
            <button onClick={onLeaveRoom} className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors" style={{ backgroundColor: '#ff475715', border: '1px solid #ff475730', color: '#ff6b7a' }}>
              🚪 Keluar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
