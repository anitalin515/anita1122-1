import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Volume2, VolumeX } from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PauseModal } from './components/PauseModal';
import { TitleOverlay } from './components/TitleOverlay';
import {
  CaughtStats,
  DIFFICULTY_CONFIG,
  GameStatus,
  HudSnapshot,
  LeaderboardByDifficulty,
  PlayerProfile,
  ROUND_DURATION_SECONDS,
} from './types/game';
import { gameAudio } from './utils/audio';
import {
  isValidPlayerName,
  loadLeaderboard,
  loadMutedPreference,
  loadSavedProfile,
  recordLeaderboardScore,
  sanitizePlayerName,
  saveMutedPreference,
  saveProfile,
} from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadSavedProfile());
  const [muted, setMuted] = useState<boolean>(() => {
    const initial = loadMutedPreference();
    gameAudio.setMuted(initial);
    return initial;
  });

  const [status, setStatus] = useState<GameStatus>('TITLE_MENU');
  const [roundId, setRoundId] = useState<number>(1);
  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    timeLeft: ROUND_DURATION_SECONDS,
    stunLeft: 0,
    stats: { candy: 0, gift: 0, coin: 0, bomb: 0 },
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardByDifficulty>(() => loadLeaderboard());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    stats: CaughtStats;
    rank: number | null;
    entryId: string | null;
  } | null>(null);

  const leftHeldRef = useRef(false);
  const rightHeldRef = useRef(false);

  const releaseThumbButtons = useCallback(() => {
    leftHeldRef.current = false;
    rightHeldRef.current = false;
  }, []);

  const handleToggleMute = useCallback(() => {
    gameAudio.unlock();
    setMuted((prev) => {
      const next = !prev;
      gameAudio.setMuted(next);
      saveMutedPreference(next);
      return next;
    });
  }, []);

  const handleProfileChange = useCallback((next: PlayerProfile) => {
    setProfile(next);
    saveProfile(next);
  }, []);

  const handleStartGame = useCallback(() => {
    if (!isValidPlayerName(profile.name)) return;
    const cleanProfile: PlayerProfile = {
      ...profile,
      name: sanitizePlayerName(profile.name),
    };
    setProfile(cleanProfile);
    saveProfile(cleanProfile);

    releaseThumbButtons();
    setLastResult(null);
    setRoundId((prev) => prev + 1);
    setStatus('PLAYING');

    gameAudio.unlock();
    gameAudio.startBgm(true);
  }, [profile, releaseThumbButtons]);

  const handlePause = useCallback(() => {
    if (status !== 'PLAYING') return;
    releaseThumbButtons();
    gameAudio.pauseBgm();
    setStatus('PAUSED');
  }, [releaseThumbButtons, status]);

  const handleResume = useCallback(() => {
    if (status !== 'PAUSED') return;
    releaseThumbButtons();
    setStatus('PLAYING');
    gameAudio.startBgm(false);
  }, [releaseThumbButtons, status]);

  const handleRestart = useCallback(() => {
    releaseThumbButtons();
    setLastResult(null);
    setRoundId((prev) => prev + 1);
    setStatus('PLAYING');
    gameAudio.startBgm(true);
  }, [releaseThumbButtons]);

  const handleAbandon = useCallback(() => {
    releaseThumbButtons();
    gameAudio.stopBgm();
    setStatus('TITLE_MENU');
  }, [releaseThumbButtons]);

  const handleRoundComplete = useCallback(
    (finalScore: number, stats: CaughtStats) => {
      releaseThumbButtons();
      gameAudio.stopBgm();

      const { board, savedEntry, rank } = recordLeaderboardScore({
        playerName: sanitizePlayerName(profile.name) || '玩家',
        gender: profile.gender,
        difficulty: profile.difficulty,
        score: finalScore,
        stats,
      });

      setLeaderboard(board);
      setLastResult({
        score: finalScore,
        stats,
        rank,
        entryId: savedEntry.id,
      });
      setStatus('GAME_OVER');
    },
    [profile.difficulty, profile.gender, profile.name, releaseThumbButtons]
  );

  // Escape key pauses/resumes during gameplay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLeaderboard) {
          setShowLeaderboard(false);
        } else if (status === 'PLAYING') {
          handlePause();
        } else if (status === 'PAUSED') {
          handleResume();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePause, handleResume, showLeaderboard, status]);

  const isPlayOverlayVisible = status === 'PLAYING' || status === 'PAUSED' || status === 'GAME_OVER';
  const isStunned = hud.stunLeft > 0;

  return (
    <main className="relative w-full h-dvh overflow-hidden bg-[#091426] select-none">
      {/* Full-viewport 60fps Canvas Simulation */}
      <GameCanvas
        status={status}
        roundId={roundId}
        gender={profile.gender}
        difficulty={profile.difficulty}
        leftHeldRef={leftHeldRef}
        rightHeldRef={rightHeldRef}
        onHudUpdate={setHud}
        onRoundComplete={handleRoundComplete}
      />

      {/* Low-Occlusion Top HUD & Bottom Thumb Controls during active gameplay */}
      {isPlayOverlayVisible && (
        <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3 sm:p-4">
          {/* Top Perimeter HUD (No backdrop-filter over canvas, >=85% playfield unobstructed) */}
          <div className="flex items-start justify-between gap-2 w-full max-w-5xl mx-auto">
            {/* Left Cluster: Player + Score */}
            <div className="bg-[#091426]/88 border border-[#2A4063] rounded-xl px-3.5 py-2 flex items-center gap-3">
              <div>
                <div className="text-[11px] text-slate-400 leading-none">
                  {profile.name} · {DIFFICULTY_CONFIG[profile.difficulty].label}
                </div>
                <div className="mt-1 font-mono-num text-xl sm:text-2xl font-bold text-amber-300 leading-none">
                  {hud.score.toLocaleString()}
                  <span className="ml-1 text-xs font-sans font-medium text-slate-400">分</span>
                </div>
              </div>
            </div>

            {/* Center: Countdown Timer */}
            <div
              className={`border rounded-xl px-4 py-2 text-center ${
                hud.timeLeft <= 15
                  ? 'bg-[#3F1219]/92 border-rose-500/80 text-rose-200'
                  : 'bg-[#091426]/88 border-[#2A4063] text-slate-100'
              }`}
            >
              <div className="text-[11px] opacity-85 leading-none">
                {hud.timeLeft <= 15 && hud.timeLeft > 0 ? '加速衝刺中' : '剩餘時間'}
              </div>
              <div className="mt-1 font-mono-num text-xl sm:text-2xl font-bold leading-none">
                {hud.timeLeft}s
              </div>
            </div>

            {/* Right Cluster: Mute & Pause Actions */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={muted ? '開啟音效' : '靜音'}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-[#091426]/88 border border-[#2A4063] text-slate-200 hover:bg-[#162947] active:scale-[0.96] transition-all flex items-center justify-center cursor-pointer"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-amber-400" />
                )}
              </button>
              <button
                type="button"
                onClick={handlePause}
                aria-label="暫停遊戲"
                className="min-h-[44px] min-w-[44px] px-3 rounded-xl bg-[#091426]/88 border border-[#2A4063] text-slate-100 hover:bg-[#162947] active:scale-[0.96] transition-all flex items-center justify-center gap-1.5 text-sm font-semibold cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">暫停</span>
              </button>
            </div>
          </div>

          {/* Subtle Stun Status Banner (Text + Countdown alongside icon, never hue-only) */}
          {status === 'PLAYING' && isStunned && (
            <div className="mx-auto mb-auto mt-3 px-4 py-1.5 rounded-xl bg-[#450A0A]/92 border border-rose-500 text-rose-100 text-xs sm:text-sm font-semibold tabular-nums">
              炸彈暈眩中！暫時無法移動（{hud.stunLeft.toFixed(1)}s）
            </div>
          )}

          {/* Bottom Corner Ergonomic Left/Right Thumb Buttons (co-exists with canvas drag) */}
          {status === 'PLAYING' && (
            <div className="flex items-end justify-between w-full max-w-5xl mx-auto pb-1">
              <button
                type="button"
                aria-label="向左移動"
                onPointerDown={(e) => {
                  e.preventDefault();
                  gameAudio.unlock();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  leftHeldRef.current = true;
                }}
                onPointerUp={() => {
                  leftHeldRef.current = false;
                }}
                onPointerCancel={() => {
                  leftHeldRef.current = false;
                }}
                onLostPointerCapture={() => {
                  leftHeldRef.current = false;
                }}
                className={`pointer-events-auto w-16 h-14 sm:w-20 sm:h-14 rounded-2xl border flex items-center justify-center transition-transform active:scale-95 touch-none cursor-pointer ${
                  isStunned
                    ? 'bg-[#091426]/45 border-rose-500/40 text-rose-300/60'
                    : 'bg-[#091426]/72 border-[#3B5984]/80 text-slate-100 hover:bg-[#162947]/85'
                }`}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                type="button"
                aria-label="向右移動"
                onPointerDown={(e) => {
                  e.preventDefault();
                  gameAudio.unlock();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  rightHeldRef.current = true;
                }}
                onPointerUp={() => {
                  rightHeldRef.current = false;
                }}
                onPointerCancel={() => {
                  rightHeldRef.current = false;
                }}
                onLostPointerCapture={() => {
                  rightHeldRef.current = false;
                }}
                className={`pointer-events-auto w-16 h-14 sm:w-20 sm:h-14 rounded-2xl border flex items-center justify-center transition-transform active:scale-95 touch-none cursor-pointer ${
                  isStunned
                    ? 'bg-[#091426]/45 border-rose-500/40 text-rose-300/60'
                    : 'bg-[#091426]/72 border-[#3B5984]/80 text-slate-100 hover:bg-[#162947]/85'
                }`}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Title & Player Setup Overlay */}
      {status === 'TITLE_MENU' && (
        <TitleOverlay
          profile={profile}
          muted={muted}
          onChangeProfile={handleProfileChange}
          onToggleMute={handleToggleMute}
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Pause Modal */}
      {status === 'PAUSED' && (
        <PauseModal
          playerName={profile.name}
          difficulty={profile.difficulty}
          currentScore={hud.score}
          timeLeft={hud.timeLeft}
          onResume={handleResume}
          onRestart={handleRestart}
          onAbandon={handleAbandon}
        />
      )}

      {/* Game Over / Summary Modal */}
      {status === 'GAME_OVER' && lastResult && (
        <GameOverModal
          playerName={profile.name}
          gender={profile.gender}
          difficulty={profile.difficulty}
          finalScore={lastResult.score}
          stats={lastResult.stats}
          rank={lastResult.rank}
          onPlayAgain={handleRestart}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onBackToTitle={() => setStatus('TITLE_MENU')}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          board={leaderboard}
          initialDifficulty={profile.difficulty}
          highlightId={lastResult?.entryId ?? null}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </main>
  );
}
