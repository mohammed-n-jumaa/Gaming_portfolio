"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PORTRAIT } from "@/lib/content";
import { useApp } from "../AppProvider";
import { LevelHead } from "./LevelHead";

const T = {
  en: {
    title: "Character *sheet*",
    sub: "Choose your developer. (There is only one. Good choice.)",
    klass: "Class: Full-Stack SharePoint Developer",
    sub2: "Guild: K-Apps · Freelance: React & Laravel",
    bio: "I build enterprise applications, intranet portals and business management systems with SharePoint Online, SPFx, TypeScript, ASP.NET Web API and React — custom web parts, forms, dashboards, reports and workflow-driven solutions that make teams more productive. Off the clock, I ship freelance platforms with React & Laravel.",
    stats: [
      ["Frontend", 92],
      ["Backend", 88],
      ["SharePoint / SPFx", 90],
      ["Databases", 84],
      ["Problem solving", 95],
      ["Coffee tolerance", 100],
    ] as [string, number][],
    facts: [
      ["XP", "2+ years"],
      ["Quests", "10+ shipped"],
      ["Tongues", "Arabic (native) · English (proficient)"],
      ["Status", "Open to work"],
    ],
    traits: ["Strong communicator", "Team player", "Time management", "Detail-oriented", "Analytical", "Creative"],
  },
  ar: {
    title: "بطاقة *الشخصية*",
    sub: "اختار المطوّر تبعك. (في واحد بس. اختيار موفّق.)",
    klass: "الفئة: مطوّر Full-Stack و SharePoint",
    sub2: "النقابة: K-Apps · العمل الحر: React و Laravel",
    bio: "أبني تطبيقات للشركات، بوابات إنترانت وأنظمة إدارة أعمال بـ SharePoint Online و SPFx و TypeScript و ASP.NET Web API و React — web parts مخصصة، نماذج، لوحات تحكم، تقارير وحلول سير عمل بترفع إنتاجية الفرق. وبعد الدوام، بسلّم منصات عمل حر بـ React و Laravel.",
    stats: [
      ["الواجهات", 92],
      ["الباك إند", 88],
      ["SharePoint / SPFx", 90],
      ["قواعد البيانات", 84],
      ["حل المشاكل", 95],
      ["تحمّل القهوة", 100],
    ] as [string, number][],
    facts: [
      ["الخبرة", "+2 سنوات"],
      ["المهمات", "+10 مشاريع"],
      ["اللغات", "عربي (أم) · إنجليزي (متقن)"],
      ["الحالة", "متاح للعمل"],
    ],
    traits: ["تواصل قوي", "روح الفريق", "إدارة الوقت", "مهتم بالتفاصيل", "تحليلي", "مبدع"],
  },
};

export function CharacterSheet() {
  const { lang } = useApp();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".cs-grid", start: "top 72%" } });
      tl.from(".cs-card", { rotateY: -70, autoAlpha: 0, duration: 1.2, ease: "expo.out", transformPerspective: 1200 })
        .from(".cs-box", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "expo.out" }, 0.2)
        .from(".cs-bar i", { scaleX: 0, stagger: 0.08, duration: 1.4, ease: "expo.out" }, 0.5)
        .from(".cs-trait", { scale: 0, stagger: 0.06, duration: 0.5, ease: "back.out(2.4)" }, 0.8);
      gsap.utils.toArray<HTMLElement>(".cs-num").forEach((el) => {
        const v = { n: 0 };
        const to = Number(el.dataset.v);
        gsap.to(v, {
          n: to,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: { trigger: ".cs-grid", start: "top 72%" },
          onUpdate: () => void (el.textContent = String(Math.round(v.n))),
        });
      });
      // holographic tilt of the character card
      const card = root.current!.querySelector<HTMLElement>(".cs-card")!;
      const rx = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        rx(x * 18);
        ry(-y * 18);
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
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section className="lvl cs" id="about" ref={root}>
      <LevelHead n={1} title={c.title} sub={c.sub} />
      <div className="cs-grid">
        <div className="cs-card holo" data-cursor="✦">
          <div className="cs-card-top px">
            <span>★★★★★</span>
            <span>#001</span>
          </div>
          <div className="cs-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PORTRAIT} alt="Mohammed Nedal" crossOrigin="anonymous" />
          </div>
          <div className="cs-card-name">
            <b>{lang === "ar" ? "محمد نضال" : "Mohammed Nedal"}</b>
            <span className="px">LV 99 · FULL-STACK</span>
          </div>
          <span className="holo-foil" aria-hidden />
        </div>

        <div className="cs-right">
          <div className="cs-box panel cs-bio">
            <span className="px cs-box-t">{c.klass}</span>
            <span className="cs-sub2">{c.sub2}</span>
            <p>{c.bio}</p>
          </div>
          <div className="cs-box panel cs-stats">
            {c.stats.map(([k, v], i) => (
              <div className={`cs-stat ${i === c.stats.length - 1 ? "is-max" : ""}`} key={k}>
                <span className="cs-stat-k">{k}</span>
                <span className="cs-bar">
                  <i style={{ width: `${v}%` }} />
                </span>
                <span className="px cs-num" data-v={v}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div className="cs-row">
            <div className="cs-box panel cs-facts">
              {c.facts.map(([k, v]) => (
                <div key={k}>
                  <span className="px">{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <div className="cs-box panel cs-traits">
              <span className="px cs-box-t">{lang === "ar" ? "الصفات" : "Traits"}</span>
              <div>
                {c.traits.map((t) => (
                  <span className="cs-trait" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
