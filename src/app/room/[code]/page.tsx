'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Board from '@/components/Board/Board';
import PlayerPanel from '@/components/Player/PlayerPanel';
import DiceRollModal from '@/components/Modal/DiceRollModal';
import EventCardModal from '@/components/Modal/EventCardModal';
import BuyPropertyModal from '@/components/Modal/BuyPropertyModal';
import { useRealtimeRoom, useRealtimePlayers, useRealtimeCard } from '@/hooks/useRealtime';
import { getCellByIndex, getPropertyCells } from '@/lib/game/board-data';
import { drawRandomCard, getCardById } from '@/lib/game/takdir-cards';
import { Player, Room, BoardCell } from '@/lib/types';

// ============================================================
// GAME ROOM PAGE
// ============================================================

export default function GameRoom({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter();
  const { code: roomCode } = use(params);

  // State
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<BoardCell | null>(null);
  const [lastRoll, setLastRoll] = useState<{ dice1: number; dice2: number; total: number } | null>(null);

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
      const roomData = JSON.parse(storedRoom);

      if (roomData.code === roomCode) {
        setCurrentPlayer(player);
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [roomCode, router]);

  // Check if it's current player's turn
  const isMyTurn = room && currentPlayer && room.turnOrder[room.currentTurn] === currentPlayer.id;

  // Handle roll dice
  const handleRollDice = useCallback(async () => {
    if (!currentPlayer || !room) return;

    setShowDiceModal(true);
  }, [currentPlayer, room]);

  // Handle dice roll complete
  const handleDiceRollComplete = useCallback(
    async (result: { dice1: number; dice2: number; total: number }) => {
      if (!currentPlayer || !room) return;

      setLastRoll(result);

      try {
        const response = await fetch('/api/roll-dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: room.id,
            playerId: currentPlayer.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        // Update local state
        setCurrentPlayer((prev) =>
          prev
            ? {
                ...prev,
                position: data.newPosition,
                luck: data.newLuck,
                cleanMoney: prev.cleanMoney + data.moneyChange,
              }
            : null
        );

        // Check what's on the new position
        const cell = getCellByIndex(data.newPosition);

        if (cell.type === 'property') {
          // Check if property is available
          const property = getPropertyCells().find((p) => p.index === data.newPosition);
          if (property) {
            setSelectedCell(property);
            setShowBuyModal(true);
          }
        } else if (cell.type === 'draw_takdir') {
          // Draw takdir card
          const card = drawRandomCard();
          broadcastCard({
            cardId: card.id,
            drawnBy: currentPlayer.id,
            playerName: currentPlayer.name,
          });
        } else if (cell.type === 'draw_kegiatan') {
          // Draw kegiatan card
          const card = drawRandomCard();
          broadcastCard({
            cardId: card.id,
            drawnBy: currentPlayer.id,
            playerName: currentPlayer.name,
          });
        }
      } catch (err) {
        console.error('Roll dice error:', err);
      }
    },
    [currentPlayer, room, broadcastCard]
  );

  // Handle buy property
  const handleBuyProperty = useCallback(async () => {
    if (!currentPlayer || !room || !selectedCell) return;

    try {
      const response = await fetch('/api/buy-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          playerId: currentPlayer.id,
          boardIndex: selectedCell.index,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update local state
      setCurrentPlayer((prev) =>
        prev
          ? {
              ...prev,
              cleanMoney: data.newBalance,
              properties: [...(prev.properties || []), data.property.id],
            }
          : null
      );

      setShowBuyModal(false);
      setSelectedCell(null);
    } catch (err) {
      console.error('Buy property error:', err);
    }
  }, [currentPlayer, room, selectedCell]);

  // Handle end turn
  const handleEndTurn = useCallback(async () => {
    if (!currentPlayer || !room) return;

    try {
      const response = await fetch('/api/end-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          playerId: currentPlayer.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update local state
      setCurrentPlayer((prev) =>
        prev
          ? {
              ...prev,
              cleanMoney: data.newBalance,
            }
          : null
      );

      setLastRoll(null);
    } catch (err) {
      console.error('End turn error:', err);
    }
  }, [currentPlayer, room]);

  // Handle cell click
  const handleCellClick = useCallback((cell: BoardCell) => {
    setSelectedCell(cell);
  }, []);

  // Handle reaction
  const handleReaction = useCallback(
    (reaction: string) => {
      if (currentPlayer) {
        broadcastReaction(currentPlayer.id, reaction);
      }
    },
    [currentPlayer, broadcastReaction]
  );

  // Handle dismiss card
  const handleDismissCard = useCallback(() => {
    broadcastDismiss();
  }, [broadcastDismiss]);

  // Loading state
  if (!currentPlayer || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-green-950 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">MONOPOLI WNI</h1>
            <p className="text-green-200 text-sm">Room: {roomCode}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">Giliran: {players.find((p) => p.id === room.turnOrder[room.currentTurn])?.name || '...'}</p>
            <p className="text-green-200 text-sm">Putaran: {room.currentTurn + 1}/{room.turnOrder.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Players */}
        <div className="lg:w-64 space-y-2">
          {players.map((player) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isActive={room.turnOrder[room.currentTurn] === player.id}
              onRollDice={
                room.turnOrder[room.currentTurn] === player.id
                  ? handleRollDice
                  : undefined
              }
              onEndTurn={
                room.turnOrder[room.currentTurn] === player.id
                  ? handleEndTurn
                  : undefined
              }
            />
          ))}
        </div>

        {/* Center - Board */}
        <div className="flex-1">
          <Board
            players={players.map((p) => ({
              id: p.id,
              position: p.position,
              tokenColor: p.tokenColor || '#3b82f6',
              name: p.name,
            }))}
            onCellClick={handleCellClick}
          />

          {/* Current Player Actions */}
          {isMyTurn && (
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={handleRollDice}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                🎲 LEMPAR DADU
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="lg:w-64">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <h3 className="font-bold mb-2">Status Game</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-200">Pot:</span>
                <span className="font-bold">
                  Rp{(room.potMoney || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-200">Pemain:</span>
                <span className="font-bold">{players.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DiceRollModal
        isOpen={showDiceModal}
        onClose={() => setShowDiceModal(false)}
        onRollComplete={handleDiceRollComplete}
      />

      {selectedCell && (
        <BuyPropertyModal
          isOpen={showBuyModal}
          cell={selectedCell}
          playerMoney={currentPlayer.cleanMoney}
          onBuy={handleBuyProperty}
          onSkip={() => {
            setShowBuyModal(false);
            setSelectedCell(null);
          }}
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
