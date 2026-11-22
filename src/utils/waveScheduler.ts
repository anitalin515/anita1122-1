import {
  CANDY_STYLES,
  COIN_STYLES,
  DIFFICULTY_CONFIG,
  Difficulty,
  GIFT_STYLES,
  ItemCategory,
  ItemStyle,
  ROUND_POSITIVE_QUOTA,
  RUSH_START_ELAPSED_SECONDS,
  ScheduledDrop,
} from '../types/game';

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickStyle(category: ItemCategory, index: number): ItemStyle {
  if (category === 'candy') {
    return CANDY_STYLES[index % CANDY_STYLES.length];
  }
  if (category === 'gift') {
    return GIFT_STYLES[index % GIFT_STYLES.length];
  }
  if (category === 'coin') {
    return COIN_STYLES[index % COIN_STYLES.length];
  }
  return 'fuse_bomb';
}

function preventTripleBombs(items: Array<{ category: ItemCategory; style: ItemStyle }>): void {
  for (let i = 2; i < items.length; i++) {
    if (
      items[i].category === 'bomb' &&
      items[i - 1].category === 'bomb' &&
      items[i - 2].category === 'bomb'
    ) {
      const swapIdx = items.findIndex((item, idx) => idx !== i && item.category !== 'bomb');
      if (swapIdx >= 0) {
        [items[i], items[swapIdx]] = [items[swapIdx], items[i]];
      }
    }
  }
}

/**
 * Generates a deterministic-total 5,000-point drop queue for a 60-second round.
 * Positive pool: 50 candies (1,000) + 30 gifts (1,500) + 25 coins (2,500) = 5,000 points.
 * Bomb count: 15 (easy) / 19 (normal) / 23 (hard).
 * Strictly enforces quantity order: candy > gift > coin > bomb.
 *
 * Pacing across the full 60s:
 * - Phase 1 (0.25s – 45.0s): ~60% of items, balanced mix.
 * - Phase 2 (45.0s – 59.45s): ~40% of items at accelerated toss rate right up to the buzzer,
 *   with slower candies finishing by 56.6s and fast coins/gifts/bombs continuing through 59.45s
 *   so items keep tossing until the game ends while staying catchable.
 */
export function buildRoundSchedule(difficulty: Difficulty): ScheduledDrop[] {
  const candies: Array<{ category: ItemCategory; style: ItemStyle }> = [];
  const gifts: Array<{ category: ItemCategory; style: ItemStyle }> = [];
  const coins: Array<{ category: ItemCategory; style: ItemStyle }> = [];
  const bombs: Array<{ category: ItemCategory; style: ItemStyle }> = [];

  for (let i = 0; i < ROUND_POSITIVE_QUOTA.candy; i++) {
    candies.push({ category: 'candy', style: pickStyle('candy', i) });
  }
  for (let i = 0; i < ROUND_POSITIVE_QUOTA.gift; i++) {
    gifts.push({ category: 'gift', style: pickStyle('gift', i) });
  }
  for (let i = 0; i < ROUND_POSITIVE_QUOTA.coin; i++) {
    coins.push({ category: 'coin', style: pickStyle('coin', i) });
  }
  const bombCount = DIFFICULTY_CONFIG[difficulty].bombCount;
  for (let i = 0; i < bombCount; i++) {
    bombs.push({ category: 'bomb', style: 'fuse_bomb' });
  }

  shuffleInPlace(candies);
  shuffleInPlace(gifts);
  shuffleInPlace(coins);

  // Split each category across Phase 1 (0.25-45s), Phase 2A (45-56.6s), and Finale (56.6-59.45s)
  const p1Candies = candies.slice(0, 32);
  const p2ACandies = candies.slice(32); // 18 candies in 45-56.6s

  const p1Gifts = gifts.slice(0, 18);
  const p2AGifts = gifts.slice(18, 26);
  const finaleGifts = gifts.slice(26); // 4 gifts in 56.6-59.45s

  const p1Coins = coins.slice(0, 14);
  const p2ACoins = coins.slice(14, 20);
  const finaleCoins = coins.slice(20); // 5 coins in 56.6-59.45s

  const p1BombCount = Math.round(bombCount * 0.58);
  const finaleBombCount = Math.max(2, Math.round(bombCount * 0.16));
  const p2ABombCount = bombCount - p1BombCount - finaleBombCount;

  const p1Bombs = bombs.slice(0, p1BombCount);
  const p2ABombs = bombs.slice(p1BombCount, p1BombCount + p2ABombCount);
  const finaleBombs = bombs.slice(p1BombCount + p2ABombCount);

  const phase1 = shuffleInPlace([...p1Candies, ...p1Gifts, ...p1Coins, ...p1Bombs]);
  const phase2A = shuffleInPlace([...p2ACandies, ...p2AGifts, ...p2ACoins, ...p2ABombs]);
  const finale = shuffleInPlace([...finaleGifts, ...finaleCoins, ...finaleBombs]);

  preventTripleBombs(phase1);
  preventTripleBombs(phase2A);
  preventTripleBombs(finale);

  const scheduled: ScheduledDrop[] = [];

  const assignSlots = (
    items: Array<{ category: ItemCategory; style: ItemStyle }>,
    start: number,
    end: number
  ) => {
    const step = (end - start) / Math.max(1, items.length);
    items.forEach((entry, idx) => {
      const baseTime = start + idx * step;
      const jitter = (Math.random() - 0.5) * step * 0.55;
      const t = Math.max(start, Math.min(end, baseTime + jitter));
      scheduled.push({ time: t, category: entry.category, style: entry.style });
    });
  };

  assignSlots(phase1, 0.25, RUSH_START_ELAPSED_SECONDS - 0.15);
  assignSlots(phase2A, RUSH_START_ELAPSED_SECONDS, 56.6);
  assignSlots(finale, 56.75, 59.45);

  return scheduled.sort((a, b) => a.time - b.time);
}
