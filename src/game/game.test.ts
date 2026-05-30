import { describe, it, expect } from 'vitest';
import { Card } from './card';
import { upgradeCard } from './upgrade';
import { Player } from './player';
import { SeededRNG, setActiveRng } from './rng';

describe('upgradeCard', () => {
  it('buffs attack value', () => {
    const c = new Card({ id: 'strike', name: 'Удар', type: 'attack', cost: 1, value: 6, description: '', rarity: 'basic' });
    const up = upgradeCard(c);
    expect(up.value).toBe(9);
    expect(up.upgraded).toBe(true);
  });
});

describe('Player damage', () => {
  it('applies vulnerable multiplier', () => {
    const p = new Player();
    p.hp = 50;
    p.vulnerable = 2;
    p.takeDamage(10);
    expect(p.hp).toBe(35);
  });

  it('block absorbs damage', () => {
    const p = new Player();
    p.hp = 50;
    p.block = 5;
    p.takeDamage(10);
    expect(p.hp).toBe(45);
    expect(p.block).toBe(0);
  });
});

describe('SeededRNG', () => {
  it('is deterministic', () => {
    setActiveRng(new SeededRNG(12345));
    const a = new SeededRNG(12345);
    const b = new SeededRNG(12345);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });
});
