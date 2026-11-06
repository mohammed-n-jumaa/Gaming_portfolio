"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { LINKS } from "@/lib/content";
import { game } from "@/lib/game";
import { sfx } from "@/lib/sfx";
import { useApp } from "../AppProvider";
import { Cover } from "../sections/Covers";
import { LevelHead } from "./LevelHead";

const DIFF = [4, 5, 4, 4, 4];
const T = {
  en: { title: "Quest *log*", sub: "Projects I've completed. Select a quest to read the briefing.", done: "Completed", diff: "Difficulty", reward: "Loot used", open: "Open quest ↗", code: "View code ↗", all: "More quests on GitHub ↗", q: "Quest", lock: "🔒 Private enterprise project — under NDA" },
  ar: { title: "سجل *المهمات*", sub: "مشاريع خلّصتها. اختار مهمة عشان تقرأ التفاصيل.", done: "مكتملة", diff: "الصعوبة", reward: "الأدوات المستعملة", open: "افتح المهمة ↗", code: "شوف الكود ↗", all: "مهمات أكثر على GitHub ↗", q: "مهمة", lock: "🔒 مشروع شركة خاص — سرّي" },
};

export function QuestLog() {
  const { t, lang } = useApp();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);
  const [sel, setSel] = useState(0);
  const q = t.work.items[sel];

  useGSAP(
    () => {
      gsap.from(".ql-item", { x: -50, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: "expo.out", clearProps: "transform",  scrollTrigger: { trigger: ".ql-wrap", start: "top 78%" } });
      gsap.from(".ql-detail", { y: 60, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".ql-wrap", start: "top 78%" } });
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );
  useGSAP(
    () => {
      gsap.fromTo(".ql-cover", { clipPath: "inset(0 100% 0 0 round 12px)" }, { clipPath: "inset(0 0% 0 0 round 12px)", duration: 0.9, ease: "expo.inOut" });
      gsap.fromTo(".ql-d-body > *", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.5, delay: 0.2 });
    },
    { scope: root, dependencies: [sel, lang] }
  );

  const pick = (i: number) => {
    if (i === sel) return;
    sfx.pop();
    setSel(i);
    game.unlock("quest");
  };

  return (
    <section className="lvl ql" id="work" ref={root}>
      <LevelHead n={4} title={c.title} sub={c.sub} />
      <div className="ql-wrap">
        <ol className="ql-list">
          {t.work.items.map((p, i) => (
            <li key={p.title}>
              <button className={`ql-item panel ${sel === i ? "is-sel" : ""}`} onClick={() => pick(i)}>
                <span className="px ql-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="ql-t">
                  <b>{p.title}</b>
                  <small>{p.sub}</small>
                </span>
                <span className="ql-ok px">✓</span>
              </button>
            </li>
          ))}
          <li>
            <a className="ql-more px" href={LINKS.github} target="_blank" rel="noreferrer">
              {c.all}
            </a>
          </li>
        </ol>

        <article className="ql-detail panel" aria-live="polite">
          <div className="ql-cover" key={sel}>
            <Cover kind={q.cover} />
            <span className="ql-stamp px">{c.done}</span>
          </div>
          <div className="ql-d-body">
            <span className="px ql-meta">
              {c.q} {String(sel + 1).padStart(2, "0")} · {q.cat}
            </span>
            <h3>
              {q.title} <em className="accent">— {q.sub}</em>
            </h3>
            <p>{q.desc}</p>
            <div className="ql-row">
              <span className="px">{c.diff}</span>
              <span className="ql-stars" aria-label={`${DIFF[sel]}/5`}>
                {"★".repeat(DIFF[sel])}
                <i>{"★".repeat(5 - DIFF[sel])}</i>
              </span>
            </div>
            <div className="ql-row ql-row--col">
              <span className="px">{c.reward}</span>
              <span className="ql-loot">
                {q.tech.map((x) => (
                  <span className="chip" key={x}>
                    {x}
                  </span>
                ))}
              </span>
            </div>
            {q.url ? (
              <a className="btn btn--ac" href={q.url} target="_blank" rel="noreferrer">
                {q.url.includes("github") ? c.code : c.open}
              </a>
            ) : (
              <span className="ql-lock px">{c.lock}</span>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
