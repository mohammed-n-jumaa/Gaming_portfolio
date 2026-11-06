"use client";
import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/themes";
import { scramble } from "@/lib/fx";
import { useApp } from "./AppProvider";
import { gsap, useGSAP } from "@/lib/gsap";

/** Floating palette switcher. Each swatch shows its 3-colour system; click = circular reveal. */
export function ThemeDock() {
  const { theme, switchTheme, lang, loaded, t } = useApp();
  const [open, setOpen] = useState(false);
  const nameRef = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const current = THEMES.find((x) => x.id === theme) ?? THEMES[0];

  useEffect(() => {
    scramble(nameRef.current, lang === "ar" ? current.nameAr : current.name, 600);
  }, [current, lang]);

  useGSAP(
    () => {
      if (!loaded) return;
      gsap.from(root.current, { y: 120, autoAlpha: 0, duration: 1.2, ease: "expo.out", delay: 1.2 });
    },
    { dependencies: [loaded] }
  );

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey) {
        const i = THEMES.findIndex((x) => x.id === document.documentElement.dataset.theme);
        switchTheme(THEMES[(i + 1) % THEMES.length].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [switchTheme]);

  const shuffle = (e: React.MouseEvent) => {
    const pool = THEMES.filter((x) => x.id !== theme);
    switchTheme(pool[(Math.random() * pool.length) | 0].id, { x: e.clientX, y: e.clientY });
  };

  return (
    <div className={`dock ${open ? "is-open" : ""}`} ref={root}>
      <button className="dock-main" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t.nav.palette}>
        <Swatch c={current.swatch} />
        <span className="dock-text">
          <small>{t.nav.palette} · T</small>
          <span ref={nameRef}>{current.name}</span>
        </span>
      </button>
      <div className="dock-list" role="listbox" aria-label={t.nav.palette}>
        {THEMES.map((th, i) => (
          <button
            key={th.id}
            role="option"
            aria-selected={th.id === theme}
            className={`dock-sw ${th.id === theme ? "is-on" : ""}`}
            style={{ transitionDelay: open ? `${i * 35}ms` : "0ms" }}
            onClick={(e) => switchTheme(th.id, { x: e.clientX, y: e.clientY })}
            title={lang === "ar" ? th.nameAr : th.name}
            tabIndex={open ? 0 : -1}
          >
            <Swatch c={th.swatch} />
            {th.mix && <em>mix</em>}
          </button>
        ))}
        <button className="dock-sw dock-shuffle" onClick={shuffle} title={t.nav.shuffle} tabIndex={open ? 0 : -1}>
          ⟳
        </button>
      </div>
    </div>
  );
}

function Swatch({ c }: { c: [string, string, string] }) {
  return (
    <span
      className="swatch"
      style={{ background: `conic-gradient(from 200deg, ${c[0]} 0 50%, ${c[1]} 50% 75%, ${c[2]} 75% 100%)` }}
    />
  );
}
