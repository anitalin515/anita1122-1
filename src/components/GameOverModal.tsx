import React from 'react';
import { RotateCcw, Trophy, Home } from 'lucide-react';
import {
  CaughtStats,
  DIFFICULTY_CONFIG,
  Difficulty,
  Gender,
  ROUND_POSITIVE_TOTAL_POINTS,
} from '../types/game';
import { ChildAvatarIcon, ItemBadgeIcon } from './CharacterPreview';

interface GameOverModalProps {
  playerName: string;
  gender: Gender;
  difficulty: Difficulty;
  finalScore: number;
  stats: CaughtStats;
  rank: number | null;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onBackToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  playerName,
  gender,
  difficulty,
  finalScore,
  stats,
  rank,
  onPlayAgain,
  onOpenLeaderboard,
  onBackToTitle,
}) => {
  const ratio = Math.max(0, Math.min(100, Math.round((finalScore / ROUND_POSITIVE_TOTAL_POINTS) * 100)));

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#091426]/82 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gameover-title"
    >
      <div className="w-full max-w-md bg-[#0F1E36] border border-[#2A4063] rounded-2xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.68)]">
        {/* Header with Avatar */}
        <div className="flex items-center gap-3.5">
          <ChildAvatarIcon gender={gender} className="w-12 h-12 shrink-0" />
          <div className="min-w-0">
            <h2 id="gameover-title" className="text-xl font-bold text-slate-100">
              時間到！本局結算
            </h2>
            <p className="text-sm text-slate-300 truncate">
              {playerName} · {DIFFICULTY_CONFIG[difficulty].label}難度
            </p>
          </div>
        </div>

        {/* Score Hero */}
        <div className="mt-5 py-4 px-4 rounded-xl bg-[#091426] border border-[#2A4063] text-center">
          <div className="text-xs font-medium text-slate-400">最終結算分數</div>
          <div className="mt-1 font-mono-num text-4xl font-bold text-amber-300">
            {finalScore.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400 tabular-nums">
            滿分總配分 {ROUND_POSITIVE_TOTAL_POINTS.toLocaleString()} 分 · 達成率 {ratio}%
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-[#1B3358] overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${ratio}%` }}
            />
          </div>

          {rank !== null && (
            <p className="mt-3 text-sm font-semibold text-amber-300">
              恭喜進入「{DIFFICULTY_CONFIG[difficulty].label}」排行榜第 {rank} 名！
            </p>
          )}
        </div>

        {/* Item Catch Breakdown */}
        <div className="mt-4 divide-y divide-[#2A4063]/60 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-slate-200">
              <ItemBadgeIcon type="coin" className="w-5 h-5" />
              <span>金幣（+100）</span>
            </span>
            <span className="font-mono-num text-slate-100">
              {stats.coin} 個 · +{(stats.coin * 100).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-slate-200">
              <ItemBadgeIcon type="gift" className="w-5 h-5" />
              <span>禮物（+50）</span>
            </span>
            <span className="font-mono-num text-slate-100">
              {stats.gift} 個 · +{(stats.gift * 50).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-slate-200">
              <ItemBadgeIcon type="candy" className="w-5 h-5" />
              <span>糖果（+20）</span>
            </span>
            <span className="font-mono-num text-slate-100">
              {stats.candy} 個 · +{(stats.candy * 20).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-rose-300">
              <ItemBadgeIcon type="bomb" className="w-5 h-5" />
              <span>炸彈（-80）</span>
            </span>
            <span className="font-mono-num text-rose-300">
              {stats.bomb} 次 · -{(stats.bomb * 80).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再玩一次</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="h-11 rounded-xl bg-[#1B3358] hover:bg-[#234170] text-slate-100 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>排行榜</span>
            </button>
            <button
              type="button"
              onClick={onBackToTitle}
              className="h-11 rounded-xl bg-[#091426] border border-[#2A4063] hover:bg-[#132238] text-slate-200 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>修改設定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
