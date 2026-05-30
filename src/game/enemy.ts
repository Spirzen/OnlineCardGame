import { rngPick, rngChance, rng } from './rng';
import enemiesData from '../data/enemies.json';
import type { EnemyData } from './types';
import { LOCALE } from './locale';
import type { Player } from './player';

export const INTENT_ATTACK = 'attack';
export const INTENT_BLOCK = 'block';
export const INTENT_BUFF = 'buff';
export const INTENT_DEBUFF = 'debuff';
export const INTENT_SPECIAL = 'special';
export const INTENT_BLOCK_ATTACK = 'block_attack';
export const INTENT_UNKNOWN = 'unknown';

const enemyDb = enemiesData as Record<string, EnemyData>;

export class Enemy {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  block = 0;
  strength = 0;
  vulnerable = 0;
  weak = 0;
  intentPattern: string[];
  attackDamage: number;
  blockAttackDamage: number;
  blockValue: number;
  buffValue: number;
  debuffValue: number;
  specialDamage: number;
  description: string;
  intentIndex = 0;
  currentIntent = INTENT_UNKNOWN;
  intentValue = 0;
  alive = true;
  stunTurns = 0;
  poison = 0;
  bleed = 0;
  burn = 0;
  marked = 0;
  blindTurns = 0;
  slowTurns = 0;
  slowAmount = 0;

  constructor(data: EnemyData & { id?: string }, hpMult = 1) {
    this.id = data.id ?? 'unknown';
    this.name = data.name;
    this.maxHp = Math.floor(data.hp * hpMult);
    this.hp = this.maxHp;
    this.intentPattern = data.intent_pattern;
    this.attackDamage = data.attack_damage ?? 6;
    this.blockAttackDamage = data.block_attack_damage ?? 5;
    this.blockValue = data.block_value ?? 5;
    this.buffValue = data.buff_value ?? 2;
    this.debuffValue = data.debuff_value ?? 1;
    this.specialDamage = data.special_damage ?? 10;
    this.description = data.description ?? '';
    this.planIntent();
  }

  planIntent() {
    const intent = this.intentPattern[this.intentIndex % this.intentPattern.length];
    this.intentIndex++;
    this.currentIntent = intent;
    switch (intent) {
      case INTENT_ATTACK:
        this.intentValue = this.calcDamage(this.attackDamage);
        break;
      case INTENT_BLOCK:
        this.intentValue = this.blockValue;
        break;
      case INTENT_BUFF:
        this.intentValue = this.buffValue;
        break;
      case INTENT_DEBUFF:
        this.intentValue = this.debuffValue;
        break;
      case INTENT_SPECIAL:
        this.intentValue = this.calcDamage(this.specialDamage);
        break;
      case INTENT_BLOCK_ATTACK:
        this.intentValue = this.calcDamage(this.blockAttackDamage);
        break;
      default:
        this.intentValue = 0;
    }
  }

  calcDamage(base: number, str?: number): number {
    const strVal = str ?? this.strength;
    let damage = base + strVal;
    if (this.weak > 0) damage = Math.floor(damage * 0.75);
    return Math.max(0, damage);
  }

  executeIntent(player: Player): string[] {
    const messages: string[] = [];
    this.processTurnStart(messages);

    if (this.stunTurns > 0) {
      this.stunTurns--;
      messages.push(`${this.name} оглушён — пропускает ход!`);
      this.tickStatuses();
      this.planIntent();
      return messages;
    }

    const intent = this.currentIntent;
    let effectiveStrength = this.strength;
    if (this.slowTurns > 0) {
      effectiveStrength = Math.max(0, effectiveStrength - this.slowAmount);
    }

    switch (intent) {
      case INTENT_ATTACK: {
        const dmgVal = this.calcDamage(this.attackDamage, effectiveStrength);
        if (this.blindTurns > 0) {
          this.blindTurns--;
          messages.push(`${this.name} промахивается (ослепление)!`);
        } else {
          player.takeDamage(dmgVal);
          messages.push(`${this.name} атакует на ${dmgVal}!`);
          if (player.reflect > 0) {
            const dealt = this.takeDamage(player.reflect, true);
            messages.push(`Отражение: ${player.reflect} → ${this.name} (${dealt} прошло)`);
          }
        }
        break;
      }
      case INTENT_BLOCK:
        this.block += this.intentValue;
        messages.push(`${this.name} получает ${this.intentValue} брони!`);
        break;
      case INTENT_BUFF:
        this.strength += this.intentValue;
        messages.push(`${this.name} получает +${this.intentValue} силы!`);
        break;
      case INTENT_DEBUFF:
        player.applyVulnerable(this.intentValue);
        messages.push(`${this.name} накладывает уязвимость ${this.intentValue}!`);
        break;
      case INTENT_SPECIAL: {
        const dmgVal = this.calcDamage(this.specialDamage, effectiveStrength);
        if (this.blindTurns > 0) {
          this.blindTurns--;
          messages.push(`${this.name} промахивается (ослепление)!`);
        } else {
          const dmg = player.takeDamage(dmgVal);
          messages.push(`${this.name}: особая атака ${dmgVal} (${dmg} прошло)!`);
        }
        break;
      }
      case INTENT_BLOCK_ATTACK: {
        this.block += this.blockValue;
        const dmgVal = this.calcDamage(this.blockAttackDamage, effectiveStrength);
        if (this.blindTurns > 0) {
          this.blindTurns--;
          messages.push(`${this.name} промахивается (ослепление)!`);
        } else {
          const dmg = player.takeDamage(dmgVal);
          messages.push(`${this.name}: ${this.blockValue} брони и ${dmgVal} урона (${dmg} прошло)!`);
        }
        break;
      }
    }

    this.tickStatuses();
    this.planIntent();
    return messages;
  }

  processTurnStart(messages: string[]) {
    if (this.poison > 0) {
      const dealt = this.takeDamage(this.poison, true);
      messages.push(`${this.name}: яд ${this.poison} (${dealt} прошло)`);
    }
    if (this.burn > 0) {
      const dealt = this.takeDamage(this.burn, true);
      messages.push(`${this.name}: горение ${this.burn} (${dealt} прошло)`);
    }
  }

  tickStatuses() {
    if (this.vulnerable > 0) this.vulnerable--;
    if (this.weak > 0) this.weak--;
    if (this.slowTurns > 0) this.slowTurns--;
  }

  takeDamage(amount: number, ignoreBlock = false): number {
    if (this.vulnerable > 0) amount = Math.floor(amount * 1.5);
    let damage: number;
    if (!ignoreBlock) {
      const blocked = Math.min(this.block, amount);
      this.block -= blocked;
      damage = amount - blocked;
    } else {
      damage = amount;
    }
    if (this.bleed > 0 && damage > 0) damage += this.bleed;
    this.hp = Math.max(0, this.hp - damage);
    if (this.hp <= 0) this.alive = false;
    return damage;
  }

  applyVulnerable(turns: number) {
    this.vulnerable = Math.max(this.vulnerable, turns);
  }

  applyWeak(turns: number) {
    this.weak = Math.max(this.weak, turns);
  }

  isAlive() {
    return this.alive && this.hp > 0;
  }

  getIntentLabel() {
    return LOCALE.INTENT_LABELS[this.currentIntent] ?? '???';
  }
}

export class Encounter {
  enemies: Enemy[];

  constructor(enemyIds: string[], hpMult = 1) {
    this.enemies = enemyIds
      .filter((id) => id in enemyDb)
      .map((id) => {
        const data = { ...enemyDb[id], id };
        return new Enemy(data, hpMult);
      });
  }

  getLivingEnemies() {
    return this.enemies.filter((e) => e.isAlive());
  }

  allDead() {
    return this.getLivingEnemies().length === 0;
  }
}

export function createCombatEncounter(
  isElite: boolean,
  isBoss: boolean,
  floor = 0,
  ascMult = 1
): Encounter {
  if (isBoss) {
    return new Encounter(['shulgen'], ascMult);
  }
  if (isElite) {
    const earlyElites = ['gremlin_nob', 'sentry', 'ulem_shadow', 'shurale_elite'];
    const midElites = [...earlyElites, 'azhdaha', 'yulmauz_elder', 'vampir_elder'];
    const lateElites = [...midElites, 'zarkum_guard'];
    let pool: string[];
    if (floor >= 11) pool = lateElites;
    else if (floor >= 6) pool = midElites;
    else pool = earlyElites;
    return new Encounter([rngPick(pool)], 1.15 * ascMult);
  }

  const act1Myth = ['shurale', 'bigalyash', 'bire', 'bapak', 'yulmauz'];
  const act2Myth = ['yulmauz', 'myaskay', 'vampir', 'bichura', 'yuha', 'shurale', 'bigalyash'];
  const act3Myth = ['myaskay', 'vampir', 'yuha', 'yulmauz', 'bichura', 'bapak'];

  let mythPool: string[] = [];
  if (floor <= 4) mythPool = act1Myth;
  else if (floor <= 9) mythPool = act2Myth;
  else mythPool = act3Myth;

  const regularPool = ['cultist', 'jaw_worm', 'louse', 'slime', 'sentry'].filter((id) => {
    if (floor <= 0) return ['louse', 'slime'].includes(id);
    if (floor <= 2) return ['louse', 'slime', 'cultist'].includes(id);
    if (floor <= 4) return ['cultist', 'jaw_worm', 'louse', 'slime'].includes(id);
    if (floor <= 9) return ['cultist', 'jaw_worm', 'slime'].includes(id);
    return true;
  });

  let count: number;
  if (floor <= 0) count = 1;
  else if (floor <= 2) count = rngChance(0.35) ? 2 : 1;
  else if (floor <= 4) count = rngChance(0.4) ? 2 : 1;
  else {
    const r = rng();
    count = floor <= 9
      ? r < 0.15 ? 3 : r < 0.45 ? 2 : 1
      : r < 0.2 ? 3 : r < 0.5 ? 2 : 1;
  }

  const enemies: string[] = [];
  const useMyth = mythPool.length > 0 && rngChance(0.35);

  for (let i = 0; i < count; i++) {
    if (useMyth && i === 0) {
      const mythId = rngPick(mythPool);
      if (mythId === 'bichura') {
        enemies.push('bichura', 'bichura');
        if (rngChance(0.4)) enemies.push('bichura');
      } else {
        enemies.push(mythId);
      }
    } else {
      enemies.push(rngPick(regularPool));
    }
  }

  return new Encounter(enemies, ascMult);
}
