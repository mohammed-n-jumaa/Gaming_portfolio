"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CONTENT, type Content, type Lang } from "@/lib/content";
import { DEFAULT_THEME, THEMES, THEME_EVENT, type ThemeId } from "@/lib/themes";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { game } from "@/lib/game";

type Ctx = {
  lang: Lang;
  t: Content;
  switchLang: (to?: Lang) => void;
  theme: ThemeId;
  switchTheme: (id: ThemeId, origin?: { x: number; y: number }) => void;
  loaded: boolean;
  setLoaded: (v: boolean) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
};

type VTDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [loaded, setLoaded] = useState(false);
  const wipeRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  // hydrate persisted prefs (the inline head script already painted the right theme)
  useEffect(() => {
    try {
      const th = localStorage.getItem("mn-theme") as ThemeId | null;
      if (th && THEMES.some((x) => x.id === th)) setTheme(th);
      const l = localStorage.getItem("mn-lang") as Lang | null;
      if (l === "ar" || l === "en") setLang(l);
    } catch {}
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("mn-lang", lang);
    } catch {}
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [lang]);

  const applyTheme = useCallback((id: ThemeId) => {
    game.unlock("fashion");
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("mn-theme", id);
    } catch {}
    setTheme(id);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: id }));
  }, []);

  /** Circular "shape-layer" reveal of the new palette from the click point (View Transitions API). */
  const switchTheme = useCallback(
    (id: ThemeId, origin?: { x: number; y: number }) => {
      if (id === document.documentElement.dataset.theme) return;
      const doc = document as VTDoc;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!doc.startViewTransition || reduce) {
        applyTheme(id);
        return;
      }
      const x = origin?.x ?? innerWidth / 2;
      const y = origin?.y ?? innerHeight / 2;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = doc.startViewTransition(() => applyTheme(id));
      vt.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 1100, easing: "cubic-bezier(.76,0,.24,1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
    },
    [applyTheme]
  );

  /** Language swap hidden behind a staggered column wipe, like an AE transition preset. */
  const switchLang = useCallback(
    (to?: Lang) => {
      const next: Lang = to ?? (lang === "en" ? "ar" : "en");
      if (next === lang || busy.current) return;
      const cols = wipeRef.current?.children;
      if (!cols) {
        setLang(next);
        return;
      }
      busy.current = true;
      game.unlock("polyglot");
      const tl = gsap.timeline({ onComplete: () => void (busy.current = false) });
      tl.set(wipeRef.current, { visibility: "visible" })
        .fromTo(cols, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.55, ease: "power4.inOut", stagger: 0.05 })
        .add(() => setLang(next))
        .to(cols, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.6, ease: "power4.inOut", stagger: 0.05, delay: 0.25 })
        .set(wipeRef.current, { visibility: "hidden" });
    },
    [lang]
  );

  return (
    <AppCtx.Provider value={{ lang, t: CONTENT[lang], switchLang, theme, switchTheme, loaded, setLoaded }}>
      {children}
      <div className="wipe" ref={wipeRef} aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </AppCtx.Provider>
  );
}
