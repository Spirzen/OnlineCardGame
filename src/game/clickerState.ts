import { Player } from './player';
import {
  Enemy,
  createCombatEncounter,
  INTENT_ATTACK,
  INTENT_SPECIAL,
  INTENT_BLOCK_ATTACK,
  INTENT_DEBUFF,
} from './enemy';
import { pickClickerEvent, getAllClickerEvents } from './clickerEvents';
import { rngChance } from './rng';
import type { GameEvent } from './events';
import { LOCALE } from './locale';
import {
  getClickerActForLevel,
  getEnemyLore,
  getSpawnLore,
  getKillLore,
  getWhisperForLevel,
} from './clickerLore';

import {
  computeClickerBonuses,
  getClickerUpgrade,
  getUpgradeCostFor,
} from './clickerUpgrades';

export { CLICKER_UPGRADES, CLICKER_UPGRADES_BY_TIER } from './clickerUpgrades';
export type { ClickerUpgradeTier } from './clickerUpgrades';

export interface ClickerAttackResult {
  damage: number;
  crit: boolean;
  killed: boolean;
  goldEarned: number;
  combo: number;
}

export interface ClickerTickResult {
  autoDamage: number;
  regenAmount: number;
  enemyHitPlayer: boolean;
  playerDamage: number;
  killed: boolean;
  goldEarned: number;
  gameOver: boolean;
  eventTriggered: boolean;
}

export interface SavedClickerEnemy {
  id: string;
  maxHp: number;
  hp: number;
  block: number;
  strength: number;
  vulnerable: number;
  weak: number;
  intentIndex: number;
  currentIntent: string;
  intentValue: number;
  alive: boolean;
  stunTurns: number;
  poison: number;
  bleed: number;
  burn: number;
  marked: number;
  blindTurns: number;
  slowTurns: number;
  slowAmount: number;
}

export interface SavedClickerState {
  level: number;
  gold: number;
  totalKills: number;
  upgradeLevels: Record<string, number>;
  playerHp: number;
  playerMaxHp: number;
  seenEventIds: string[];
  currentEventId: string | null;
  eventMessage: string;
  subScreen: 'play' | 'event' | 'game_over';
  enemy: SavedClickerEnemy | null;
  enemyAttackTimer: number;
  comboCount: number;
  comboTimer: number;
  autoDamageBuffer: number;
  isElite: boolean;
  isBoss: boolean;
  actLabel: string;
  actLore: string;
  enemyLore: string;
  spawnLore: string;
  whisper: string;
  whisperTimer: number;
}

const COMBO_DECAY_MS = 1400;
const COMBO_MAX = 20;
const BASE_ATTACK_INTERVAL_MS = 4000;
const EVENT_CHANCE = 0.22;
const EVENT_EVERY_N_LEVELS = 5;
const WHISPER_ROTATE_MS = 18000;

/** Доля урона врагов от значений карточного боя (кликер без блока). */
const CLICKER_ENEMY_DAMAGE_MULT = 0.36;
const CLICKER_BOSS_DAMAGE_MULT = 0.3;
const CLICKER_ELITE_DAMAGE_MULT = 0.33;

export class ClickerState {
  level = 1;
  gold = 0;
  totalKills = 0;
  upgradeLevels: Record<string, number> = {};
  player = new Player();
  enemy: Enemy | null = null;
  seenEventIds: string[] = [];
  currentEvent: GameEvent | null = null;
  eventMessage = '';
  subScreen: 'play' | 'event' | 'game_over' = 'play';
  enemyAttackTimer = BASE_ATTACK_INTERVAL_MS;
  comboCount = 0;
  comboTimer = 0;
  autoDamageBuffer = 0;
  isElite = false;
  isBoss = false;
  actLabel = '';
  actLore = '';
  enemyLore = '';
  spawnLore = '';
  whisper = '';
  whisperTimer = WHISPER_ROTATE_MS;
  lastLog = '';
  lastClickResult: ClickerAttackResult | null = null;

  begin() {
    this.level = 1;
    this.gold = 0;
    this.totalKills = 0;
    this.upgradeLevels = {};
    this.seenEventIds = [];
    this.currentEvent = null;
    this.eventMessage = '';
    this.subScreen = 'play';
    this.comboCount = 0;
    this.comboTimer = 0;
    this.autoDamageBuffer = 0;
    this.lastLog = '';
    this.whisperTimer = WHISPER_ROTATE_MS;
    this.initPlayer();
    this.refreshActLore();
    this.spawnEnemy();
  }

  refreshActLore() {
    const act = getClickerActForLevel(this.level);
    this.actLabel = act.label;
    this.actLore = act.lore;
    this.whisper = getWhisperForLevel(this.level);
  }

  initPlayer() {
    this.player = new Player();
    this.player.maxHp = this.getMaxHp();
    this.player.hp = this.player.maxHp;
    this.player.gold = 0;
  }

  getBonuses() {
    return computeClickerBonuses(this.upgradeLevels);
  }

  getUpgradeLevel(id: string): number {
    return this.upgradeLevels[id] ?? 0;
  }

  getUpgradeCost(id: string): number {
    const def = getClickerUpgrade(id);
    if (!def) return Infinity;
    return getUpgradeCostFor(def, this.getUpgradeLevel(id));
  }

  getAmplifier(): number {
    return 1 + this.getBonuses().ampPct;
  }

  getClickBase(): number {
    const b = this.getBonuses();
    return (1 + Math.floor(this.level * 0.15) + b.click) * (1 + b.clickPct);
  }

  getComboMultiplier(): number {
    const b = this.getBonuses();
    return 1 + this.comboCount * (0.05 + b.comboPct);
  }

  getCritChance(): number {
    return Math.min(0.75, this.getBonuses().critPct);
  }

  getCritMultiplier(): number {
    return this.getBonuses().critMult;
  }

  getAutoDps(): number {
    const b = this.getBonuses();
    if (b.auto <= 0 && b.autoPct <= 0) return 0;
    const base = b.auto * (1 + b.autoPct);
    return base * this.getAmplifier();
  }

  getMaxHp(): number {
    const b = this.getBonuses();
    return Math.floor((100 + b.hp) * (1 + b.hpPct));
  }

  getRegenPerSec(): number {
    return this.getBonuses().regen;
  }

  getGoldMultiplier(): number {
    return 1 + this.getBonuses().goldPct;
  }

  getClickDamagePreview(): number {
    let damage = this.getClickBase() * this.getAmplifier() * this.getComboMultiplier();
    damage += this.player.strength * 0.5;
    return Math.max(1, Math.floor(damage));
  }

  calcClickDamage(): { damage: number; crit: boolean } {
    let damage = this.getClickBase() * this.getAmplifier() * this.getComboMultiplier();
    damage += this.player.strength * 0.5;
    const crit = rngChance(this.getCritChance());
    if (crit) damage *= this.getCritMultiplier();
    return { damage: Math.max(1, Math.floor(damage)), crit };
  }

  getEnemyAttackInterval(): number {
    const scale = Math.max(0.5, 1 - this.level * 0.0045);
    return BASE_ATTACK_INTERVAL_MS * scale;
  }

  /** Урон врага в кликере — ослаблен относительно карточного боя. */
  getClickerEnemyDamage(raw: number): number {
    let mult = CLICKER_ENEMY_DAMAGE_MULT;
    if (this.isBoss) mult = CLICKER_BOSS_DAMAGE_MULT;
    else if (this.isElite) mult = CLICKER_ELITE_DAMAGE_MULT;

    const levelSoftening = 1 / (1 + (this.level - 1) * 0.01);
    let scaled = raw * mult * levelSoftening;
    const cap = 6 + Math.floor(this.level * 0.34);
    if (this.isBoss) scaled = Math.min(scaled, cap + 5);
    return Math.max(1, Math.min(Math.floor(scaled), cap));
  }

  spawnEnemy() {
    this.isBoss = this.level > 0 && this.level % 25 === 0;
    this.isElite = !this.isBoss && this.level > 0 && this.level % 10 === 0;
    this.refreshActLore();
    const floor = Math.min(this.level - 1, 14);
    const encounter = createCombatEncounter(this.isElite, this.isBoss, floor, 1 + this.level * 0.04);
    this.enemy = encounter.enemies[0] ?? null;
    if (this.enemy) {
      const hpScale = 1 + (this.level - 1) * 0.18;
      this.enemy.maxHp = Math.floor(this.enemy.maxHp * hpScale);
      this.enemy.hp = this.enemy.maxHp;
      this.enemyLore = getEnemyLore(this.enemy.id);
      this.spawnLore = getSpawnLore(
        this.level,
        this.isElite,
        this.isBoss,
        this.enemy.id,
        this.enemy.name,
      );
    } else {
      this.enemyLore = '';
      this.spawnLore = '';
    }
    this.enemyAttackTimer = this.getEnemyAttackInterval();
  }

  registerCombo() {
    this.comboTimer = COMBO_DECAY_MS;
    this.comboCount = Math.min(COMBO_MAX, this.comboCount + 1);
  }

  tickCombo(deltaMs: number) {
    if (this.comboCount <= 0) return;
    this.comboTimer -= deltaMs;
    if (this.comboTimer <= 0) this.comboCount = 0;
  }

  applyDamageToEnemy(amount: number): number {
    if (!this.enemy?.isAlive()) return 0;
    return this.enemy.takeDamage(amount);
  }

  calcKillGold(): number {
    const base = 3 + Math.floor(this.level * 1.2);
    const bonus = this.isBoss ? 50 : this.isElite ? 15 : 0;
    return Math.floor((base + bonus) * this.getGoldMultiplier());
  }

  onEnemyKilled(): { gold: number; eventTriggered: boolean } {
    const enemyName = this.enemy?.name ?? LOCALE.CLICKER_LORE_UNKNOWN;
    const wasElite = this.isElite;
    const wasBoss = this.isBoss;
    const gold = this.calcKillGold();
    this.gold += gold;
    this.totalKills++;
    this.level++;
    const killLore = getKillLore(enemyName, wasElite, wasBoss);
    this.lastLog = LOCALE.CLICKER_KILL.replace('{lore}', killLore).replace('{gold}', String(gold));
    const eventTriggered = this.tryTriggerEvent(true);
    if (!eventTriggered) this.spawnEnemy();
    return { gold, eventTriggered };
  }

  tryTriggerEvent(afterKill: boolean): boolean {
    if (this.subScreen !== 'play') return false;
    const periodic = afterKill && this.level > 1 && (this.level - 1) % EVENT_EVERY_N_LEVELS === 0;
    const random = afterKill && this.level >= 2 && rngChance(EVENT_CHANCE);
    if (!periodic && !random) return false;

    const seen = new Set(this.seenEventIds);
    this.currentEvent = pickClickerEvent(this.level, seen);
    this.seenEventIds.push(this.currentEvent.id);
    this.eventMessage = '';
    this.subScreen = 'event';
    return true;
  }

  clickAttack(): ClickerAttackResult {
    const empty: ClickerAttackResult = {
      damage: 0,
      crit: false,
      killed: false,
      goldEarned: 0,
      combo: this.comboCount,
    };
    if (this.subScreen !== 'play' || !this.enemy?.isAlive()) {
      this.lastClickResult = empty;
      return empty;
    }

    this.registerCombo();
    const { damage, crit } = this.calcClickDamage();
    this.applyDamageToEnemy(damage);

    if (!this.enemy.isAlive()) {
      const { gold } = this.onEnemyKilled();
      const result = { damage, crit, killed: true, goldEarned: gold, combo: this.comboCount };
      this.lastClickResult = result;
      return result;
    }

    const result = { damage, crit, killed: false, goldEarned: 0, combo: this.comboCount };
    this.lastClickResult = result;
    return result;
  }

  enemyAttackPlayer(): number {
    if (!this.enemy?.isAlive() || this.subScreen !== 'play') return 0;

    const intent = this.enemy.currentIntent;
    let damage = 0;

    if (intent === INTENT_ATTACK || intent === INTENT_SPECIAL || intent === INTENT_BLOCK_ATTACK) {
      const raw = this.enemy.intentValue;
      if (intent === INTENT_BLOCK_ATTACK) this.enemy.block += this.enemy.blockValue;
      const dealt = this.player.takeDamage(this.getClickerEnemyDamage(raw));
      this.lastLog = LOCALE.CLICKER_ENEMY_HIT
        .replace('{name}', this.enemy.name)
        .replace('{dmg}', String(dealt));
      damage = dealt;
    } else if (intent === INTENT_DEBUFF) {
      this.player.applyVulnerable(Math.min(1, this.enemy.intentValue));
      this.lastLog = LOCALE.CLICKER_ENEMY_DEBUFF.replace('{name}', this.enemy.name);
    } else {
      this.enemy.block += this.enemy.intentValue;
    }

    this.enemy.planIntent();
    this.enemyAttackTimer = this.getEnemyAttackInterval();
    return damage;
  }

  tick(deltaMs: number): ClickerTickResult {
    const result: ClickerTickResult = {
      autoDamage: 0,
      regenAmount: 0,
      enemyHitPlayer: false,
      playerDamage: 0,
      killed: false,
      goldEarned: 0,
      gameOver: false,
      eventTriggered: false,
    };

    if (this.subScreen === 'game_over') return result;

    this.tickCombo(deltaMs);

    this.whisperTimer -= deltaMs;
    if (this.whisperTimer <= 0) {
      this.whisper = getWhisperForLevel(this.level);
      this.whisperTimer = WHISPER_ROTATE_MS;
    }

    if (this.subScreen === 'play' && this.player.hp < this.player.maxHp) {
      const regen = (this.getRegenPerSec() * deltaMs) / 1000;
      if (regen >= 0.01) {
        const before = this.player.hp;
        this.player.heal(regen);
        result.regenAmount = this.player.hp - before;
      }
    }

    const autoDps = this.getAutoDps();
    if (this.subScreen === 'play' && autoDps > 0 && this.enemy?.isAlive()) {
      this.autoDamageBuffer += (autoDps * deltaMs) / 1000;
      if (this.autoDamageBuffer >= 1) {
        const dmg = Math.floor(this.autoDamageBuffer);
        this.autoDamageBuffer -= dmg;
        result.autoDamage = this.applyDamageToEnemy(dmg);
        if (!this.enemy.isAlive()) {
          const kill = this.onEnemyKilled();
          result.killed = true;
          result.goldEarned = kill.gold;
          result.eventTriggered = kill.eventTriggered;
        }
      }
    }

    if (this.subScreen === 'play' && this.enemy?.isAlive()) {
      this.enemyAttackTimer -= deltaMs;
      if (this.enemyAttackTimer <= 0) {
        result.playerDamage = this.enemyAttackPlayer();
        result.enemyHitPlayer = result.playerDamage > 0;
        if (!this.player.isAlive()) {
          this.subScreen = 'game_over';
          result.gameOver = true;
        }
      }
    }

    return result;
  }

  buyUpgrade(id: string): boolean {
    const def = getClickerUpgrade(id);
    if (!def) return false;
    const level = this.getUpgradeLevel(id);
    if (level >= def.maxLevel) return false;

    const cost = this.getUpgradeCost(id);
    if (this.gold < cost) return false;

    this.gold -= cost;
    this.upgradeLevels[id] = level + 1;
    this.lastLog = def.description;

    const oldMax = this.player.maxHp;
    this.player.maxHp = this.getMaxHp();
    this.player.hp += this.player.maxHp - oldMax;

    return true;
  }

  pickEventChoice(index: number) {
    if (!this.currentEvent) return;
    const choice = this.currentEvent.choices[index];
    if (choice) {
      this.eventMessage = choice.apply(this.player);
      if (this.player.hp > this.player.maxHp) this.player.hp = this.player.maxHp;
    }
  }

  continueFromEvent() {
    this.currentEvent = null;
    this.eventMessage = '';
    this.subScreen = 'play';
    if (!this.enemy?.isAlive()) this.spawnEnemy();
  }

  serialize(): SavedClickerState {
    return {
      level: this.level,
      gold: this.gold,
      totalKills: this.totalKills,
      upgradeLevels: { ...this.upgradeLevels },
      playerHp: this.player.hp,
      playerMaxHp: this.player.maxHp,
      seenEventIds: [...this.seenEventIds],
      currentEventId: this.currentEvent?.id ?? null,
      eventMessage: this.eventMessage,
      subScreen: this.subScreen,
      enemy: this.enemy ? this.serializeEnemy(this.enemy) : null,
      enemyAttackTimer: this.enemyAttackTimer,
      comboCount: this.comboCount,
      comboTimer: this.comboTimer,
      autoDamageBuffer: this.autoDamageBuffer,
      isElite: this.isElite,
      isBoss: this.isBoss,
      actLabel: this.actLabel,
      actLore: this.actLore,
      enemyLore: this.enemyLore,
      spawnLore: this.spawnLore,
      whisper: this.whisper,
      whisperTimer: this.whisperTimer,
    };
  }

  private serializeEnemy(enemy: Enemy): SavedClickerEnemy {
    return {
      id: enemy.id,
      maxHp: enemy.maxHp,
      hp: enemy.hp,
      block: enemy.block,
      strength: enemy.strength,
      vulnerable: enemy.vulnerable,
      weak: enemy.weak,
      intentIndex: enemy.intentIndex,
      currentIntent: enemy.currentIntent,
      intentValue: enemy.intentValue,
      alive: enemy.alive,
      stunTurns: enemy.stunTurns,
      poison: enemy.poison,
      bleed: enemy.bleed,
      burn: enemy.burn,
      marked: enemy.marked,
      blindTurns: enemy.blindTurns,
      slowTurns: enemy.slowTurns,
      slowAmount: enemy.slowAmount,
    };
  }

  static deserialize(data: SavedClickerState): ClickerState {
    const state = new ClickerState();
    state.level = data.level;
    state.gold = data.gold;
    state.totalKills = data.totalKills;
    state.upgradeLevels = { ...data.upgradeLevels };
    state.seenEventIds = [...data.seenEventIds];
    state.eventMessage = data.eventMessage;
    state.subScreen = data.subScreen;
    state.enemyAttackTimer = data.enemyAttackTimer;
    state.comboCount = data.comboCount;
    state.comboTimer = data.comboTimer;
    state.autoDamageBuffer = data.autoDamageBuffer;
    state.isElite = data.isElite;
    state.isBoss = data.isBoss;
    state.actLabel = data.actLabel ?? '';
    state.actLore = data.actLore ?? '';
    state.enemyLore = data.enemyLore ?? '';
    state.spawnLore = data.spawnLore ?? '';
    state.whisper = data.whisper ?? getWhisperForLevel(data.level);
    state.whisperTimer = data.whisperTimer ?? WHISPER_ROTATE_MS;

    state.player = new Player();
    state.player.maxHp = state.getMaxHp();
    state.player.hp = Math.min(data.playerHp, state.player.maxHp);

    if (data.enemy) {
      const floor = Math.min(data.level - 1, 14);
      const enc = createCombatEncounter(data.isElite, data.isBoss, floor, 1);
      const enemy = enc.enemies.find((e) => e.id === data.enemy!.id) ?? enc.enemies[0];
      if (enemy) Object.assign(enemy, data.enemy);
      state.enemy = enemy ?? null;
      if (!state.enemyLore && state.enemy) {
        state.enemyLore = getEnemyLore(state.enemy.id);
      }
    }

    if (!state.actLabel) state.refreshActLore();

    if (data.currentEventId) {
      state.currentEvent = getAllClickerEvents().find((e) => e.id === data.currentEventId) ?? null;
    }

    return state;
  }
}

export function getClickerBestLevel(): number {
  try {
    const raw = localStorage.getItem('ural_batyr_clicker_best');
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveClickerBestLevel(level: number) {
  const best = getClickerBestLevel();
  if (level > best) {
    try {
      localStorage.setItem('ural_batyr_clicker_best', String(level));
    } catch {
      /* ignore */
    }
  }
}
