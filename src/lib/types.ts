// ============================================================
// TYPES - MonopoliWNI
// ============================================================

// --- Board Types ---
export type CellType = 'property' | 'corner' | 'event' | 'tax' | 'draw_takdir' | 'draw_kegiatan';

export type PropertyGroup = 'coklat' | 'cyan' | 'kuning' | 'orange' | 'merah' | 'hijau' | 'ungu' | 'transport' | null;

export interface BoardCell {
  index: number;
  name: string;
  subtitle: string;
  type: CellType;
  group: PropertyGroup;
  price: number | null;
  rent: number | null;
  buildingCost: number | null;
  taxAmount?: number | null;
  description: string;
  color: string;
  groupColor: string;
  emoji: string;
}

// --- Role Types ---
export type RoleType = 'normal' | 'meme';

export interface RoleDefinition {
  id: string;
  name: string;
  type: RoleType;
  baseIncome: number;
  incomeType: 'per_turn' | 'per_steps';
  incomeSteps?: number;
  baseLuck: number;
  stats: PlayerStats;
  specialAbility: string;
  flavorText: string;
  progressionChain?: string[];
}

// --- Stats Types ---
export interface PlayerStats {
  negotiation: number;
  investigation: number;
  persuasion: number;
  streetSmart: number;
  charm: number;
}

// --- Luck Types ---
export interface LuckModifier {
  source: string;
  amount: number;
  isPermanent: boolean;
  duration?: number;
}

export interface LuckEvent {
  timestamp: number;
  cause: string;
  amount: number;
  description: string;
}

// --- Money Types ---
export type MoneyType = 'clean' | 'dirty';

export interface DirtySource {
  source: string;
  amount: number;
  timestamp: number;
}

// --- Evidence Types ---
export type EvidenceType = 'screenshot' | 'witness' | 'document' | 'bank_statement' | 'viral';

export interface Evidence {
  id: string;
  type: EvidenceType;
  bonusModifier: number;
  description: string;
  obtainedAt: number;
}

// --- Card Types ---
export type CardTier = 'ringan' | 'sedang' | 'berat' | 'legendary';
export type CardCategory = 'event_normal' | 'event_meme' | 'interaksi' | 'koruptor' | 'audit' | 'legendary';
export type CardType = 'buff' | 'debuff' | 'takdir';
export type KegiatanCategory = 'usaha' | 'kerja_sampingan' | 'investasi' | 'sosial' | 'tantangan';

export interface CardEffect {
  type: 'money' | 'skip' | 'dice' | 'property' | 'luck' | 'special' | 'interaction' | 'role';
  value?: number;
  target?: 'self' | 'all' | 'choose_one' | 'random';
  special?: string;
}

export interface Card {
  id: string;
  name: string;
  tier: CardTier;
  category: CardCategory;
  cardType?: CardType;
  effect: CardEffect;
  luckModifier?: LuckModifier;
  evidenceGrant?: string;
  evidenceBonus?: number;
  frequency: number;
  flavorText: string;
}

export interface KegiatanCard {
  id: string;
  name: string;
  category: KegiatanCategory;
  positive: {
    money: number;
    luckBonus?: number;
    special?: string;
  };
  negative: {
    money: number;
    luckPenalty?: number;
    special?: string;
  };
  roleBonus: Record<string, number>;
  flavorText: string;
}

// --- Roll Types ---
export interface RollResult {
  dice: number;
  stat: number;
  evidenceBonus: number;
  total: number;
  dc: number;
  success: boolean;
}

// --- Player Types (camelCase for frontend, maps from snake_case DB) ---
export interface Player {
  id: string;
  name: string;
  position: number;
  cleanMoney: number;
  dirtyMoney: number;
  totalMoney?: number;
  properties: string[];
  role: string;
  selectedRole: string | null;
  roleLevel: number;
  luck: number;
  permanentLuckMods: LuckModifier[];
  stats: PlayerStats;
  evidence: Evidence[];
  statusEffects: StatusEffect[];
  isBankrupt: boolean;
  isConnected: boolean;
  isReady: boolean;
  tokenColor: string;
  token_color?: string;
  dirtyHistory: DirtySource[];
  memeRoleBuff: string | null;
  memeRoleActive: boolean;
  isBot: boolean;
}

export interface StatusEffect {
  type: string;
  duration: number;
  effect: string;
}

// --- Room Types (camelCase for frontend, maps from snake_case DB) ---
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type GameMode = 'bundir' | 'sultan' | 'kilat';

export const GAME_MODES: Record<GameMode, {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  winCondition: string;
  totalRounds: number;
}> = {
  bundir: {
    id: 'bundir',
    title: 'BUNDIR',
    subtitle: 'Main atau Gugur',
    description: 'Bangkrut = keluar. Pemain terakhir yang bertahan hidup menang. Hidup cuma sekali, dompet juga.',
    icon: '💀',
    color: '#f87171',
    winCondition: 'Pemain terakhir yang bertahan',
    totalRounds: 999,
  },
  sultan: {
    id: 'sultan',
    title: 'KAYA RAYA',
    subtitle: 'Sultan atau Miskin',
    description: 'Main 20 babak. Pemain paling kaya di akhir babak 20 menang. Kalo miskin, scroll HP aja.',
    icon: '💎',
    color: '#ffd56d',
    winCondition: 'Pemain terkaya di akhir babak 20',
    totalRounds: 20,
  },
  kilat: {
    id: 'kilat',
    title: 'KILAT',
    subtitle: 'Ngebut atau Keabisan',
    description: 'Cuma 10 babak! Uang awal 2x lipat, sewa naik 50%. Yang lambat, gulung tikar.',
    icon: '⚡',
    color: '#38bdf8',
    winCondition: 'Pemain terkaya di akhir babak 10',
    totalRounds: 10,
  },
};

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  currentTurn: number;
  turnOrder: string[];
  potMoney: number;
  gameMode: GameMode;
  totalRounds: number;
  createdAt: string;
}

// --- Helper to convert DB snake_case to camelCase ---
export function mapPlayerFromDB(dbPlayer: Record<string, unknown>): Player {
  return {
    id: dbPlayer.id as string,
    name: dbPlayer.name as string,
    position: dbPlayer.position as number,
    cleanMoney: dbPlayer.clean_money as number,
    dirtyMoney: dbPlayer.dirty_money as number,
    properties: (dbPlayer.properties as string[]) || [],
    role: (dbPlayer.role as string) || 'magang',
    selectedRole: (dbPlayer.selected_role as string) || null,
    roleLevel: (dbPlayer.role_level as number) || 1,
    luck: (dbPlayer.luck as number) || 50,
    permanentLuckMods: (dbPlayer.permanent_luck_modifiers as LuckModifier[]) || [],
    stats: (dbPlayer.stats as PlayerStats) || { negotiation: 5, investigation: 3, persuasion: 5, streetSmart: 3, charm: 5 },
    evidence: (dbPlayer.evidence as Evidence[]) || [],
    statusEffects: (dbPlayer.status_effects as StatusEffect[]) || [],
    isBankrupt: (dbPlayer.is_bankrupt as boolean) || false,
    isConnected: (dbPlayer.is_connected as boolean) || true,
    isReady: (dbPlayer.is_ready as boolean) || false,
    tokenColor: (dbPlayer.token_color as string) || '#3b82f6',
    dirtyHistory: (dbPlayer.dirty_history as DirtySource[]) || [],
    memeRoleBuff: (dbPlayer.meme_role_buff as string) || null,
    memeRoleActive: (dbPlayer.meme_role_active as boolean) || false,
    isBot: (dbPlayer.is_bot as boolean) || false,
  };
}

export function mapRoomFromDB(dbRoom: Record<string, unknown>): Room {
  return {
    id: dbRoom.id as string,
    code: dbRoom.code as string,
    hostId: dbRoom.host_id as string,
    status: dbRoom.status as RoomStatus,
    currentTurn: dbRoom.current_turn as number,
    turnOrder: (dbRoom.turn_order as string[]) || [],
    potMoney: (dbRoom.pot_money as number) || 0,
    gameMode: (dbRoom.game_mode as GameMode) || 'bundir',
    totalRounds: (dbRoom.total_rounds as number) || 20,
    createdAt: dbRoom.created_at as string,
  };
}

// --- Game Log Types ---
export type GameAction = 'roll' | 'move' | 'buy' | 'sell' | 'rent' | 'event' | 'kegiatan' | 'interaction' | 'koruptor' | 'audit' | 'defense' | 'bankrupt';

export interface GameLog {
  id: string;
  roomId: string;
  playerId: string;
  action: GameAction;
  detail: Record<string, unknown>;
  createdAt: string;
}

// --- Meme Role Types (Buff) ---
export interface MemeRoleBuff {
  id: string;
  name: string;
  effect: CardEffect;
  sideEffect: string;
  luckPenalty: number;
  toggleable: boolean;
  flavorText: string;
}
