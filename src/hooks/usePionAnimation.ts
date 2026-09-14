'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface AnimatedPion {
  playerId: string;
  currentPosition: number;
  targetPosition: number;
  path: number[];
  isAnimating: boolean;
}

export function usePionAnimation() {
  const [animatedPions, setAnimatedPions] = useState<Map<string, AnimatedPion>>(new Map());
  const animationRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generatePath = useCallback((from: number, to: number): number[] => {
    const path: number[] = [];
    let current = from;
    while (current !== to) {
      current = (current + 1) % 40;
      path.push(current);
    }
    return path;
  }, []);

  const animatePion = useCallback((playerId: string, from: number, to: number, onComplete?: () => void) => {
    const path = generatePath(from, to);

    const newPion: AnimatedPion = {
      playerId,
      currentPosition: from,
      targetPosition: to,
      path,
      isAnimating: true,
    };

    setAnimatedPions(prev => {
      const next = new Map(prev);
      next.set(playerId, newPion);
      return next;
    });

    // Clear any existing animation for this player
    const oldInterval = animationRef.current.get(playerId);
    if (oldInterval) clearInterval(oldInterval);

    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        const nextPos = path[step];
        setAnimatedPions(prev => {
          const next = new Map(prev);
          const pion = next.get(playerId);
          if (pion) {
            next.set(playerId, {
              ...pion,
              currentPosition: nextPos,
            });
          }
          return next;
        });
        step++;
      } else {
        clearInterval(interval);
        animationRef.current.delete(playerId);
        // Keep the pion in the map at its final position
        // so getPionPosition returns the correct value until realtime catches up
        onComplete?.();
      }
    }, 200);

    animationRef.current.set(playerId, interval);
  }, [generatePath]);

  const getPionPosition = useCallback((playerId: string, defaultPosition: number) => {
    const pion = animatedPions.get(playerId);
    if (pion) {
      return pion.currentPosition;
    }
    return defaultPosition;
  }, [animatedPions]);

  useEffect(() => {
    return () => {
      animationRef.current.forEach(interval => clearInterval(interval));
      animationRef.current.clear();
    };
  }, []);

  return {
    animatePion,
    getPionPosition,
  };
}
