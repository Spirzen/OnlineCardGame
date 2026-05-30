const META_CODEX_KEY = 'ural_batyr_meta_codex';

export function loadMetaCodexUnlocks(): string[] {
  try {
    const raw = localStorage.getItem(META_CODEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

function saveMetaCodexUnlocks(ids: string[]) {
  try {
    localStorage.setItem(META_CODEX_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/** Добавляет id в мета-кодекс. Возвращает только что открытые записи. */
export function addMetaCodexUnlocks(newIds: string[]): string[] {
  const current = loadMetaCodexUnlocks();
  const added: string[] = [];
  for (const id of newIds) {
    if (!current.includes(id)) {
      current.push(id);
      added.push(id);
    }
  }
  if (added.length > 0) saveMetaCodexUnlocks(current);
  return added;
}

export function hasMetaCodexUnlocks(): boolean {
  return loadMetaCodexUnlocks().length > 0;
}
