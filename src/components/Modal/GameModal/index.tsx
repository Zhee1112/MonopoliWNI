'use client';

import { useState, useRef, useEffect } from 'react';
import { Player } from '@/lib/types';
import { getPropertyCells, getCellByIndex } from '@/lib/game/board-data';
import { NORMAL_ROLES } from '@/lib/game/role-data';

// ============================================================
// GAME MODAL - 4 Tabs: Pemain, Status & Aset, Chat, Opsi
// ============================================================

type TabKey = 'players' | 'status' | 'chat' | 'settings';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabKey;
  players: Player[];
  currentPlayer: Player;
  roomCode: string;
  ownedCells?: Record<number, string>;
  chatMessages?: { sender: string; text: string }[];
  onSendChat?: (text: string) => void;
  onLeaveRoom?: () => void;
}

const TAB_CONFIG = [
  { key: 'players' as TabKey, label: 'Pemain', icon: '👥' },
  { key: 'status' as TabKey, label: 'Status & Aset', icon: '📊' },
  { key: 'chat' as TabKey, label: 'Chat Meja', icon: '💬' },
  { key: 'settings' as TabKey, label: 'Opsi', icon: '⚙️' },
];

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
      <div className="w-full max-w-[440px] bg-surface-container-low border border-outline-variant rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-surface-container px-4 py-3 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <span className="text-lg">{TAB_CONFIG.find((t) => t.key === activeTab)?.icon || '👥'}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary leading-tight">
                {activeTab === 'players' && 'Daftar Pemain Meja'}
                {activeTab === 'status' && 'Status Game & Aset Meja'}
                {activeTab === 'chat' && 'Obrolan Santai Satir'}
                {activeTab === 'settings' && 'Pengaturan Suara & Meja'}
              </h2>
              <span className="text-[10px] text-on-surface-variant">Kamar #{roomCode} &bull; {players.length} Pemain</span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-white flex items-center justify-center transition-colors">
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="bg-surface-container/80 px-3 py-2 border-b border-outline-variant flex items-center gap-1.5 overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label} {tab.key === 'players' && `(${players.length})`}</span>
              {tab.key === 'chat' && <span className="w-2 h-2 rounded-full bg-rose-500" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {/* PANEL: PEMAIN */}
          {activeTab === 'players' && players.map((player) => {
            const isActive = player.id === currentPlayer.id;
            const isHost = player.id === currentPlayer.id;
            return (
              <div key={player.id} className={`border rounded-xl p-3 ${isActive ? 'bg-surface-container border-primary/30 shadow-sm' : 'bg-surface-container-low border-outline-variant hover:bg-surface-container-high transition-colors'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow" style={{ backgroundColor: player.tokenColor, color: '#fff' }}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface">{player.name}</span>
                        {isHost && <span className="px-1.5 py-0.2 bg-primary/20 text-primary text-[9px] font-mono rounded font-bold">HOST</span>}
                        {player.isBot && <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-400 text-[9px] font-mono rounded font-bold">BOT</span>}
                      </div>
                      <span className="text-[10px] text-on-surface-variant">Lv {player.roleLevel} {getRoleName(player.role)} &bull; Hoki: {player.luck}/100</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2 rounded-lg border border-outline-variant">
                  <div>
                    <span className="text-[9px] text-outline block uppercase font-medium">KAS BERSIH</span>
                    <span className="font-mono font-bold text-xs text-primary">Rp {(player.cleanMoney || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-outline block uppercase font-medium">KEPEMILIKAN ASET</span>
                    <span className="text-[10px] text-on-surface font-semibold">{player.properties?.length || 0} Kavling</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* PANEL: STATUS & ASET */}
          {activeTab === 'status' && (
            <>
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-outline uppercase font-semibold block">KODE MEJA PRIVATE</span>
                  <span className="font-mono font-bold text-sm text-primary">#{roomCode}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(roomCode)}
                  className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-xs rounded-md text-primary flex items-center gap-1 border border-outline-variant"
                >
                  <span className="text-sm">📋</span>
                  <span>Salin</span>
                </button>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1.5 font-semibold">Kavling yang Telah Dikuasai</span>
                <div className="space-y-1.5">
                  {getPropertyCells().slice(0, 3).map((cell) => (
                    <div key={cell.index} className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: cell.groupColor }} />
                        <div>
                          <span className="text-xs font-bold text-on-surface block">{cell.name}</span>
                          <span className="text-[10px] text-on-surface-variant">Sewa Rp {((cell.rent || 0) / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-primary font-bold">Rp {(cell.price || 0) / 1000}k</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PANEL: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs">
                {chatMessages.length === 0 && (
                  <div className="text-center text-outline text-xs py-8">Belum ada pesan</div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className="bg-surface-container-low p-2 rounded-lg border border-outline-variant">
                    <span className="font-bold text-secondary text-[11px]">{msg.sender}:</span>
                    <p className="text-on-surface-variant mt-0.5">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-3 pt-2 bg-surface-container rounded-lg p-1.5 flex items-center gap-1.5 border border-outline-variant">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="bg-background-lowest text-on-surface text-xs px-3 py-1.5 rounded flex-1 focus:outline-none placeholder:text-outline border border-outline-variant"
                  placeholder="Ketik pesan satir..."
                />
                <button onClick={handleSendChat} className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded text-xs hover:bg-primary-container transition-colors">
                  Kirim
                </button>
              </div>
            </div>
          )}

          {/* PANEL: SETTINGS */}
          {activeTab === 'settings' && (
            <>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-xl border border-outline-variant">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Efek Suara Kocok Dadu</span>
                  <span className="text-[10px] text-on-surface-variant">Sfx koin &amp; bunyi klakson angkot</span>
                </div>
                <span className="text-secondary text-xl">🔊</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-xl border border-outline-variant">
                <div>
                  <span className="text-xs font-bold text-on-surface block">Musik Latar Angklung Jazz</span>
                  <span className="text-[10px] text-on-surface-variant">Suasana kafe santai Nusantara</span>
                </div>
                <span className="text-primary text-xl">🎵</span>
              </div>
              <div className="pt-2">
                <button onClick={onLeaveRoom} className="w-full py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <span className="text-sm">🚪</span>
                  <span>Tinggalkan Meja Monopoli</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container border-t border-outline-variant flex items-center justify-between">
          <span className="text-[10px] text-on-surface-variant font-mono">Status: Room Aktif ({players.length}/8 Player)</span>
          <button onClick={onClose} className="px-3 py-1 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-on-surface rounded-md text-xs font-medium transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
