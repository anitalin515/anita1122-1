import React, { useState } from 'react';
import { Trophy, Volume2, VolumeX, Play } from 'lucide-react';
import {
  DIFFICULTY_CONFIG,
  Difficulty,
  Gender,
  PlayerProfile,
} from '../types/game';
import { isValidPlayerName } from '../utils/storage';
import { ChildAvatarIcon, ItemBadgeIcon } from './CharacterPreview';

interface TitleOverlayProps {
  profile: PlayerProfile;
  muted: boolean;
  onChangeProfile: (next: PlayerProfile) => void;
  onToggleMute: () => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  profile,
  muted,
  onChangeProfile,
  onToggleMute,
  onStartGame,
  onOpenLeaderboard,
}) => {
  const [touchedName, setTouchedName] = useState(false);

  const trimmedName = profile.name.trim();
  const nameValid = isValidPlayerName(profile.name);
  const showNameError = touchedName && !nameValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedName(true);
    if (!nameValid) return;
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Bar: Sound & Leaderboard */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto shrink-0">
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0F1E36]/90 border border-[#2A4063] text-slate-100 hover:bg-[#162947] active:scale-[0.98] transition-all flex items-center gap-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>排行榜</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? '開啟音效與音樂' : '靜音'}
          className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-[#0F1E36]/90 border border-[#2A4063] text-slate-100 hover:bg-[#162947] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400" />
          )}
          <span className="hidden sm:inline">{muted ? '已靜音' : '音效開啟'}</span>
        </button>
      </div>

      {/* Center Content: Title Lockup + Setup Form */}
      <div className="w-full max-w-4xl mx-auto my-auto py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-10">
        {/* Left/Top: Bespoke Title Lockup over calm starry sky space */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:flex-1">
          <svg
            viewBox="0 0 360 118"
            className="w-full max-w-[310px] sm:max-w-[360px] h-auto drop-shadow-[0_6px_18px_rgba(9,20,38,0.85)]"
            role="img"
            aria-label="星夜雪村接禮趣"
          >
            {/* Decorative crescent star accents */}
            <path
              d="M34 26 L37 33 L44 34 L38 39 L40 46 L34 42 L28 46 L30 39 L24 34 L31 33 Z"
              fill="#FBBF24"
            />
            <circle cx="326" cy="24" r="3" fill="#FDE68A" />
            <circle cx="312" cy="16" r="1.8" fill="#F8FAFC" opacity="0.8" />
            {/* Warm ribbon banner */}
            <path
              d="M66 14 L294 14 L286 30 L294 46 L66 46 L74 30 Z"
              fill="#B91C1C"
              stroke="#091426"
              strokeWidth="2.5"
            />
            <text
              x="180"
              y="35"
              textAnchor="middle"
              fill="#FEF3C7"
              fontSize="13"
              fontWeight="700"
              letterSpacing="2.5"
            >
              SANTA&apos;S MIDNIGHT DROP
            </text>
            {/* Main Chinese Title */}
            <text
              x="180"
              y="92"
              textAnchor="middle"
              fill="#F8FAFC"
              stroke="#091426"
              strokeWidth="6"
              paintOrder="stroke"
              fontSize="40"
              fontWeight="900"
              letterSpacing="2"
            >
              星夜雪村接禮趣
            </text>
            <text
              x="180"
              y="92"
              textAnchor="middle"
              fill="#FEF3C7"
              fontSize="40"
              fontWeight="900"
              letterSpacing="2"
            >
              星夜雪村接禮趣
            </text>
          </svg>

          <p className="mt-1.5 text-sm sm:text-base text-slate-200 max-w-md text-balance leading-relaxed drop-shadow-[0_2px_6px_rgba(9,20,38,0.9)]">
            聖誕老人正駕著雪橇在夜空拋撒驚喜，快拿好布袋接住寶物、閃避炸彈，挑戰 60 秒 5,000 分最高紀錄！最後 15 秒將進入高速衝刺！
          </p>

          {/* Unboxed Item Score Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-200 bg-[#091426]/70 px-4 py-2.5 rounded-xl border border-[#2A4063]/80">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <ItemBadgeIcon type="coin" className="w-5 h-5" />
              <span>金幣 +100</span>
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <ItemBadgeIcon type="gift" className="w-5 h-5" />
              <span>禮物 +50</span>
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <ItemBadgeIcon type="candy" className="w-5 h-5" />
              <span>糖果 +20</span>
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 tabular-nums text-rose-300">
              <ItemBadgeIcon type="bomb" className="w-5 h-5" />
              <span>炸彈 -80（暈眩 3 秒）</span>
            </span>
          </div>
        </div>

        {/* Right/Bottom: Player Setup Card (Single elevation) */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md mx-auto lg:mx-0 bg-[#0F1E36]/94 border border-[#2A4063] rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        >
          {/* 1. Player Name */}
          <div>
            <label
              htmlFor="player-name-input"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              玩家姓名
            </label>
            <input
              id="player-name-input"
              type="text"
              maxLength={12}
              value={profile.name}
              onChange={(e) => {
                onChangeProfile({ ...profile, name: e.target.value });
                if (!touchedName) setTouchedName(true);
              }}
              placeholder="輸入中文、英文或數字（1–12字）"
              className={`w-full h-12 px-4 rounded-xl bg-[#091426] border text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                showNameError
                  ? 'border-rose-500 focus:ring-rose-500/40'
                  : 'border-[#2A4063] focus:border-amber-400 focus:ring-amber-400/30'
              }`}
            />
            {showNameError ? (
              <p className="mt-1.5 text-xs text-rose-400">
                {trimmedName.length === 0
                  ? '請先輸入玩家姓名再開始遊戲。'
                  : '姓名僅能包含中文、英文字母或數字（不可含空格或符號）。'}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                可使用中文、英文或數字，最多 12 個字元
              </p>
            )}
          </div>

          {/* 2. Gender Selection */}
          <div className="mt-4">
            <span className="block text-sm font-medium text-slate-200 mb-1.5">角色性別</span>
            <div className="grid grid-cols-2 gap-3">
              {(['boy', 'girl'] as Gender[]).map((g) => {
                const selected = profile.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChangeProfile({ ...profile, gender: g })}
                    className={`min-h-[56px] px-3 py-2 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#1B3358] border-amber-400 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]'
                        : 'bg-[#091426]/80 border-[#2A4063] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <ChildAvatarIcon gender={g} className="w-9 h-9 shrink-0" />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {g === 'boy' ? '男孩' : '女孩'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Difficulty Selection */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-200">遊戲難易度</span>
              <span className="text-xs text-slate-400">
                {DIFFICULTY_CONFIG[profile.difficulty].shortDesc}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#091426] border border-[#2A4063] rounded-xl">
              {DIFFICULTIES.map((diff) => {
                const active = profile.difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onChangeProfile({ ...profile, difficulty: diff })}
                    className={`min-h-[44px] rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#132238]'
                    }`}
                  >
                    {DIFFICULTY_CONFIG[diff].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Start Game CTA */}
          <button
            type="submit"
            className="mt-5 w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>開始遊戲</span>
          </button>
        </form>
      </div>

      {/* Single flat control hint line */}
      <div className="w-full max-w-4xl mx-auto text-center text-xs text-slate-300/90 shrink-0 pt-1">
        <span>滑動螢幕或點擊左右方向鍵移動布袋 · 桌機可使用方向鍵 / A・D · 按 Esc 暫停</span>
      </div>
    </div>
  );
};
