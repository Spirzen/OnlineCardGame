import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { RunState } from '../game/runState';
import type { MapNode } from '../game/map';
import { sfx } from '../game/sfx';

type GameAction =
  | { type: 'BEGIN_RUN' }
  | { type: 'BEGIN_DAILY' }
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
  | { type: 'CLEAR_BANNER' }
  | { type: 'TOGGLE_DECK'; open: boolean }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'REFRESH' };

interface GameContextValue {
  run: RunState;
  tick: number;
  dispatch: (action: GameAction) => void;
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
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const runRef = useRef(new RunState());
  const [tick, setTick] = useState(0);

  const dispatch = useCallback((action: GameAction) => {
    applyAction(runRef.current, action);
    setTick((t) => t + 1);
  }, []);

  return (
    <GameContext.Provider value={{ run: runRef.current, tick, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
