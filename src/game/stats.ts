import type { SessionStats, LeaderboardEntry } from './types';

const STATS_KEY = 'teni_shpilya_stats';
const SETTINGS_KEY = 'teni_shpilya_settings';

export interface GameSettings {
  muted: boolean;
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as GameSettings;
  } catch {
    /* ignore */
  }
  return { muted: false };
}

export function saveSettings(s: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function loadSessionStats(): SessionStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionStats;
      return {
        totalRuns: parsed.totalRuns ?? 0,
        totalWins: parsed.totalWins ?? 0,
        bestFloor: parsed.bestFloor ?? 0,
        totalKills: parsed.totalKills ?? 0,
        dailyBestFloor: parsed.dailyBestFloor ?? 0,
        leaderboard: parsed.leaderboard ?? [],
        ascensionLevel: parsed.ascensionLevel ?? 0,
        maxAscensionUnlocked: parsed.maxAscensionUnlocked ?? 0,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    totalRuns: 0,
    totalWins: 0,
    bestFloor: 0,
    totalKills: 0,
    dailyBestFloor: 0,
    leaderboard: [],
    ascensionLevel: 0,
    maxAscensionUnlocked: 0,
  };
}

export function saveSessionStats(stats: SessionStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function setAscensionLevel(level: number): SessionStats {
  const stats = loadSessionStats();
  const clamped = Math.max(0, Math.min(level, stats.maxAscensionUnlocked));
  const updated = { ...stats, ascensionLevel: clamped };
  saveSessionStats(updated);
  return updated;
}

export function unlockAscension(stats: SessionStats, completedLevel: number): SessionStats {
  const next = Math.min(completedLevel + 1, 10);
  if (next <= stats.maxAscensionUnlocked) return stats;
  const updated = { ...stats, maxAscensionUnlocked: next };
  saveSessionStats(updated);
  return updated;
}

export function addLeaderboardEntry(
  stats: SessionStats,
  entry: Omit<LeaderboardEntry, 'date'>
): SessionStats {
  const full: LeaderboardEntry = { ...entry, date: new Date().toISOString() };
  const leaderboard = [...stats.leaderboard, full]
    .sort((a, b) => b.floor - a.floor || b.kills - a.kills)
    .slice(0, 10);
  return { ...stats, leaderboard };
}
