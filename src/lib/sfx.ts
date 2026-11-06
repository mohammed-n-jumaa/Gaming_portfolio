"use client";
/** Synthesised UI sounds (no audio files): dialogue blips, coins, level-up jingle. */
import { game } from "./game";

let ctx: AudioContext | null = null;
const ac = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.035, at = 0, slide = 0) {
  if (game.get().muted) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  /** Animal-Crossing-ish speech blip, pitch varies per syllable */
  blip: () => tone(380 + Math.random() * 160, 0.045, "square", 0.022),
  pop: () => tone(520, 0.08, "sine", 0.06, 0, 1.8),
  click: () => tone(900, 0.03, "square", 0.02),
  coin: () => {
    tone(988, 0.08, "square", 0.04);
    tone(1319, 0.28, "square", 0.04, 0.08);
  },
  levelUp: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, "square", 0.04, i * 0.09)),
  whoosh: () => tone(220, 0.25, "sawtooth", 0.02, 0, 3),
};
