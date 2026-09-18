'use client';

import { useState, useEffect } from 'react';
import { ACHIEVEMENTS, getAchievement } from '@/lib/game/achievements';

interface PlayerResult {
  playerId: string;
  playerName: string;
  placement: number;
  totalAssets: number;
  cleanMoney: number;
  properties: string[];
  isBot: boolean;
  isBankrupt: boolean;
}

interface AchievementAward {
  playerId: string;
  achievementId: string;
  xp: number;
}

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: PlayerResult[];
  achievements: AchievementAward[];
  currentPlayerId: string;
  gameMode: string;
  winnerId?: string;
  winnerName?: string;
  onPlayAgain?: () => void;
  onBackToLobby?: () => void;
}

const RANK_EMOJIS: Record<number, string> = {
  1: '👑', 2: '📊', 3: '🥉', 4: '🤝', 5: '🤝', 6: '🤝', 7: '🤝', 8: '🤝',
};

const RANK_COLORS: Record<number, string> = {
  1: 'text-[#ffd56d]', 2: 'text-slate-300', 3: 'text-amber-600', 4: 'text-[#4edea3]',
};

const RANK_BG: Record<number, string> = {
  1: 'bg-[#ffd56d]/10 border-[#ffd56d]/30', 2: 'bg-slate-400/10 border-slate-400/30',
  3: 'bg-amber-600/10 border-amber-600/30', 4: 'bg-[#4edea3]/10 border-[#4edea3]/30',
};

export default function PostGameModal({
  isOpen, onClose, rankings, achievements, currentPlayerId,
  gameMode, winnerId, winnerName, onPlayAgain, onBackToLobby,
}: PostGameModalProps) {
  const [activeTab, setActiveTab] = useState<'skor' | 'xp' | 'achievement' | 'rate'>('skor');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentPlayerResult = rankings.find(p => p.playerId === currentPlayerId);
  const isWinner = currentPlayerResult?.placement === 1;
  const winnerRank = rankings.find(p => p.placement === 1);
  const myAchievements = achievements.filter(a => a.playerId === currentPlayerId);
  const totalXp = myAchievements.reduce((sum, a) => sum + a.xp, 0);

  const handleShare = async () => {
    const text = `Monopoli WNI — ${gameMode.toUpperCase()}\n🏆 Juara: ${winnerName}\nSaya peringkat #${currentPlayerResult?.placement} dengan aset Rp ${(currentPlayerResult?.totalAssets || 0).toLocaleString('id-ID')}\n\nMain di: monopoliwni.vercel.app`;
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch { /* silent */ }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-[#05140b] border border-[#1c452e] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative px-6 pt-8 pb-6 text-center border-b border-[#1c452e]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-[#7a9a7a] hover:text-[#ffd56d] hover:bg-[#1c452e]/50 transition-colors"
          >
            &#x2715;
          </button>
          <div className="text-5xl mb-3">{isWinner ? '🏆' : '📋'}</div>
          <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {isWinner ? 'KAMU MENANG!' : `Peringkat #${currentPlayerResult?.placement || '?'}`}
          </h2>
          <p className="text-sm text-emerald-400/70">
            {gameMode === 'bundir' ? 'Mode BUNDIR' : gameMode === 'sultan' ? 'Mode KAYA RAYA' : 'Mode KILAT'}
            {' — '}
            {winnerName ? `Juara: ${winnerName}` : 'Selesai'}
          </p>
        </div>

        {/* Winner Spotlight */}
        {winnerRank && (
          <div className="px-6 py-5 bg-gradient-to-b from-[#ffd56d]/5 to-transparent border-b border-[#1c452e]">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#ffd56d]/20 border-2 border-[#ffd56d]/40 flex items-center justify-center text-3xl">
                {RANK_EMOJIS[1]}
              </div>
              <div>
                <div className="text-lg font-bold text-[#ffd56d]">{winnerRank.playerName}</div>
                <div className="text-sm text-[#4edea3]/70">
                  Rp {winnerRank.totalAssets.toLocaleString('id-ID')} total aset
                  {' • '}{winnerRank.properties.length} properti
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#1c452e]">
          {(['skor', 'xp', 'achievement', 'rate'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'text-[#ffd56d] border-b-2 border-[#ffd56d] bg-[#ffd56d]/5'
                  : 'text-emerald-400/50 hover:text-emerald-400/70'
              }`}
            >
              {tab === 'skor' ? '🏆 Skor' : tab === 'xp' ? '⭐ XP' : tab === 'achievement' ? '🏅 Pencapaian' : '⭐ Nilai'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'skor' && (
            <div className="space-y-3">
              {rankings.map((p, i) => (
                <div
                  key={p.playerId}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    p.playerId === currentPlayerId
                      ? 'bg-[#4edea3]/10 border-[#4edea3]/30'
                      : RANK_BG[p.placement] || 'bg-[#0a2617]/50 border-[#1c452e]/50'
                  }`}
                >
                  <div className={`text-lg font-bold w-8 text-center ${RANK_COLORS[p.placement] || 'text-emerald-400/50'}`}>
                    {RANK_EMOJIS[p.placement] || `#${p.placement}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold truncate ${p.playerId === currentPlayerId ? 'text-[#4edea3]' : 'text-white'}`}>
                        {p.playerName}
                      </span>
                      {p.playerId === currentPlayerId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold">ANDA</span>
                      )}
                      {p.isBot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800/50 text-emerald-400/50 font-bold">BOT</span>
                      )}
                      {p.isBankrupt && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-400 font-bold">BANGKRUT</span>
                      )}
                    </div>
                    <div className="text-xs text-emerald-400/50 mt-0.5">
                      Rp {p.totalAssets.toLocaleString('id-ID')} • {p.properties.length} properti
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${RANK_COLORS[p.placement] || 'text-emerald-400/50'}`}>
                      #{p.placement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'xp' && (
            <div className="space-y-4">
              {/* Placement XP — from achievements table */}
              {(() => {
                const placementAch = myAchievements.find(a =>
                  a.achievementId === 'winner' || a.achievementId === 'runner_up' || a.achievementId === 'third_place' || a.achievementId === 'participation'
                );
                if (placementAch) {
                  const def = getAchievement(placementAch.achievementId);
                  return (
                    <div className="p-4 rounded-xl bg-[#0a2617]/80 border border-[#1c452e]">
                      <div className="text-xs text-emerald-400/50 uppercase tracking-wider mb-2">Placement Bonus</div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">
                          {def?.emoji || RANK_EMOJIS[currentPlayerResult?.placement || 4]} {def?.name || `Peringkat #${currentPlayerResult?.placement || '?'}`}
                        </span>
                        <span className="text-[#ffd56d] font-bold">+{placementAch.xp} XP</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Achievement XP */}
              {(() => {
                const otherAchievements = myAchievements.filter(a =>
                  a.achievementId !== 'winner' && a.achievementId !== 'runner_up' && a.achievementId !== 'third_place' && a.achievementId !== 'participation'
                );
                if (otherAchievements.length === 0) return null;
                return (
                  <div className="p-4 rounded-xl bg-[#0a2617]/80 border border-[#1c452e]">
                    <div className="text-xs text-emerald-400/50 uppercase tracking-wider mb-2">Achievement XP</div>
                    <div className="space-y-2">
                      {otherAchievements.map(a => {
                        const def = getAchievement(a.achievementId);
                        return def ? (
                          <div key={a.achievementId} className="flex items-center justify-between">
                            <span className="text-white text-sm">{def.emoji} {def.name}</span>
                            <span className="text-[#4edea3] font-bold text-sm">+{a.xp} XP</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Total XP */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#ffd56d]/10 to-[#4edea3]/10 border border-[#ffd56d]/30">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">Total XP Diperoleh</span>
                  <span className="text-[#ffd56d] font-bold text-xl">+{totalXp} XP</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievement' && (
            <div className="space-y-3">
              {myAchievements.length === 0 ? (
                <div className="text-center py-8 text-emerald-400/30">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-sm">Belum ada pencapaian di sesi ini</div>
                </div>
              ) : (
                myAchievements.map(a => {
                  const def = getAchievement(a.achievementId);
                  if (!def) return null;
                  return (
                    <div
                      key={a.achievementId}
                      className={`p-3 rounded-xl border ${def.bgColor} ${def.borderColor}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{def.emoji}</div>
                        <div className="flex-1">
                          <div className={`font-semibold text-sm ${def.color}`}>{def.name}</div>
                          <div className="text-xs text-emerald-400/50">{def.description}</div>
                        </div>
                        <div className="text-sm font-bold text-[#ffd56d]">+{a.xp} XP</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'rate' && (
            <div className="space-y-3">
              {ratingSubmitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🙏</div>
                  <div className="text-white font-semibold mb-1">Terima kasih sudah menilai!</div>
                  <div className="text-sm text-emerald-400/50">Penilaianmu membantu komunitas Monopoli WNI</div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-sm text-emerald-400/70">Beri penilaian untuk pemain lain</div>
                  </div>
                  {rankings.filter(p => p.playerId !== currentPlayerId && !p.isBot).map(p => (
                    <div
                      key={p.playerId}
                      className="p-3 rounded-xl border bg-[#0a2617]/80 border-[#1c452e]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1c452e] flex items-center justify-center text-sm font-bold text-white">
                            {p.playerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white font-semibold text-sm">{p.playerName}</span>
                            <span className="text-xs text-emerald-400/50 block">#{p.placement}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRatings(prev => ({ ...prev, [p.playerId]: star }))}
                              className="text-xl transition-transform hover:scale-125"
                            >
                              {star <= (ratings[p.playerId] || 0) ? '⭐' : '☆'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {rankings.filter(p => p.playerId !== currentPlayerId && !p.isBot).length === 0 && (
                    <div className="text-center py-8 text-emerald-400/30">
                      <div className="text-4xl mb-2">🤖</div>
                      <div className="text-sm">Hanya bot yang lawan — tidak ada yang bisa dinilai</div>
                    </div>
                  )}
                  {Object.keys(ratings).length > 0 && (
                    <button
                      onClick={() => setRatingSubmitted(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffd56d] to-[#e5b842] text-[#3e2e00] font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      ⭐ Kirim Penilaian ({Object.keys(ratings).length} pemain)
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-[#1c452e]/80 border border-[#2a5e40] text-[#4edea3] font-semibold text-sm hover:bg-[#2a5e40]/80 transition-colors"
          >
            {shareStatus === 'copied' ? '✓ Tersalin!' : '📋 Salin Hasil'}
          </button>
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#3bc48d] text-[#003824] font-bold text-sm hover:opacity-90 transition-opacity"
            >
              🔄 Main Lagi
            </button>
          )}
          {onBackToLobby && (
            <button
              onClick={onBackToLobby}
              className="flex-1 py-3 rounded-xl bg-[#0a2617] border border-[#1c452e] text-emerald-400/70 font-semibold text-sm hover:bg-[#123e25] transition-colors"
            >
              🚪 Kembali ke Lobby
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
