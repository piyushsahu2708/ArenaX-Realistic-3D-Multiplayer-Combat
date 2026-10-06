/**
 * Realistic Procedural Web Audio API Sound Engine for ArenaX 3D
 * Synthesizes gunshots, hitmarkers, headshot bells, footsteps, reloads, and melee strikes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Realistic Gunshot synthesis based on weapon category
  public playGunshot(weaponCategory: string = 'ASSAULT_RIFLE') {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const dest = this.masterGain;

    // 1. Noise blast component (the explosion crack)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    let filterFreq = 1800;
    let decayDuration = 0.22;
    let subFreq = 140;

    if (weaponCategory === 'SNIPER') {
      filterFreq = 2200;
      decayDuration = 0.45;
      subFreq = 90;
    } else if (weaponCategory === 'SHOTGUN') {
      filterFreq = 1400;
      decayDuration = 0.35;
      subFreq = 80;
    } else if (weaponCategory === 'SMG') {
      filterFreq = 2600;
      decayDuration = 0.14;
      subFreq = 180;
    } else if (weaponCategory === 'PISTOL') {
      filterFreq = 2200;
      decayDuration = 0.16;
      subFreq = 160;
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + decayDuration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + decayDuration);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    whiteNoise.start(t);
    whiteNoise.stop(t + decayDuration);

    // 2. Punch / Low thump sine wave
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(subFreq, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + decayDuration * 0.8);

    oscGain.gain.setValueAtTime(0.9, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + decayDuration * 0.8);

    osc.connect(oscGain);
    oscGain.connect(dest);

    osc.start(t);
    osc.stop(t + decayDuration * 0.8);
  }

  // Melee whoosh / strike punch
  public playMelee(isImpact: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isImpact ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isImpact ? 160 : 320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + (isImpact ? 0.18 : 0.12));

    gain.gain.setValueAtTime(isImpact ? 0.75 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isImpact ? 0.18 : 0.12));

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Hitmarker sound: crisp high "tick" or golden headshot chime
  public playHitmarker(isHeadshot: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (isHeadshot) {
      // High bell chime (Headshot ding!)
      osc.frequency.setValueAtTime(1760, t); // A6 note
      osc.frequency.setValueAtTime(2200, t + 0.04);
      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    } else {
      // Body hit sharp click
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + (isHeadshot ? 0.3 : 0.08));
  }

  // Weapon reload mechanical clicks
  public playReload() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Mag out click
    this.playClick(t, 600, 0.05);
    // Mag in click
    this.playClick(t + 0.9, 850, 0.06);
    // Slide rack
    this.playClick(t + 1.6, 1200, 0.08);
  }

  private playClick(time: number, freq: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  // Footstep sound
  public playFootstep(isSprint: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSprint ? 110 : 85, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.07);

    gain.gain.setValueAtTime(isSprint ? 0.22 : 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Item pickup chime
  public playPickup(type: string = 'WEAPON') {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const notes = type === 'MEDKIT' ? [523.25, 659.25] : type === 'ARMOR' ? [440, 554.37] : [659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.25, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.2);
    });
  }

  // Special ability sonic pulse
  public playSpecialAbility() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Match victory / defeat fanfare
  public playMatchEnd(isWin: boolean) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const chords = isWin
      ? [523.25, 659.25, 783.99, 1046.5] // C Major fanfare
      : [392.0, 369.99, 329.63, 261.63]; // Minor descending

    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = isWin ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);

      gain.gain.setValueAtTime(0.3, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.55);
    });
  }
}

export const soundEngine = new SoundEngine();
