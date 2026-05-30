import { loadSettings, saveSettings } from './stats';

class SfxEngine {
  private ctx: AudioContext | null = null;
  muted = loadSettings().muted;

  private ensureCtx(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    saveSettings({ muted: this.muted });
    return this.muted;
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.08) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  click() {
    this.tone(880, 0.06, 'square', 0.04);
  }

  card() {
    this.tone(520, 0.08, 'triangle', 0.06);
    setTimeout(() => this.tone(780, 0.06, 'triangle', 0.05), 40);
  }

  attack() {
    this.tone(120, 0.15, 'sawtooth', 0.07);
    this.tone(80, 0.2, 'square', 0.05);
  }

  block() {
    this.tone(200, 0.12, 'triangle', 0.06);
    this.tone(320, 0.1, 'sine', 0.04);
  }

  heal() {
    this.tone(440, 0.1, 'sine', 0.05);
    setTimeout(() => this.tone(660, 0.12, 'sine', 0.05), 80);
  }

  turn() {
    this.tone(330, 0.1, 'triangle', 0.05);
  }

  victory() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.25, 'sine', 0.06), i * 120);
    });
  }

  defeat() {
    [400, 300, 200].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.3, 'sawtooth', 0.05), i * 150);
    });
  }

  elite() {
    this.tone(150, 0.3, 'sawtooth', 0.06);
  }

  boss() {
    [100, 80, 60].forEach((f) => this.tone(f, 0.4, 'square', 0.05));
  }
}

export const sfx = new SfxEngine();
