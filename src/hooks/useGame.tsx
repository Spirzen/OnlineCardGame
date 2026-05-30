import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { RunState } from '../game/runState';
import { setStoryTutorialStatus } from '../game/storyTutorial';
import type { MapNode } from '../game/map';
import { sfx } from '../game/sfx';
import { saveRun, loadSavedRun, hasSavedRun, clearSavedRun } from '../game/runSave';
import {
  saveClickerRun,
  loadClickerRun,
  hasClickerSave,
} from '../game/clickerSave';
import { setAscensionLevel } from '../game/stats';

type GameAction =
  | { type: 'BEGIN_RUN' }
  | { type: 'BEGIN_DAILY' }
  | { type: 'RESUME_RUN' }
  | { type: 'SET_ASCENSION'; level: number }
  | { type: 'SELECT_CLASS'; classId: string }
  | { type: 'PICK_STARTER_RELIC'; index: number }
  | { type: 'GO_MENU' }
  | { type: 'GO_MAP' }
  | { type: 'OPEN_STATS' }
  | { type: 'OPEN_EDITOR' }
  | { type: 'SELECT_NODE'; node: MapNode }
  | { type: 'PLAY_CARD'; cardIndex: number; targetIndex: number | null }
  | { type: 'END_TURN' }
  | { type: 'SELECT_CARD'; index: number | null }
  | { type: 'SELECT_ENEMY'; index: number | null }
  | { type: 'RESPOND_COMBAT_DIALOGUE'; choiceIndex: number }
  | { type: 'PICK_REWARD'; index: number }
  | { type: 'SKIP_REWARD' }
  | { type: 'PICK_TREASURE'; index: number }
  | { type: 'REST_HEAL' }
  | { type: 'OPEN_SMITH' }
  | { type: 'SMITH_UPGRADE'; index: number }
  | { type: 'BUY_CARD'; index: number }
  | { type: 'BUY_RELIC'; index: number }
  | { type: 'REMOVE_CARD'; index: number }
  | { type: 'LEAVE_SHOP' }
  | { type: 'PICK_EVENT'; index: number }
  | { type: 'CONTINUE_EVENT' }
  | { type: 'DISMISS_CODEX' }
  | { type: 'OPEN_CODEX' }
  | { type: 'OPEN_CODEX_MENU' }
  | { type: 'OPEN_EPIC_NOVEL'; from?: 'menu' | 'codex' }
  | { type: 'CLOSE_EPIC_NOVEL' }
  | { type: 'START_STORY_TUTORIAL' }
  | { type: 'EXIT_STORY_TUTORIAL' }
  | { type: 'COMPLETE_STORY_TUTORIAL' }
  | { type: 'SKIP_STORY_TUTORIAL' }
  | { type: 'CLEAR_BANNER' }
  | { type: 'TOGGLE_DECK'; open: boolean }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'REFRESH' }
  | { type: 'BEGIN_CLICKER' }
  | { type: 'CONTINUE_CLICKER' }
  | { type: 'CLICKER_ATTACK' }
  | { type: 'CLICKER_TICK'; deltaMs: number }
  | { type: 'CLICKER_BUY_UPGRADE'; id: string }
  | { type: 'CLICKER_PICK_EVENT'; index: number }
  | { type: 'CLICKER_CONTINUE_EVENT' }
  | { type: 'CLICKER_RESTART' };

interface GameContextValue {
  run: RunState;
  tick: number;
  dispatch: (action: GameAction) => void;
  savedRunAvailable: boolean;
  clickerSaveAvailable: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

function applyAction(run: RunState, action: GameAction) {
  switch (action.type) {
    case 'BEGIN_RUN':
      run.beginRunSetup(false);
      break;
    case 'BEGIN_DAILY':
      run.beginRunSetup(true);
      break;
    case 'RESUME_RUN':
      break;
    case 'SET_ASCENSION':
      run.stats = setAscensionLevel(action.level);
      break;
    case 'SELECT_CLASS':
      run.selectClass(action.classId);
      break;
    case 'PICK_STARTER_RELIC':
      run.pickStarterRelic(action.index);
      break;
    case 'GO_MENU':
      run.goToMenu();
      break;
    case 'GO_MAP':
      run.screen = 'map';
      break;
    case 'OPEN_STATS':
      run.openStats();
      break;
    case 'OPEN_EDITOR':
      run.openCardEditor();
      break;
    case 'SELECT_NODE':
      if (run.gameMap?.selectNode(action.node)) {
        run.enterNode(action.node);
      }
      break;
    case 'SELECT_CARD':
      if (run.combat) run.combat.selectedCardIndex = action.index;
      break;
    case 'SELECT_ENEMY':
      if (run.combat) run.combat.selectedEnemyIndex = action.index;
      break;
    case 'RESPOND_COMBAT_DIALOGUE': {
      const combat = run.combat;
      if (!combat || combat.combatOver) break;
      const result = combat.respondToDialogue(action.choiceIndex);
      if (result) sfx.click();
      break;
    }
    case 'PLAY_CARD': {
      const combat = run.combat;
      if (!combat || combat.combatOver) break;
      const card = combat.player.hand.cards[action.cardIndex];
      if (!combat.canPlayCard(action.cardIndex)) break;
      if (combat.cardNeedsTarget(card)) {
        const target = combat.resolveTargetIndex(card, action.targetIndex);
        if (target === null) {
          combat.selectedCardIndex = action.cardIndex;
          break;
        }
      }
      combat.selectedCardIndex = null;
      combat.selectedEnemyIndex = null;
      const cardType = card.type;
      combat.playCard(action.cardIndex, action.targetIndex);
      if (cardType === 'attack' || cardType === 'creature') sfx.attack();
      else if (cardType === 'block') sfx.block();
      else sfx.card();
      if (combat.combatOver && combat.victory) {
        sfx.victory();
        run.onCombatVictory();
      } else if (combat.combatOver) {
        sfx.defeat();
        run.onCombatDefeat();
      }
      break;
    }
    case 'END_TURN': {
      const combat = run.combat;
      if (!combat || combat.combatOver) break;
      sfx.turn();
      combat.endPlayerTurn();
      if (combat.combatOver && combat.victory) {
        sfx.victory();
        run.onCombatVictory();
      } else if (combat.combatOver) {
        sfx.defeat();
        run.onCombatDefeat();
      }
      break;
    }
    case 'PICK_REWARD':
      run.pickRewardCard(action.index);
      break;
    case 'SKIP_REWARD':
      run.skipReward();
      break;
    case 'PICK_TREASURE':
      run.pickTreasureRelic(action.index);
      break;
    case 'REST_HEAL':
      run.restHeal();
      sfx.heal();
      break;
    case 'OPEN_SMITH':
      run.openSmith();
      break;
    case 'SMITH_UPGRADE':
      run.smithUpgrade(action.index);
      sfx.card();
      break;
    case 'BUY_CARD':
      run.buyShopCard(action.index);
      sfx.click();
      break;
    case 'BUY_RELIC':
      run.buyShopRelic(action.index);
      sfx.click();
      break;
    case 'REMOVE_CARD':
      run.removeShopCard(action.index);
      break;
    case 'LEAVE_SHOP':
      run.leaveShop();
      break;
    case 'PICK_EVENT':
      run.pickEventChoice(action.index);
      break;
    case 'CONTINUE_EVENT':
      run.continueFromEvent();
      break;
    case 'DISMISS_CODEX':
      run.dismissCodex();
      sfx.click();
      break;
    case 'OPEN_CODEX':
      run.openCodexBrowse();
      sfx.click();
      break;
    case 'OPEN_CODEX_MENU':
      run.openCodexFromMenu();
      sfx.click();
      break;
    case 'OPEN_EPIC_NOVEL':
      run.openEpicNovel(action.from === 'codex' ? 'codex' : 'menu');
      sfx.click();
      break;
    case 'CLOSE_EPIC_NOVEL':
      run.closeEpicNovel();
      sfx.click();
      break;
    case 'START_STORY_TUTORIAL':
      setStoryTutorialStatus('in_progress');
      run.screen = 'story_tutorial';
      sfx.click();
      break;
    case 'EXIT_STORY_TUTORIAL':
      run.screen = 'menu';
      sfx.click();
      break;
    case 'COMPLETE_STORY_TUTORIAL':
      run.completeStoryTutorial();
      sfx.click();
      break;
    case 'SKIP_STORY_TUTORIAL':
      setStoryTutorialStatus('declined');
      run.screen = 'menu';
      sfx.click();
      break;
    case 'CLEAR_BANNER':
      run.banner = null;
      break;
    case 'TOGGLE_DECK':
      run.toggleDeckModal(action.open);
      break;
    case 'TOGGLE_MUTE':
      sfx.toggleMute();
      break;
    case 'REFRESH':
      break;
    case 'BEGIN_CLICKER':
      run.beginClicker();
      sfx.click();
      break;
    case 'CONTINUE_CLICKER':
      break;
    case 'CLICKER_ATTACK': {
      const result = run.clickerClick();
      if (result && result.damage > 0) {
        sfx.attack();
        if (result.crit) sfx.elite();
      }
      if (result?.killed) sfx.victory();
      break;
    }
    case 'CLICKER_TICK': {
      const result = run.clickerTick(action.deltaMs);
      if (result?.gameOver) {
        run.clickerGameOver();
        sfx.defeat();
      }
      break;
    }
    case 'CLICKER_BUY_UPGRADE':
      if (run.clickerBuyUpgrade(action.id)) sfx.click();
      break;
    case 'CLICKER_PICK_EVENT':
      run.clickerPickEvent(action.index);
      sfx.click();
      break;
    case 'CLICKER_CONTINUE_EVENT':
      run.clickerContinueEvent();
      sfx.click();
      break;
    case 'CLICKER_RESTART':
      run.clickerRestart();
      sfx.click();
      break;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const runRef = useRef(new RunState());
  const [tick, setTick] = useState(0);
  const [savedRunAvailable, setSavedRunAvailable] = useState(hasSavedRun);
  const [clickerSaveAvailable, setClickerSaveAvailable] = useState(hasClickerSave);

  const dispatch = useCallback((action: GameAction) => {
    if (action.type === 'RESUME_RUN') {
      const saved = loadSavedRun();
      if (saved) runRef.current = saved;
    } else if (action.type === 'CONTINUE_CLICKER') {
      const saved = loadClickerRun();
      if (saved) runRef.current.continueClicker(saved);
    } else {
      applyAction(runRef.current, action);
    }
    if (runRef.current.screen === 'clicker') {
      saveClickerRun(runRef.current.clicker);
      clearSavedRun();
    } else {
      saveRun(runRef.current);
    }
    setSavedRunAvailable(hasSavedRun());
    setClickerSaveAvailable(hasClickerSave());
    setTick((t) => t + 1);
  }, []);

  return (
    <GameContext.Provider
      value={{ run: runRef.current, tick, dispatch, savedRunAvailable, clickerSaveAvailable }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
