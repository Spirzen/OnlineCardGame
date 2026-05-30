import type { GameEvent } from '../events';
import { getActNumber } from '../acts';
import { rngPick } from '../rng';

export function filterEventPool(
  events: GameEvent[],
  floor: number,
  seenIds: Set<string>,
  classId: string,
): GameEvent[] {
  const act = getActNumber(floor) as 1 | 2 | 3;
  const filtered = events.filter((e) => {
    if (e.acts && !e.acts.includes(act)) return false;
    if (e.minFloor !== undefined && floor < e.minFloor) return false;
    if (e.maxFloor !== undefined && floor > e.maxFloor) return false;
    if (e.classIds && !e.classIds.includes(classId)) return false;
    if (e.oncePerRun && seenIds.has(e.id)) return false;
    return true;
  });
  if (filtered.length > 0) return filtered;

  const withoutOnce = events.filter((e) => !e.oncePerRun || !seenIds.has(e.id));
  return withoutOnce.length > 0 ? withoutOnce : events;
}

export function pickEventForFloor(
  events: GameEvent[],
  floor: number,
  seenIds: Set<string>,
  classId: string,
): GameEvent {
  return rngPick(filterEventPool(events, floor, seenIds, classId));
}
