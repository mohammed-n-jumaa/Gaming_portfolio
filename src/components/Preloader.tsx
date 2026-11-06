"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useApp } from "./AppProvider";
import { PORTRAIT } from "@/lib/content";

export function Preloader() {
  const { setLoaded, t } = useApp();
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const reduce = prefersReducedMotion();
    const counter = { v: 0 };
    const img = new Image();
    const imgReady = new Promise<void>((res) => {
      img.onload = img.onerror = () => res();
      img.crossOrigin = "anonymous";
      img.src = PORTRAIT;
    });
    const fonts = document.fonts?.ready ?? Promise.resolve();

    const count = gsap.to(counter, {
      v: 100,
      duration: reduce ? 0.3 : 2.6,
      ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(counter.v);
        if (num.current) {
          num.current.textContent = String(v).padStart(3, "0");
          num.current.style.fontVariationSettings = `"wdth" ${Math.round(62 + v * 0.63)}, "wght" ${Math.round(200 + v * 7)}`;
        }
        if (bar.current) bar.current.style.transform = `scaleX(${counter.v / 100})`;
        setLine(Math.min(5, Math.floor(v / 20) + 1));
      },
    });

    let killed = false;
    const done = new Promise<void>((res) => count.eventCallback("onComplete", () => res()));
    Promise.all([done, imgReady, fonts]).then(() => {
      if (killed) return;
      const cols = el.querySelectorAll(".pl-cols span");
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(".pl-num-in", { yPercent: -105, duration: 0.7, ease: "power4.in" }, 0)
        .to(".pl-log, .pl-meta, .pl-bar", { autoAlpha: 0, duration: 0.4 }, 0)
        .fromTo(cols, { scaleY: 0 }, { scaleY: 1, transformOrigin: "50% 100%", duration: 0.6, ease: "power4.inOut", stagger: 0.06 }, 0.45)
        .set(".pl-panel", { autoAlpha: 0 })
        .add(() => setLoaded(true))
        .to(cols, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.75, ease: "power4.inOut", stagger: 0.06 }, "+=0.1");
    });
    return () => {
      killed = true;
      count.kill();
    };
  }, [setLoaded]);

  if (gone) return null;
  return (
    <div className="pl" ref={root} aria-hidden>
      <div className="pl-panel">
        <div className="pl-meta">
          <span>MN — ©2026</span>
          <span>Portfolio / v3.0</span>
        </div>
        <ul className="pl-log">
          {t.loader.slice(0, line).map((l, i) => (
            <li key={i}>{l}</li>
          ))}
          <li className="pl-caret">_</li>
        </ul>
        <div className="pl-num">
          <span className="pl-num-in" ref={num}>
            000
          </span>
        </div>
        <span className="pl-bar">
          <span ref={bar} />
        </span>
      </div>
      <div className="pl-cols">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
