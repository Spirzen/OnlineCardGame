export type CardType =
  | 'attack'
  | 'block'
  | 'buff'
  | 'debuff'
  | 'draw'
  | 'creature';

export type CardRarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'custom';

export interface CardBonus {
  id: string;
  value: number;
  target?: string;
  discard_cost?: number;
}

export interface CardData {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  value: number;
  description: string;
  rarity: CardRarity;
  aoe?: boolean;
  block?: number;
  draw?: number;
  effect?: string;
  effect_value?: number;
  effect2?: string;
  effect2_value?: number;
  energy_gain?: number;
  self_damage?: number;
  strength_mult?: number;
  lifesteal?: boolean;
  upgraded?: boolean;
  kind?: string;
  health?: number;
  custom?: boolean;
  bonuses?: CardBonus[];
  discard_cost?: number;
  discard_reward?: string;
  discard_reward_value?: number;
}

export interface RelicData {
  id: string;
  name: string;
  description: string;
  effect: string;
  value: number;
  rarity: string;
}

export interface EnemyData {
  name: string;
  hp: number;
  intent_pattern: string[];
  attack_damage?: number;
  block_attack_damage?: number;
  block_value?: number;
  buff_value?: number;
  debuff_value?: number;
  special_damage?: number;
  description?: string;
}

export type Screen =
  | 'menu'
  | 'class_select'
  | 'relic_pick'
  | 'map'
  | 'combat'
  | 'reward'
  | 'shop'
  | 'rest'
  | 'smith'
  | 'event'
  | 'treasure'
  | 'codex'
  | 'epic_novel'
  | 'story_tutorial'
  | 'game_over'
  | 'victory'
  | 'stats'
  | 'card_editor'
  | 'clicker';

export interface LeaderboardEntry {
  floor: number;
  kills: number;
  classId: string;
  daily: boolean;
  date: string;
}

export interface SessionStats {
  totalRuns: number;
  totalWins: number;
  bestFloor: number;
  totalKills: number;
  dailyBestFloor: number;
  leaderboard: LeaderboardEntry[];
  ascensionLevel: number;
  maxAscensionUnlocked: number;
}

export interface FxPayload {
  id: number;
  kind:
    | 'damage'
    | 'block'
    | 'heal'
    | 'shake'
    | 'confetti'
    | 'slash'
    | 'fire'
    | 'ice'
    | 'lightning'
    | 'holy'
    | 'blood'
    | 'shield'
    | 'buff'
    | 'debuff'
    | 'spark'
    | 'impact';
  x?: number | string;
  y?: number | string;
  value?: number;
  label?: string;
}
