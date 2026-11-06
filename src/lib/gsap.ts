"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out" });
  // Custom eases tuned like After Effects "Easy Ease" curves
}

export const EASE = {
  out: "expo.out",
  inOut: "power4.inOut",
  snap: "back.out(1.6)",
};

/** shared runtime state written by the smooth scroller */
export const scrollState: {
  velocity: number;
  direction: 1 | -1;
  lenis: { scrollTo: (t: number | string | HTMLElement, o?: Record<string, unknown>) => void; stop: () => void; start: () => void } | null;
} = { velocity: 0, direction: 1, lenis: null };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (scrollState.lenis) scrollState.lenis.scrollTo(el, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: "smooth" });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, useGSAP };
