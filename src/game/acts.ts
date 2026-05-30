import { LOCALE } from './locale';

export function getActLabel(floor: number): string {
  if (floor <= 5) return LOCALE.ACT_1;
  if (floor <= 10) return LOCALE.ACT_2;
  return LOCALE.ACT_3;
}

export function getActLore(floor: number): string {
  if (floor <= 5) return LOCALE.ACT_1_LORE;
  if (floor <= 10) return LOCALE.ACT_2_LORE;
  return LOCALE.ACT_3_LORE;
}

export function getActNumber(floor: number): number {
  if (floor <= 5) return 1;
  if (floor <= 10) return 2;
  return 3;
}
