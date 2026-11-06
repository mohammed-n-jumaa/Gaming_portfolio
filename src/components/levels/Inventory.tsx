"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SKILLS, type SkillCat } from "@/lib/content";
import { game } from "@/lib/game";
import { sfx } from "@/lib/sfx";
import { useApp } from "../AppProvider";
import { LevelHead } from "./LevelHead";

type Rarity = "legendary" | "epic" | "rare";
const INFO: Record<string, { sym: string; en: string; ar: string }> = {
  React: { sym: "Re", en: "Modern UIs with reusable components. My main weapon.", ar: "واجهات حديثة بمكونات قابلة لإعادة الاستخدام. سلاحي الأساسي." },
  TypeScript: { sym: "Ts", en: "Strongly-typed JavaScript at scale. Prevents 90% of 3am bugs.", ar: "JavaScript بأنواع صارمة. بتمنع 90% من باغات الساعة 3 الفجر." },
  JavaScript: { sym: "Js", en: "Interactive and dynamic web apps.", ar: "تطبيقات ويب تفاعلية وديناميكية." },
  HTML5: { sym: "Ht", en: "Semantic and accessible web structures.", ar: "هيكلة ويب دلالية وسهلة الوصول." },
  CSS3: { sym: "Cs", en: "Responsive, modern interfaces. Yes, I can center a div.", ar: "واجهات متجاوبة وحديثة. آه، بعرف أوسّط div." },
  Tailwind: { sym: "Tw", en: "Utility-first styling at speed.", ar: "تنسيق سريع بأسلوب utility-first." },
  SASS: { sym: "Sa", en: "CSS with superpowers.", ar: "CSS بقوى خارقة." },
  Bootstrap: { sym: "Bs", en: "Rapid responsive layouts.", ar: "تخطيطات متجاوبة بسرعة." },
  Laravel: { sym: "Lv", en: "Elegant PHP framework — APIs, auth, queues, the lot.", ar: "إطار PHP أنيق — APIs، مصادقة، طوابير، وكل شي." },
  PHP: { sym: "Ph", en: "Server-side programming.", ar: "برمجة جهة الخادم." },
  "ASP.NET API": { sym: "An", en: "Robust RESTful APIs for enterprise apps.", ar: "RESTful APIs قوية لتطبيقات الشركات." },
  "REST APIs": { sym: "Ra", en: "Clean API design and integration.", ar: "تصميم وربط APIs بشكل نظيف." },
  Auth: { sym: "Au", en: "Authentication & security best practices.", ar: "المصادقة وأفضل ممارسات الأمان." },
  MySQL: { sym: "My", en: "Relational database management.", ar: "إدارة قواعد البيانات العلائقية." },
  "SQL Server": { sym: "Sq", en: "Enterprise data on Microsoft's stack.", ar: "بيانات الشركات على منظومة مايكروسوفت." },
  "Data Modeling": { sym: "Dm", en: "Schemas built for performance and reliability.", ar: "مخططات مبنية للأداء والاعتمادية." },
  SharePoint: { sym: "Sp", en: "Enterprise content management, intranets & portals.", ar: "إدارة محتوى الشركات، إنترانت وبوابات." },
  SPFx: { sym: "Fx", en: "SharePoint Framework web parts in React.", ar: "Web parts بـ SharePoint Framework و React." },
  "Azure DevOps": { sym: "Az", en: "CI/CD pipelines and deployments.", ar: "خطوط CI/CD والنشر." },
  Git: { sym: "Gi", en: "Version control. git blame never lies.", ar: "إدارة النسخ. git blame ما بيكذب." },
  Figma: { sym: "Fg", en: "Design handoff and prototyping.", ar: "تسليم التصاميم والنماذج الأولية." },
};
const rarityOf = (s: (typeof SKILLS)[number]): Rarity => (s.big ? "legendary" : s.c === "frontend" || s.c === "backend" ? "epic" : "rare");

const T = {
  en: {
    title: "The *inventory*",
    sub: "Every item is a skill I actually use. Click to inspect.",
    cats: { all: "All", frontend: "Frontend", backend: "Backend", data: "Data", platform: "Platform" },
    rar: { legendary: "Legendary", epic: "Epic", rare: "Rare" },
    type: "Type",
    slots: "slots",
    equipped: "✓ Equipped",
  },
  ar: {
    title: "*الحقيبة*",
    sub: "كل غرض مهارة بستعملها فعلاً. اكبس عشان تفحصه.",
    cats: { all: "الكل", frontend: "واجهات", backend: "باك إند", data: "بيانات", platform: "منصّات" },
    rar: { legendary: "أسطوري", epic: "ملحمي", rare: "نادر" },
    type: "النوع",
    slots: "خانة",
    equipped: "✓ مجهّز",
  },
};

export function Inventory() {
  const { lang } = useApp();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);
  const [cat, setCat] = useState<"all" | SkillCat>("all");
  const [sel, setSel] = useState(SKILLS[0].n);
  const seen = useRef(new Set<string>());
  const item = SKILLS.find((s) => s.n === sel)!;
  const info = INFO[item.n];
  const rar = rarityOf(item);

  useGSAP(
    () => {
      gsap.fromTo(".inv-slot", { scale: 0.3, autoAlpha: 0 }, {
        scale: 1,
        autoAlpha: 1,
        clearProps: "transform,opacity,visibility",
        duration: 0.6,
        ease: "back.out(2)",
        stagger: { each: 0.03, from: "random" },
        scrollTrigger: { trigger: ".inv-grid", start: "top 78%" },
      });
      gsap.from(".inv-detail", { x: 60, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".inv-grid", start: "top 78%" } });
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  useGSAP(
    () => {
      gsap.fromTo(".inv-d-tile", { scale: 0.6, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2.5)" });
      gsap.fromTo(".inv-d-text > *", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.4 });
    },
    { scope: root, dependencies: [sel] }
  );

  const pick = (n: string) => {
    setSel(n);
    sfx.pop();
    seen.current.add(n);
    game.set({ items: game.get().items + 1 });
    if (seen.current.size >= 3) game.unlock("loot");
  };

  return (
    <section className="lvl inv" id="skills" ref={root}>
      <LevelHead n={2} title={c.title} sub={c.sub} />
      <div className="inv-tabs" role="tablist">
        {(Object.keys(c.cats) as ("all" | SkillCat)[]).map((k) => (
          <button key={k} role="tab" aria-selected={cat === k} className={`chip ${cat === k ? "is-on" : ""}`} onClick={() => (setCat(k), sfx.click())}>
            {c.cats[k]}
          </button>
        ))}
        <span className="px inv-count">
          {SKILLS.length}/24 {c.slots}
        </span>
      </div>
      <div className="inv-wrap">
        <div className="inv-grid panel">
          {SKILLS.map((s) => {
            const r = rarityOf(s);
            const dim = cat !== "all" && cat !== s.c;
            return (
              <button
                key={s.n}
                className={`inv-slot inv-slot--${r} ${sel === s.n ? "is-sel" : ""} ${dim ? "is-dim" : ""}`}
                onClick={() => pick(s.n)}
                aria-label={s.n}
              >
                <span className="inv-sym">{INFO[s.n].sym}</span>
                <span className="inv-name">{s.n}</span>
              </button>
            );
          })}
          {Array.from({ length: 24 - SKILLS.length }, (_, i) => (
            <span className="inv-slot inv-slot--empty" key={`e${i}`} aria-hidden />
          ))}
        </div>
        <aside className={`inv-detail panel inv-detail--${rar}`} aria-live="polite">
          <div className="inv-d-tile">
            <span>{info.sym}</span>
          </div>
          <div className="inv-d-text">
            <span className={`px inv-rar inv-rar--${rar}`}>★ {c.rar[rar]}</span>
            <h3>{item.n}</h3>
            <span className="inv-d-type">
              {c.type}: {c.cats[item.c]}
            </span>
            <p>{lang === "ar" ? info.ar : info.en}</p>
            <span className="px inv-eq">{c.equipped}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
