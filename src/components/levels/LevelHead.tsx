"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "../AppProvider";
import { Title } from "../Split";

/** "LEVEL 0X" banner that stamps in like a game stage card. */
export function LevelHead({ n, title, sub }: { n: number; title: string; sub?: string }) {
  const { lang } = useApp();
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 82%" } });
      tl.from(".lh-badge", { scale: 2.4, rotate: -14, autoAlpha: 0, duration: 0.7, ease: "back.out(2)" })
        .from(".lh-title .c, .lh-title .wi", { yPercent: 110, stagger: 0.025, duration: 0.9, ease: "expo.out" }, 0.15)
        .from(".lh-sub", { autoAlpha: 0, y: 14, duration: 0.7 }, 0.4)
        .from(".lh-line", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0.2);
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );
  return (
    <div className="lh" ref={root}>
      <span className="lh-badge px">
        {lang === "ar" ? "مرحلة" : "LEVEL"} {String(n).padStart(2, "0")}
      </span>
      <h2 className="lh-title">
        <Title text={title} />
      </h2>
      {sub && <p className="lh-sub">{sub}</p>}
      <span className="lh-line" />
    </div>
  );
}
