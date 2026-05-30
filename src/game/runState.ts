import {
  NODE_COMBAT,
  NODE_ELITE,
  NODE_BOSS,
  NODE_REST,
  NODE_SHOP,
  NODE_TREASURE,
  NODE_EVENT,
} from './settings';
import { Player } from './player';
import { GameMap, MapNode } from './map';
import { CombatManager } from './combat';
import { createCombatEncounter } from './enemy';
import { Card, getRewardCards, getShopCards } from './card';
import { Relic, getRelicPickOptions, getShopDiscount } from './relic';
import { getClass } from './classes';
import { SeededRNG, setActiveRng, dailySeed, randomSeed, rngPick } from './rng';
import { loadSessionStats, saveSessionStats, addLeaderboardEntry } from './stats';
import { GAME_EVENTS, type GameEvent } from './events';
import { upgradeCard } from './upgrade';
import type { Screen, SessionStats } from './types';

export class RunState {
  screen: Screen = 'menu';
  player = new Player();
  gameMap: GameMap | null = null;
  combat: CombatManager | null = null;
  rewardCards: Card[] = [];
  shopCards: Card[] = [];
  shopRelics: Relic[] = [];
  treasureRelics: Relic[] = [];
  relicPickOptions: Relic[] = [];
  smithCards: Card[] = [];
  kills = 0;
  eventMessage = '';
  currentEvent: GameEvent | null = null;
  pendingNode: MapNode | null = null;
  stats: SessionStats = loadSessionStats();
  banner: { title: string; subtitle?: string; type?: string } | null = null;
  selectedClassId = 'warrior';
  isDailyRun = false;
  runSeed = 0;
  deckModalOpen = false;

  beginRunSetup(daily = false) {
    this.isDailyRun = daily;
    this.runSeed = daily ? dailySeed() : randomSeed();
    this.screen = 'class_select';
  }

  selectClass(classId: string) {
    this.selectedClassId = classId;
    setActiveRng(new SeededRNG(this.runSeed));
    this.relicPickOptions = getRelicPickOptions(3);
    this.screen = 'relic_pick';
  }

  pickStarterRelic(index: number) {
    if (index >= 0 && index < this.relicPickOptions.length) {
      this.startRunWithClass(this.selectedClassId, this.relicPickOptions[index]);
    }
  }

  startRunWithClass(classId: string, starterRelic: Relic) {
    const cls = getClass(classId);
    setActiveRng(new SeededRNG(this.runSeed));
    this.player = new Player();
    this.player.maxHp = cls.hp;
    this.player.hp = cls.hp;
    this.player.maxEnergy = cls.energy;
    this.player.energy = cls.energy;
    this.player.gold = cls.gold;
    this.player.initDeck(classId);
    this.player.relics = [starterRelic];
    this.gameMap = new GameMap();
    this.combat = null;
    this.kills = 0;
    this.stats.totalRuns++;
    saveSessionStats(this.stats);
    this.screen = 'map';
  }

  enterNode(node: MapNode) {
    this.pendingNode = node;
    const ntype = node.type;

    if ([NODE_COMBAT, NODE_ELITE, NODE_BOSS].includes(ntype)) {
      const isElite = ntype === NODE_ELITE;
      const isBoss = ntype === NODE_BOSS;
      const encounter = createCombatEncounter(isElite, isBoss, node.floor);
      this.combat = new CombatManager(this.player, encounter);
      this.screen = 'combat';
      if (isBoss) {
        this.banner = { title: 'БОСС', subtitle: 'Судьба забега решается здесь', type: 'boss' };
      } else if (isElite) {
        this.banner = { title: 'ЭЛИТНЫЙ БОЙ', subtitle: 'Опасный противник!', type: 'elite' };
      } else {
        this.banner = { title: 'БОЙ!', type: 'fight' };
      }
    } else if (ntype === NODE_REST) {
      this.screen = 'rest';
    } else if (ntype === NODE_SHOP) {
      this.shopCards = getShopCards(5);
      this.shopRelics = getRelicPickOptions(2);
      this.screen = 'shop';
    } else if (ntype === NODE_TREASURE) {
      this.treasureRelics = getRelicPickOptions(3);
      this.screen = 'treasure';
    } else if (ntype === NODE_EVENT) {
      this.currentEvent = rngPick(GAME_EVENTS);
      this.eventMessage = '';
      this.screen = 'event';
    }
  }

  onCombatVictory() {
    this.kills += this.combat?.encounter.enemies.length ?? 0;
    this.stats.totalKills += this.combat?.encounter.enemies.length ?? 0;
    saveSessionStats(this.stats);
    this.rewardCards = getRewardCards(3);
    this.screen = 'reward';
  }

  onCombatDefeat() {
    this.recordRunEnd(false);
    this.screen = 'game_over';
  }

  recordRunEnd(won: boolean) {
    const [floor] = this.gameMap?.getFloorProgress() ?? [0, 15];
    if (won) {
      this.stats.totalWins++;
      this.stats.bestFloor = Math.max(this.stats.bestFloor, 15);
      if (this.isDailyRun) {
        this.stats.dailyBestFloor = Math.max(this.stats.dailyBestFloor, 15);
      }
    } else {
      this.stats.bestFloor = Math.max(this.stats.bestFloor, floor);
      if (this.isDailyRun) {
        this.stats.dailyBestFloor = Math.max(this.stats.dailyBestFloor, floor);
      }
    }
    this.stats = addLeaderboardEntry(this.stats, {
      floor: won ? 15 : floor,
      kills: this.kills,
      classId: this.selectedClassId,
      daily: this.isDailyRun,
    });
    saveSessionStats(this.stats);
  }

  pickRewardCard(index: number) {
    if (index >= 0 && index < this.rewardCards.length) {
      this.player.addCardToDeck(this.rewardCards[index]);
    }
    this.completeNode();
  }

  skipReward() {
    this.completeNode();
  }

  pickTreasureRelic(index: number) {
    if (index >= 0 && index < this.treasureRelics.length) {
      this.player.relics.push(this.treasureRelics[index]);
    }
    this.completeNode();
  }

  restHeal() {
    this.player.heal(Math.floor(this.player.maxHp / 4));
    this.completeNode();
  }

  openSmith() {
    const seen = new Set<string>();
    this.smithCards = this.player.deck
      .getAllCards()
      .filter((c) => {
        const k = `${c.id}:${c.name}`;
        if (c.upgraded || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    this.screen = 'smith';
  }

  smithUpgrade(index: number) {
    const card = this.smithCards[index];
    if (!card) return;
    const upgraded = upgradeCard(card);
    this.player.removeCardFromDeck(card);
    this.player.addCardToDeck(upgraded);
    this.completeNode();
  }

  buyShopCard(index: number) {
    if (index < 0 || index >= this.shopCards.length) return;
    const discount = getShopDiscount(this.player.relics);
    const price = Math.floor(50 * (1 - discount));
    if (this.player.gold >= price) {
      this.player.gold -= price;
      this.player.addCardToDeck(this.shopCards[index]);
      this.shopCards.splice(index, 1);
    }
  }

  removeShopCard(index: number) {
    const all = this.player.deck.getAllCards();
    if (index < 0 || index >= all.length) return;
    const discount = getShopDiscount(this.player.relics);
    const price = Math.floor(75 * (1 - discount));
    if (this.player.gold >= price) {
      this.player.gold -= price;
      this.player.removeCardFromDeck(all[index]);
    }
  }

  buyShopRelic(index: number) {
    if (index < 0 || index >= this.shopRelics.length) return;
    const discount = getShopDiscount(this.player.relics);
    const price = Math.floor(150 * (1 - discount));
    if (this.player.gold >= price) {
      this.player.gold -= price;
      this.player.relics.push(this.shopRelics[index]);
      this.shopRelics.splice(index, 1);
    }
  }

  leaveShop() {
    this.completeNode();
  }

  pickEventChoice(index: number) {
    if (!this.currentEvent) return;
    const choice = this.currentEvent.choices[index];
    if (choice) {
      this.eventMessage = choice.apply(this.player);
    }
  }

  continueFromEvent() {
    this.currentEvent = null;
    this.completeNode();
  }

  completeNode() {
    if (this.gameMap && this.pendingNode) {
      this.gameMap.completeCurrentNode();
      if (this.gameMap.isBossFloor() && this.pendingNode.completed) {
        this.recordRunEnd(true);
        this.screen = 'victory';
        this.pendingNode = null;
        return;
      }
    }
    this.screen = 'map';
    this.pendingNode = null;
    this.combat = null;
  }

  goToMenu() {
    this.screen = 'menu';
    this.gameMap = null;
    this.combat = null;
  }

  openStats() {
    this.stats = loadSessionStats();
    this.screen = 'stats';
  }

  openCardEditor() {
    this.screen = 'card_editor';
  }

  toggleDeckModal(open: boolean) {
    this.deckModalOpen = open;
  }
}

export { loadSessionStats, saveSessionStats };
