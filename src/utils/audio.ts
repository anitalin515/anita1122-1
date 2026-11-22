// Procedural Web Audio API Christmas music-box BGM and tactile game SFX

interface NoteStep {
  freq: number; // 0 = rest
  beats: number;
  bassFreq?: number;
}

// Crisp frequencies (Hz)
const N = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  G3: 196.0,
  C3: 130.81,
  F3: 174.61,
};

// Cheerful Jingle Bells + festive winter loop
const MELODY_LOOP: NoteStep[] = [
  // Jingle bells, jingle bells
  { freq: N.E5, beats: 1, bassFreq: N.C4 },
  { freq: N.E5, beats: 1 },
  { freq: N.E5, beats: 2, bassFreq: N.G3 },
  { freq: N.E5, beats: 1, bassFreq: N.C4 },
  { freq: N.E5, beats: 1 },
  { freq: N.E5, beats: 2, bassFreq: N.G3 },
  // Jingle all the way
  { freq: N.E5, beats: 1, bassFreq: N.C4 },
  { freq: N.G5, beats: 1 },
  { freq: N.C5, beats: 1.5, bassFreq: N.E4 },
  { freq: N.D5, beats: 0.5 },
  { freq: N.E5, beats: 4, bassFreq: N.C4 },
  // Oh what fun it is to ride
  { freq: N.F5, beats: 1, bassFreq: N.F3 },
  { freq: N.F5, beats: 1 },
  { freq: N.F5, beats: 1.5, bassFreq: N.C4 },
  { freq: N.F5, beats: 0.5 },
  { freq: N.F5, beats: 1, bassFreq: N.C4 },
  { freq: N.E5, beats: 1 },
  { freq: N.E5, beats: 1, bassFreq: N.G3 },
  { freq: N.E5, beats: 0.5 },
  { freq: N.E5, beats: 0.5 },
  // In a one-horse open sleigh
  { freq: N.E5, beats: 1, bassFreq: N.D4 },
  { freq: N.D5, beats: 1 },
  { freq: N.D5, beats: 1, bassFreq: N.G3 },
  { freq: N.E5, beats: 1 },
  { freq: N.D5, beats: 2, bassFreq: N.G3 },
  { freq: N.G5, beats: 2, bassFreq: N.B4 },
  // Repeat phrase 2 resolution:
  { freq: N.E5, beats: 1, bassFreq: N.C4 },
  { freq: N.E5, beats: 1 },
  { freq: N.E5, beats: 2, bassFreq: N.G3 },
  { freq: N.E5, beats: 1, bassFreq: N.C4 },
  { freq: N.E5, beats: 1 },
  { freq: N.E5, beats: 2, bassFreq: N.G3 },
  { freq: N.E5, beats: 1, bassFreq: N.C4 },
  { freq: N.G5, beats: 1 },
  { freq: N.C5, beats: 1.5, bassFreq: N.E4 },
  { freq: N.D5, beats: 0.5 },
  { freq: N.E5, beats: 4, bassFreq: N.C4 },
  { freq: N.F5, beats: 1, bassFreq: N.F3 },
  { freq: N.F5, beats: 1 },
  { freq: N.F5, beats: 1.5, bassFreq: N.C4 },
  { freq: N.F5, beats: 0.5 },
  { freq: N.F5, beats: 1, bassFreq: N.C4 },
  { freq: N.E5, beats: 1 },
  { freq: N.E5, beats: 1, bassFreq: N.G3 },
  { freq: N.E5, beats: 0.5 },
  { freq: N.E5, beats: 0.5 },
  { freq: N.G5, beats: 1, bassFreq: N.G3 },
  { freq: N.G5, beats: 1 },
  { freq: N.F5, beats: 1, bassFreq: N.B4 },
  { freq: N.D5, beats: 1 },
  { freq: N.C5, beats: 4, bassFreq: N.C4 },
];

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private bgmPlaying = false;
  private bgmTimer: number | null = null;
  private stepIndex = 0;
  private hurryMode = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.7;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.02);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setHurry(hurry: boolean): void {
    this.hurryMode = hurry;
  }

  public startBgm(resetStep = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (resetStep) {
      this.stepIndex = 0;
      this.hurryMode = false;
    }
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.scheduleNextNote();
  }

  public pauseBgm(): void {
    this.bgmPlaying = false;
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public stopBgm(): void {
    this.pauseBgm();
    this.stepIndex = 0;
    this.hurryMode = false;
  }

  private scheduleNextNote(): void {
    if (!this.bgmPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const step = MELODY_LOOP[this.stepIndex % MELODY_LOOP.length];
    this.stepIndex = (this.stepIndex + 1) % MELODY_LOOP.length;

    const beatDurationMs = this.hurryMode ? 245 : 300;
    const durationSec = (step.beats * beatDurationMs) / 1000;
    const now = ctx.currentTime;

    if (step.freq > 0) {
      // Warm music-box chime lead
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(step.freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.11, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.12, durationSec * 0.92));

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + durationSec);

      // Subtle harmonic bell shimmer
      const shimmer = ctx.createOscillator();
      const sGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(step.freq * 2, now);
      sGain.gain.setValueAtTime(0.0001, now);
      sGain.gain.exponentialRampToValueAtTime(0.032, now + 0.01);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(0.22, durationSec * 0.7));
      shimmer.connect(sGain);
      sGain.connect(this.masterGain);
      shimmer.start(now);
      shimmer.stop(now + Math.min(0.24, durationSec));
    }

    if (step.bassFreq) {
      const bass = ctx.createOscillator();
      const bGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(step.bassFreq, now);
      bGain.gain.setValueAtTime(0.0001, now);
      bGain.gain.exponentialRampToValueAtTime(0.065, now + 0.02);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + Math.min(0.45, durationSec * 1.1));
      bass.connect(bGain);
      bGain.connect(this.masterGain);
      bass.start(now);
      bass.stop(now + Math.min(0.48, durationSec * 1.15));
    }

    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, step.beats * beatDurationMs);
  }

  public playCatchCandy(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(990, now + 0.09);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playCatchGift(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      if (!this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  public playCatchCoin(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const pairs = [
      { f: 987.77, t: 0, dur: 0.09 },
      { f: 1318.51, t: 0.065, dur: 0.24 },
    ];
    pairs.forEach(({ f, t, dur }) => {
      if (!this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.01);
    });
  }

  public playHitBomb(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;

    // Low boom thump
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sawtooth';
    boom.frequency.setValueAtTime(160, now);
    boom.frequency.exponentialRampToValueAtTime(38, now + 0.36);
    boomGain.gain.setValueAtTime(0.32, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    boom.connect(boomGain);
    boomGain.connect(this.masterGain);
    boom.start(now);
    boom.stop(now + 0.4);

    // Filtered noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.28);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.28);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.28, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(now);

    // Dizzy cartoon warble
    const dizzy = ctx.createOscillator();
    const dGain = ctx.createGain();
    dizzy.type = 'sine';
    dizzy.frequency.setValueAtTime(480, now + 0.12);
    dizzy.frequency.linearRampToValueAtTime(240, now + 0.55);
    dGain.gain.setValueAtTime(0.001, now + 0.12);
    dGain.gain.linearRampToValueAtTime(0.11, now + 0.18);
    dGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    dizzy.connect(dGain);
    dGain.connect(this.masterGain);
    dizzy.start(now + 0.12);
    dizzy.stop(now + 0.6);
  }

  public playToss(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.04);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.055);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playGameOver(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      if (!this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.07;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.68);
    });
  }
}

export const gameAudio = new GameAudioEngine();
