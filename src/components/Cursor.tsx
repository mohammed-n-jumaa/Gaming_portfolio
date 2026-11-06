"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Two-layer cursor: precise dot + lagging ring that morphs into labels over interactive targets. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const d = dot.current!;
    const r = ring.current!;
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });
    let shown = false;

    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const lab = target.closest<HTMLElement>("[data-cursor]");
      const link = target.closest("a, button, [role=button], input, .drag-pill");
      if (lab) {
        r.classList.add("is-label");
        r.classList.remove("is-link");
        if (label.current) label.current.textContent = lab.dataset.cursor ?? "";
      } else if (link) {
        r.classList.add("is-link");
        r.classList.remove("is-label");
      } else {
        r.classList.remove("is-link", "is-label");
      }
    };
    const down = () => r.classList.add("is-down");
    const up = () => r.classList.remove("is-down");
    const leave = () => gsap.to([d, r], { autoAlpha: 0, duration: 0.3, onComplete: () => void (shown = false) });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div className="cur-ring" ref={ring} aria-hidden>
        <span ref={label} />
      </div>
      <div className="cur-dot" ref={dot} aria-hidden />
    </>
  );
}
