import React, { useEffect, useRef } from 'react';
import {
  BACKDROP_IMAGES,
  BASE_TERMINAL_SPEED,
  BOMB_STUN_SECONDS,
  CaughtStats,
  DIFFICULTY_CONFIG,
  Difficulty,
  FallingItem,
  FloatingPopup,
  GameStatus,
  Gender,
  HudSnapshot,
  ITEM_POINTS,
  Particle,
  PlayerState,
  ROUND_DURATION_SECONDS,
  RUSH_SPEED_MULTIPLIER,
  RUSH_START_ELAPSED_SECONDS,
  SantaState,
  ScheduledDrop,
  Snowflake,
} from '../types/game';
import { gameAudio } from '../utils/audio';
import {
  drawChild,
  drawFallingItem,
  drawFloatingPopups,
  drawGroundSnowbank,
  drawParticles,
  drawSantaAndSleigh,
  drawSnowfall,
} from '../utils/canvasDraw';
import { buildRoundSchedule } from '../utils/waveScheduler';

interface GameCanvasProps {
  status: GameStatus;
  roundId: number;
  gender: Gender;
  difficulty: Difficulty;
  leftHeldRef: React.MutableRefObject<boolean>;
  rightHeldRef: React.MutableRefObject<boolean>;
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onRoundComplete: (finalScore: number, stats: CaughtStats) => void;
}

const BASE_GRAVITY: Record<FallingItem['category'], number> = {
  bomb: 1240,
  coin: 920,
  gift: 680,
  candy: 480,
};

function getSpriteScale(width: number): { sleigh: number; child: number; item: number } {
  const largeBase = Math.max(1.22, Math.min(1.42, (width / 390) * 1.24));
  const childScale = Math.max(0.88, Math.min(1.02, (width / 390) * 0.92));
  return {
    sleigh: largeBase * 1.04,
    child: childScale,
    item: largeBase * 1.02,
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  status,
  roundId,
  gender,
  difficulty,
  leftHeldRef,
  rightHeldRef,
  onHudUpdate,
  onRoundComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const statusRef = useRef(status);
  statusRef.current = status;
  const genderRef = useRef(gender);
  genderRef.current = gender;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;
  const onHudUpdateRef = useRef(onHudUpdate);
  onHudUpdateRef.current = onHudUpdate;
  const onRoundCompleteRef = useRef(onRoundComplete);
  onRoundCompleteRef.current = onRoundComplete;

  // Preloaded storybook backdrops
  const portraitImgRef = useRef<HTMLImageElement | null>(null);
  const landscapeImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const pImg = new Image();
    pImg.src = BACKDROP_IMAGES.portrait;
    portraitImgRef.current = pImg;

    const lImg = new Image();
    lImg.src = BACKDROP_IMAGES.landscape;
    landscapeImgRef.current = lImg;
  }, []);

  // Mutable simulation state isolated from React renders
  const simRef = useRef({
    width: 390,
    height: 760,
    elapsed: 0,
    timeLeft: ROUND_DURATION_SECONDS,
    globalTime: 0,
    score: 0,
    stats: { candy: 0, gift: 0, coin: 0, bomb: 0 } as CaughtStats,
    schedule: [] as ScheduledDrop[],
    scheduleIndex: 0,
    nextItemId: 1,
    items: [] as FallingItem[],
    particles: [] as Particle[],
    popups: [] as FloatingPopup[],
    snowflakes: [] as Snowflake[],
    santa: {
      x: 195,
      y: 84,
      baseY: 84,
      vx: 150,
      targetSpeed: 150,
      directionChangeTimer: 1.5,
      facing: 1,
      tossAnimTimer: 0,
      bobPhase: 0,
    } as SantaState,
    player: {
      x: 195,
      y: 682,
      vx: 0,
      facing: 1,
      stunTimer: 0,
      catchBounceTimer: 0,
      walkPhase: 0,
      width: 54,
      height: 62,
    } as PlayerState,
    dragTargetX: null as number | null,
    activePointerId: null as number | null,
    keyLeft: false,
    keyRight: false,
    shakeTimer: 0,
    shakeMagnitude: 0,
    hitFlashTimer: 0,
    hitstopTimer: 0,
    rushApplied: false,
    roundEnded: false,
    lastHudScore: -999999,
    lastHudSec: -1,
    lastHudStun: -1,
  });

  // Reset round state whenever roundId increments
  useEffect(() => {
    const sim = simRef.current;
    const w = sim.width;
    const h = sim.height;
    const groundY = Math.max(240, h - 82);
    const diffCfg = DIFFICULTY_CONFIG[difficultyRef.current];
    const initSpeed =
      (diffCfg.santaSpeedRange[0] + diffCfg.santaSpeedRange[1]) * 0.5 * (Math.random() < 0.5 ? 1 : -1);

    sim.elapsed = 0;
    sim.timeLeft = ROUND_DURATION_SECONDS;
    sim.score = 0;
    sim.stats = { candy: 0, gift: 0, coin: 0, bomb: 0 };
    sim.schedule = buildRoundSchedule(difficultyRef.current);
    sim.scheduleIndex = 0;
    sim.nextItemId = 1;
    sim.items = [];
    sim.particles = [];
    sim.popups = [];
    sim.santa = {
      x: w * 0.5,
      y: Math.min(114, h * 0.148),
      baseY: Math.min(114, h * 0.148),
      vx: initSpeed,
      targetSpeed: initSpeed,
      directionChangeTimer: 1.2 + Math.random() * 1.6,
      facing: initSpeed >= 0 ? 1 : -1,
      tossAnimTimer: 0,
      bobPhase: 0,
    };
    sim.player = {
      x: w * 0.5,
      y: groundY,
      vx: 0,
      facing: 1,
      stunTimer: 0,
      catchBounceTimer: 0,
      walkPhase: 0,
      width: 50,
      height: 58,
    };
    sim.dragTargetX = null;
    sim.activePointerId = null;
    sim.shakeTimer = 0;
    sim.shakeMagnitude = 0;
    sim.hitFlashTimer = 0;
    sim.hitstopTimer = 0;
    sim.rushApplied = false;
    sim.roundEnded = false;
    sim.lastHudScore = 0;
    sim.lastHudSec = ROUND_DURATION_SECONDS;
    sim.lastHudStun = 0;

    onHudUpdateRef.current({
      score: 0,
      timeLeft: ROUND_DURATION_SECONDS,
      stunLeft: 0,
      stats: { candy: 0, gift: 0, coin: 0, bomb: 0 },
    });
  }, [roundId]);

  // Keyboard listeners + blur safety
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keyLeft = true;
        simRef.current.dragTargetX = null;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keyRight = true;
        simRef.current.dragTargetX = null;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        simRef.current.keyLeft = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        simRef.current.keyRight = false;
      }
    };
    const clearHeld = () => {
      simRef.current.keyLeft = false;
      simRef.current.keyRight = false;
      simRef.current.dragTargetX = null;
      simRef.current.activePointerId = null;
      leftHeldRef.current = false;
      rightHeldRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearHeld);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearHeld);
    };
  }, [leftHeldRef, rightHeldRef]);

  // ResizeObserver & Main 60fps Game Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const initSnowflakes = (w: number, h: number) => {
      const count = Math.min(70, Math.max(32, Math.floor((w * h) / 14000)));
      const flakes: Snowflake[] = [];
      for (let i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 1.2 + Math.random() * 2.4,
          vy: 22 + Math.random() * 38,
          vx: -12 + Math.random() * 24,
          alpha: 0.25 + Math.random() * 0.55,
          swayPhase: Math.random() * Math.PI * 2,
        });
      }
      simRef.current.snowflakes = flakes;
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(300, Math.round(rect.width));
      const h = Math.max(400, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const sim = simRef.current;
      const oldW = sim.width || w;
      sim.width = w;
      sim.height = h;
      sim.player.x = Math.max(32, Math.min(w - 32, (sim.player.x / oldW) * w));
      sim.player.y = Math.max(240, h - 82);
      sim.santa.baseY = Math.min(114, h * 0.148);
      sim.santa.y = sim.santa.baseY;
      sim.santa.x = Math.max(76, Math.min(w - 76, (sim.santa.x / oldW) * w));

      if (sim.snowflakes.length === 0) {
        initSnowflakes(w, h);
      }
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    let rafId = 0;
    let lastTimestamp = performance.now();

    const spawnBurst = (x: number, y: number, color: string, count: number, speed = 170) => {
      const sim = simRef.current;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const mag = speed * (0.45 + Math.random() * 0.7);
        sim.particles.push({
          x,
          y,
          vx: Math.cos(angle) * mag,
          vy: Math.sin(angle) * mag - 45,
          radius: 2.2 + Math.random() * 2.8,
          color,
          alpha: 0.95,
          life: 0.42 + Math.random() * 0.25,
          maxLife: 0.65,
          gravity: 260,
        });
      }
    };

    const spawnPopup = (x: number, y: number, text: string, color: string, scale = 1) => {
      simRef.current.popups.push({
        x,
        y,
        vy: -58,
        text,
        color,
        life: 0.9,
        maxLife: 0.9,
        scale,
      });
    };

    const spawnDroppedItem = (drop: ScheduledDrop) => {
      const sim = simRef.current;
      const w = sim.width;
      const h = sim.height;
      const scaleY = h / 760;
      const scales = getSpriteScale(w);
      const diffCfg = DIFFICULTY_CONFIG[difficultyRef.current];
      const rushFactor = sim.elapsed >= RUSH_START_ELAPSED_SECONDS ? RUSH_SPEED_MULTIPLIER : 1;

      // Upward toss arc from Santa's sleigh
      const spawnX = Math.max(46, Math.min(w - 46, sim.santa.x - sim.santa.facing * 12));
      const spawnY = sim.santa.y - 8;

      const spreadWidth = Math.min(195, w * 0.35);
      let vx = (Math.random() - 0.5) * 2 * spreadWidth;
      // Bias slightly inward if Santa is near edge
      if (spawnX < w * 0.22) vx = Math.abs(vx) * 0.8 + 22;
      if (spawnX > w * 0.78) vx = -Math.abs(vx) * 0.8 - 22;

      const upwardImpulse =
        drop.category === 'bomb'
          ? -(115 + Math.random() * 45) * scaleY * (rushFactor > 1 ? 1.12 : 1)
          : -(140 + Math.random() * 65) * scaleY * (rushFactor > 1 ? 1.12 : 1);

      const terminalVy = BASE_TERMINAL_SPEED[drop.category] * diffCfg.speedMultiplier * rushFactor * scaleY;
      const gravity = BASE_GRAVITY[drop.category] * diffCfg.speedMultiplier * rushFactor * scaleY;

      const baseRadius =
        drop.category === 'bomb'
          ? 13.5
          : drop.category === 'coin'
            ? 15
            : drop.category === 'gift'
              ? 16
              : 14;

      sim.items.push({
        id: sim.nextItemId++,
        category: drop.category,
        style: drop.style,
        x: spawnX,
        y: spawnY,
        vx,
        vy: upwardImpulse,
        terminalVy,
        gravity,
        rotation: (Math.random() - 0.5) * 0.5,
        vr: (Math.random() - 0.5) * 3.8,
        radius: baseRadius * scales.item,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: drop.category === 'candy' ? 28 : drop.category === 'gift' ? 10 : 0,
        points: ITEM_POINTS[drop.category],
        age: 0,
      });

      sim.santa.tossAnimTimer = 0.25;
      gameAudio.playToss();
    };

    const stepSimulation = (dt: number) => {
      const sim = simRef.current;
      const w = sim.width;
      const h = sim.height;
      const scales = getSpriteScale(w);
      const groundY = Math.max(240, h - 82);
      sim.globalTime += dt;

      // Ambient snowflakes always drift gently across all game states (unless paused)
      if (statusRef.current !== 'PAUSED') {
        for (const flake of sim.snowflakes) {
          flake.y += flake.vy * dt;
          flake.x += (flake.vx + Math.sin(sim.globalTime * 1.4 + flake.swayPhase) * 14) * dt;
          if (flake.y > h + 8) {
            flake.y = -8;
            flake.x = Math.random() * w;
          }
          if (flake.x < -10) flake.x = w + 10;
          if (flake.x > w + 10) flake.x = -10;
        }
      }

      // Gentle ambient Santa flyby on Title Screen
      if (statusRef.current === 'TITLE_MENU') {
        sim.santa.bobPhase += dt * 2.5;
        sim.santa.x += 78 * dt;
        sim.santa.facing = 1;
        sim.santa.y = sim.santa.baseY + Math.sin(sim.santa.bobPhase) * 7;
        if (sim.santa.x > w + 90) {
          sim.santa.x = -90;
        }
        return;
      }

      if (statusRef.current !== 'PLAYING' || sim.roundEnded) {
        return;
      }

      // Hitstop freeze for heavy bomb feedback
      if (sim.hitstopTimer > 0) {
        sim.hitstopTimer = Math.max(0, sim.hitstopTimer - dt);
        return;
      }

      // Update round timer & 45s rush acceleration
      sim.elapsed += dt;
      sim.timeLeft = Math.max(0, ROUND_DURATION_SECONDS - sim.elapsed);
      const inRush = sim.elapsed >= RUSH_START_ELAPSED_SECONDS;
      gameAudio.setHurry(inRush && sim.timeLeft > 0);

      if (inRush && !sim.rushApplied) {
        sim.rushApplied = true;
        for (const item of sim.items) {
          item.terminalVy *= RUSH_SPEED_MULTIPLIER;
          item.gravity *= RUSH_SPEED_MULTIPLIER;
          if (item.vy > 0) {
            item.vy *= 1.18;
          }
        }
      }

      // Update screen shake & hit flash
      if (sim.shakeTimer > 0) sim.shakeTimer = Math.max(0, sim.shakeTimer - dt);
      if (sim.hitFlashTimer > 0) sim.hitFlashTimer = Math.max(0, sim.hitFlashTimer - dt);

      // === 1. SANTA SLEIGH RANDOM MOVEMENT & TOSSING ===
      const diffCfg = DIFFICULTY_CONFIG[difficultyRef.current];
      const santaMargin = Math.min(88, w * 0.19);
      const santaRushBoost = inRush ? 1.32 : 1;
      sim.santa.bobPhase += dt * (inRush ? 5.0 : 3.8);
      if (sim.santa.tossAnimTimer > 0) {
        sim.santa.tossAnimTimer = Math.max(0, sim.santa.tossAnimTimer - dt);
      }

      sim.santa.directionChangeTimer -= dt;
      if (sim.santa.directionChangeTimer <= 0) {
        const [minS, maxS] = diffCfg.santaSpeedRange;
        const speedMag = (minS + Math.random() * (maxS - minS)) * santaRushBoost;
        const dir = Math.random() < 0.55 ? -sim.santa.facing : sim.santa.facing;
        sim.santa.targetSpeed = speedMag * dir;
        sim.santa.directionChangeTimer = (inRush ? 0.55 : 0.8) + Math.random() * (inRush ? 1.1 : 1.7);
      }

      // Smoothly accelerate toward targetSpeed
      sim.santa.vx += (sim.santa.targetSpeed - sim.santa.vx) * Math.min(1, dt * 4.8);
      sim.santa.x += sim.santa.vx * dt;

      if (sim.santa.x <= santaMargin) {
        sim.santa.x = santaMargin;
        sim.santa.vx = Math.abs(sim.santa.vx) || diffCfg.santaSpeedRange[0] * santaRushBoost;
        sim.santa.targetSpeed = Math.abs(sim.santa.targetSpeed) || diffCfg.santaSpeedRange[0] * santaRushBoost;
      } else if (sim.santa.x >= w - santaMargin) {
        sim.santa.x = w - santaMargin;
        sim.santa.vx = -Math.abs(sim.santa.vx) || -diffCfg.santaSpeedRange[0] * santaRushBoost;
        sim.santa.targetSpeed = -Math.abs(sim.santa.targetSpeed) || -diffCfg.santaSpeedRange[0] * santaRushBoost;
      }
      if (Math.abs(sim.santa.vx) > 10) {
        sim.santa.facing = sim.santa.vx >= 0 ? 1 : -1;
      }
      sim.santa.y = sim.santa.baseY + Math.sin(sim.santa.bobPhase) * 6;

      // Spawn scheduled items from Santa's sleigh
      while (
        sim.scheduleIndex < sim.schedule.length &&
        sim.elapsed >= sim.schedule[sim.scheduleIndex].time
      ) {
        spawnDroppedItem(sim.schedule[sim.scheduleIndex]);
        sim.scheduleIndex++;
      }

      // === 2. PLAYER CHILD MOVEMENT & 3-SECOND STUN ===
      const player = sim.player;
      player.y = groundY;
      const halfBound = 32;

      if (player.catchBounceTimer > 0) {
        player.catchBounceTimer = Math.max(0, player.catchBounceTimer - dt);
      }

      if (player.stunTimer > 0) {
        // Stunned: cannot move for ~3 seconds while items continue falling normally
        player.stunTimer = Math.max(0, player.stunTimer - dt);
        player.vx = 0;
        sim.dragTargetX = null;
      } else {
        const moveLeft = sim.keyLeft || leftHeldRef.current;
        const moveRight = sim.keyRight || rightHeldRef.current;
        const maxMoveSpeed = Math.max(410, w * 0.92);

        if (moveLeft && !moveRight) {
          sim.dragTargetX = null;
          player.vx = -maxMoveSpeed;
          player.x += player.vx * dt;
          player.facing = -1;
        } else if (moveRight && !moveLeft) {
          sim.dragTargetX = null;
          player.vx = maxMoveSpeed;
          player.x += player.vx * dt;
          player.facing = 1;
        } else if (sim.dragTargetX !== null) {
          const clampedTarget = Math.max(halfBound, Math.min(w - halfBound, sim.dragTargetX));
          const diff = clampedTarget - player.x;
          const maxStep = Math.max(760, w * 1.8) * dt;
          const step = Math.abs(diff) <= maxStep ? diff : Math.sign(diff) * maxStep;
          player.vx = step / Math.max(dt, 0.001);
          player.x += step;
          if (Math.abs(diff) > 2) {
            player.facing = diff >= 0 ? 1 : -1;
          }
        } else {
          player.vx = 0;
        }

        player.x = Math.max(halfBound, Math.min(w - halfBound, player.x));
        if (Math.abs(player.vx) > 20) {
          player.walkPhase += dt * 16;
        }
      }

      // === 3. FALLING ITEMS PHYSICS & SACK CATCH COLLISION ===
      const sackCenterX = player.x;
      const sackTopY = player.y - 4 * scales.child;
      const sackHalfWidth = 28 * scales.child;
      const sackHalfHeight = 18 * scales.child;

      for (let i = sim.items.length - 1; i >= 0; i--) {
        const item = sim.items[i];
        item.age += dt;
        item.vy = Math.min(item.terminalVy, item.vy + item.gravity * dt);

        const swayVx =
          item.vy > 0 && item.swayAmp > 0
            ? Math.cos(item.age * 3.8 + item.swayPhase) * item.swayAmp
            : 0;
        item.x += (item.vx + swayVx) * dt;
        item.y += item.vy * dt;
        item.rotation += item.vr * dt;

        // Dampen horizontal throw momentum over time
        item.vx *= Math.pow(0.45, dt);

        // Bounce cleanly off horizontal edges so items stay inside the playfield
        if (item.x < 22) {
          item.x = 22;
          item.vx = Math.abs(item.vx) * 0.7;
        } else if (item.x > w - 22) {
          item.x = w - 22;
          item.vx = -Math.abs(item.vx) * 0.7;
        }

        // Check collision with sack (only when item is descending or near sack height)
        const hitRadius = item.category === 'bomb' ? item.radius * 0.82 : item.radius * 1.1;
        const dx = Math.abs(item.x - sackCenterX);
        const dy = Math.abs(item.y - sackTopY);

        if (dx <= sackHalfWidth + hitRadius * 0.65 && dy <= sackHalfHeight + hitRadius * 0.65) {
          sim.items.splice(i, 1);

          if (item.category === 'bomb') {
            sim.score += ITEM_POINTS.bomb;
            sim.stats.bomb += 1;
            player.stunTimer = BOMB_STUN_SECONDS;
            player.vx = 0;
            sim.dragTargetX = null;
            sim.shakeTimer = 0.36;
            sim.shakeMagnitude = 8;
            sim.hitFlashTimer = 0.16;
            sim.hitstopTimer = 0.055;

            spawnBurst(item.x, sackTopY, '#EF4444', 16, 220);
            spawnBurst(item.x, sackTopY, '#475569', 10, 140);
            spawnPopup(item.x, sackTopY - 26, '-80', '#F87171', 1.2);
            gameAudio.playHitBomb();
          } else {
            sim.score += item.points;
            sim.stats[item.category] += 1;
            player.catchBounceTimer = 0.22;

            if (item.category === 'coin') {
              spawnBurst(item.x, sackTopY, '#FACC15', 14, 185);
              spawnPopup(item.x, sackTopY - 24, '+100', '#FDE047', 1.15);
              gameAudio.playCatchCoin();
            } else if (item.category === 'gift') {
              spawnBurst(item.x, sackTopY, '#4ADE80', 11, 155);
              spawnPopup(item.x, sackTopY - 22, '+50', '#86EFAC', 1.05);
              gameAudio.playCatchGift();
            } else {
              spawnBurst(item.x, sackTopY, '#F472B6', 8, 125);
              spawnPopup(item.x, sackTopY - 20, '+20', '#FBCFE8', 0.96);
              gameAudio.playCatchCandy();
            }
          }
          continue;
        }

        // Remove if hit ground past snowbank
        if (item.y > h + 32) {
          if (item.category === 'bomb') {
            spawnBurst(item.x, h - 18, '#64748B', 5, 70);
          }
          sim.items.splice(i, 1);
        }
      }

      // === 4. PARTICLES & FLOATING SCORE POPUPS ===
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          sim.particles.splice(i, 1);
          continue;
        }
        p.vy += p.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      for (let i = sim.popups.length - 1; i >= 0; i--) {
        const pop = sim.popups[i];
        pop.life -= dt;
        if (pop.life <= 0) {
          sim.popups.splice(i, 1);
          continue;
        }
        pop.y += pop.vy * dt;
      }

      // Sync React HUD only when visible integer readouts change
      const intSec = Math.ceil(sim.timeLeft);
      const intStun = Math.ceil(player.stunTimer * 10) / 10;
      if (
        sim.score !== sim.lastHudScore ||
        intSec !== sim.lastHudSec ||
        (player.stunTimer > 0 ? 1 : 0) !== (sim.lastHudStun > 0 ? 1 : 0) ||
        Math.ceil(player.stunTimer) !== Math.ceil(sim.lastHudStun)
      ) {
        sim.lastHudScore = sim.score;
        sim.lastHudSec = intSec;
        sim.lastHudStun = player.stunTimer;
        onHudUpdateRef.current({
          score: sim.score,
          timeLeft: intSec,
          stunLeft: intStun,
          stats: { ...sim.stats },
        });
      }

      // End round cleanly at 0s
      if (sim.timeLeft <= 0 && !sim.roundEnded) {
        sim.roundEnded = true;
        gameAudio.playGameOver();
        onRoundCompleteRef.current(sim.score, { ...sim.stats });
      }
    };

    const renderFrame = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const sim = simRef.current;
      const dpr = canvas.width / sim.width;
      const w = sim.width;
      const h = sim.height;
      const scales = getSpriteScale(w);
      const groundY = Math.max(240, h - 82);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Camera shake transform on bomb impact
      if (sim.shakeTimer > 0) {
        const mag = sim.shakeMagnitude * (sim.shakeTimer / 0.36);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      // 1. Storybook backdrop image (aspect-matched cover) + midnight gradient fallback
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#091426');
      bgGrad.addColorStop(0.65, '#162947');
      bgGrad.addColorStop(1, '#1E3A5F');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const bgImg = w >= h ? landscapeImgRef.current : portraitImgRef.current;
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const viewAspect = w / h;
        let drawW = w;
        let drawH = h;
        let offsetX = 0;
        let offsetY = 0;

        if (viewAspect > imgAspect) {
          drawW = w;
          drawH = w / imgAspect;
          offsetY = (h - drawH) * 0.65; // Anchor cottages in lower third
        } else {
          drawH = h;
          drawW = h * imgAspect;
          offsetX = (w - drawW) * 0.5;
        }
        ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);

        // Measured scrim so falling items & Santa maintain crisp 4.5:1 figure-ground contrast
        const scrim = ctx.createLinearGradient(0, 0, 0, h);
        scrim.addColorStop(0, 'rgba(9, 20, 38, 0.38)');
        scrim.addColorStop(0.55, 'rgba(9, 20, 38, 0.22)');
        scrim.addColorStop(1, 'rgba(9, 20, 38, 0.35)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Ambient falling snow
      drawSnowfall(ctx, sim.snowflakes);

      // 3. Snowbank ground ridge
      drawGroundSnowbank(ctx, w, h, groundY);

      // 4. Santa Claus + sleigh + reindeer (scaled up cleanly)
      drawSantaAndSleigh(ctx, sim.santa, sim.globalTime, scales.sleigh);

      // 5. Active falling items & child character (scaled up cleanly)
      if (statusRef.current !== 'TITLE_MENU') {
        for (const item of sim.items) {
          drawFallingItem(ctx, item, sim.globalTime, scales.item);
        }

        drawChild(ctx, sim.player, genderRef.current, sim.globalTime, scales.child);
        drawParticles(ctx, sim.particles);
        drawFloatingPopups(ctx, sim.popups);
      }

      // Brief red flash on bomb hit
      if (sim.hitFlashTimer > 0) {
        ctx.fillStyle = `rgba(220, 38, 38, ${(sim.hitFlashTimer / 0.16) * 0.28})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();
    };

    const loop = (now: number) => {
      const rawDt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      stepSimulation(dt);
      renderFrame();

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [leftHeldRef, rightHeldRef]);

  // Pointer drag handlers directly on canvas
  const updateDragFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (statusRef.current !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    simRef.current.dragTargetX = e.clientX - rect.left;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (statusRef.current !== 'PLAYING') return;
    gameAudio.unlock();
    e.currentTarget.setPointerCapture(e.pointerId);
    simRef.current.activePointerId = e.pointerId;
    updateDragFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (statusRef.current !== 'PLAYING') return;
    if (simRef.current.activePointerId === e.pointerId || e.buttons === 1) {
      updateDragFromEvent(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (simRef.current.activePointerId === e.pointerId) {
      simRef.current.activePointerId = null;
      simRef.current.dragTargetX = null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block w-full h-full touch-canvas cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
