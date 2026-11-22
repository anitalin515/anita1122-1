import {
  Difficulty,
  Gender,
  LeaderboardByDifficulty,
  LeaderboardEntry,
  PlayerProfile,
} from '../types/game';

const LEADERBOARD_KEY = 'santa_drop_leaderboard_v1';
const PROFILE_KEY = 'santa_drop_profile_v1';
const MUTE_KEY = 'santa_drop_muted_v1';

// Supports CJK Unified Ideographs (Chinese), English letters, and digits (1-12 chars)
const VALID_NAME_REGEX = /^[\u4e00-\u9fff\u3400-\u4dbfa-zA-Z0-9]{1,12}$/;

export function isValidPlayerName(raw: string): boolean {
  const trimmed = raw.trim();
  return VALID_NAME_REGEX.test(trimmed);
}

export function sanitizePlayerName(raw: string): string {
  return raw.trim();
}

export function loadSavedProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return { name: '', gender: 'boy', difficulty: 'normal' };
    }
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    const gender: Gender = parsed.gender === 'girl' ? 'girl' : 'boy';
    const difficulty: Difficulty =
      parsed.difficulty === 'easy' || parsed.difficulty === 'hard' ? parsed.difficulty : 'normal';
    const name = typeof parsed.name === 'string' && isValidPlayerName(parsed.name) ? parsed.name : '';
    return { name, gender, difficulty };
  } catch {
    return { name: '', gender: 'boy', difficulty: 'normal' };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadMutedPreference(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveMutedPreference(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
  } catch {
    // Ignore storage quota errors
  }
}

export function loadLeaderboard(): LeaderboardByDifficulty {
  const empty: LeaderboardByDifficulty = { easy: [], normal: [], hard: [] };
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<LeaderboardByDifficulty>;
    return {
      easy: Array.isArray(parsed.easy) ? parsed.easy.slice(0, 5) : [],
      normal: Array.isArray(parsed.normal) ? parsed.normal.slice(0, 5) : [],
      hard: Array.isArray(parsed.hard) ? parsed.hard.slice(0, 5) : [],
    };
  } catch {
    return empty;
  }
}

export function recordLeaderboardScore(
  entry: Omit<LeaderboardEntry, 'id' | 'playedAt'>
): {
  board: LeaderboardByDifficulty;
  savedEntry: LeaderboardEntry;
  rank: number | null;
} {
  const board = loadLeaderboard();
  const savedEntry: LeaderboardEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    playedAt: new Date().toISOString(),
  };

  const list = [...board[entry.difficulty], savedEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTotalCatch = a.stats.coin + a.stats.gift + a.stats.candy;
    const bTotalCatch = b.stats.coin + b.stats.gift + b.stats.candy;
    if (bTotalCatch !== aTotalCatch) return bTotalCatch - aTotalCatch;
    return new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime();
  });

  const top5 = list.slice(0, 5);
  const rankIndex = top5.findIndex((item) => item.id === savedEntry.id);

  const nextBoard: LeaderboardByDifficulty = {
    ...board,
    [entry.difficulty]: top5,
  };

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(nextBoard));
  } catch {
    // Ignore storage quota errors
  }

  return {
    board: nextBoard,
    savedEntry,
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
  };
}
