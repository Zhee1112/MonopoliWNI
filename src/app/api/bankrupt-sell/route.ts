import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { mapPlayerFromDB } from '@/lib/types';
import { getPropertyCells } from '@/lib/game/board-data';

// ============================================================
// SELL BANKRUPT PROPERTY API
// POST: Sell a bankrupt player's property to bank or another player
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { roomId, sellerId, propertyName, buyerId } = await request.json();

    if (!roomId || !sellerId || !propertyName) {
      return NextResponse.json(
        { error: 'Room ID, Seller ID, and Property Name are required' },
        { status: 400 }
      );
    }

    // Get seller
    const { data: dbSeller, error: sellerError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('id', sellerId)
      .eq('room_id', roomId)
      .single();

    if (sellerError || !dbSeller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Only bankrupt players can use this route
    if (!dbSeller.is_bankrupt) {
      return NextResponse.json(
        { error: 'Hanya pemain bangkrut yang bisa menjual properti' },
        { status: 403 }
      );
    }

    // Check seller owns the property
    const sellerProps = (dbSeller.properties as string[]) || [];
    if (!sellerProps.includes(propertyName)) {
      return NextResponse.json(
        { error: 'Properti tidak dimiliki seller' },
        { status: 400 }
      );
    }

    if (sellerError || !dbSeller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const seller = mapPlayerFromDB(dbSeller as Record<string, unknown>);

    // Find property cell
    const propertyCells = getPropertyCells();
    const cell = propertyCells.find(c => c.name === propertyName);
    if (!cell) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check seller owns this property
    if (!(seller.properties || []).includes(propertyName)) {
      return NextResponse.json({ error: 'Seller does not own this property' }, { status: 400 });
    }

    // Calculate sell price (50% of buy price)
    const sellPrice = Math.floor((cell.price || 0) * 0.5);

    if (buyerId) {
      // Sell to another player
      const { data: dbBuyer, error: buyerError } = await supabaseAdmin
        .from('players')
        .select('*')
        .eq('id', buyerId)
        .eq('room_id', roomId)
        .single();

      if (buyerError || !dbBuyer) {
        return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
      }

      const buyer = mapPlayerFromDB(dbBuyer as Record<string, unknown>);

      // Check buyer has enough money
      if (buyer.cleanMoney < sellPrice) {
        return NextResponse.json({ error: 'Buyer does not have enough money' }, { status: 400 });
      }

      // Transfer money
      await supabaseAdmin
        .from('players')
        .update({ clean_money: seller.cleanMoney + sellPrice })
        .eq('id', sellerId);

      await supabaseAdmin
        .from('players')
        .update({ clean_money: buyer.cleanMoney - sellPrice })
        .eq('id', buyerId);

      // Transfer property
      const newSellerProps = (seller.properties || []).filter(p => p !== propertyName);
      const newBuyerProps = [...(buyer.properties || []), propertyName];

      await supabaseAdmin
        .from('players')
        .update({ properties: newSellerProps })
        .eq('id', sellerId);

      await supabaseAdmin
        .from('players')
        .update({ properties: newBuyerProps })
        .eq('id', buyerId);

      // Update property owner
      await supabaseAdmin
        .from('properties')
        .update({ owner_id: buyerId })
        .eq('room_id', roomId)
        .eq('board_index', cell.index);

      // Log
      await supabaseAdmin.from('game_log').insert({
        room_id: roomId,
        player_id: sellerId,
        action: 'sell',
        detail: { propertyName, sellPrice, buyerId, buyerName: buyer.name, type: 'bankrupt_sell' },
      });

      return NextResponse.json({
        success: true,
        sellPrice,
        buyerName: buyer.name,
        newSellerBalance: seller.cleanMoney + sellPrice,
        newBuyerBalance: buyer.cleanMoney - sellPrice,
      });
    } else {
      // Sell to bank
      await supabaseAdmin
        .from('players')
        .update({ clean_money: seller.cleanMoney + sellPrice })
        .eq('id', sellerId);

      const newSellerProps = (seller.properties || []).filter(p => p !== propertyName);
      await supabaseAdmin
        .from('players')
        .update({ properties: newSellerProps })
        .eq('id', sellerId);

      // Update property owner to null (bank)
      await supabaseAdmin
        .from('properties')
        .update({ owner_id: null, house_level: 0 })
        .eq('room_id', roomId)
        .eq('board_index', cell.index);

      // Log
      await supabaseAdmin.from('game_log').insert({
        room_id: roomId,
        player_id: sellerId,
        action: 'sell',
        detail: { propertyName, sellPrice, type: 'bankrupt_sell_bank' },
      });

      return NextResponse.json({
        success: true,
        sellPrice,
        newSellerBalance: seller.cleanMoney + sellPrice,
      });
    }
  } catch (error) {
    console.error('Sell bankrupt property error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
