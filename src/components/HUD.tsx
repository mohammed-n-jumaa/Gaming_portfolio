"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, scrollToId, useGSAP } from "@/lib/gsap";
import { game, levelOf, levelProgress, useGame, type AchId } from "@/lib/game";
import { ACHIEVEMENTS } from "@/lib/dialogue";
import { scramble } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { confetti } from "@/lib/confetti";
import { useApp } from "./AppProvider";

export const LEVELS = [
  { id: "home", en: "Title Screen", ar: "شاشة البداية" },
  { id: "about", en: "Character", ar: "الشخصية" },
  { id: "skills", en: "Inventory", ar: "الحقيبة" },
  { id: "services", en: "Abilities", ar: "القدرات" },
  { id: "work", en: "Quest Log", ar: "المهمات" },
  { id: "experience", en: "World Map", ar: "الخريطة" },
  { id: "console", en: "Console", ar: "الكونسول" },
  { id: "contact", en: "Continue?", ar: "تكمل؟" },
];

const ALL = Object.keys(ACHIEVEMENTS) as AchId[];

export function HUD() {
  const { lang, switchLang, loaded } = useApp();
  const g = useGame();
  const [panel, setPanel] = useState<null | "ach" | "map">(null);
  const levelName = useRef<HTMLSpanElement>(null);
  const levelNum = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLElement>(null);
  const lv = levelOf(g.xp);
  const ar = lang === "ar";

  useGSAP(
    () => {
      if (!loaded) return;
      gsap.from(".hud > *", { y: -80, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "back.out(1.6)", delay: 0.6 });
    },
    { scope: root, dependencies: [loaded] }
  );

  // current-level indicator
  useEffect(() => {
    const sts = LEVELS.map((l, i) =>
      ScrollTrigger.create({
        trigger: `#${l.id}`,
        start: "top 50%",
        end: "bottom 50%",
        refreshPriority: -1,
        onToggle: (s) => {
          if (!s.isActive) return;
          scramble(levelNum.current, String(i).padStart(2, "0"), 400);
          scramble(levelName.current, ar ? l.ar : l.en, 600);
        },
      })
    );
    return () => sts.forEach((s) => s.kill());
  }, [ar]);

  // Konami code → achievement + confetti
  useEffect(() => {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    const k = (e: KeyboardEvent) => {
      i = e.key === seq[i] || e.key.toLowerCase() === seq[i] ? i + 1 : e.key === seq[0] ? 1 : 0;
      if (i === seq.length) {
        i = 0;
        game.unlock("konami");
        confetti();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const away = (e: PointerEvent) => !(e.target as HTMLElement).closest(".hud-panel, .hud-btn") && setPanel(null);
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [panel]);

  const toggle = (p: "ach" | "map") => {
    sfx.click();
    setPanel((c) => (c === p ? null : p));
  };

  return (
    <header className="hud" ref={root}>
      <div className="hud-player panel">
        <button className="hud-logo" onClick={() => scrollToId("home")} aria-label="Home">
          MN
        </button>
        <div className="hud-p">
          <span className="px hud-p-top">
            {ar ? "اللاعب" : "PLAYER"} · {ar ? "ضيف" : "GUEST"} <b>LV {lv}</b>
          </span>
          <span className="hud-xp" aria-label={`XP ${g.xp}`}>
            <i style={{ transform: `scaleX(${levelProgress(g.xp)})` }} />
          </span>
          <span className="px hud-p-xp">{g.xp} XP</span>
        </div>
      </div>

      <div className="hud-level panel px" aria-hidden>
        <span className="hud-lv-k">{ar ? "مرحلة" : "LEVEL"}</span>
        <span ref={levelNum}>00</span>
        <i />
        <span ref={levelName}>{ar ? LEVELS[0].ar : LEVELS[0].en}</span>
      </div>

      <div className="hud-actions">
        <button className="hud-btn panel" onClick={() => toggle("ach")} aria-expanded={panel === "ach"} title="Achievements">
          🏆 <span className="px">{g.ach.length}/{ALL.length}</span>
        </button>
        <button
          className="hud-btn panel"
          onClick={() => {
            game.set({ muted: !g.muted });
            if (g.muted) sfx.coin();
          }}
          aria-label={g.muted ? "Unmute" : "Mute"}
        >
          {g.muted ? "🔇" : "🔊"}
        </button>
        <button className="hud-btn panel px" onClick={() => switchLang()}>
          {ar ? "EN" : "ع"}
        </button>
        <button className="hud-btn hud-btn--map panel px" onClick={() => toggle("map")} aria-expanded={panel === "map"}>
          {ar ? "المراحل" : "LEVELS"}
        </button>
      </div>

      {panel === "ach" && (
        <div className="hud-panel panel hud-panel--ach">
          <h4 className="px">{ar ? "الإنجازات" : "ACHIEVEMENTS"}</h4>
          <ul>
            {ALL.map((id) => {
              const a = ACHIEVEMENTS[id];
              const on = g.ach.includes(id);
              const [t, d] = ar ? a.ar : a.en;
              return (
                <li key={id} className={on ? "is-on" : ""}>
                  <span className="ach-ico">{on ? a.icon : "🔒"}</span>
                  <span>
                    <b>{on ? t : "???"}</b>
                    <small>{d}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {panel === "map" && (
        <div className="hud-panel panel hud-panel--map">
          <h4 className="px">{ar ? "اختر مرحلة" : "SELECT LEVEL"}</h4>
          <ol>
            {LEVELS.map((l, i) => {
              const seen = i === 0 || g.visited.includes(l.id);
              return (
                <li key={l.id}>
                  <button
                    onClick={() => {
                      setPanel(null);
                      sfx.click();
                      scrollToId(l.id);
                    }}
                  >
                    <span className="px">{String(i).padStart(2, "0")}</span>
                    <span>{ar ? l.ar : l.en}</span>
                    <span className="lv-state">{seen ? "✓" : "★"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </header>
  );
}

/** Achievement / level-up toasts with coin sounds. */
export function Toasts() {
  const { lang } = useApp();
  const [items, setItems] = useState<{ k: number; icon: string; title: string; desc: string; lvl?: boolean }[]>([]);
  const ar = lang === "ar";
  useEffect(() => {
    let k = 0;
    const push = (it: Omit<(typeof items)[number], "k">) => {
      const key = ++k;
      setItems((p) => [...p, { ...it, k: key }]);
      setTimeout(() => setItems((p) => p.filter((x) => x.k !== key)), 3800);
    };
    const a = game.on<AchId>("achievement", (id) => {
      const d = ACHIEVEMENTS[id];
      const [t, s] = ar ? d.ar : d.en;
      sfx.coin();
      push({ icon: d.icon, title: (ar ? "إنجاز جديد: " : "Achievement unlocked: ") + t, desc: `${s} · +100 XP` });
    });
    const b = game.on<number>("levelup", (n) => {
      sfx.levelUp();
      confetti(innerWidth / 2, 80);
      push({ icon: "⭐", title: ar ? `ارتقيت للمستوى ${n}!` : `LEVEL UP! You're now LV ${n}`, desc: ar ? "استمر بالاستكشاف" : "Keep exploring", lvl: true });
    });
    return () => {
      a();
      b();
    };
  }, [ar]);
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div className={`toast panel ${t.lvl ? "toast--lvl" : ""}`} key={t.k}>
          <span className="toast-ico">{t.icon}</span>
          <span>
            <b>{t.title}</b>
            <small className="px">{t.desc}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
