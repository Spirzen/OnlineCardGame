export const CARD_ATTACK = 'attack';
export const CARD_BLOCK = 'block';
export const CARD_BUFF = 'buff';
export const CARD_DEBUFF = 'debuff';
export const CARD_DRAW = 'draw';
export const CARD_CREATURE = 'creature';

export const NODE_COMBAT = 'combat';
export const NODE_ELITE = 'elite';
export const NODE_BOSS = 'boss';
export const NODE_REST = 'rest';
export const NODE_SHOP = 'shop';
export const NODE_TREASURE = 'treasure';
export const NODE_EVENT = 'event';

export const STARTING_HP = 85;
export const STARTING_ENERGY = 3;
export const MAX_ENERGY = 10;
export const STARTING_GOLD = 99;
export const STARTING_HAND = 5;
export const DRAW_PER_TURN = 5;
export const MAX_HAND = 10;

export const CARD_TYPE_COLORS: Record<string, string> = {
  attack: '#c84828',
  block: '#3878b8',
  buff: '#c89020',
  debuff: '#7040a0',
  draw: '#389868',
  creature: '#a86828',
};

export const RARITY_COLORS: Record<string, string> = {
  basic: '#a0a0aa',
  common: '#78b4ff',
  uncommon: '#64d282',
  rare: '#ffb450',
  custom: '#c882ff',
};

export const NODE_COLORS: Record<string, string> = {
  combat: '#c84646',
  elite: '#dc8230',
  boss: '#aa2daa',
  rest: '#46af5a',
  shop: '#dcbe37',
  treasure: '#f0d246',
  event: '#5a96dc',
};

export const NODE_ICONS: Record<string, string> = {
  combat: '⚔',
  elite: '👹',
  boss: '🐉',
  rest: '🔥',
  shop: '🏕',
  treasure: '💎',
  event: '📜',
};
