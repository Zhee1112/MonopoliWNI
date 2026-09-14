'use client';

import { useState, useEffect } from 'react';

interface GlobalEventModalProps {
  isOpen: boolean;
  eventName: string;
  eventEmoji: string;
  eventDescription: string;
  playerEffects?: Array<{
    playerName: string;
    moneyChange: number;
    statusEffect?: string;
  }>;
  onContinue: () => void;
}

export default function GlobalEventModal({
  isOpen,
  eventName,
  eventEmoji,
  eventDescription,
  playerEffects = [],
  onContinue,
}: GlobalEventModalProps) {
  const [phase, setPhase] = useState<'enter' | 'reveal' | 'done'>('enter');

  useEffect(() => {
    if (isOpen) {
      setPhase('enter');
      const timer1 = setTimeout(() => setPhase('reveal'), 1500);
      const timer2 = setTimeout(() => setPhase('done'), 3000);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Animated background flash */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-900/30 via-transparent to-amber-900/30 animate-pulse" />

        <div className="relative bg-[#0a1a11] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_0_1px_rgba(248,113,113,0.3)] overflow-hidden">
          {/* Header warning stripe */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 px-6 py-3 flex items-center justify-center gap-3">
            <span className="text-white text-sm font-black uppercase tracking-[0.3em] animate-pulse">
              &#x26A0;&#xFE0F; EVENT GLOBAL &#x26A0;&#xFE0F;
            </span>
          </div>

          {/* Main content */}
          <div className="p-8 text-center">
            {/* Emoji animation */}
            <div className={`text-7xl mb-4 transition-all duration-700 ${phase === 'enter' ? 'scale-0 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}>
              {eventEmoji}
            </div>

            {/* Event name */}
            <h1
              className={`text-2xl sm:text-3xl font-black text-white mb-2 transition-all duration-500 delay-300 ${phase === 'enter' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {eventName}
            </h1>

            {/* Description */}
            <p className={`text-base sm:text-lg text-[#d1c5af] max-w-lg mx-auto mt-4 transition-all duration-500 delay-500 ${phase === 'reveal' || phase === 'done' ? 'opacity-100' : 'opacity-0'}`}>
              {eventDescription}
            </p>

            {/* Player effects */}
            {playerEffects.length > 0 && phase === 'done' && (
              <div className="mt-6 space-y-2 max-w-md mx-auto">
                {playerEffects.map((pe, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#152f1f] border border-[#203a29] rounded-lg px-4 py-2 text-sm animate-in slide-in-from-bottom"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <span className="text-[#cbead1] font-semibold">{pe.playerName}</span>
                    <div className="flex items-center gap-2">
                      {pe.moneyChange !== 0 && (
                        <span className={`font-mono font-bold ${pe.moneyChange > 0 ? 'text-[#4edea3]' : 'text-[#f87171]'}`}>
                          {pe.moneyChange > 0 ? '+' : ''}Rp {Math.abs(pe.moneyChange).toLocaleString('id-ID')}
                        </span>
                      )}
                      {pe.statusEffect && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 border border-amber-700/50">
                          {pe.statusEffect}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continue button */}
          {phase === 'done' && (
            <div className="bg-[#092515] px-6 py-4 flex justify-center border-t border-[#203a29]">
              <button
                onClick={onContinue}
                className="px-8 py-3 rounded-lg bg-[#4edea3] text-[#002b18] font-bold text-sm hover:bg-[#6ffbbe] active:scale-95 shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-2"
              >
                Lanjutkan Permainan
                <span>&#x2192;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
