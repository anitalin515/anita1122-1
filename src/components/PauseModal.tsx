import React, { useState } from 'react';
import { Play, RotateCcw, LogOut } from 'lucide-react';
import { DIFFICULTY_CONFIG, Difficulty } from '../types/game';

interface PauseModalProps {
  playerName: string;
  difficulty: Difficulty;
  currentScore: number;
  timeLeft: number;
  onResume: () => void;
  onRestart: () => void;
  onAbandon: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  playerName,
  difficulty,
  currentScore,
  timeLeft,
  onResume,
  onRestart,
  onAbandon,
}) => {
  const [confirmingAbandon, setConfirmingAbandon] = useState(false);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#091426]/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="w-full max-w-sm bg-[#0F1E36] border border-[#2A4063] rounded-2xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.65)] text-center">
        <h2 id="pause-title" className="text-xl font-bold text-slate-100">
          遊戲暫停
        </h2>
        <p className="mt-1.5 text-sm text-slate-300 tabular-nums">
          {playerName} · {DIFFICULTY_CONFIG[difficulty].label} · 剩餘 {timeLeft} 秒 · {currentScore} 分
        </p>

        {confirmingAbandon ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-rose-200 leading-relaxed">
              確定要放棄本局嗎？返回主畫面後，本局分數將不會列入排行榜。
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmingAbandon(false)}
                className="h-11 rounded-xl bg-[#1B3358] hover:bg-[#234170] text-slate-100 text-sm font-semibold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onAbandon}
                className="h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                確定放棄
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={onResume}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>繼續遊戲</span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="w-full h-11 rounded-xl bg-[#1B3358] hover:bg-[#234170] text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新開始</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmingAbandon(true)}
              className="w-full h-11 rounded-xl bg-transparent border border-rose-500/40 hover:bg-rose-950/50 text-rose-300 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>放棄本局</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
