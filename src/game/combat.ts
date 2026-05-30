import { rngInt, rngChance } from './rng';
import {
  type ActiveCombatDialogue,
  COMBAT_DIALOGUE_CHANCE,
  COMBAT_DIALOGUE_MAX_PER_FIGHT,
  pickDialogueForEnemy,
  buildActiveDialogue,
  applyDialogueChoiceEffect,
  applyDialogueSilence,
} from './combatDialogues';
import {
  CARD_ATTACK,
  CARD_BLOCK,
  CARD_DEBUFF,
  CARD_CREATURE,
  STARTING_HAND,
  DRAW_PER_TURN,
} from './settings';
import { LOCALE } from './locale';
import type { Player } from './player';
import type { Encounter } from './enemy';
import type { Card } from './card';
import {
  applyRelicOnCombatStart,
  applyRelicOnCombatEnd,
  getExtraDraw,
  applyStartVulnerableToEnemies,
} from './relic';
import {
  applyOnPlayBonuses,
  modifyAttackDamage,
  shouldPierce,
  shouldDoubleHit,
  shouldLifesteal,
  shouldEcho,
  processPlayerEndTurn,
  processPlayerStartTurn,
} from './cardEffects';

export class CombatManager {
  static STATE_PLAYER_TURN = 'player_turn';
  static STATE_ENEMY_TURN = 'enemy_turn';
  static STATE_VICTORY = 'victory';
  static STATE_DEFEAT = 'defeat';

  player: Player;
  encounter: Encounter;
  state = CombatManager.STATE_PLAYER_TURN;
  turn = 0;
  log: string[] = [];
  selectedCardIndex: number | null = null;
  selectedEnemyIndex: number | null = null;
  combatOver = false;
  victory = false;
  goldReward = 0;
  activeDialogue: ActiveCombatDialogue | null = null;
  dialoguesShown = 0;
  dialogueIdsShown: string[] = [];

  constructor(player: Player, encounter: Encounter) {
    this.player = player;
    this.encounter = encounter;
    this.initCombat();
  }

  initCombat() {
    this.player.resetCombat();
    for (const relic of this.player.relics) {
      applyRelicOnCombatStart(this.player, relic);
    }

    const extraDraw = getExtraDraw(this.player.relics);
    const drawn = this.player.deck.draw(STARTING_HAND + extraDraw);
    for (const card of drawn) this.player.hand.add(card);

    const vulnRelic = applyStartVulnerableToEnemies(this.player.relics);
    if (vulnRelic) {
      for (const enemy of this.encounter.getLivingEnemies()) {
        enemy.applyVulnerable(vulnRelic.value);
      }
    }

    for (const relic of this.player.relics) {
      if (relic.effect === 'extra_energy') {
        for (const enemy of this.encounter.getLivingEnemies()) {
          enemy.strength += relic.value;
        }
      }
    }

    this.turn = 1;
    this.log = [LOCALE.COMBAT_STARTED, `${LOCALE.COMBAT_TURN} ${this.turn}${LOCALE.COMBAT_YOUR_TURN}`];
    this.maybeTriggerDialogue();
  }

  addLog(msg: string) {
    this.log.push(msg);
    if (this.log.length > 8) this.log = this.log.slice(-8);
  }

  hasActiveDialogue(): boolean {
    return this.activeDialogue !== null;
  }

  maybeTriggerDialogue() {
    if (this.combatOver || this.activeDialogue) return;
    if (this.dialoguesShown >= COMBAT_DIALOGUE_MAX_PER_FIGHT) return;
    if (!rngChance(COMBAT_DIALOGUE_CHANCE)) return;

    const living = this.encounter.getLivingEnemies();
    if (!living.length) return;

    const enemy = living[rngInt(living.length)];
    const enemyIndex = this.encounter.enemies.indexOf(enemy);
    const def = pickDialogueForEnemy(enemy.id, this.dialogueIdsShown);
    this.activeDialogue = buildActiveDialogue(def, enemy, enemyIndex);
    this.dialoguesShown++;
    this.dialogueIdsShown.push(def.id);
    this.addLog(`${enemy.name} обращается к вам…`);
  }

  respondToDialogue(choiceIndex: number): string | null {
    if (!this.activeDialogue || this.combatOver) return null;
    if (choiceIndex < 0 || choiceIndex > 3) return null;

    const { enemyName } = this.activeDialogue;
    let result: string;

    if (choiceIndex === 3) {
      result = applyDialogueSilence();
    } else {
      const choice = this.activeDialogue.choices[choiceIndex];
      if (!choice) return null;
      result = applyDialogueChoiceEffect(choice.effect, this.player);
    }

    this.activeDialogue = null;
    this.addLog(`${enemyName}: «…» — ${result}`);
    return result;
  }

  canPlayCard(cardIndex: number): boolean {
    if (this.activeDialogue) return false;
    if (this.state !== CombatManager.STATE_PLAYER_TURN) return false;
    if (cardIndex < 0 || cardIndex >= this.player.hand.cards.length) return false;
    return this.player.energy >= this.player.hand.cards[cardIndex].cost;
  }

  cardNeedsTarget(card: Card): boolean {
    const living = this.encounter.getLivingEnemies();
    return (
      [CARD_ATTACK, CARD_CREATURE, CARD_DEBUFF].includes(card.type) &&
      !card.aoe &&
      living.length > 0
    );
  }

  resolveTargetIndex(card: Card, targetIndex: number | null): number | null {
    if (!this.cardNeedsTarget(card)) return targetIndex;
    const living = this.encounter.getLivingEnemies();
    if (!living.length) return null;
    if (targetIndex !== null && targetIndex < living.length) return targetIndex;
    if (living.length === 1) return 0;
    return null;
  }

  playCard(cardIndex: number, targetEnemyIndex: number | null = null): boolean {
    if (!this.canPlayCard(cardIndex)) return false;
    const card = this.player.hand.cards[cardIndex];
    const target = this.resolveTargetIndex(card, targetEnemyIndex);
    if (this.cardNeedsTarget(card) && target === null) return false;
    if (!this.player.spendEnergy(card.cost)) return false;

    const played = this.player.hand.remove(cardIndex)!;
    for (const msg of this.resolveCard(played, target)) this.addLog(msg);
    this.player.deck.addToDiscard(played);

    if (this.encounter.allDead()) this.endCombatVictory();
    return true;
  }

  dealDamageToEnemy(enemy: ReturnType<Encounter['getLivingEnemies']>[0], baseDmg: number, card: Card, messages: string[]): number {
    const dmg = modifyAttackDamage(this, baseDmg, enemy, card);
    if (shouldPierce(card)) {
      enemy.hp = Math.max(0, enemy.hp - dmg);
      if (enemy.hp <= 0) enemy.alive = false;
      messages.push(`${card.name}: ${dmg} пробивного урона → ${enemy.name}`);
      return dmg;
    }
    const dealt = enemy.takeDamage(dmg);
    messages.push(`${card.name}: ${dmg} урона → ${enemy.name} (${dealt} прошло)`);
    return dealt;
  }

  resolveCard(card: Card, targetEnemyIndex: number | null): string[] {
    const messages: string[] = [];
    const living = this.encounter.getLivingEnemies();

    if ([CARD_ATTACK, CARD_CREATURE, CARD_DEBUFF].includes(card.type) || card.block > 0) {
      let targetList = living;
      if (card.aoe) targetList = [...living];
      else if (targetEnemyIndex !== null && targetEnemyIndex < living.length) {
        targetList = [living[targetEnemyIndex]];
      } else if (living.length) targetList = [living[0]];
      else targetList = [];

      if ([CARD_ATTACK, CARD_CREATURE].includes(card.type)) {
        let totalLifesteal = 0;
        const hits = shouldDoubleHit(card) ? 2 : 1;
        const perHit = shouldDoubleHit(card) ? Math.max(1, Math.floor(card.value / hits)) : card.value;
        for (let h = 0; h < hits; h++) {
          for (const enemy of targetList) {
            const base = this.player.getAttackDamage(perHit, card.strength_mult);
            const dealt = this.dealDamageToEnemy(enemy, base, card, messages);
            if (shouldLifesteal(card)) totalLifesteal += dealt;
          }
        }
        if (totalLifesteal > 0) {
          this.player.heal(totalLifesteal);
          messages.push(`Исцеление +${totalLifesteal}!`);
        }
        if (card.type === CARD_CREATURE && card.health > 0) {
          this.player.gainBlock(card.health);
          messages.push(`Существо даёт ${card.health} брони!`);
        }
      }

      if (card.block > 0 && card.type !== CARD_CREATURE) {
        this.player.gainBlock(card.block);
        messages.push(`+${card.block} брони!`);
      }
    }

    if (card.type === CARD_BLOCK) {
      this.player.gainBlock(card.value);
      messages.push(`+${card.value} брони!`);
    }

    if (card.type === CARD_DEBUFF && card.aoe && !card.bonuses?.length) {
      for (const enemy of living) {
        if (card.effect === 'vulnerable') enemy.applyVulnerable(card.effect_value);
        if (card.effect2 === 'weak') enemy.applyWeak(card.effect2_value);
      }
      messages.push('Ослабление всех врагов!');
    } else {
      applyOnPlayBonuses(this, card, targetEnemyIndex, messages);
    }

    if (shouldEcho(card) && [CARD_ATTACK, CARD_CREATURE].includes(card.type)) {
      messages.push('Эхо — повтор эффекта!');
      let echoTargets = living;
      if (!card.aoe && targetEnemyIndex !== null && targetEnemyIndex < living.length) {
        echoTargets = [living[targetEnemyIndex]];
      } else if (living.length) echoTargets = [living[0]];
      for (const enemy of echoTargets) {
        const base = this.player.getAttackDamage(Math.max(1, Math.floor(card.value / 2)), card.strength_mult);
        this.dealDamageToEnemy(enemy, base, card, messages);
      }
    }

    return messages;
  }

  endPlayerTurn() {
    if (this.activeDialogue) return;
    if (this.state !== CombatManager.STATE_PLAYER_TURN) return;
    const endMsgs: string[] = [];
    processPlayerEndTurn(this, endMsgs);
    for (const msg of endMsgs) this.addLog(msg);
    this.player.endTurn();
    this.state = CombatManager.STATE_ENEMY_TURN;
    this.addLog(LOCALE.COMBAT_END_YOUR_TURN);

    if (!this.player.isAlive()) {
      this.endCombatDefeat();
      return;
    }
    this.enemyTurn();
  }

  enemyTurn() {
    for (const enemy of this.encounter.getLivingEnemies()) {
      if (!this.player.isAlive()) break;
      for (const msg of enemy.executeIntent(this.player)) this.addLog(msg);
      if (this.player.thorns > 0 && enemy.isAlive()) {
        enemy.takeDamage(this.player.thorns);
        this.addLog(`Шипы: ${this.player.thorns} → ${enemy.name}`);
      }
    }

    if (this.encounter.allDead()) {
      this.endCombatVictory();
      return;
    }
    if (!this.player.isAlive()) {
      this.endCombatDefeat();
      return;
    }

    this.turn++;
    const startMsgs: string[] = [];
    processPlayerStartTurn(this, startMsgs);
    for (const msg of startMsgs) this.addLog(msg);
    this.player.startTurn();

    const drawn = this.player.deck.draw(DRAW_PER_TURN);
    for (const card of drawn) {
      if (!this.player.hand.add(card)) this.addLog(LOCALE.COMBAT_HAND_FULL);
    }

    if (this.player.relics.some((r) => r.effect === 'energy_every_n') && this.turn % 3 === 0) {
      this.player.gainEnergy(1);
      this.addLog('Счастливый цветок: +1 энергия!');
    }

    this.state = CombatManager.STATE_PLAYER_TURN;
    this.addLog(`${LOCALE.COMBAT_TURN} ${this.turn}${LOCALE.COMBAT_YOUR_TURN}`);
    this.maybeTriggerDialogue();
  }

  endCombatVictory() {
    this.state = CombatManager.STATE_VICTORY;
    this.combatOver = true;
    this.victory = true;
    this.goldReward = 10 + rngInt(16);
    if (this.encounter.enemies.some((e) => ['gremlin_nob', 'sentry'].includes(e.id))) {
      this.goldReward += 15;
    }
    if (this.encounter.enemies.some((e) => ['hexaghost', 'slime_boss', 'guardian'].includes(e.id))) {
      this.goldReward += 50;
    }
    this.player.gold += this.goldReward;
    for (const relic of this.player.relics) {
      applyRelicOnCombatEnd(this.player, relic);
    }
    this.addLog(`Победа! +${this.goldReward} золота.`);
  }

  endCombatDefeat() {
    this.state = CombatManager.STATE_DEFEAT;
    this.combatOver = true;
    this.victory = false;
    this.addLog(LOCALE.COMBAT_DEFEATED);
  }
}
