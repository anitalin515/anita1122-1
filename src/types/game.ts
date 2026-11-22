export type Gender = 'boy' | 'girl';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameStatus = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type ItemCategory = 'candy' | 'gift' | 'coin' | 'bomb';

export type ItemStyle =
  | 'cane'
  | 'swirl'
  | 'lollipop'
  | 'red_gold'
  | 'green_stripe'
  | 'blue_star'
  | 'star_coin'
  | 'snowflake_coin'
  | 'fuse_bomb';

export interface PlayerProfile {
  name: string;
  gender: Gender;
  difficulty: Difficulty;
}

export interface CaughtStats {
  candy: number;
  gift: number;
  coin: number;
  bomb: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  gender: Gender;
  difficulty: Difficulty;
  score: number;
  stats: CaughtStats;
  playedAt: string;
}

export type LeaderboardByDifficulty = Record<Difficulty, LeaderboardEntry[]>;

export interface HudSnapshot {
  score: number;
  timeLeft: number;
  stunLeft: number;
  stats: CaughtStats;
}

export interface ScheduledDrop {
  time: number;
  category: ItemCategory;
  style: ItemStyle;
}

export interface FallingItem {
  id: number;
  category: ItemCategory;
  style: ItemStyle;
  x: number;
  y: number;
  vx: number;
  vy: number;
  terminalVy: number;
  gravity: number;
  rotation: number;
  vr: number;
  radius: number;
  swayPhase: number;
  swayAmp: number;
  points: number;
  age: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity: number;
}

export interface FloatingPopup {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface Snowflake {
  x: number;
  y: number;
  radius: number;
  vy: number;
  vx: number;
  alpha: number;
  swayPhase: number;
}

export interface SantaState {
  x: number;
  y: number;
  baseY: number;
  vx: number;
  targetSpeed: number;
  directionChangeTimer: number;
  facing: 1 | -1;
  tossAnimTimer: number;
  bobPhase: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  facing: 1 | -1;
  stunTimer: number;
  catchBounceTimer: number;
  walkPhase: number;
  width: number;
  height: number;
}

export const ROUND_DURATION_SECONDS = 60;
export const ROUND_POSITIVE_TOTAL_POINTS = 5000;
export const RUSH_START_ELAPSED_SECONDS = 45;
export const RUSH_SPEED_MULTIPLIER = 1.32;
export const BOMB_STUN_SECONDS = 3.0;

export const ITEM_POINTS: Record<ItemCategory, number> = {
  bomb: -80,
  coin: 100,
  gift: 50,
  candy: 20,
};

// Strictly enforced fall speed hierarchy: bomb > coin > gift > candy (units per second on 760px reference height)
export const BASE_TERMINAL_SPEED: Record<ItemCategory, number> = {
  bomb: 560,
  coin: 410,
  gift: 295,
  candy: 205,
};

// Strictly enforced quantity hierarchy: candy (50) > gift (30) > coin (25) > bomb (15/19/23)
// Positive sum: 50*20 (1000) + 30*50 (1500) + 25*100 (2500) = 5000 points per round!
export const ROUND_POSITIVE_QUOTA = {
  candy: 50,
  gift: 30,
  coin: 25,
} as const;

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    shortDesc: string;
    speedMultiplier: number;
    bombCount: number;
    santaSpeedRange: [number, number];
  }
> = {
  easy: {
    label: '簡單',
    shortDesc: '物品掉落較慢 · 炸彈較少',
    speedMultiplier: 0.8,
    bombCount: 15,
    santaSpeedRange: [130, 200],
  },
  normal: {
    label: '正常',
    shortDesc: '標準節奏 · 均衡反應挑戰',
    speedMultiplier: 1.06,
    bombCount: 19,
    santaSpeedRange: [170, 260],
  },
  hard: {
    label: '困難',
    shortDesc: '物品掉落快速 · 高難度考驗',
    speedMultiplier: 1.4,
    bombCount: 23,
    santaSpeedRange: [215, 325],
  },
};

export const CANDY_STYLES: ItemStyle[] = ['cane', 'swirl', 'lollipop'];
export const GIFT_STYLES: ItemStyle[] = ['red_gold', 'green_stripe', 'blue_star'];
export const COIN_STYLES: ItemStyle[] = ['star_coin', 'snowflake_coin'];

const assetBase = import.meta.env.BASE_URL || '/';

export const BACKDROP_IMAGES = {
  portrait: `${assetBase}src/assets/images/winter_village_portrait_1795354032938.jpg`,
  landscape: `${assetBase}src/assets/images/winter_village_landscape_1795354032646.jpg`,
} as const;
