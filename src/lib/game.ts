"use client";
/**
 * Tiny game-state store: XP, levels, achievements, visited levels.
 * Persisted to localStorage, consumed via useSyncExternalStore.
 */
import { useSyncExternalStore } from "react";

export type AchId =
  | "start"
  | "guided"
  | "explorer"
  | "laugh"
  | "comedian"
  | "loot"
  | "quest"
  | "cheater"
  | "fashion"
  | "polyglot"
  | "boss"
  | "konami";

export type GameState = {
  xp: number;
  ach: AchId[];
  visited: string[];
  jokes: number;
  items: number;
  mode: "tour" | "free" | null;
  muted: boolean;
  returning: boolean;
};

export type Action = "tour-start" | "tour-next" | "tour-stop" | "free" | "joke" | "hire" | "hide" | "show" | "close" | "menu";

const KEY = "mn-game-v1";
const XP_PER_LEVEL = 300;
export const LEVEL_IDS = ["about", "skills", "services", "work", "experience", "console", "contact"];

const initial: GameState = { xp: 0, ach: [], visited: [], jokes: 0, items: 0, mode: null, muted: false, returning: false };
let state: GameState = initial;
let hydrated = false;
const subs = new Set<() => void>();
const bus = new EventTarget();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw), mode: null, returning: true };
  } catch {}
}

function persist() {
  try {
    const { mode, returning, ...rest } = state;
    void mode;
    void returning;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {}
}

function set(patch: Partial<GameState>) {
  state = { ...state, ...patch };
  persist();
  subs.forEach((f) => f());
}

export const levelOf = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const levelProgress = (xp: number) => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;

export const game = {
  get: () => (hydrate(), state),
  set,
  addXp(n: number) {
    const before = levelOf(state.xp);
    set({ xp: state.xp + n });
    const after = levelOf(state.xp);
    if (after > before) bus.dispatchEvent(new CustomEvent("levelup", { detail: after }));
  },
  unlock(id: AchId) {
    hydrate();
    if (state.ach.includes(id)) return;
    set({ ach: [...state.ach, id] });
    bus.dispatchEvent(new CustomEvent("achievement", { detail: id }));
    game.addXp(100);
  },
  visit(id: string) {
    hydrate();
    if (state.visited.includes(id)) return false;
    set({ visited: [...state.visited, id] });
    game.addXp(40);
    if (LEVEL_IDS.every((l) => state.visited.includes(l))) game.unlock("explorer");
    return true;
  },
  /** cross-component commands (title menu → guide, console → guide…) */
  act(a: Action) {
    bus.dispatchEvent(new CustomEvent("act", { detail: a }));
  },
  on<T = unknown>(type: "act" | "achievement" | "levelup", fn: (d: T) => void) {
    const h = (e: Event) => fn((e as CustomEvent).detail as T);
    bus.addEventListener(type, h);
    return () => bus.removeEventListener(type, h);
  },
};

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => void subs.delete(f);
};

export function useGame() {
  return useSyncExternalStore(subscribe, () => game.get(), () => initial);
}
