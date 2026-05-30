import cardsData from '../data/cards.json';
import type { CardData } from './types';
import { CARD_ATTACK, CARD_BLOCK, CARD_BUFF, CARD_DEBUFF, CARD_DRAW, CARD_CREATURE } from './settings';

export class Card {
  id: string;
  name: string;
  type: string;
  cost: number;
  value: number;
  description: string;
  rarity: string;
  aoe: boolean;
  block: number;
  draw: number;
  effect?: string;
  effect_value: number;
  effect2?: string;
  effect2_value: number;
  energy_gain: number;
  self_damage: number;
  strength_mult: number;
  lifesteal: boolean;
  upgraded: boolean;
  kind: string;
  health: number;
  custom: boolean;
  bonuses: CardData['bonuses'];

  constructor(data: CardData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.cost = data.cost;
    this.value = data.value ?? 0;
    this.description = data.description ?? '';
    this.rarity = data.rarity ?? 'common';
    this.aoe = data.aoe ?? false;
    this.block = data.block ?? 0;
    this.draw = data.draw ?? 0;
    this.effect = data.effect;
    this.effect_value = data.effect_value ?? 0;
    this.effect2 = data.effect2;
    this.effect2_value = data.effect2_value ?? 0;
    this.energy_gain = data.energy_gain ?? 0;
    this.self_damage = data.self_damage ?? 0;
    this.strength_mult = data.strength_mult ?? 1;
    this.lifesteal = data.lifesteal ?? false;
    this.upgraded = data.upgraded ?? false;
    this.kind = data.kind ?? 'spell';
    this.health = data.health ?? 0;
    this.custom = data.custom ?? false;
    this.bonuses = data.bonuses ?? [];
  }

  copy(): Card {
    return new Card(this.toData());
  }

  toData(): CardData {
    return {
      id: this.id,
      name: this.name,
      type: this.type as CardData['type'],
      cost: this.cost,
      value: this.value,
      description: this.description,
      rarity: this.rarity as CardData['rarity'],
      aoe: this.aoe,
      block: this.block,
      draw: this.draw,
      effect: this.effect,
      effect_value: this.effect_value,
      effect2: this.effect2,
      effect2_value: this.effect2_value,
      energy_gain: this.energy_gain,
      self_damage: this.self_damage,
      strength_mult: this.strength_mult,
      lifesteal: this.lifesteal,
      upgraded: this.upgraded,
      kind: this.kind,
      health: this.health,
      custom: this.custom,
      bonuses: this.bonuses,
    };
  }
}

export class Deck {
  drawPile: Card[] = [];
  discardPile: Card[] = [];
  exhaustPile: Card[] = [];

  constructor(cards: Card[] = []) {
    this.drawPile = [...cards];
    this.shuffle();
  }

  shuffle() {
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }

  draw(count = 1): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0 && this.discardPile.length > 0) {
        this.drawPile = [...this.discardPile];
        this.discardPile = [];
        this.shuffle();
      }
      if (this.drawPile.length > 0) {
        drawn.push(this.drawPile.pop()!);
      }
    }
    return drawn;
  }

  addToDraw(card: Card) {
    this.drawPile.push(card);
  }

  addToDiscard(card: Card) {
    this.discardPile.push(card);
  }

  discardAll(cards: Card[]) {
    this.discardPile.push(...cards);
  }

  getAllCards(): Card[] {
    return [...this.drawPile, ...this.discardPile, ...this.exhaustPile];
  }
}

export class Hand {
  cards: Card[] = [];
  maxSize: number;

  constructor(maxSize = 10) {
    this.maxSize = maxSize;
  }

  add(card: Card): boolean {
    if (this.cards.length >= this.maxSize) return false;
    this.cards.push(card);
    return true;
  }

  remove(index: number): Card | null {
    if (index < 0 || index >= this.cards.length) return null;
    return this.cards.splice(index, 1)[0];
  }

  clear() {
    this.cards = [];
  }
}

const db = cardsData as CardData[];

function uniqueCards(excludeBasic = false): CardData[] {
  const seen = new Set<string>();
  const pool: CardData[] = [];
  for (const c of db) {
    if (excludeBasic && c.rarity === 'basic') continue;
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    pool.push(c);
  }
  return pool;
}

export function createCard(data: CardData): Card {
  return new Card(JSON.parse(JSON.stringify(data)));
}

export function createStartingDeck(): Card[] {
  const byId: Record<string, CardData> = {};
  for (const c of db) {
    if (!byId[c.id]) byId[c.id] = c;
  }
  const deck: Card[] = [];
  for (let i = 0; i < 3; i++) if (byId.strike) deck.push(createCard(byId.strike));
  for (let i = 0; i < 3; i++) if (byId.defend) deck.push(createCard(byId.defend));
  for (const id of ['iron_wave', 'shrug_it_off', 'pommel_strike']) {
    if (byId[id]) deck.push(createCard(byId[id]));
  }
  return deck;
}

export function getRewardCards(count = 3): Card[] {
  let pool = uniqueCards(true);
  if (pool.length < count) {
    pool = uniqueCards(false).filter((c) => c.rarity !== 'basic');
    if (pool.length === 0) pool = uniqueCards(false);
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(createCard);
}

export function getShopCards(count = 5): Card[] {
  const pool = uniqueCards(true);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(createCard);
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    [CARD_ATTACK]: 'Атака',
    [CARD_BLOCK]: 'Защита',
    [CARD_BUFF]: 'Бафф',
    [CARD_DEBUFF]: 'Дебафф',
    [CARD_DRAW]: 'Добор',
    [CARD_CREATURE]: 'Существо',
  };
  return labels[type] ?? type;
}
