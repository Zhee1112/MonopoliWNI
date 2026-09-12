import { PlayerStats, Evidence, RollResult, LuckEvent, DirtySource } from '../types';

// ============================================================
// GAME LOGIC - Stats, Evidence, Roll System
// ============================================================

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
