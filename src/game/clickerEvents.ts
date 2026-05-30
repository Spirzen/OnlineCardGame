import type { GameEvent } from './events';
import { GAME_EVENTS } from './events';
import { CLICKER_EVENTS } from './events/clicker-events';
import { filterEventPool } from './events/eventPool';
import { rngChance, rngPick } from './rng';

/** Доля исцеляющих событий кликера при срабатывании. */
const CLICKER_HEAL_EVENT_WEIGHT = 0.62;

function choiceHasHeal(choice: GameEvent['choices'][number]): boolean {
  const fn = choice.apply.toString();
  return fn.includes('.heal(') || fn.includes('.hp = p.maxHp') || fn.includes('.hp=p.maxHp');
}

function eventHasHeal(event: GameEvent): boolean {
  return event.choices.some(choiceHasHeal);
}

const MAIN_EVENTS_WITH_HEAL = GAME_EVENTS.filter(eventHasHeal);

const MAIN_POOL_FOR_CLICKER = [
  ...MAIN_EVENTS_WITH_HEAL,
  ...GAME_EVENTS.filter((e) => !CLICKER_EVENTS.some((c) => c.id === e.id)),
];

export function getAllClickerEvents(): GameEvent[] {
  return [...CLICKER_EVENTS, ...GAME_EVENTS];
}

export function pickClickerEvent(level: number, seenIds: Set<string>): GameEvent {
  const floor = Math.min(level - 1, 14);

  const clickerPool = CLICKER_EVENTS.filter((e) => !e.oncePerRun || !seenIds.has(e.id));

  if (clickerPool.length > 0 && rngChance(CLICKER_HEAL_EVENT_WEIGHT)) {
    return rngPick(clickerPool);
  }

  const mainFiltered = filterEventPool(MAIN_POOL_FOR_CLICKER, floor, seenIds, 'warrior');
  const withHeal = mainFiltered.filter(eventHasHeal);

  if (withHeal.length > 0 && rngChance(0.45)) {
    return rngPick(withHeal);
  }

  if (mainFiltered.length > 0) return rngPick(mainFiltered);
  if (clickerPool.length > 0) return rngPick(clickerPool);
  return rngPick(CLICKER_EVENTS);
}
