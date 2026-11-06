"use client";
import { useMemo, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PORTRAIT } from "@/lib/content";
import { useApp } from "../AppProvider";
import { LevelHead } from "./LevelHead";

const SEG = 620;
const T = {
  en: { title: "World *map*", sub: "My career as a road trip. Scroll — that's me walking.", here: "You are here", start: "START", now: "NOW" },
  ar: { title: "*خريطة* المسيرة", sub: "مسيرتي كأنها رحلة. انزل بالسكرول — هاد أنا ماشي.", here: "إنت هون", start: "البداية", now: "الآن" },
};

export function WorldMap() {
  const { t, lang } = useApp();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);
  // oldest → newest so the walk moves forward in time
  const items = useMemo(() => [...t.exp.items].reverse(), [t.exp.items]);
  const H = SEG * items.length + 200;
  const pts = items.map((_, i) => ({ x: i % 2 ? 700 : 300, y: 260 + i * SEG }));

  const d = useMemo(() => {
    let p = { x: 500, y: 0 };
    let s = `M${p.x} ${p.y}`;
    for (const q of [...pts, { x: 500, y: H }]) {
      s += ` C${p.x} ${p.y + 230} ${q.x} ${q.y - 230} ${q.x} ${q.y}`;
      p = q;
    }
    return s;
  }, [pts, H]);

  useGSAP(
    () => {
      const path = root.current!.querySelector<SVGPathElement>(".wm-progress")!;
      const walker = root.current!.querySelector<HTMLElement>(".wm-walker")!;
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      const flags = gsap.utils.toArray<HTMLElement>(".wm-stop");
      // fraction of the path where each checkpoint sits
      const stops = pts.map((pt) => {
        let best = 0;
        let bd = Infinity;
        for (let l = 0; l <= len; l += 8) {
          const q = path.getPointAtLength(l);
          const dd = Math.hypot(q.x - pt.x, q.y - pt.y);
          if (dd < bd) {
            bd = dd;
            best = l;
          }
        }
        return best / len;
      });
      let lastX = 500;
      ScrollTrigger.create({
        trigger: ".wm-map",
        start: "top 65%",
        end: "bottom 65%",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          path.style.strokeDashoffset = `${len * (1 - p)}`;
          const q = path.getPointAtLength(len * p);
          walker.style.left = `${q.x / 10}%`;
          walker.style.top = `${(q.y / H) * 100}%`;
          walker.classList.toggle("is-left", q.x < lastX - 0.5);
          lastX = q.x;
          walker.style.setProperty("--step", `${Math.sin(p * 140) * 6}deg`);
          flags.forEach((f, i) => f.classList.toggle("is-on", p >= stops[i] - 0.01));
        },
      });
      gsap.utils.toArray<HTMLElement>(".wm-card").forEach((card) => {
        gsap.from(card, { y: 60, autoAlpha: 0, rotate: card.classList.contains("wm-card--r") ? 3 : -3, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 80%" } });
      });
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section className="lvl wm" id="experience" ref={root}>
      <LevelHead n={5} title={c.title} sub={c.sub} />
      <div className="wm-map" style={{ height: `${H}px` }}>
        <svg className="wm-svg" viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" aria-hidden>
          <path d={d} className="wm-road" />
          <path d={d} className="wm-dash" />
          <path d={d} className="wm-progress" />
        </svg>
        <span className="wm-pin wm-pin--start px" style={{ left: "50%", top: 0 }}>
          {c.start}
        </span>
        {items.map((e, i) => {
          const p = pts[i];
          const right = p.x < 500;
          return (
            <div key={e.co} className="wm-stop" style={{ left: `${p.x / 10}%`, top: `${(p.y / H) * 100}%` }}>
              <span className="wm-flag px">{e.year}</span>
              <span className="wm-dot" />
              <article className={`wm-card panel ${right ? "wm-card--r" : "wm-card--l"}`}>
                <span className="px wm-date">
                  {e.from} — {e.to}
                </span>
                <h3>{e.co}</h3>
                <span className="wm-role accent">{e.role}</span>
                <p>{e.desc}</p>
                <span className="wm-skills">
                  {e.skills.map((s) => (
                    <span className="chip" key={s}>
                      {s}
                    </span>
                  ))}
                </span>
              </article>
            </div>
          );
        })}
        <span className="wm-pin wm-pin--end px" style={{ left: "50%", top: "100%" }}>
          {c.now} ★
        </span>
        <div className="wm-walker" aria-hidden>
          <span className="wm-walker-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PORTRAIT} alt="" />
          </span>
          <span className="wm-walker-tag px">{c.here}</span>
        </div>
      </div>
    </section>
  );
}
