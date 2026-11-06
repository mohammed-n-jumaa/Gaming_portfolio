"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { game, useGame, type Action } from "@/lib/game";
import { scramble } from "@/lib/fx";
import { sfx } from "@/lib/sfx";
import { useApp } from "../AppProvider";
import { Split } from "../Split";

const T = {
  en: {
    tag: "MOHAMMED.EXE · v3.0",
    first: "Mohammed",
    last: "Nedal",
    roles: ["Full Stack Developer", "SharePoint Engineer", "React × Laravel", "Professional bug hunter"],
    menu: [
      { label: "Start guided tour", act: "tour-start" as Action, hint: "Mohammed shows you around" },
      { label: "Free roam", act: "free" as Action, hint: "Explore at your own pace" },
      { label: "Tell me a joke", act: "joke" as Action, hint: "Guaranteed dad-tier humour" },
      { label: "Hire me", act: "hire" as Action, hint: "Skip straight to the good ending" },
    ],
    keys: "↑ ↓ to choose · ENTER to select",
    hi: "HI-SCORE",
  },
  ar: {
    tag: "MOHAMMED.EXE · v3.0",
    first: "محمد",
    last: "نضال",
    roles: ["مطوّر Full Stack", "مهندس SharePoint", "React × Laravel", "صيّاد باغات محترف"],
    menu: [
      { label: "ابدأ الجولة مع المرشد", act: "tour-start" as Action, hint: "محمد بفرجيك المكان" },
      { label: "تجوّل لحالك", act: "free" as Action, hint: "استكشف على راحتك" },
      { label: "احكيلي نكتة", act: "joke" as Action, hint: "نكت مضمونة… تقريباً" },
      { label: "وظّفني", act: "hire" as Action, hint: "اقفز للنهاية السعيدة" },
    ],
    keys: "↑ ↓ للاختيار · ENTER للتأكيد",
    hi: "أعلى نتيجة",
  },
};

export function TitleScreen() {
  const { lang, loaded } = useApp();
  const g = useGame();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);
  const role = useRef<HTMLSpanElement>(null);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    if (!loaded) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % c.roles.length;
      scramble(role.current, c.roles[i], 800);
    }, 2800);
    return () => clearInterval(id);
  }, [loaded, c.roles]);

  // keyboard menu, only while the title screen is in view
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || window.scrollY > innerHeight * 0.6) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        sfx.click();
        setSel((s) => (s + (e.key === "ArrowDown" ? 1 : c.menu.length - 1)) % c.menu.length);
      } else if (e.key === "Enter") {
        const btn = root.current?.querySelector<HTMLButtonElement>(".ts-opt.is-sel");
        btn?.click();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [c.menu.length]);

  useGSAP(
    () => {
      if (!loaded) {
        gsap.set(".ts-name .c, .ts-name .wi", { yPercent: 110 });
        gsap.set(".ts-fade", { autoAlpha: 0, y: 20 });
        return;
      }
      gsap
        .timeline({ delay: 0.15 })
        .from(".ts-floor", { autoAlpha: 0, scaleY: 0.4, duration: 1.4, ease: "expo.out" }, 0)
        .to(".ts-name .c, .ts-name .wi", { yPercent: 0, duration: 1.1, stagger: 0.04, ease: "back.out(1.7)" }, 0.2)
        .to(".ts-fade", { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.8, ease: "expo.out" }, 0.6)
        .from(".ts-opt", { x: -30, autoAlpha: 0, stagger: 0.07, duration: 0.6, ease: "back.out(2)" }, 0.9)
        .from(".ts-shape", { scale: 0, rotate: -90, stagger: 0.1, duration: 1, ease: "back.out(2)" }, 0.5);
      gsap.to(".ts-shape", { y: "random(-24, 24)", x: "random(-16, 16)", rotate: "random(-30, 30)", duration: "random(3, 5)", repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.3 });
    },
    { scope: root, dependencies: [loaded, lang], revertOnUpdate: true }
  );

  return (
    <section className="lvl ts" id="home" ref={root}>
      <div className="ts-sky" aria-hidden>
        <span className="ts-sun" />
        <span className="ts-shape ts-shape--1" />
        <span className="ts-shape ts-shape--2" />
        <span className="ts-shape ts-shape--3" />
        <span className="ts-shape ts-shape--4" />
      </div>
      <div className="ts-floor" aria-hidden>
        <div className="ts-grid" />
      </div>

      <div className="ts-center">
        <span className="px ts-tag ts-fade">{c.tag}</span>
        <h1 className="ts-name" aria-label={`${c.first} ${c.last}`}>
          <Split text={c.first} /> <em className="accent"><Split text={c.last} /></em>
        </h1>
        <p className="ts-role ts-fade">
          <span className="px">&gt;</span> <span ref={role}>{c.roles[0]}</span>
          <span className="ts-caret">_</span>
        </p>

        <div className="ts-menu panel ts-fade" role="menu">
          {c.menu.map((m, i) => (
            <button
              key={m.act}
              role="menuitem"
              className={`ts-opt ${sel === i ? "is-sel" : ""}`}
              onMouseEnter={() => sel !== i && (setSel(i), sfx.click())}
              onClick={() => {
                game.unlock("start");
                game.act(m.act);
              }}
            >
              <span className="ts-arrow px">▶</span>
              <span className="ts-opt-l">{m.label}</span>
              <span className="ts-opt-h">{m.hint}</span>
            </button>
          ))}
        </div>
        <div className="ts-meta px ts-fade">
          <span>{c.keys}</span>
          <span>
            {c.hi}: {String(g.xp).padStart(5, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
