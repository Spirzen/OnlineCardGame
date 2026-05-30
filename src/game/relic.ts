import relicsData from '../data/relics.json';
import type { RelicData } from './types';
import type { Player } from './player';

export class Relic {
  id: string;
  name: string;
  description: string;
  effect: string;
  value: number;
  rarity: string;

  constructor(data: RelicData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.effect = data.effect;
    this.value = data.value ?? 0;
    this.rarity = data.rarity ?? 'common';
  }
}

const db = relicsData as RelicData[];

export function getRandomRelics(count = 3): Relic[] {
  const shuffled = [...db].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((r) => new Relic(r));
}

export function getStarterRelic(): Relic {
  const starter = db.find((r) => r.rarity === 'starter');
  return new Relic(starter ?? db[0]);
}

export function applyRelicOnCombatStart(player: Player, relic: Relic) {
  switch (relic.effect) {
    case 'start_strength':
      player.strength += relic.value;
      break;
    case 'start_block':
      player.block += relic.value;
      break;
    case 'start_heal':
      player.heal(relic.value);
      break;
    case 'extra_energy':
      player.maxEnergy += relic.value;
      player.energy += relic.value;
      break;
    case 'thorns':
      player.thorns += relic.value;
      break;
  }
}

export function applyRelicOnCombatEnd(player: Player, relic: Relic) {
  if (relic.effect === 'heal_after_combat') {
    player.heal(relic.value);
  }
}

export function getShopDiscount(relics: Relic[]): number {
  return relics
    .filter((r) => r.effect === 'shop_discount')
    .reduce((s, r) => s + r.value, 0) / 100;
}

export function applyStartVulnerableToEnemies(relics: Relic[]) {
  return relics.find((r) => r.effect === 'start_vulnerable');
}

export function getExtraDraw(relics: Relic[]): number {
  return relics
    .filter((r) => r.effect === 'extra_draw')
    .reduce((s, r) => s + r.value, 0);
}
