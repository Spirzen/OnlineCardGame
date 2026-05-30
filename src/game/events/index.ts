import type { GameEvent } from '../events';
import { GAME_EVENTS_DATA } from '../eventsData';
import { CREATURE_EVENTS } from './creature-events';
import { SURREAL_EVENTS } from './surreal-events';
import { EPIC_EXTRA_EVENTS } from './epic-extra-events';

export const GAME_EVENTS: GameEvent[] = [
  ...GAME_EVENTS_DATA,
  ...CREATURE_EVENTS,
  ...SURREAL_EVENTS,
  ...EPIC_EXTRA_EVENTS,
];
