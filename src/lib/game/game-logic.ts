import { PlayerStats, Evidence, RollResult, LuckEvent, DirtySource, Card, KegiatanCard, Player, StatusEffect, CardType } from '../types';
import { getPropertyCells } from './board-data';

// ============================================================
// GAME LOGIC - Stats, Evidence, Roll System
// ============================================================

// --- CARD TYPE HELPER ---
export function getCardType(card: Card): CardType {
  if (card.cardType) return card.cardType;
  // Derive from effect: negative value = debuff, positive = buff, special/interaction/role = takdir
  if (card.effect.type === 'money') {
    return (card.effect.value || 0) < 0 ? 'debuff' : 'buff';
  }
  if (card.effect.type === 'skip') return 'debuff';
  return 'takdir';
}

// --- DICE ROLL ---
export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

// --- ROLL SYSTEM ---
export function performAction(
  stat: number,
  evidenceBonus: number,
  dc: number,
  diceSides: number = 20
): RollResult {
  const dice = rollDice(diceSides);
  const total = dice + stat + evidenceBonus;

  return {
    dice,
    stat,
    evidenceBonus,
    total,
    dc,
    success: total >= dc,
  };
}

// --- EVIDENCE SYSTEM ---
export const EVIDENCE_TYPES = {
  screenshot: { bonusModifier: 2, description: 'Screenshot transfer/chat' },
  witness: { bonusModifier: 3, description: 'Saksi mata' },
  document: { bonusModifier: 4, description: 'Dokumen bukti' },
  bank_statement: { bonusModifier: 5, description: 'Rekening koran' },
  viral: { bonusModifier: 6, description: 'Viral di media' },
} as const;

export function createEvidence(type: keyof typeof EVIDENCE_TYPES): Evidence {
  return {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    bonusModifier: EVIDENCE_TYPES[type].bonusModifier,
    description: EVIDENCE_TYPES[type].description,
    obtainedAt: Date.now(),
  };
}

export function calculateEvidenceBonus(evidence: Evidence[]): number {
  return evidence.reduce((sum, ev) => sum + ev.bonusModifier, 0);
}

// --- LUCK SYSTEM ---
export function rollLuckFluctuation(): number {
  const roll = rollDice(100);
  if (roll <= 10) return -10;
  if (roll <= 25) return -5;
  if (roll <= 40) return -2;
  if (roll <= 60) return 0;
  if (roll <= 75) return 2;
  if (roll <= 90) return 5;
  return 10;
}

export function updateLuck(currentLuck: number, fluctuation: number): number {
  const newLuck = currentLuck + fluctuation;
  return Math.max(0, Math.min(100, newLuck));
}

export function createLuckEvent(cause: string, amount: number, description: string): LuckEvent {
  return {
    timestamp: Date.now(),
    cause,
    amount,
    description,
  };
}

// --- MONEY SYSTEM ---
export function calculateTotalMoney(cleanMoney: number, dirtyMoney: number): number {
  return cleanMoney + dirtyMoney;
}

export function launderMoney(
  dirtyMoney: number,
  amount: number,
  fee: number = 0.4
): { cleanAmount: number; feeAmount: number } {
  const feeAmount = Math.floor(amount * fee);
  const cleanAmount = amount - feeAmount;
  return { cleanAmount, feeAmount };
}

export function confiscateDirtyMoney(dirtyMoney: number, percentage: number): number {
  return Math.floor(dirtyMoney * (percentage / 100));
}

// --- KEGIATAN OUTCOME ---
export interface KegiatanOutcome {
  money: number;
  luckChange: number;
  outcome: 'positive' | 'negative';
}

export function calculateKegiatanOutcome(
  positive: { money: number; luckBonus?: number },
  negative: { money: number; luckPenalty?: number },
  playerRole: string,
  playerLuck: number,
  roleBonus: Record<string, number>
): KegiatanOutcome {
  // Determine positive or negative based on luck
  const luckRange = getLuckRange(playerLuck);
  const positiveChance = LUCK_TABLE[luckRange];
  const isPositive = Math.random() * 100 < positiveChance;

  // Calculate base money
  const baseMoney = isPositive ? positive.money : negative.money;

  // Apply role bonus
  const roleMultiplier = roleBonus[playerRole] || 1;
  const finalMoney = Math.floor(baseMoney * (1 + roleMultiplier));

  // Apply luck modifier
  const luckModifier = isPositive
    ? Math.floor(finalMoney * (playerLuck / 200))
    : Math.floor(finalMoney * (1 - playerLuck / 200));

  // Calculate luck change
  const luckChange = isPositive
    ? (positive.luckBonus || 0)
    : (negative.luckPenalty || 0);

  return {
    money: finalMoney + luckModifier,
    luckChange,
    outcome: isPositive ? 'positive' : 'negative',
  };
}

const LUCK_TABLE: Record<string, number> = {
  low: 20,     // 0-30
  medium_low: 40,  // 31-50
  medium_high: 60,  // 51-70
  high: 80,    // 71-100
};

function getLuckRange(luck: number): string {
  if (luck <= 30) return 'low';
  if (luck <= 50) return 'medium_low';
  if (luck <= 70) return 'medium_high';
  return 'high';
}

// --- RENT CALCULATION ---
export function calculateRent(
  baseRent: number,
  houseLevel: number,
  groupOwned: boolean
): number {
  let rent = baseRent;
  if (houseLevel > 0) {
    rent = baseRent * (1 + houseLevel * 0.5);
  }
  if (groupOwned) {
    rent *= 2;
  }
  return Math.floor(rent);
}

// --- STATS CALCULATION ---
export function calculateStatModifier(
  baseStat: number,
  luckModifier: number,
  memeRoleBonus?: number
): number {
  let modifier = baseStat;
  // Luck affects stats slightly
  modifier += Math.floor(luckModifier / 20);
  // Meme role bonus
  if (memeRoleBonus) {
    modifier += memeRoleBonus;
  }
  return Math.max(1, modifier);
}

// --- DIRTY MONEY TRACKING ---
export function addDirtySource(
  dirtyHistory: DirtySource[],
  source: string,
  amount: number
): DirtySource[] {
  return [
    ...dirtyHistory,
    {
      source,
      amount,
      timestamp: Date.now(),
    },
  ];
}

// --- DEFENSE OPTIONS ---
export interface DefenseOption {
  type: 'accept' | 'bribe' | 'lawyer' | 'destroy_evidence' | 'scapegoat';
  name: string;
  cost: number;
  description: string;
  statRequired: keyof PlayerStats;
  dcRequired: number;
}

export const DEFENSE_OPTIONS: DefenseOption[] = [
  {
    type: 'accept',
    name: 'Terima Audit',
    cost: 0,
    description: 'Duit kotor disita sesuai kartu',
    statRequired: 'persuasion',
    dcRequired: 0,
  },
  {
    type: 'bribe',
    name: 'Sogok Audit',
    cost: 1000000,
    description: 'Bayar untuk batalkan audit',
    statRequired: 'negotiation',
    dcRequired: 18,
  },
  {
    type: 'lawyer',
    name: 'Pakai Lawyer',
    cost: 1000000,
    description: 'Penalty dikurangi 50%',
    statRequired: 'persuasion',
    dcRequired: 20,
  },
  {
    type: 'destroy_evidence',
    name: 'Buang Bukti',
    cost: 0,
    description: 'Konversi duit kotor ke bersih (fee 40%)',
    statRequired: 'streetSmart',
    dcRequired: 15,
  },
  {
    type: 'scapegoat',
    name: 'Kambing Hitam',
    cost: 300000,
    description: 'Audit dialihkan ke pemain lain',
    statRequired: 'persuasion',
    dcRequired: 22,
  },
];

// --- LAUNDERING ---
export function processLaundering(
  dirtyAmount: number,
  playerStats: PlayerStats,
  evidenceBonus: number
): { success: boolean; cleanAmount: number; fee: number } {
  const roll = performAction(
    playerStats.streetSmart,
    evidenceBonus,
    15,
    20
  );

  if (roll.success) {
    const { cleanAmount, feeAmount } = launderMoney(dirtyAmount, dirtyAmount, 0.4);
    return {
      success: true,
      cleanAmount,
      fee: feeAmount,
    };
  }

  return {
    success: false,
    cleanAmount: 0,
    fee: 0,
  };
}

// ============================================================
// CARD EFFECT PROCESSING
// ============================================================

export interface CardEffectResult {
  updatedPlayer: Player;
  moneyChanges: Array<{ playerId: string; amount: number; label: string }>;
  statusMessages: string[];
  shouldCheckBankruptcy: boolean;
}

export function isPlayerBankrupt(player: Player): boolean {
  return player.cleanMoney <= 0 && player.dirtyMoney <= 0 && !player.isBankrupt;
}

export function checkBankruptcy(player: Player): Player {
  if (isPlayerBankrupt(player)) {
    return {
      ...player,
      isBankrupt: true,
      cleanMoney: 0,
      dirtyMoney: 0,
      properties: [],
      statusEffects: [],
    };
  }
  return player;
}

export function processCardEffect(
  card: Card,
  player: Player,
  gachaRoll: number,
  allPlayers: Player[]
): CardEffectResult {
  const result: CardEffectResult = {
    updatedPlayer: { ...player },
    moneyChanges: [],
    statusMessages: [],
    shouldCheckBankruptcy: false,
  };

  const p = result.updatedPlayer;

  switch (card.effect.type) {
    case 'money':
      processMoneyEffect(card, p, gachaRoll, allPlayers, result);
      break;
    case 'skip':
      processSkipEffect(card, p, allPlayers, result);
      break;
    case 'dice':
      processDiceEffect(card, p, gachaRoll, allPlayers, result);
      break;
    case 'property':
      processPropertyEffect(card, p, allPlayers, result);
      break;
    case 'luck':
      processLuckEffect(card, p, allPlayers, result);
      break;
    case 'special':
      processSpecialEffect(card, p, gachaRoll, allPlayers, result);
      break;
    case 'interaction':
      processInteractionEffect(card, p, gachaRoll, allPlayers, result);
      break;
    case 'role':
      processRoleEffect(card, p, allPlayers, result);
      break;
  }

  // Apply luck modifier from card
  if (card.luckModifier) {
    const lm = card.luckModifier;
    if (lm.isPermanent) {
      p.permanentLuckMods = [...(p.permanentLuckMods || []), lm];
      p.luck = Math.max(0, Math.min(100, p.luck + lm.amount));
    } else {
      p.luck = Math.max(0, Math.min(100, p.luck + lm.amount));
    }
  }

  // Evidence grants from certain cards
  if (card.evidenceGrant && gachaRoll >= 3) {
    const evidence = { id: card.evidenceGrant, type: 'document' as const, bonusModifier: card.evidenceBonus || 1, description: card.name, obtainedAt: Date.now() };
    p.evidence = [...(p.evidence || []), evidence];
    result.statusMessages.push(`Bukti diperoleh: ${card.evidenceGrant}`);
  }

  return result;
}

function processMoneyEffect(
  card: Card, p: Player, gachaRoll: number,
  allPlayers: Player[], result: CardEffectResult
) {
  const value = card.effect.value || 0;
  const target = card.effect.target || 'self';
  const special = card.effect.special || '';
  const isKoruptor = card.category === 'koruptor';

  if (target === 'self') {
    // Direct money change to self — koruptor cards add to dirtyMoney
    if (isKoruptor && value > 0) {
      p.dirtyMoney = Math.max(0, p.dirtyMoney + value);
      result.statusMessages.push(`+Rp ${value.toLocaleString('id-ID')} duit kotor dari ${card.name}`);
    } else {
      p.cleanMoney = Math.max(0, p.cleanMoney + value);
    }
    if (value > 0 && !isKoruptor) {
      result.statusMessages.push(`+Rp ${value.toLocaleString('id-ID')} dari ${card.name}`);
    } else if (value < 0) {
      result.statusMessages.push(`-Rp ${Math.abs(value).toLocaleString('id-ID')} untuk ${card.name}`);
      result.shouldCheckBankruptcy = true;
    }
    result.moneyChanges.push({ playerId: p.id, amount: value, label: card.name });
  } else if (target === 'all') {
    // All players get the same effect
    for (const other of allPlayers) {
      result.moneyChanges.push({ playerId: other.id, amount: value, label: card.name });
    }
    if (value > 0) {
      result.statusMessages.push(`Semua pemain +Rp ${value.toLocaleString('id-ID')}`);
    } else {
      result.statusMessages.push(`Semua pemain -Rp ${Math.abs(value).toLocaleString('id-ID')}`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (target === 'random') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const targetPlayer = others[Math.floor(Math.random() * others.length)];
      result.moneyChanges.push({ playerId: targetPlayer.id, amount: value, label: card.name });
      result.statusMessages.push(`${targetPlayer.name} ${value > 0 ? 'menerima' : 'membayar'} Rp ${Math.abs(value).toLocaleString('id-ID')}`);
    }
  }

  // Handle specials for money cards
  if (special === 'bayar_pajak_30persen') {
    const tax = Math.floor(p.cleanMoney * 0.3);
    p.cleanMoney = Math.max(0, p.cleanMoney - tax);
    result.moneyChanges.push({ playerId: p.id, amount: -tax, label: 'Pajak 30%' });
    result.statusMessages.push(`Bayar pajak 30%: -Rp ${tax.toLocaleString('id-ID')}`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'semua_pemain_plus500rb') {
    for (const other of allPlayers) {
      if (other.id !== p.id) {
        result.moneyChanges.push({ playerId: other.id, amount: 500000, label: card.name });
      }
    }
    result.statusMessages.push(`Semua pemain lain +Rp 500.000`);
  } else if (special === 'bayar_20persen_saldo') {
    const penalty = Math.floor(p.cleanMoney * 0.2);
    p.cleanMoney = Math.max(0, p.cleanMoney - penalty);
    result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Ditagih Invoice' });
    result.statusMessages.push(`Bayar 20% saldo: -Rp ${penalty.toLocaleString('id-ID')}`);
    result.shouldCheckBankruptcy = true;
  } else if (special === '20persen_plus500rb') {
    const bonus = Math.floor(p.cleanMoney * 0.2) + 500000;
    p.cleanMoney += bonus;
    result.moneyChanges.push({ playerId: p.id, amount: bonus, label: 'Pedagang Lima Ribu' });
    result.statusMessages.push(`Pedagang lima ribu! +Rp ${bonus.toLocaleString('id-ID')} (20% saldo + 500rb)`);
  } else if (special.startsWith('luck_') && isKoruptor) {
    // Koruptor card specials — apply luck penalty and side effects
    const luckMatch = special.match(/luck_(\d+)/);
    const luckPenalty = luckMatch ? parseInt(luckMatch[1]) : 20;
    p.luck = Math.max(0, p.luck - luckPenalty);
    result.statusMessages.push(`Hoki -${luckPenalty} karena korupsi!`);

    if (special.includes('semua_plus500rb')) {
      for (const other of allPlayers) {
        if (other.id !== p.id) {
          other.cleanMoney = Math.max(0, other.cleanMoney + 500000);
          result.moneyChanges.push({ playerId: other.id, amount: 500000, label: 'Korupsi sharing' });
        }
      }
      result.statusMessages.push(`Semua pemain +Rp 500.000 (syaratWF)`);
    } else if (special.includes('semua_plus300rb')) {
      for (const other of allPlayers) {
        if (other.id !== p.id) {
          other.cleanMoney = Math.max(0, other.cleanMoney + 300000);
          result.moneyChanges.push({ playerId: other.id, amount: 300000, label: 'Korupsi sharing' });
        }
      }
      result.statusMessages.push(`Semua pemain +Rp 300.000`);
    } else if (special.includes('semua_plus200rb')) {
      for (const other of allPlayers) {
        if (other.id !== p.id) {
          other.cleanMoney = Math.max(0, other.cleanMoney + 200000);
          result.moneyChanges.push({ playerId: other.id, amount: 200000, label: 'Korupsi sharing' });
        }
      }
      result.statusMessages.push(`Semua pemain +Rp 200.000`);
    } else if (special.includes('semua_plus1jt')) {
      for (const other of allPlayers) {
        if (other.id !== p.id) {
          other.cleanMoney = Math.max(0, other.cleanMoney + 1000000);
          result.moneyChanges.push({ playerId: other.id, amount: 1000000, label: 'Korupsi sharing' });
        }
      }
      result.statusMessages.push(`Semua pemain +Rp 1.000.000`);
    } else if (special.includes('semua_plus400rb')) {
      for (const other of allPlayers) {
        if (other.id !== p.id) {
          other.cleanMoney = Math.max(0, other.cleanMoney + 400000);
          result.moneyChanges.push({ playerId: other.id, amount: 400000, label: 'Korupsi sharing' });
        }
      }
      result.statusMessages.push(`Semua pemain +Rp 400.000`);
    }

    if (special.includes('bayar_1jt')) {
      const penalty = 1000000;
      p.cleanMoney = Math.max(0, p.cleanMoney - penalty);
      result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Denda korupsi' });
      result.statusMessages.push(`Bayar denda: -Rp ${penalty.toLocaleString('id-ID')}`);
      result.shouldCheckBankruptcy = true;
    } else if (special.includes('bayar_2jt')) {
      const penalty = 2000000;
      p.cleanMoney = Math.max(0, p.cleanMoney - penalty);
      result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Denda korupsi' });
      result.statusMessages.push(`Bayar denda: -Rp ${penalty.toLocaleString('id-ID')}`);
      result.shouldCheckBankruptcy = true;
    } else if (special.includes('bayar_500rb')) {
      const penalty = 500000;
      p.cleanMoney = Math.max(0, p.cleanMoney - penalty);
      result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Denda korupsi' });
      result.statusMessages.push(`Bayar denda: -Rp ${penalty.toLocaleString('id-ID')}`);
      result.shouldCheckBankruptcy = true;
    }

    // Handle property-specific koruptor effects
    if (special.includes('1_properti_disita') && p.properties.length > 0) {
      const seizedProp = p.properties[Math.floor(Math.random() * p.properties.length)];
      p.properties = p.properties.filter(prop => prop !== seizedProp);
      result.statusMessages.push(`Properti "${seizedProp}" disita oleh KPK!`);
    }
    if (special.includes('2_properti_50') && p.properties.length > 0) {
      const count = Math.min(2, p.properties.length);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * p.properties.length);
        const prop = p.properties[idx];
        p.properties.splice(idx, 1);
        result.statusMessages.push(`Properti "${prop}" dijual paksa 50%!`);
      }
    }
    if (special.includes('semua_dapat_properti_gratis')) {
      // Give each player a free property
      for (const other of allPlayers) {
        result.moneyChanges.push({ playerId: other.id, amount: 0, label: 'Properti gratis korupsi' });
      }
      result.statusMessages.push(`Semua pemain dapat properti gratis dari korupsi!`);
    }
    if (special.includes('ke_pemain_luck_tertinggi')) {
      // Pay 2M to player with highest luck
      const highestLuckPlayer = [...allPlayers].filter(o => o.id !== p.id).sort((a, b) => b.luck - a.luck)[0];
      if (highestLuckPlayer) {
        const penalty = 2000000;
        p.cleanMoney = Math.max(0, p.cleanMoney - penalty);
        highestLuckPlayer.cleanMoney += penalty;
        result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Bayar ke pemain beruntung' });
        result.moneyChanges.push({ playerId: highestLuckPlayer.id, amount: penalty, label: 'Diterima dari koruptor' });
        result.statusMessages.push(`Bayar Rp 2.000.000 ke ${highestLuckPlayer.name} (luck tertinggi)!`);
        result.shouldCheckBankruptcy = true;
      }
    }
    if (special.includes('3_pemain_random')) {
      // Pay 500k to 3 random players
      const others = allPlayers.filter(o => o.id !== p.id);
      const shuffled = [...others].sort(() => Math.random() - 0.5);
      const targets = shuffled.slice(0, Math.min(3, shuffled.length));
      for (const target of targets) {
        const penalty = 500000;
        p.cleanMoney = Math.max(0, p.cleanMoney - penalty);
        target.cleanMoney += penalty;
        result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Bagi korupsi' });
        result.moneyChanges.push({ playerId: target.id, amount: penalty, label: 'Diterima dari koruptor' });
      }
      result.statusMessages.push(`Bayar Rp 500.000 ke 3 pemain random!`);
      result.shouldCheckBankruptcy = true;
    }
  }
}

function processSkipEffect(
  card: Card, p: Player, allPlayers: Player[], result: CardEffectResult
) {
  const skipTurns = card.effect.value || 1;
  const special = card.effect.special || '';

  // Add skip_turn status
  const existingSkip = p.statusEffects.find(e => e.type === 'skip_turn');
  if (existingSkip) {
    existingSkip.duration += skipTurns;
  } else {
    p.statusEffects = [...p.statusEffects, {
      type: 'skip_turn',
      duration: skipTurns,
      effect: `Skip ${skipTurns} putaran: ${card.name}`,
    }];
  }
  result.statusMessages.push(`Skip ${skipTurns} putaran!`);

  // Handle specials
  if (special === 'bayar_200rb') {
    p.cleanMoney = Math.max(0, p.cleanMoney - 200000);
    result.moneyChanges.push({ playerId: p.id, amount: -200000, label: 'Bayar mogok' });
    result.statusMessages.push(`Bayar Rp 200.000 untuk biaya mogok`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'dapat_500rb') {
    p.cleanMoney += 500000;
    result.moneyChanges.push({ playerId: p.id, amount: 500000, label: 'Bonus emak driver' });
    result.statusMessages.push(`Dapat Rp 500.000`);
  } else if (special === 'minus_200rb') {
    p.cleanMoney = Math.max(0, p.cleanMoney - 200000);
    result.moneyChanges.push({ playerId: p.id, amount: -200000, label: 'Ghosting penalty' });
    result.statusMessages.push(`Kehilangan Rp 200.000`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'atau_skip_1') {
    // Player already loses money from card, but also gets skipped
    result.statusMessages.push(`Bayar atau skip 1 giliran!`);
  }
}

function processDiceEffect(
  card: Card, p: Player, gachaRoll: number,
  allPlayers: Player[], result: CardEffectResult
) {
  const special = card.effect.special || '';

  if (special === 'genap_x2_ganjil_80persen') {
    if (gachaRoll % 2 === 0) {
      p.cleanMoney = Math.max(0, p.cleanMoney * 2);
      result.statusMessages.push(`Dadu genap! Uang x2!`);
    } else {
      const loss = Math.floor(p.cleanMoney * 0.8);
      p.cleanMoney = Math.max(0, p.cleanMoney - loss);
      result.moneyChanges.push({ playerId: p.id, amount: -loss, label: 'Investasi Bodong' });
      result.statusMessages.push(`Dadu ganjil! Kehilangan 80% uang!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'genap_plus3jt_ganjil_minus2jt') {
    if (gachaRoll % 2 === 0) {
      p.cleanMoney += 3000000;
      result.moneyChanges.push({ playerId: p.id, amount: 3000000, label: 'Crypto moonshot' });
      result.statusMessages.push(`Crypto moonshot! +Rp 3.000.000`);
    } else {
      p.cleanMoney = Math.max(0, p.cleanMoney - 2000000);
      result.moneyChanges.push({ playerId: p.id, amount: -2000000, label: 'Crypto rugpull' });
      result.statusMessages.push(`Crypto rugpull! -Rp 2.000.000`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'roll_2x_pilih_terbaik') {
    // Virtual: player rolls twice, take better result (applied as money bonus)
    const bonus = Math.max(gachaRoll * 100000, 500000);
    p.cleanMoney += bonus;
    result.moneyChanges.push({ playerId: p.id, amount: bonus, label: 'Viral Challenge' });
    result.statusMessages.push(`Viral challenge berhasil! +Rp ${bonus.toLocaleString('id-ID')}`);
  } else if (special === 'ganda_x2_tapi_gagal_bayar_200rb') {
    // Knalpot racing: dice x2, but fail = pay 200k
    if (gachaRoll >= 4) {
      result.statusMessages.push(`Knalpot racing berhasil! Dadu berikutnya x2`);
    } else {
      p.cleanMoney = Math.max(0, p.cleanMoney - 200000);
      result.moneyChanges.push({ playerId: p.id, amount: -200000, label: 'Knalpot racing gagal' });
      result.statusMessages.push(`Knalpot racing gagal! Bayar Rp 200.000`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'batalkan_dadu_pemain_lain') {
    // MK card: cancel another player's dice (mark for reroll)
    result.statusMessages.push(`Dadu pemain lain dibatalkan! Harus roll ulang.`);
  } else if (special === '3x_dadu_permanen') {
    // Infinity Stone: triple dice permanently
    p.statusEffects = [...p.statusEffects, {
      type: 'triple_dice',
      duration: 999,
      effect: 'Dadu x3 permanen (Infinity Stone)',
    }];
    result.statusMessages.push(`Dadu x3 permanen!`);
  }
}

function processPropertyEffect(
  card: Card, p: Player, allPlayers: Player[], result: CardEffectResult
) {
  const special = card.effect.special || '';

  if (special === 'pilih_1_properti_gratis') {
    const propertyCells = getPropertyCells();
    const unownedCell = propertyCells.find(c => c.type === 'property' && c.price && c.price > 0);
    if (unownedCell) {
      p.properties = [...(p.properties || []), unownedCell.name];
      result.statusMessages.push(`Bapakmu Presiden! Mendapat properti "${unownedCell.name}" gratis!`);
    } else {
      result.statusMessages.push(`Bapakmu Presiden! Tidak ada properti tersedia.`);
    }
  } else if (special === 'diskon_15persen') {
    p.statusEffects = [...p.statusEffects, {
      type: 'discount',
      duration: 3,
      effect: 'Diskon 15% properti berikutnya',
    }];
    result.statusMessages.push(`Diskon 15% properti berikutnya berlaku 3 giliran!`);
  } else if (special === '3_properti_nilai_0') {
    const props = [...(p.properties || [])];
    const affected = props.slice(0, 3);
    affected.forEach(propName => {
      p.statusEffects = [...p.statusEffects, {
        type: 'property_value_zero',
        duration: 999,
        effect: `"${propName}" nilainya jadi 0 (Sertifikat Palsu)`,
      }];
      result.statusMessages.push(`Properti "${propName}" nilainya jadi 0!`);
    });
  } else if (special === 'semua_properti_murah_gratis') {
    p.statusEffects = [...p.statusEffects, {
      type: 'discount',
      duration: 5,
      effect: 'Semua properti jadi murah/gratis (Mogul Gosek)',
    }];
    result.statusMessages.push(`Semua properti jadi murah/gratis selama 5 giliran!`);
  }
}

function processLuckEffect(
  card: Card, p: Player, allPlayers: Player[], result: CardEffectResult
) {
  const value = card.effect.value || 0;
  p.luck = Math.max(0, Math.min(100, p.luck + value));
  if (value > 0) {
    result.statusMessages.push(`Keberuntungan +${value}!`);
  } else {
    result.statusMessages.push(`Keberuntungan ${value}!`);
  }
}

function processSpecialEffect(
  card: Card, p: Player, gachaRoll: number,
  allPlayers: Player[], result: CardEffectResult
) {
  const special = card.effect.special || '';

  if (special === 'random_1_pemain_sita_50_duit_kotor') {
    // Audit: seize 50% dirty money from a random player
    const targets = allPlayers.filter(o => o.dirtyMoney > 0);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const seized = Math.floor(target.dirtyMoney * 0.5);
      result.moneyChanges.push({ playerId: target.id, amount: -seized, label: 'Audit Mendadak' });
      result.statusMessages.push(`${target.name} disita ${seized.toLocaleString('id-ID')} uang kotor!`);
    }
  } else if (special === 'semua_pemain_bayar_10_saldo') {
    // Tax Audit: all players pay 10% of balance
    for (const other of allPlayers) {
      const penalty = Math.floor(other.cleanMoney * 0.1);
      if (penalty > 0) {
        result.moneyChanges.push({ playerId: other.id, amount: -penalty, label: 'Tax Audit' });
      }
    }
    result.statusMessages.push(`Tax audit! Semua pemain bayar 10% saldo.`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'pemain_duit_kotor_terbanyak_sita_semua') {
    // KPK: seize ALL dirty money from player with most dirty money
    let target = allPlayers[0];
    for (const other of allPlayers) {
      if (other.dirtyMoney > target.dirtyMoney) target = other;
    }
    if (target.dirtyMoney > 0) {
      result.moneyChanges.push({ playerId: target.id, amount: -target.dirtyMoney, label: 'KPK Datang' });
      result.statusMessages.push(`${target.name} disita semua uang kotor!`);
    }
  } else if (special === 'random_2_pemain_sita_75_duit_kotor') {
    const targets = allPlayers.filter(o => o.dirtyMoney > 0).sort(() => Math.random() - 0.5).slice(0, 2);
    for (const target of targets) {
      const seized = Math.floor(target.dirtyMoney * 0.75);
      result.moneyChanges.push({ playerId: target.id, amount: -seized, label: 'Sidak BPK' });
      result.statusMessages.push(`${target.name} disita 75% uang kotor!`);
    }
  } else if (special === 'random_1_pemain_bayar_20_duit_kotor') {
    const targets = allPlayers.filter(o => o.dirtyMoney > 0);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const penalty = Math.floor(target.dirtyMoney * 0.2);
      result.moneyChanges.push({ playerId: target.id, amount: -penalty, label: 'Inspeksi Dadakan' });
      result.statusMessages.push(`${target.name} bayar 20% uang kotor!`);
    }
  } else if (special === 'lihat_3_kartu_pilih_1') {
    result.statusMessages.push(`Melihat 3 kartu, pilih 1 yang terbaik!`);
  } else if (special === 'properti_premium_naik_10') {
    result.statusMessages.push(`Properti premium naik 10%!`);
  } else if (special === 'negotiation_plus2_permanen') {
    p.stats = { ...p.stats, negotiation: (p.stats.negotiation || 0) + 2 };
    result.statusMessages.push(`Negotiation +2 permanen!`);
  } else if (special === 'sembunyikan_kas_3_babak') {
    p.statusEffects = [...p.statusEffects, {
      type: 'hidden_cash',
      duration: 3,
      effect: 'Kas disembunyikan selama 3 babak',
    }];
    result.statusMessages.push(`Kas disembunyikan selama 3 babak!`);
  } else if (special === 'bayar_30_persen_duit_kotor') {
    const penalty = Math.floor(p.dirtyMoney * 0.3);
    p.dirtyMoney = Math.max(0, p.dirtyMoney - penalty);
    result.moneyChanges.push({ playerId: p.id, amount: -penalty, label: 'Bea Cukai' });
    result.statusMessages.push(`Bayar 30% uang kotor: -Rp ${penalty.toLocaleString('id-ID')}`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'semua_dirty_money_disita_plus_denda_100rb') {
    const seized = p.dirtyMoney;
    p.dirtyMoney = 0;
    p.cleanMoney = Math.max(0, p.cleanMoney - 100000);
    result.moneyChanges.push({ playerId: p.id, amount: -100000, label: 'KPK Datang' });
    result.statusMessages.push(`Semua uang kotor disita + denda Rp 100.000!`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'presiden_tiktok_unlimited_income_3_turn') {
    p.statusEffects = [...p.statusEffects, {
      type: 'unlimited_income',
      duration: 3,
      effect: 'Income unlimited 3 giliran',
    }];
    result.statusMessages.push(`Presiden TikTok! Income unlimited 3 giliran!`);
  } else if (special === 'semua_pemain_minus_1jt') {
    for (const other of allPlayers) {
      result.moneyChanges.push({ playerId: other.id, amount: -1000000, label: 'Dukun Political' });
    }
    result.statusMessages.push(`Semua pemain -Rp 1.000.000!`);
    result.shouldCheckBankruptcy = true;
  } else if (special === 'income_x2_permanen') {
    p.statusEffects = [...p.statusEffects, {
      type: 'double_income',
      duration: 999,
      effect: 'Income x2 permanen',
    }];
    result.statusMessages.push(`Income x2 permanen!`);
  } else if (special === 'kembali_0_plus_3jt') {
    p.position = 0;
    p.cleanMoney += 3000000;
    result.moneyChanges.push({ playerId: p.id, amount: 3000000, label: 'Time Traveler' });
    result.statusMessages.push(`Kembali ke Start! +Rp 3.000.000`);
  } else if (special === '1_pemain_bankrupt_minus_5jt_luck_20') {
    // Black Hole: player with lowest money goes bankrupt
    const sorted = [...allPlayers].sort((a, b) => (a.cleanMoney + a.dirtyMoney) - (b.cleanMoney + b.dirtyMoney));
    if (sorted.length > 0) {
      const target = sorted[0];
      target.isBankrupt = true;
      target.cleanMoney = 0;
      target.dirtyMoney = 0;
      target.properties = [];
      target.luck = Math.max(0, target.luck - 20);
      result.statusMessages.push(`${target.name} masuk Black Hole! Bankrupt!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'kas_x3_tapi_dicurigai_kpk_3_babak') {
    // Uang Gaib: money x3 but flagged by KPK for 3 rounds
    p.cleanMoney += card.effect.value || 0;
    p.dirtyMoney = Math.floor(p.dirtyMoney + (card.effect.value || 0) * 0.7);
    p.statusEffects = [...p.statusEffects, {
      type: 'kpk_suspicion',
      duration: 3,
      effect: 'Dicurigai KPK - 30% uang kotor bisa disita tiap babak',
    }];
    result.moneyChanges.push({ playerId: p.id, amount: card.effect.value || 0, label: 'Uang Gaib' });
    result.statusMessages.push(`Uang Gaib! +Rp ${(card.effect.value || 0).toLocaleString('id-ID')} tapi dicurigai KPK 3 babak!`);
  }
}

function processInteractionEffect(
  card: Card, p: Player, gachaRoll: number,
  allPlayers: Player[], result: CardEffectResult
) {
  const value = card.effect.value || 0;
  const special = card.effect.special || '';

  if (special === 'target_bayar_ke_draw') {
    // Random target pays to card drawer
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      const amount = value;
      result.moneyChanges.push({ playerId: target.id, amount: -amount, label: card.name });
      result.moneyChanges.push({ playerId: p.id, amount: amount, label: card.name });
      result.statusMessages.push(`${target.name} membayar Rp ${amount.toLocaleString('id-ID')} ke ${p.name}`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target mundur 3 langkah') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.position = (target.position - 3 + 40) % 40;
      result.statusMessages.push(`${target.name} mundur 3 langkah!`);
    }
  } else if (special === 'target_rent_freeze_2_babak') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'rent_frozen',
        duration: 2,
        effect: 'Properti sewa gratis 2 babak',
      }];
      result.statusMessages.push(`Properti ${target.name} sewa gratis 2 babak!`);
    }
  } else if (special === 'curi_30_persen_kas_target') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      const stolen = Math.floor(target.cleanMoney * 0.3);
      target.cleanMoney = Math.max(0, target.cleanMoney - stolen);
      p.cleanMoney += stolen;
      result.moneyChanges.push({ playerId: target.id, amount: -stolen, label: 'Hack Rekening' });
      result.moneyChanges.push({ playerId: p.id, amount: stolen, label: 'Hack Rekening' });
      result.statusMessages.push(`Mencuri 30% kas dari ${target.name}!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_bayar_50_persen_kas_ke_kamu') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      const amount = Math.floor(target.cleanMoney * 0.5);
      target.cleanMoney = Math.max(0, target.cleanMoney - amount);
      p.cleanMoney += amount;
      result.moneyChanges.push({ playerId: target.id, amount: -amount, label: 'Debt Collector' });
      result.moneyChanges.push({ playerId: p.id, amount, label: 'Debt Collector' });
      result.statusMessages.push(`${target.name} membayar 50% kas ke ${p.name}!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'curi_20_persen_kas_dari_pemain_kaya') {
    const others = allPlayers.filter(o => o.id !== p.id).sort((a, b) => b.cleanMoney - a.cleanMoney);
    if (others.length > 0) {
      const target = others[0];
      const stolen = Math.floor(target.cleanMoney * 0.2);
      target.cleanMoney = Math.max(0, target.cleanMoney - stolen);
      p.cleanMoney += stolen;
      result.moneyChanges.push({ playerId: target.id, amount: -stolen, label: 'Operasi Senyap' });
      result.moneyChanges.push({ playerId: p.id, amount: stolen, label: 'Operasi Senyap' });
      result.statusMessages.push(`Mencuri 20% kas dari ${target.name} (pemain terkaya)!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_skip_1_turn') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'skip_turn',
        duration: 1,
        effect: `Skip 1 putaran: ${card.name}`,
      }];
      result.statusMessages.push(`${target.name} skip 1 putaran!`);
    }
  } else if (special === 'target_skip_1_plus_bayar_200rb') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'skip_turn',
        duration: 1,
        effect: `Skip 1 putaran: ${card.name}`,
      }];
      target.cleanMoney = Math.max(0, target.cleanMoney - 200000);
      result.moneyChanges.push({ playerId: target.id, amount: -200000, label: card.name });
      result.statusMessages.push(`${target.name} skip 1 putaran + bayar Rp 200.000!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_skip_plus_minus_100rb_luck') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'skip_turn',
        duration: 1,
        effect: `Skip 1 putaran: ${card.name}`,
      }];
      target.cleanMoney = Math.max(0, target.cleanMoney - 100000);
      target.luck = Math.max(0, target.luck - 5);
      result.moneyChanges.push({ playerId: target.id, amount: -100000, label: card.name });
      result.statusMessages.push(`${target.name} skip + bayar Rp 100.000 + luck -5!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_bayar_500rb_atau_skip') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      if (target.cleanMoney >= 500000) {
        target.cleanMoney -= 500000;
        result.moneyChanges.push({ playerId: target.id, amount: -500000, label: 'FOMO Konser' });
        result.statusMessages.push(`${target.name} bayar Rp 500.000 untuk konser!`);
      } else {
        target.statusEffects = [...target.statusEffects, {
          type: 'skip_turn',
          duration: 1,
          effect: 'Skip: FOMO Konser',
        }];
        result.statusMessages.push(`${target.name} skip 1 putaran (FOMO Konser)!`);
      }
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_bayar_300rb_plus_skip') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.cleanMoney = Math.max(0, target.cleanMoney - 300000);
      target.statusEffects = [...target.statusEffects, {
        type: 'skip_turn',
        duration: 1,
        effect: 'Skip: Kena Tilang',
      }];
      result.moneyChanges.push({ playerId: target.id, amount: -300000, label: 'Kena Tilang' });
      result.statusMessages.push(`${target.name} bayar Rp 300.000 + skip 1 putaran!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_bayar_200rb_plus_luck_5') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.cleanMoney = Math.max(0, target.cleanMoney - 200000);
      target.luck = Math.max(0, target.luck - 5);
      result.moneyChanges.push({ playerId: target.id, amount: -200000, label: 'WFH Zoom Crash' });
      result.statusMessages.push(`${target.name} bayar Rp 200.000 + luck -5!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_bayar_300rb_plus_luck_10') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.cleanMoney = Math.max(0, target.cleanMoney - 300000);
      target.luck = Math.max(0, target.luck - 10);
      result.moneyChanges.push({ playerId: target.id, amount: -300000, label: 'Drama Queen Burnout' });
      result.statusMessages.push(`${target.name} bayar Rp 300.000 + luck -10!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_bayar_400rb_plus_luck_8') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.cleanMoney = Math.max(0, target.cleanMoney - 400000);
      target.luck = Math.max(0, target.luck - 8);
      result.moneyChanges.push({ playerId: target.id, amount: -400000, label: 'Bocah TikTok Cancel' });
      result.statusMessages.push(`${target.name} bayar Rp 400.000 + luck -8!`);
      result.shouldCheckBankruptcy = true;
    }
  } else if (special === 'target_luck_15_permanen') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.luck = Math.max(0, target.luck - 15);
      target.permanentLuckMods = [...(target.permanentLuckMods || []), {
        source: card.name, amount: -15, isPermanent: true,
      }];
      result.statusMessages.push(`${target.name} luck -15 permanen!`);
    }
  } else if (special === 'target_luck_10_permanen') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.luck = Math.max(0, target.luck - 10);
      target.permanentLuckMods = [...(target.permanentLuckMods || []), {
        source: card.name, amount: -10, isPermanent: true,
      }];
      result.statusMessages.push(`${target.name} luck -10 permanen!`);
    }
  } else if (special === 'target_luck_20_permanen') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.luck = Math.max(0, target.luck - 20);
      target.permanentLuckMods = [...(target.permanentLuckMods || []), {
        source: card.name, amount: -20, isPermanent: true,
      }];
      result.statusMessages.push(`${target.name} luck -20 permanen!`);
    }
  } else if (special === 'target_luck_12_permanen') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.luck = Math.max(0, target.luck - 12);
      target.permanentLuckMods = [...(target.permanentLuckMods || []), {
        source: card.name, amount: -12, isPermanent: true,
      }];
      result.statusMessages.push(`${target.name} luck -12 permanen!`);
    }
  } else if (special === 'target_income_50_3_turn') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'income_half',
        duration: 3,
        effect: 'Income -50% selama 3 giliran',
      }];
      result.statusMessages.push(`${target.name} income -50% selama 3 giliran!`);
    }
  } else if (special === '1_properti_dijual_50') {
    // Sita Properti: force sell 1 property at 50%
    if (p.properties.length > 0) {
      const sold = p.properties[0];
      p.properties = p.properties.slice(1);
      result.statusMessages.push(`Properti "${sold}" disita dan dijual!`);
    }
  } else if (special === 'target_pindah_random') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      const randomPos = Math.floor(Math.random() * 40);
      target.position = randomPos;
      result.statusMessages.push(`${target.name} dipindah ke posisi ${randomPos}!`);
    }
  } else if (special === 'properti_level_min_1') {
    result.statusMessages.push(`Properti tetangga level minimal 1!`);
  } else if (special === 'ambil_1_properti_gratis') {
    result.statusMessages.push(`Ambil 1 properti pemain lain gratis!`);
  } else if (special === 'properti_nggak_disewa_1_turn') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'rent_frozen',
        duration: 1,
        effect: 'Properti nggak disewa 1 turn',
      }];
      result.statusMessages.push(`Properti ${target.name} nggak bisa disewa 1 turn!`);
    }
  } else if (special === 'target_nggak_beli_properti_1_turn') {
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      target.statusEffects = [...target.statusEffects, {
        type: 'no_buy',
        duration: 1,
        effect: 'Nggak boleh beli properti 1 turn',
      }];
      result.statusMessages.push(`${target.name} nggak boleh beli properti 1 turn!`);
    }
  } else if (special === '1_properti_hilang') {
    if (p.properties.length > 0) {
      const lost = p.properties[p.properties.length - 1];
      p.properties = p.properties.slice(0, -1);
      result.statusMessages.push(`Properti "${lost}" hilang!`);
    }
  } else if (special === 'sewa_min_50_1_turn') {
    p.statusEffects = [...p.statusEffects, {
      type: 'rent_boost',
      duration: 1,
      effect: 'Sewa properti minimal 50% selama 1 giliran',
    }];
    result.statusMessages.push(`Sewa properti minimal 50% selama 1 giliran!`);
  } else if (special === 'properti_level_min_1') {
    p.statusEffects = [...p.statusEffects, {
      type: 'no_buy',
      duration: 1,
      effect: 'Properti level minimum 1',
    }];
    result.statusMessages.push(`Properti tetangga level minimal 1!`);
  } else if (special === 'semua_bayar_300rb_ke_kamu') {
    for (const other of allPlayers) {
      if (other.id !== p.id) {
        other.cleanMoney = Math.max(0, other.cleanMoney - 300000);
        p.cleanMoney += 300000;
        result.moneyChanges.push({ playerId: other.id, amount: -300000, label: 'Presiden TikTok' });
        result.moneyChanges.push({ playerId: p.id, amount: 300000, label: 'Presiden TikTok' });
      }
    }
    result.statusMessages.push(`Semua pemain bayar Rp 300.000 ke ${p.name}!`);
    result.shouldCheckBankruptcy = true;
  } else if (value > 0 && special === '') {
    // Generic interaction: target pays value to drawer
    const others = allPlayers.filter(o => o.id !== p.id);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      result.moneyChanges.push({ playerId: target.id, amount: -value, label: card.name });
      result.moneyChanges.push({ playerId: p.id, amount: value, label: card.name });
      result.statusMessages.push(`${target.name} membayar Rp ${value.toLocaleString('id-ID')} ke ${p.name}`);
      result.shouldCheckBankruptcy = true;
    }
  }
}

function processRoleEffect(
  card: Card, p: Player, allPlayers: Player[], result: CardEffectResult
) {
  const special = card.effect.special || '';

  if (special === 'presiden_gorong_gorong') {
    p.memeRoleBuff = 'presiden_gorong_gorong';
    p.memeRoleActive = true;
    result.statusMessages.push(`Menjadi Presiden Gorong-Gorong!`);
  } else if (special === 'anak_sultan_role') {
    p.memeRoleBuff = 'anak_sultan';
    p.memeRoleActive = true;
    result.statusMessages.push(`Menjadi Anak Sultan!`);
  }
}

// ============================================================
// KEGIATAN CARD EFFECT PROCESSING
// ============================================================

export interface KegiatanEffectResult {
  updatedPlayer: Player;
  moneyChange: number;
  luckChange: number;
  outcome: 'positive' | 'negative';
  statusMessage: string;
  shouldCheckBankruptcy: boolean;
  specialEffect?: { type: string; value: number };
}

export function processKegiatanEffect(
  card: KegiatanCard,
  player: Player,
  gachaRoll: number,
  passed: boolean
): KegiatanEffectResult {
  const isPositive = passed;

  const outcome = isPositive ? card.positive : card.negative;
  const roleBonus = card.roleBonus[player.selectedRole || player.role] || 0;

  const updatedPlayer = { ...player };

  let moneyChange = 0;
  let luckChange = 0;
  let specialEffect: { type: string; value: number } | undefined;

  if (outcome.special) {
    if (outcome.special === 'hasil_x3') {
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const roll3 = Math.floor(Math.random() * 6) + 1;
      const best = Math.max(roll1, roll2, roll3);
      moneyChange = best * 100000;
      updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
      specialEffect = { type: 'hasil_x3', value: moneyChange };
    } else if (outcome.special === 'hasil_div3') {
      const roll1 = Math.floor(Math.random() * 6) + 1;
      const roll2 = Math.floor(Math.random() * 6) + 1;
      const roll3 = Math.floor(Math.random() * 6) + 1;
      const worst = Math.min(roll1, roll2, roll3);
      moneyChange = -(worst * 50000);
      updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
      specialEffect = { type: 'hasil_div3', value: moneyChange };
    } else if (outcome.special === 'spin_hadiah') {
      const prizes = [100000, 200000, 300000, 500000, 750000, 1000000];
      moneyChange = prizes[Math.floor(Math.random() * prizes.length)];
      updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
      specialEffect = { type: 'spin_hadiah', value: moneyChange };
    } else if (outcome.special === 'spin_denda') {
      const fines = [50000, 100000, 150000, 200000, 300000, 500000];
      moneyChange = -(fines[Math.floor(Math.random() * fines.length)]);
      updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
      specialEffect = { type: 'spin_denda', value: moneyChange };
    } else if (outcome.special === 'random_500rb_5jt') {
      moneyChange = Math.floor(Math.random() * 4500000) + 500000;
      updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
      specialEffect = { type: 'random_500rb_5jt', value: moneyChange };
    } else if (outcome.special === 'random_200rb_2jt') {
      moneyChange = -(Math.floor(Math.random() * 1800000) + 200000);
      updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
      specialEffect = { type: 'random_200rb_2jt', value: moneyChange };
    }
  } else {
    moneyChange = Math.floor(outcome.money * (1 + roleBonus));
    updatedPlayer.cleanMoney = Math.max(0, updatedPlayer.cleanMoney + moneyChange);
  }

  if (isPositive && card.positive.luckBonus) {
    luckChange = card.positive.luckBonus;
    updatedPlayer.luck = Math.max(0, Math.min(100, updatedPlayer.luck + luckChange));
  } else if (!isPositive && card.negative.luckPenalty) {
    luckChange = -card.negative.luckPenalty;
    updatedPlayer.luck = Math.max(0, Math.min(100, updatedPlayer.luck + luckChange));
  }

  let msg: string;
  if (specialEffect) {
    const prefix = isPositive ? 'WIN' : 'LOSE';
    msg = `${card.name} [${prefix}]: ${specialEffect.type.replace(/_/g, ' ')} = Rp ${Math.abs(specialEffect.value).toLocaleString('id-ID')}`;
  } else {
    msg = isPositive
      ? `${card.name}: +Rp ${Math.abs(moneyChange).toLocaleString('id-ID')}`
      : `${card.name}: -Rp ${Math.abs(moneyChange).toLocaleString('id-ID')}`;
  }

  return {
    updatedPlayer,
    moneyChange,
    luckChange,
    outcome: isPositive ? 'positive' : 'negative',
    statusMessage: msg,
    shouldCheckBankruptcy: !isPositive && moneyChange < 0,
    specialEffect,
  };
}
