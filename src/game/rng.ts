export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(max: number): number {
    return Math.floor(this.next() * max);
  }

  pick<T>(arr: T[]): T {
    return arr[this.int(arr.length)];
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  chance(p: number): boolean {
    return this.next() < p;
  }
}

let activeRng = new SeededRNG(Date.now());

export function setActiveRng(rng: SeededRNG) {
  activeRng = rng;
}

export function getActiveRng() {
  return activeRng;
}

export function rng() {
  return activeRng.next();
}

export function rngInt(max: number) {
  return activeRng.int(max);
}

export function rngPick<T>(arr: T[]) {
  return activeRng.pick(arr);
}

export function rngShuffle<T>(arr: T[]) {
  return activeRng.shuffle(arr);
}

export function rngChance(p: number) {
  return activeRng.chance(p);
}

export function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function randomSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}
