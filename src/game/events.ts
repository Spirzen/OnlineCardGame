import type { Player } from './player';

export interface EventChoice {
  text: string;
  apply: (player: Player) => string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  /** Короткая справка об эпосе — для игроков, впервые знакомящихся с «Урал-батыром» */
  loreSnippet?: string;
  /** В каких актах может выпасть (1 — детство/степь, 2 — царство дивов, 3 — путь к роднику) */
  acts?: (1 | 2 | 3)[];
  minFloor?: number;
  maxFloor?: number;
  oncePerRun?: boolean;
  classIds?: string[];
  tags?: string[];
}

export { GAME_EVENTS } from './events/index';
