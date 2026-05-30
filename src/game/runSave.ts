import { RunState } from './runState';
import { Player } from './player';
import { GameMap, MapNode } from './map';
import { CombatManager } from './combat';
import { Encounter, Enemy } from './enemy';
import { Card, createCard } from './card';
import { Relic } from './relic';
import { SeededRNG, setActiveRng } from './rng';
import { GAME_EVENTS } from './events';
import { CODEX_BY_ID } from './codex';
import { loadMetaCodexUnlocks } from './metaCodex';
import type { CardData, RelicData, Screen } from './types';

const SAVE_KEY = 'ural_batyr_run_save';
const SAVE_VERSION = 1;

const RESUMABLE_SCREENS: Screen[] = [
  'map', 'combat', 'reward', 'shop', 'rest', 'smith', 'event', 'treasure', 'codex',
];

interface SavedNode {
  type: string;
  floor: number;
  col: number;
  row: number;
  visited: boolean;
  available: boolean;
  completed: boolean;
  connectionKeys: string[];
}

interface SavedMap {
  act: number;
  floors: SavedNode[][];
  currentNodeKey: string | null;
  bossNodeKey: string | null;
}

interface SavedEnemy {
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

interface SavedCombat {
  state: string;
  turn: number;
  log: string[];
  selectedCardIndex: number | null;
  selectedEnemyIndex: number | null;
  combatOver: boolean;
  victory: boolean;
  goldReward: number;
  enemies: SavedEnemy[];
}

interface SavedPlayer {
  maxHp: number;
  hp: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  block: number;
  strength: number;
  dexterity: number;
  vulnerable: number;
  weak: number;
  frail: number;
  metallicize: number;
  thorns: number;
  turnDrawBlocked: boolean;
  endTurnDraw: number;
  endTurnBlock: number;
  endTurnHeal: number;
  nextTurnEnergy: number;
  regen: number;
  immuneTurns: number;
  reflect: number;
  rageStacks: number;
  channelEnergy: number;
  deckDraw: CardData[];
  deckDiscard: CardData[];
  deckExhaust: CardData[];
  hand: CardData[];
  relics: RelicData[];
}

export interface SavedRun {
  version: number;
  screen: Screen;
  selectedClassId: string;
  isDailyRun: boolean;
  runSeed: number;
  ascensionLevel: number;
  kills: number;
  eventMessage: string;
  currentEventId: string | null;
  seenEventIds: string[];
  pendingNodeKey: string | null;
  deckModalOpen: boolean;
  banner: RunState['banner'];
  player: SavedPlayer;
  map: SavedMap | null;
  combat: SavedCombat | null;
  rewardCards: CardData[];
  shopCards: CardData[];
  shopRelics: RelicData[];
  treasureRelics: RelicData[];
  relicPickOptions: RelicData[];
  smithCards: CardData[];
  unlockedCodexIds: string[];
  codexDisplayQueueIds: string[];
  codexBrowseMode: boolean;
}

function nodeKey(floor: number, col: number): string {
  return `${floor}:${col}`;
}

function cardsToData(cards: Card[]): CardData[] {
  return cards.map((c) => c.toData());
}

function relicsToData(relics: Relic[]): RelicData[] {
  return relics.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    effect: r.effect,
    value: r.value,
    rarity: r.rarity,
  }));
}

function serializeMap(map: GameMap | null): SavedMap | null {
  if (!map) return null;
  const floors: SavedNode[][] = map.floors.map((floor) =>
    floor.map((node) => ({
      type: node.type,
      floor: node.floor,
      col: node.col,
      row: node.row,
      visited: node.visited,
      available: node.available,
      completed: node.completed,
      connectionKeys: node.connections.map((c) => nodeKey(c.floor, c.col)),
    }))
  );
  return {
    act: map.act,
    floors,
    currentNodeKey: map.currentNode ? nodeKey(map.currentNode.floor, map.currentNode.col) : null,
    bossNodeKey: map.bossNode ? nodeKey(map.bossNode.floor, map.bossNode.col) : null,
  };
}

function serializeEnemy(enemy: Enemy): SavedEnemy {
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

function serializePlayer(player: Player): SavedPlayer {
  return {
    maxHp: player.maxHp,
    hp: player.hp,
    energy: player.energy,
    maxEnergy: player.maxEnergy,
    gold: player.gold,
    block: player.block,
    strength: player.strength,
    dexterity: player.dexterity,
    vulnerable: player.vulnerable,
    weak: player.weak,
    frail: player.frail,
    metallicize: player.metallicize,
    thorns: player.thorns,
    turnDrawBlocked: player.turnDrawBlocked,
    endTurnDraw: player.endTurnDraw,
    endTurnBlock: player.endTurnBlock,
    endTurnHeal: player.endTurnHeal,
    nextTurnEnergy: player.nextTurnEnergy,
    regen: player.regen,
    immuneTurns: player.immuneTurns,
    reflect: player.reflect,
    rageStacks: player.rageStacks,
    channelEnergy: player.channelEnergy,
    deckDraw: cardsToData(player.deck.drawPile),
    deckDiscard: cardsToData(player.deck.discardPile),
    deckExhaust: cardsToData(player.deck.exhaustPile),
    hand: cardsToData(player.hand.cards),
    relics: relicsToData(player.relics),
  };
}

export function serializeRun(run: RunState): SavedRun | null {
  if (!RESUMABLE_SCREENS.includes(run.screen)) return null;

  return {
    version: SAVE_VERSION,
    screen: run.screen,
    selectedClassId: run.selectedClassId,
    isDailyRun: run.isDailyRun,
    runSeed: run.runSeed,
    ascensionLevel: run.ascensionLevel,
    kills: run.kills,
    eventMessage: run.eventMessage,
    currentEventId: run.currentEvent?.id ?? null,
    seenEventIds: run.seenEventIds,
    pendingNodeKey: run.pendingNode ? nodeKey(run.pendingNode.floor, run.pendingNode.col) : null,
    deckModalOpen: run.deckModalOpen,
    banner: run.banner,
    player: serializePlayer(run.player),
    map: serializeMap(run.gameMap),
    combat: run.combat
      ? {
          state: run.combat.state,
          turn: run.combat.turn,
          log: [...run.combat.log],
          selectedCardIndex: run.combat.selectedCardIndex,
          selectedEnemyIndex: run.combat.selectedEnemyIndex,
          combatOver: run.combat.combatOver,
          victory: run.combat.victory,
          goldReward: run.combat.goldReward,
          enemies: run.combat.encounter.enemies.map(serializeEnemy),
        }
      : null,
    rewardCards: cardsToData(run.rewardCards),
    shopCards: cardsToData(run.shopCards),
    shopRelics: relicsToData(run.shopRelics),
    treasureRelics: relicsToData(run.treasureRelics),
    relicPickOptions: relicsToData(run.relicPickOptions),
    smithCards: cardsToData(run.smithCards),
    unlockedCodexIds: run.unlockedCodexIds,
    codexDisplayQueueIds: run.codexDisplayQueue.map((e) => e.id),
    codexBrowseMode: run.codexBrowseMode,
  };
}

function restorePlayer(data: SavedPlayer): Player {
  const player = new Player();
  Object.assign(player, {
    maxHp: data.maxHp,
    hp: data.hp,
    energy: data.energy,
    maxEnergy: data.maxEnergy,
    gold: data.gold,
    block: data.block,
    strength: data.strength,
    dexterity: data.dexterity,
    vulnerable: data.vulnerable,
    weak: data.weak,
    frail: data.frail,
    metallicize: data.metallicize,
    thorns: data.thorns,
    turnDrawBlocked: data.turnDrawBlocked,
    endTurnDraw: data.endTurnDraw,
    endTurnBlock: data.endTurnBlock,
    endTurnHeal: data.endTurnHeal,
    nextTurnEnergy: data.nextTurnEnergy,
    regen: data.regen,
    immuneTurns: data.immuneTurns,
    reflect: data.reflect,
    rageStacks: data.rageStacks,
    channelEnergy: data.channelEnergy,
  });
  player.deck.drawPile = data.deckDraw.map(createCard);
  player.deck.discardPile = data.deckDiscard.map(createCard);
  player.deck.exhaustPile = data.deckExhaust.map(createCard);
  player.hand.cards = data.hand.map(createCard);
  player.relics = data.relics.map((r) => new Relic(r));
  return player;
}

function restoreMap(data: SavedMap): GameMap {
  const map = Object.create(GameMap.prototype) as GameMap;
  map.act = data.act;
  map.floors = [];
  const keyToNode = new Map<string, MapNode>();

  for (const floor of data.floors) {
    const floorNodes: MapNode[] = [];
    for (const sn of floor) {
      const node = new MapNode(sn.type, sn.floor, sn.col, sn.row);
      node.visited = sn.visited;
      node.available = sn.available;
      node.completed = sn.completed;
      floorNodes.push(node);
      keyToNode.set(nodeKey(sn.floor, sn.col), node);
    }
    map.floors.push(floorNodes);
  }

  for (const floor of data.floors) {
    for (const sn of floor) {
      const node = keyToNode.get(nodeKey(sn.floor, sn.col))!;
      for (const ck of sn.connectionKeys) {
        const target = keyToNode.get(ck);
        if (target) node.connections.push(target);
      }
    }
  }

  map.currentNode = data.currentNodeKey ? keyToNode.get(data.currentNodeKey) ?? null : null;
  map.bossNode = data.bossNodeKey ? keyToNode.get(data.bossNodeKey) ?? null : null;
  return map;
}

function restoreCombat(data: SavedCombat, player: Player): CombatManager {
  const enemyIds = data.enemies.map((e) => e.id);
  const encounter = new Encounter(enemyIds, 1);
  data.enemies.forEach((se, i) => {
    const enemy = encounter.enemies[i];
    if (enemy) Object.assign(enemy, se);
  });

  const combat = Object.create(CombatManager.prototype) as CombatManager;
  combat.player = player;
  combat.encounter = encounter;
  combat.state = data.state;
  combat.turn = data.turn;
  combat.log = [...data.log];
  combat.selectedCardIndex = data.selectedCardIndex;
  combat.selectedEnemyIndex = data.selectedEnemyIndex;
  combat.combatOver = data.combatOver;
  combat.victory = data.victory;
  combat.goldReward = data.goldReward;
  return combat;
}

export function deserializeRun(data: SavedRun): RunState | null {
  if (data.version !== SAVE_VERSION) return null;
  if (!RESUMABLE_SCREENS.includes(data.screen)) return null;

  setActiveRng(new SeededRNG(data.runSeed));

  const run = new RunState();
  run.screen = data.screen;
  run.selectedClassId = data.selectedClassId;
  run.isDailyRun = data.isDailyRun;
  run.runSeed = data.runSeed;
  run.ascensionLevel = data.ascensionLevel ?? 0;
  run.kills = data.kills;
  run.eventMessage = data.eventMessage;
  run.seenEventIds = data.seenEventIds ?? [];
  run.deckModalOpen = data.deckModalOpen;
  run.banner = data.banner;
  run.player = restorePlayer(data.player);
  run.gameMap = data.map ? restoreMap(data.map) : null;
  run.combat = data.combat ? restoreCombat(data.combat, run.player) : null;
  run.rewardCards = data.rewardCards.map(createCard);
  run.shopCards = data.shopCards.map(createCard);
  run.shopRelics = data.shopRelics.map((r) => new Relic(r));
  run.treasureRelics = data.treasureRelics.map((r) => new Relic(r));
  run.relicPickOptions = data.relicPickOptions.map((r) => new Relic(r));
  run.smithCards = data.smithCards.map(createCard);

  run.unlockedCodexIds = data.unlockedCodexIds ?? [];
  run.codexDisplayQueue = (data.codexDisplayQueueIds ?? [])
    .map((id) => CODEX_BY_ID[id])
    .filter(Boolean);
  run.codexBrowseMode = data.codexBrowseMode ?? false;

  for (const id of loadMetaCodexUnlocks()) {
    if (!run.unlockedCodexIds.includes(id)) run.unlockedCodexIds.push(id);
  }

  if (data.currentEventId) {
    run.currentEvent = GAME_EVENTS.find((e) => e.id === data.currentEventId) ?? null;
  }

  if (data.pendingNodeKey && run.gameMap) {
    const [floor, col] = data.pendingNodeKey.split(':').map(Number);
    run.pendingNode = run.gameMap.floors[floor]?.[col] ?? null;
  }

  return run;
}

export function saveRun(run: RunState): void {
  const data = serializeRun(run);
  if (!data) {
    clearSavedRun();
    return;
  }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function loadSavedRun(): RunState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedRun;
    return deserializeRun(data);
  } catch {
    return null;
  }
}

export function hasSavedRun(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as SavedRun;
    return data.version === SAVE_VERSION && RESUMABLE_SCREENS.includes(data.screen);
  } catch {
    return false;
  }
}

export function clearSavedRun(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function getSavedRunSummary(): { classId: string; floor: number; ascension: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedRun;
    if (data.version !== SAVE_VERSION) return null;
    const floor = data.map?.currentNodeKey
      ? Number(data.map.currentNodeKey.split(':')[0]) + 1
      : 1;
    return { classId: data.selectedClassId, floor, ascension: data.ascensionLevel ?? 0 };
  } catch {
    return null;
  }
}
