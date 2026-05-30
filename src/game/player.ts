import {
  STARTING_HP,
  STARTING_ENERGY,
  STARTING_GOLD,
  MAX_ENERGY,
} from './settings';
import { Deck, Hand, createStartingDeck } from './card';
import type { Card } from './card';
import type { Relic } from './relic';

export class Player {
  maxHp = STARTING_HP;
  hp = STARTING_HP;
  energy = STARTING_ENERGY;
  maxEnergy = STARTING_ENERGY;
  gold = STARTING_GOLD;
  block = 0;
  strength = 0;
  dexterity = 0;
  vulnerable = 0;
  weak = 0;
  frail = 0;
  metallicize = 0;
  thorns = 0;
  deck: Deck;
  hand: Hand;
  relics: Relic[] = [];
  turnDrawBlocked = false;
  endTurnDraw = 0;
  endTurnBlock = 0;
  endTurnHeal = 0;
  nextTurnEnergy = 0;
  regen = 0;
  immuneTurns = 0;
  reflect = 0;
  rageStacks = 0;
  channelEnergy = 0;

  constructor() {
    this.deck = new Deck(createStartingDeck());
    this.hand = new Hand();
  }

  resetCombat() {
    this.energy = this.maxEnergy;
    this.block = 0;
    this.vulnerable = 0;
    this.weak = 0;
    this.frail = 0;
    this.turnDrawBlocked = false;
    this.endTurnDraw = 0;
    this.endTurnBlock = 0;
    this.endTurnHeal = 0;
    this.nextTurnEnergy = 0;
    this.regen = 0;
    this.immuneTurns = 0;
    this.reflect = 0;
    this.rageStacks = 0;
    this.channelEnergy = 0;
    this.hand.clear();
    const all = this.deck.getAllCards();
    this.deck = new Deck(all);
  }

  startTurn() {
    this.energy = this.maxEnergy;
    this.block = 0;
    this.turnDrawBlocked = false;
    if (this.vulnerable > 0) this.vulnerable--;
    if (this.weak > 0) this.weak--;
    if (this.frail > 0) this.frail--;
    if (this.immuneTurns > 0) this.immuneTurns--;
  }

  endTurn() {
    if (this.metallicize > 0) this.block += this.metallicize;
    const cards = [...this.hand.cards];
    this.hand.clear();
    this.deck.discardAll(cards);
  }

  gainBlock(amount: number) {
    if (this.frail > 0) amount = Math.floor(amount * 0.75);
    if (this.dexterity > 0) amount += this.dexterity;
    this.block += amount;
  }

  takeDamage(amount: number): number {
    if (this.vulnerable > 0) amount = Math.floor(amount * 1.5);
    const blocked = Math.min(this.block, amount);
    this.block -= blocked;
    const damage = amount - blocked;
    this.hp = Math.max(0, this.hp - damage);
    if (damage > 0 && this.rageStacks > 0) {
      this.strength += this.rageStacks;
    }
    return damage;
  }

  heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  spendEnergy(cost: number): boolean {
    if (this.energy >= cost) {
      this.energy -= cost;
      return true;
    }
    return false;
  }

  gainEnergy(amount: number) {
    this.energy = Math.min(MAX_ENERGY, this.energy + amount);
  }

  applyVulnerable(turns: number) {
    if (this.immuneTurns > 0) return;
    this.vulnerable = Math.max(this.vulnerable, turns);
  }

  applyWeak(turns: number) {
    if (this.immuneTurns > 0) return;
    this.weak = Math.max(this.weak, turns);
  }

  applyFrail(turns: number) {
    if (this.immuneTurns > 0) return;
    this.frail = Math.max(this.frail, turns);
  }

  getAttackDamage(base: number, strengthMult = 1): number {
    let damage = base + this.strength * strengthMult;
    if (this.weak > 0) damage = Math.floor(damage * 0.75);
    return Math.max(0, damage);
  }

  isAlive() {
    return this.hp > 0;
  }

  addCardToDeck(card: Card) {
    this.deck.addToDraw(card.copy());
  }

  removeCardFromDeck(card: Card) {
    const all = this.deck.getAllCards();
    const idx = all.findIndex((c) => c.id === card.id && c.name === card.name);
    if (idx >= 0) {
      all.splice(idx, 1);
      this.deck = new Deck(all);
    }
  }
}
