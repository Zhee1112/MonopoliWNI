'use client';

import { useState, useRef, useEffect } from 'react';
import { Player } from '@/lib/types';
import { getPropertyCells } from '@/lib/game/board-data';
import { NORMAL_ROLES } from '@/lib/game/role-data';

// ============================================================
// GAME MODAL - 3 Tabs: Pemain, Status & Aset, Chat
// ============================================================

type TabKey = 'players' | 'status' | 'chat';

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
}

const TAB_CONFIG = [
  { key: 'players' as TabKey, label: 'Pemain', icon: '👥' },
  { key: 'status' as TabKey, label: 'Status', icon: '📊' },
  { key: 'chat' as TabKey, label: 'Chat', icon: '💬' },
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
  chatMessages = [], onSendChat, onLeaveRoom,
}: GameModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
                {activeTab === 'status' && 'Status & Aset'}
                {activeTab === 'chat' && 'Log Chat Meja'}
              </h2>
              <span className="text-[10px]" style={{ color: '#7a9a7a' }}>#{roomCode} &bull; {players.length}/8 Pemain</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#d1c5af' }}>
            <span className="text-sm">✕</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-3 py-2 flex items-center gap-1.5" style={{ backgroundColor: '#0d2e1a', borderBottom: '1px solid #203a29' }}>
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

          {/* PANEL: STATUS & ASET */}
          {activeTab === 'status' && (
            <div className="p-3 space-y-3">
              {/* Room Code */}
              <div className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29' }}>
                <div>
                  <span className="text-[10px] uppercase font-semibold block" style={{ color: '#7a9a7a' }}>Kode Meja</span>
                  <span className="font-mono font-bold text-sm" style={{ color: '#ffd56d' }}>#{roomCode}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(roomCode)}
                  className="px-2.5 py-1 rounded-md text-xs flex items-center gap-1 transition-colors"
                  style={{ backgroundColor: '#152f1f', border: '1px solid #203a29', color: '#4edea3' }}
                >
                  <span className="text-sm">📋</span>
                  <span>Salin</span>
                </button>
              </div>

              {/* Owned Properties */}
              <div>
                <span className="text-[10px] uppercase tracking-wider block mb-2 font-semibold" style={{ color: '#7a9a7a' }}>Kavling Dikuasai</span>
                <div className="space-y-1.5">
                  {getPropertyCells().slice(0, 3).map((cell) => (
                    <div key={cell.index} className="p-2.5 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#0d2e1a', border: '1px solid #203a29' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: cell.groupColor }} />
                        <div>
                          <span className="text-xs font-bold block" style={{ color: '#e0d8c8' }}>{cell.name}</span>
                          <span className="text-[10px]" style={{ color: '#7a9a7a' }}>Sewa Rp {((cell.rent || 0) / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold" style={{ color: '#4edea3' }}>Rp {(cell.price || 0) / 1000}k</span>
                    </div>
                  ))}
                </div>
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
