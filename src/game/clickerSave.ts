import { ClickerState, type SavedClickerState } from './clickerState';

const SAVE_KEY = 'ural_batyr_clicker_save';
const SAVE_VERSION = 1;

export function saveClickerRun(state: ClickerState | null): void {
  if (!state || state.subScreen === 'game_over') {
    clearClickerSave();
    return;
  }
  try {
    const data = { version: SAVE_VERSION, ...state.serialize() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadClickerRun(): ClickerState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedClickerState & { version: number };
    if (data.version !== SAVE_VERSION) return null;
    if (data.subScreen === 'game_over') return null;
    return ClickerState.deserialize(data);
  } catch {
    return null;
  }
}

export function hasClickerSave(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as SavedClickerState & { version: number };
    return data.version === SAVE_VERSION && data.subScreen !== 'game_over';
  } catch {
    return false;
  }
}

export function clearClickerSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function getClickerSaveSummary(): { level: number; kills: number } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedClickerState & { version: number };
    if (data.version !== SAVE_VERSION) return null;
    return { level: data.level, kills: data.totalKills };
  } catch {
    return null;
  }
}
