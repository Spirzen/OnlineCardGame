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
import { SeededRNG, setActiveRng, dailySeed, randomSeed } from './rng';
import { loadSessionStats, saveSessionStats, addLeaderboardEntry, unlockAscension } from './stats';
import { clearSavedRun } from './runSave';
import { ClickerState, saveClickerBestLevel } from './clickerState';
import { clearClickerSave } from './clickerSave';
import { GAME_EVENTS, type GameEvent } from './events';
import { pickEventForFloor } from './events/eventPool';
import { upgradeCard } from './upgrade';
import {
  CODEX_BY_ID,
  getStartUnlocks,
  getUnlocksForAct,
  getUnlockForEnemyKill,
  getStoryTutorialUnlocks,
  type CodexEntry,
} from './codex';
import { addMetaCodexUnlocks, loadMetaCodexUnlocks } from './metaCodex';
import { setStoryTutorialStatus } from './storyTutorial';
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
  seenEventIds: string[] = [];
  currentEvent: GameEvent | null = null;
  pendingNode: MapNode | null = null;
  stats: SessionStats = loadSessionStats();
  banner: { title: string; subtitle?: string; type?: string } | null = null;
  selectedClassId = 'warrior';
  isDailyRun = false;
  runSeed = 0;
  ascensionLevel = 0;
  deckModalOpen = false;
  unlockedCodexIds: string[] = [];
  codexDisplayQueue: CodexEntry[] = [];
  codexBrowseMode = false;
  codexMenuMode = false;
  codexStoryReveal = false;
  epicNovelReturnScreen: Screen = 'menu';
  clicker: ClickerState | null = null;

  beginRunSetup(daily = false) {
    this.isDailyRun = daily;
    this.runSeed = daily ? dailySeed() : randomSeed();
    this.ascensionLevel = daily ? 0 : loadSessionStats().ascensionLevel;
    clearSavedRun();
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
    this.seenEventIds = [];
    this.unlockedCodexIds = [];
    this.codexDisplayQueue = [];
    this.codexBrowseMode = false;
    this.codexMenuMode = false;
    this.codexStoryReveal = false;
    this.stats.totalRuns++;
    saveSessionStats(this.stats);
    this.unlockCodexIds(getStartUnlocks());
    this.mergeMetaCodexUnlocks();
    this.showCodexQueue();
  }

  mergeMetaCodexUnlocks() {
    for (const id of loadMetaCodexUnlocks()) {
      if (!this.unlockedCodexIds.includes(id)) {
        this.unlockedCodexIds.push(id);
      }
    }
  }

  completeStoryTutorial() {
    setStoryTutorialStatus('completed');
    const ids = getStoryTutorialUnlocks();
    const newlyMeta = addMetaCodexUnlocks(ids);
    this.codexMenuMode = false;
    this.codexStoryReveal = true;
    if (newlyMeta.length > 0) {
      this.unlockCodexIds(newlyMeta);
    } else {
      this.mergeMetaCodexUnlocks();
    }
    this.showCodexQueue();
  }

  unlockCodexIds(ids: string[]) {
    const newlyUnlocked: CodexEntry[] = [];
    for (const id of ids) {
      if (!this.unlockedCodexIds.includes(id)) {
        this.unlockedCodexIds.push(id);
        const entry = CODEX_BY_ID[id];
        if (entry) newlyUnlocked.push(entry);
      }
    }
    for (const entry of newlyUnlocked) {
      if (!this.codexDisplayQueue.some((e) => e.id === entry.id)) {
        this.codexDisplayQueue.push(entry);
      }
    }
  }

  unlockCodexForEnemy(enemyId: string) {
    this.unlockCodexIds(getUnlockForEnemyKill(enemyId));
  }

  unlockCodexForAct(act: number) {
    this.unlockCodexIds(getUnlocksForAct(act));
  }

  showCodexQueue() {
    if (this.codexDisplayQueue.length > 0) {
      this.codexBrowseMode = false;
      this.screen = 'codex';
    } else {
      this.screen = this.gameMap ? 'map' : 'menu';
    }
  }

  openCodexBrowse() {
    this.codexMenuMode = false;
    this.codexBrowseMode = true;
    this.screen = 'codex';
  }

  openCodexFromMenu() {
    this.codexMenuMode = true;
    this.codexBrowseMode = true;
    this.codexDisplayQueue = [];
    this.codexStoryReveal = false;
    this.screen = 'codex';
  }

  openEpicNovel(fromScreen: Screen = 'menu') {
    this.epicNovelReturnScreen = fromScreen === 'codex' ? 'codex' : 'menu';
    this.screen = 'epic_novel';
  }

  closeEpicNovel() {
    this.screen = this.epicNovelReturnScreen;
  }

  dismissCodex() {
    this.codexDisplayQueue = [];
    this.codexBrowseMode = false;
    this.codexStoryReveal = false;
    const fromMenu = this.codexMenuMode;
    this.codexMenuMode = false;
    this.screen = fromMenu || !this.gameMap ? 'menu' : 'map';
  }

  enterNode(node: MapNode) {
    this.pendingNode = node;
    const ntype = node.type;

    if ([NODE_COMBAT, NODE_ELITE, NODE_BOSS].includes(ntype)) {
      const isElite = ntype === NODE_ELITE;
      const isBoss = ntype === NODE_BOSS;
      const ascMult = 1 + 0.12 * this.ascensionLevel;
      const encounter = createCombatEncounter(isElite, isBoss, node.floor, ascMult);
      this.combat = new CombatManager(this.player, encounter);
      this.screen = 'combat';
      const foe = encounter.enemies[0];
      if (isBoss) {
        this.banner = {
          title: foe?.name.toUpperCase() ?? 'ШУЛЬГЕН',
          subtitle:
            'Брат против брата. Шульген выпил кровь и ушёл к дивам — сегодня эпос спросит, чья правда сильнее.',
          type: 'boss',
        };
      } else if (isElite) {
        this.banner = {
          title: foe?.name.toUpperCase() ?? 'ДИВ НА ПУТИ',
          subtitle: foe?.description ?? 'Опасный противник!',
          type: 'elite',
        };
      } else {
        const mythIds = new Set([
          'yulmauz', 'myaskay', 'vampir', 'shurale', 'bigalyash', 'bire', 'bapak', 'bichura', 'yuha',
        ]);
        const isMyth = foe && mythIds.has(foe.id);
        this.banner = {
          title: isMyth ? foe!.name.toUpperCase() : 'БОЙ!',
          subtitle: isMyth ? foe!.description.slice(0, 120) + '…' : undefined,
          type: 'fight',
        };
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
      this.currentEvent = pickEventForFloor(
        GAME_EVENTS,
        node.floor,
        new Set(this.seenEventIds),
        this.selectedClassId,
      );
      if (this.currentEvent && !this.seenEventIds.includes(this.currentEvent.id)) {
        this.seenEventIds.push(this.currentEvent.id);
      }
      this.eventMessage = '';
      this.screen = 'event';
    }
  }

  onCombatVictory() {
    const defeated = this.combat?.encounter.enemies ?? [];
    for (const enemy of defeated) {
      this.unlockCodexForEnemy(enemy.id);
    }
    this.kills += defeated.length;
    this.stats.totalKills += defeated.length;
    saveSessionStats(this.stats);
    this.rewardCards = getRewardCards(3);
    this.screen = 'reward';
  }

  onCombatDefeat() {
    this.recordRunEnd(false);
    clearSavedRun();
    this.screen = 'game_over';
  }

  recordRunEnd(won: boolean) {
    const [floor] = this.gameMap?.getFloorProgress() ?? [0, 15];
    if (won) {
      this.stats.totalWins++;
      this.stats.bestFloor = Math.max(this.stats.bestFloor, 15);
      if (!this.isDailyRun) {
        this.stats = unlockAscension(this.stats, this.ascensionLevel);
      }
      if (this.isDailyRun) {
        this.stats.dailyBestFloor = Math.max(this.stats.dailyBestFloor, 15);
      }
      clearSavedRun();
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
    const completedFloor = this.pendingNode?.floor;
    if (this.gameMap && this.pendingNode) {
      this.gameMap.completeCurrentNode();
      if (this.gameMap.isBossFloor() && this.pendingNode.completed) {
        this.recordRunEnd(true);
        this.screen = 'victory';
        this.pendingNode = null;
        return;
      }
    }
    this.pendingNode = null;
    this.combat = null;

    // Кодекс между актами: этаж 5 (index 4) и этаж 10 (index 9)
    if (completedFloor === 4) {
      this.unlockCodexForAct(1);
      this.showCodexQueue();
      return;
    }
    if (completedFloor === 9) {
      this.unlockCodexForAct(2);
      this.showCodexQueue();
      return;
    }

    if (this.codexDisplayQueue.length > 0) {
      this.showCodexQueue();
      return;
    }

    this.screen = 'map';
  }

  goToMenu() {
    clearSavedRun();
    clearClickerSave();
    this.clicker = null;
    this.screen = 'menu';
    this.gameMap = null;
    this.combat = null;
  }

  beginClicker() {
    clearSavedRun();
    this.clicker = new ClickerState();
    this.clicker.begin();
    this.screen = 'clicker';
  }

  continueClicker(state: ClickerState) {
    clearSavedRun();
    this.clicker = state;
    this.screen = 'clicker';
  }

  clickerClick() {
    return this.clicker?.clickAttack() ?? null;
  }

  clickerTick(deltaMs: number) {
    return this.clicker?.tick(deltaMs) ?? null;
  }

  clickerBuyUpgrade(id: string) {
    return this.clicker?.buyUpgrade(id) ?? false;
  }

  clickerPickEvent(index: number) {
    this.clicker?.pickEventChoice(index);
  }

  clickerContinueEvent() {
    this.clicker?.continueFromEvent();
  }

  clickerGameOver() {
    if (this.clicker) {
      saveClickerBestLevel(this.clicker.level);
      this.clicker.subScreen = 'game_over';
    }
  }

  clickerRestart() {
    this.beginClicker();
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
