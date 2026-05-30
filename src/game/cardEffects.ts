import { rngInt, rngShuffle } from './rng';
import type { CombatManager } from './combat';
import type { Enemy } from './enemy';
import type { Card } from './card';

export const EFFECT_VULNERABLE = 'vulnerable';
export const EFFECT_WEAK = 'weak';
export const EFFECT_STRENGTH = 'strength';
export const EFFECT_METALLICIZE = 'metallicize';
export const EFFECT_STUN = 'stun';
export const EFFECT_FREEZE = 'freeze';
export const EFFECT_POISON = 'poison';
export const EFFECT_BLEED = 'bleed';
export const EFFECT_BURN = 'burn';
export const EFFECT_MARK = 'mark';
export const EFFECT_BLIND = 'blind';
export const EFFECT_SLOW = 'slow';
export const EFFECT_SILENCE = 'silence';
export const EFFECT_FRAIL = 'frail';
export const EFFECT_END_TURN_DRAW = 'end_turn_draw';
export const EFFECT_END_TURN_BLOCK = 'end_turn_block';
export const EFFECT_END_TURN_HEAL = 'end_turn_heal';
export const EFFECT_NEXT_TURN_ENERGY = 'next_turn_energy';
export const EFFECT_THORNS = 'thorns';
export const EFFECT_DEXTERITY = 'dexterity';
export const EFFECT_HEAL = 'heal';
export const EFFECT_PIERCE = 'pierce';
export const EFFECT_EXECUTE = 'execute';
export const EFFECT_STEAL_BLOCK = 'steal_block';
export const EFFECT_STEAL_STRENGTH = 'steal_strength';
export const EFFECT_CLEAR_BLOCK = 'clear_block';
export const EFFECT_DOUBLE_HIT = 'double_hit';
export const EFFECT_RANDOM_HIT = 'random_hit';
export const EFFECT_DISCARD_BLOCK = 'discard_block';
export const EFFECT_DISCARD_DAMAGE = 'discard_damage';
export const EFFECT_DISCARD_DRAW = 'discard_draw';
export const EFFECT_DISCARD_ENERGY = 'discard_energy';
export const EFFECT_DISCARD_STRENGTH = 'discard_strength';
export const EFFECT_DISCARD_HEAL = 'discard_heal';
export const EFFECT_CHANNEL = 'channel';
export const EFFECT_REGEN = 'regen';
export const EFFECT_IMMUNE = 'immune';
export const EFFECT_REFLECT = 'reflect';
export const EFFECT_RAGE = 'rage';
export const EFFECT_ECHO = 'echo';
export const EFFECT_SHIELD_ALLY = 'shield_ally';
export const EFFECT_WEAKEN_ALL = 'weaken_all';
export const EFFECT_VULN_ALL = 'vuln_all';
export const EFFECT_DRAW = 'draw';
export const EFFECT_ENERGY = 'energy';
export const EFFECT_LIFESTEAL = 'lifesteal';
export const EFFECT_SELF_DAMAGE = 'self_damage';

const ZERO_VALUE = new Set([
  EFFECT_LIFESTEAL, EFFECT_PIERCE, EFFECT_DOUBLE_HIT, EFFECT_ECHO,
  EFFECT_SILENCE, EFFECT_CLEAR_BLOCK, EFFECT_IMMUNE, EFFECT_EXECUTE,
  EFFECT_RANDOM_HIT, EFFECT_STEAL_BLOCK, EFFECT_STEAL_STRENGTH,
]);

const TARGET_SELF = 'self';
const TARGET_ENEMY = 'enemy';
const TARGET_ALL_ENEMIES = 'all_enemies';

interface Bonus {
  id: string;
  value: number;
  target: string;
  discard_cost?: number;
}

export function collectCardBonuses(card: Card): Bonus[] {
  const bonuses: Bonus[] = [];
  const seen = new Set<string>();

  const add = (effectId: string, value: number, target = TARGET_ENEMY) => {
    if (!effectId) return;
    if (value === 0 && !ZERO_VALUE.has(effectId)) return;
    const key = `${effectId}:${value}:${target}`;
    if (seen.has(key)) return;
    seen.add(key);
    bonuses.push({ id: effectId, value, target });
  };

  for (const entry of card.bonuses ?? []) {
    add(entry.id, entry.value ?? 0, entry.target ?? TARGET_ENEMY);
  }
  if (card.effect) add(card.effect, card.effect_value, TARGET_ENEMY);
  if (card.effect2) add(card.effect2, card.effect2_value, TARGET_ENEMY);
  if (card.draw > 0) add(EFFECT_DRAW, card.draw, TARGET_SELF);
  if (card.energy_gain > 0) add(EFFECT_ENERGY, card.energy_gain, TARGET_SELF);
  if (card.self_damage > 0) add(EFFECT_SELF_DAMAGE, card.self_damage, TARGET_SELF);
  if (card.lifesteal) add(EFFECT_LIFESTEAL, 1, TARGET_SELF);

  return bonuses;
}

function pickEnemy(combat: CombatManager, targetIndex: number | null): Enemy | null {
  const living = combat.encounter.getLivingEnemies();
  if (targetIndex !== null && targetIndex < living.length) return living[targetIndex];
  return living[0] ?? null;
}

function targets(combat: CombatManager, target: string, enemy: Enemy | null): Enemy[] {
  const living = combat.encounter.getLivingEnemies();
  if (target === TARGET_ALL_ENEMIES) return [...living];
  if (enemy?.isAlive()) return [enemy];
  return living.length ? [living[0]] : [];
}

function discardFromHand(combat: CombatManager, count: number, messages: string[]): number {
  const hand = combat.player.hand.cards;
  if (!hand.length || count <= 0) return 0;
  const n = Math.min(count, hand.length);
  const indices = rngShuffle([...Array(hand.length).keys()]).slice(0, n);
  const discarded: Card[] = [];
  for (const idx of [...indices].sort((a, b) => b - a)) {
    const c = combat.player.hand.remove(idx);
    if (c) discarded.push(c);
  }
  for (const c of discarded) combat.player.deck.addToDiscard(c);
  messages.push(`Сброшено карт: ${n} (${discarded.map((c) => c.name).join(', ')})`);
  return n;
}

function applyEnemyEffect(enemy: Enemy, effectId: string, value: number, messages: string[]): number {
  switch (effectId) {
    case EFFECT_VULNERABLE:
      enemy.applyVulnerable(value);
      messages.push(`${enemy.name}: уязвимость ${value}`);
      break;
    case EFFECT_WEAK:
      enemy.applyWeak(value);
      messages.push(`${enemy.name}: слабость ${value}`);
      break;
    case EFFECT_STUN:
      enemy.stunTurns = Math.max(enemy.stunTurns, value);
      messages.push(`${enemy.name}: оглушён на ${value} ход(ов)!`);
      break;
    case EFFECT_FREEZE:
      enemy.stunTurns = Math.max(enemy.stunTurns, value);
      enemy.block = 0;
      messages.push(`${enemy.name}: заморожен! Броня снята.`);
      break;
    case EFFECT_POISON:
      enemy.poison += value;
      messages.push(`${enemy.name}: яд +${value}`);
      break;
    case EFFECT_BLEED:
      enemy.bleed += value;
      messages.push(`${enemy.name}: кровотечение +${value}`);
      break;
    case EFFECT_BURN:
      enemy.burn += value;
      messages.push(`${enemy.name}: горение +${value}`);
      break;
    case EFFECT_MARK:
      enemy.marked += value;
      messages.push(`${enemy.name}: метка +${value}`);
      break;
    case EFFECT_BLIND:
      enemy.blindTurns = Math.max(enemy.blindTurns, value);
      messages.push(`${enemy.name}: ослеплён!`);
      break;
    case EFFECT_SLOW:
      enemy.slowTurns = Math.max(enemy.slowTurns, value);
      enemy.slowAmount = Math.max(enemy.slowAmount, value);
      messages.push(`${enemy.name}: замедление −${value} силы`);
      break;
    case EFFECT_SILENCE: {
      const removed = enemy.strength;
      enemy.strength = 0;
      messages.push(`${enemy.name}: разоружён! Снято ${removed} силы.`);
      break;
    }
    case EFFECT_STEAL_BLOCK: {
      const stolen = enemy.block;
      enemy.block = 0;
      messages.push(`У ${enemy.name} украдено ${stolen} брони!`);
      return stolen;
    }
    case EFFECT_STEAL_STRENGTH: {
      const stolen = enemy.strength;
      enemy.strength = 0;
      messages.push(`У ${enemy.name} украдено ${stolen} силы!`);
      return stolen;
    }
    case EFFECT_CLEAR_BLOCK: {
      const cleared = enemy.block;
      enemy.block = 0;
      messages.push(`${enemy.name}: броня ${cleared} снята!`);
      break;
    }
  }
  return 0;
}

function applySelfEffect(combat: CombatManager, effectId: string, value: number, messages: string[]) {
  const player = combat.player;
  switch (effectId) {
    case EFFECT_STRENGTH:
      player.strength += value;
      messages.push(`+${value} силы!`);
      break;
    case EFFECT_METALLICIZE:
      player.metallicize += value;
      messages.push(`Металлизация +${value}!`);
      break;
    case EFFECT_FRAIL:
      player.applyFrail(value);
      messages.push(`Хрупкость на ${value} ход(ов)!`);
      break;
    case EFFECT_END_TURN_DRAW:
      player.endTurnDraw += value;
      messages.push(`В конце хода: +${value} карт`);
      break;
    case EFFECT_END_TURN_BLOCK:
      player.endTurnBlock += value;
      messages.push(`В конце хода: +${value} брони`);
      break;
    case EFFECT_END_TURN_HEAL:
      player.endTurnHeal += value;
      messages.push(`В конце хода: +${value} HP`);
      break;
    case EFFECT_NEXT_TURN_ENERGY:
      player.nextTurnEnergy += value;
      messages.push(`Следующий ход: +${value} энергии`);
      break;
    case EFFECT_THORNS:
      player.thorns += value;
      messages.push(`Шипы +${value}!`);
      break;
    case EFFECT_DEXTERITY:
      player.dexterity += value;
      messages.push(`Ловкость +${value}!`);
      break;
    case EFFECT_HEAL:
      player.heal(value);
      messages.push(`Исцеление +${value} HP!`);
      break;
    case EFFECT_REGEN:
      player.regen += value;
      messages.push(`Регенерация +${value}/ход`);
      break;
    case EFFECT_IMMUNE:
      player.immuneTurns = Math.max(player.immuneTurns, value);
      messages.push(`Иммунитет к дебафам ${value} ход(ов)!`);
      break;
    case EFFECT_REFLECT:
      player.reflect += value;
      messages.push(`Отражение +${value}!`);
      break;
    case EFFECT_RAGE:
      player.rageStacks += value;
      messages.push(`Ярость +${value}!`);
      break;
    case EFFECT_CHANNEL:
      player.channelEnergy += value;
      messages.push(`Накоплено ${value} энергии!`);
      break;
    case EFFECT_DRAW:
      if (!player.turnDrawBlocked) {
        const drawn = player.deck.draw(value);
        for (const c of drawn) {
          if (!player.hand.add(c)) messages.push('Рука полна — карта сгорела!');
        }
        messages.push(`Взято карт: ${drawn.length}`);
      } else {
        messages.push('Нельзя брать карты в этот ход!');
      }
      break;
    case EFFECT_ENERGY:
      player.gainEnergy(value);
      messages.push(`+${value} энергии!`);
      break;
    case EFFECT_SELF_DAMAGE: {
      const dmg = player.takeDamage(value);
      messages.push(`Вы получаете ${value} урона (${dmg} прошло)!`);
      if (player.rageStacks > 0) {
        player.strength += player.rageStacks;
        messages.push(`Ярость: +${player.rageStacks} силы!`);
      }
      break;
    }
  }
}

function applyDiscardReward(combat: CombatManager, effectId: string, value: number, count: number, messages: string[]) {
  const player = combat.player;
  const total = value ? value * count : count;
  switch (effectId) {
    case EFFECT_DISCARD_BLOCK:
      player.gainBlock(total);
      messages.push(`За сброс: +${total} брони!`);
      break;
    case EFFECT_DISCARD_DAMAGE: {
      const living = combat.encounter.getLivingEnemies();
      if (living.length) {
        const dealt = living[0].takeDamage(total);
        messages.push(`За сброс: ${total} урона → ${living[0].name} (${dealt} прошло)`);
      }
      break;
    }
    case EFFECT_DISCARD_DRAW: {
      const drawn = player.deck.draw(total);
      for (const c of drawn) {
        if (!player.hand.add(c)) messages.push('Рука полна!');
      }
      messages.push(`За сброс: взято ${drawn.length} карт`);
      break;
    }
    case EFFECT_DISCARD_ENERGY:
      player.gainEnergy(total);
      messages.push(`За сброс: +${total} энергии!`);
      break;
    case EFFECT_DISCARD_STRENGTH:
      player.strength += total;
      messages.push(`За сброс: +${total} силы!`);
      break;
    case EFFECT_DISCARD_HEAL:
      player.heal(total);
      messages.push(`За сброс: +${total} HP!`);
      break;
  }
}

export function applyOnPlayBonuses(
  combat: CombatManager,
  card: Card,
  targetEnemyIndex: number | null,
  messages: string[]
) {
  const bonuses = collectCardBonuses(card);
  const player = combat.player;
  const living = combat.encounter.getLivingEnemies();
  const enemyEffects = new Set([
    EFFECT_VULNERABLE, EFFECT_WEAK, EFFECT_STUN, EFFECT_FREEZE,
    EFFECT_POISON, EFFECT_BLEED, EFFECT_BURN, EFFECT_MARK,
    EFFECT_BLIND, EFFECT_SLOW, EFFECT_SILENCE, EFFECT_CLEAR_BLOCK,
  ]);

  for (const bonus of bonuses) {
    const { id: effectId, value } = bonus;
    const target = bonus.target ?? TARGET_ENEMY;

    if (bonus.discard_cost && bonus.discard_cost > 0) {
      const n = discardFromHand(combat, bonus.discard_cost, messages);
      if (n > 0) applyDiscardReward(combat, effectId, value, n, messages);
      continue;
    }

    if (effectId === EFFECT_STEAL_BLOCK) {
      let total = 0;
      for (const e of targets(combat, target, pickEnemy(combat, targetEnemyIndex))) {
        total += applyEnemyEffect(e, effectId, value, messages);
      }
      if (total) {
        player.gainBlock(total);
        messages.push(`Получено ${total} брони!`);
      }
      continue;
    }

    if (effectId === EFFECT_STEAL_STRENGTH) {
      let total = 0;
      for (const e of targets(combat, target, pickEnemy(combat, targetEnemyIndex))) {
        total += applyEnemyEffect(e, effectId, value, messages);
      }
      if (total) {
        player.strength += total;
        messages.push(`Получено ${total} силы!`);
      }
      continue;
    }

    if (effectId === EFFECT_WEAKEN_ALL) {
      for (const e of living) e.applyWeak(value);
      messages.push(`Все враги: слабость ${value}`);
      continue;
    }

    if (effectId === EFFECT_VULN_ALL) {
      for (const e of living) e.applyVulnerable(value);
      messages.push(`Все враги: уязвимость ${value}`);
      continue;
    }

    if (effectId === EFFECT_SHIELD_ALLY) {
      player.gainBlock(value);
      messages.push(`Щит союзника: +${value} брони`);
      continue;
    }

    if (enemyEffects.has(effectId)) {
      for (const e of targets(combat, target, pickEnemy(combat, targetEnemyIndex))) {
        applyEnemyEffect(e, effectId, value, messages);
      }
      continue;
    }

    applySelfEffect(combat, effectId, value, messages);
  }
}

export function modifyAttackDamage(
  _combat: CombatManager,
  baseDamage: number,
  enemy: Enemy,
  card: Card
): number {
  let damage = baseDamage;
  const bonuses = collectCardBonuses(card);
  if (bonuses.some((b) => b.id === EFFECT_EXECUTE)) {
    const threshold = Math.max(1, Math.floor(enemy.maxHp / 4));
    if (enemy.hp <= threshold) damage = Math.floor(damage * 1.5);
  }
  if (bonuses.some((b) => b.id === EFFECT_RANDOM_HIT)) {
    const spread = Math.max(2, Math.floor(damage / 3));
    damage = Math.max(1, damage + rngInt(spread * 2 + 1) - spread);
  }
  if (enemy.marked > 0) {
    damage += enemy.marked;
    enemy.marked = Math.max(0, enemy.marked - enemy.marked);
  }
  return Math.max(0, damage);
}

export function shouldPierce(card: Card) {
  return collectCardBonuses(card).some((b) => b.id === EFFECT_PIERCE);
}

export function shouldDoubleHit(card: Card) {
  return collectCardBonuses(card).some((b) => b.id === EFFECT_DOUBLE_HIT);
}

export function shouldLifesteal(card: Card) {
  return card.lifesteal || collectCardBonuses(card).some((b) => b.id === EFFECT_LIFESTEAL);
}

export function shouldEcho(card: Card) {
  return collectCardBonuses(card).some((b) => b.id === EFFECT_ECHO);
}

export function processPlayerEndTurn(combat: CombatManager, messages: string[]) {
  const player = combat.player;
  if (player.endTurnDraw > 0 && !player.turnDrawBlocked) {
    const drawn = player.deck.draw(player.endTurnDraw);
    for (const c of drawn) {
      if (!player.hand.add(c)) messages.push('Рука полна — карта сгорела!');
    }
    messages.push(`Конец хода: взято ${drawn.length} карт`);
  }
  if (player.endTurnBlock > 0) {
    player.gainBlock(player.endTurnBlock);
    messages.push(`Конец хода: +${player.endTurnBlock} брони`);
  }
  if (player.endTurnHeal > 0) {
    player.heal(player.endTurnHeal);
    messages.push(`Конец хода: +${player.endTurnHeal} HP`);
  }
  player.endTurnDraw = 0;
  player.endTurnBlock = 0;
  player.endTurnHeal = 0;
}

export function processPlayerStartTurn(combat: CombatManager, messages: string[]) {
  const player = combat.player;
  if (player.nextTurnEnergy > 0) {
    player.gainEnergy(player.nextTurnEnergy);
    messages.push(`Бонус энергии: +${player.nextTurnEnergy}`);
    player.nextTurnEnergy = 0;
  }
  if (player.regen > 0) {
    player.heal(player.regen);
    messages.push(`Регенерация: +${player.regen} HP`);
  }
  if (player.channelEnergy > 0) {
    player.gainEnergy(player.channelEnergy);
    messages.push(`Высвобождено ${player.channelEnergy} энергии!`);
    player.channelEnergy = 0;
  }
}
