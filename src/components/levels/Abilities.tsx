"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { sfx } from "@/lib/sfx";
import { useApp } from "../AppProvider";
import { LevelHead } from "./LevelHead";

function Emblem({ i }: { i: number }) {
  if (i === 0)
    return (
      <svg viewBox="0 0 200 200" className="emb emb-grid" aria-hidden>
        {Array.from({ length: 16 }, (_, k) => (
          <rect key={k} x={20 + (k % 4) * 42} y={20 + Math.floor(k / 4) * 42} width="34" height="34" rx="6" style={{ animationDelay: `${((k % 4) + Math.floor(k / 4)) * 0.12}s` }} />
        ))}
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 200 200" className="emb emb-stack" aria-hidden>
        {[0, 1, 2, 3].map((k) => (
          <g key={k} style={{ animationDelay: `${k * 0.2}s` }}>
            <rect x="30" y={30 + k * 38} width="140" height="28" rx="6" />
            <circle cx="150" cy={44 + k * 38} r="5" />
            <line x1="44" x2={80 + k * 15} y1={44 + k * 38} y2={44 + k * 38} />
          </g>
        ))}
      </svg>
    );
  if (i === 2)
    return (
      <svg viewBox="0 0 200 200" className="emb emb-orbit" aria-hidden>
        <circle cx="100" cy="100" r="22" className="emb-core" />
        {[48, 70, 92].map((r, k) => (
          <g key={r} className="emb-ring" style={{ animationDuration: `${6 + k * 3}s`, animationDirection: k % 2 ? "reverse" : "normal" }}>
            <circle cx="100" cy="100" r={r} />
            <circle cx={100 + r} cy="100" r="7" className="emb-sat" />
          </g>
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 200 200" className="emb emb-db" aria-hidden>
      {[0, 1, 2].map((k) => (
        <g key={k} style={{ animationDelay: `${k * 0.25}s` }}>
          <ellipse cx="100" cy={60 + k * 40} rx="60" ry="16" />
          <path d={`M40 ${60 + k * 40} v28 a60 16 0 0 0 120 0 v-28`} />
        </g>
      ))}
    </svg>
  );
}

const META = [
  { el: "⚡", stat: ["SPD 95", "UX 92"] },
  { el: "🛡", stat: ["DEF 94", "API 90"] },
  { el: "🏢", stat: ["ENT 96", "SPFx 90"] },
  { el: "💾", stat: ["INT 88", "OPT 86"] },
];

const T = {
  en: { title: "Special *abilities*", sub: "Holographic, collectible, and available for hire. Click a card to flip it.", flip: "Click to flip ↻", type: "Ability" },
  ar: { title: "القدرات *الخاصة*", sub: "هولوغرام، قابلة للتجميع، ومتاحة للتوظيف. اكبس على الكرت عشان ينقلب.", flip: "اكبس للقلب ↻", type: "قدرة" },
};

export function Abilities() {
  const { t, lang } = useApp();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);
  const [flipped, setFlipped] = useState<number[]>([]);

  useGSAP(
    () => {
      gsap.from(".ab-card", {
        y: 160,
        rotate: (i) => (i - 1.5) * 18,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".ab-hand", start: "top 80%" },
      });
      const cards = gsap.utils.toArray<HTMLElement>(".ab-card");
      const offs = cards.map((card) => {
        const inner = card.querySelector<HTMLElement>(".ab-tilt")!;
        const rx = gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          rx(x * 26);
          ry(-y * 26);
          card.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
          card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        return () => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        };
      });
      return () => offs.forEach((f) => f());
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  const flip = (i: number) => {
    sfx.whoosh();
    setFlipped((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]));
  };

  return (
    <section className="lvl abl" id="services" ref={root}>
      <LevelHead n={3} title={c.title} sub={c.sub} />
      <div className="ab-hand">
        {t.services.items.map((s, i) => (
          <button className={`ab-card ab-card--${i} holo ${flipped.includes(i) ? "is-flipped" : ""}`} key={i} onClick={() => flip(i)} data-cursor="↻">
            <span className="ab-tilt">
              <span className="ab-flip">
                <span className="ab-face ab-front">
                  <span className="ab-top px">
                    <span>
                      {c.type} · 0{i + 1}
                    </span>
                    <span>{META[i].el}</span>
                  </span>
                  <span className="ab-art">
                    <Emblem i={i} />
                  </span>
                  <span className="ab-name">{s.title}</span>
                  <span className="ab-stats px">
                    {META[i].stat.map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                  </span>
                  <span className="ab-hint px">{c.flip}</span>
                  <span className="holo-foil" aria-hidden />
                </span>
                <span className="ab-face ab-back">
                  <span className="ab-top px">
                    <span>{s.title}</span>
                  </span>
                  <span className="ab-desc">{s.desc}</span>
                  <span className="ab-tags">
                    {s.tech.map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                  </span>
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
