import React, { useState } from 'react';
import { Trophy, X } from 'lucide-react';
import {
  DIFFICULTY_CONFIG,
  Difficulty,
  LeaderboardByDifficulty,
} from '../types/game';
import { ChildAvatarIcon } from './CharacterPreview';

interface LeaderboardModalProps {
  board: LeaderboardByDifficulty;
  initialDifficulty: Difficulty;
  highlightId?: string | null;
  onClose: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  board,
  initialDifficulty,
  highlightId = null,
  onClose,
}) => {
  const [tab, setTab] = useState<Difficulty>(initialDifficulty);
  const entries = board[tab];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#091426]/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
    >
      <div className="w-full max-w-md bg-[#0F1E36] border border-[#2A4063] rounded-2xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 id="leaderboard-title" className="text-lg font-bold text-slate-100">
              各難度前 5 名排行榜
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉排行榜"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-[#1B3358] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-[#091426] border border-[#2A4063] rounded-xl">
          {DIFFICULTIES.map((diff) => {
            const active = tab === diff;
            return (
              <button
                key={diff}
                type="button"
                onClick={() => setTab(diff)}
                className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-[#132238]'
                }`}
              >
                {DIFFICULTY_CONFIG[diff].label}
              </button>
            );
          })}
        </div>

        {/* Top 5 List */}
        <div className="mt-4 space-y-2 min-h-[280px]">
          {entries.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-medium text-slate-300">
                「{DIFFICULTY_CONFIG[tab].label}」難度尚無紀錄
              </p>
              <p className="mt-1 text-xs text-slate-400">
                完成一局 60 秒挑戰後，最高分前 5 名將自動登錄於此。
              </p>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isHighlighted = highlightId === entry.id;
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${
                    isHighlighted
                      ? 'bg-[#1D3557] border-amber-400'
                      : 'bg-[#091426]/80 border-[#2A4063]/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 text-center font-mono-num text-sm font-bold shrink-0 ${
                        idx === 0
                          ? 'text-amber-400'
                          : idx === 1
                            ? 'text-slate-200'
                            : idx === 2
                              ? 'text-amber-600'
                              : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <ChildAvatarIcon gender={entry.gender} className="w-8 h-8 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate">
                        {entry.playerName}
                      </div>
                      <div className="text-xs text-slate-400 tabular-nums truncate">
                        金幣 {entry.stats.coin} · 禮物 {entry.stats.gift} · 糖果 {entry.stats.candy}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono-num text-base font-bold text-amber-300">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400">分</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full h-11 rounded-xl bg-[#1B3358] hover:bg-[#234170] text-slate-100 font-semibold text-sm transition-colors cursor-pointer"
        >
          返回
        </button>
      </div>
    </div>
  );
};
