"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, scrollState, prefersReducedMotion } from "@/lib/gsap";
import { useApp } from "./AppProvider";

export function SmoothScroll() {
  const { loaded } = useApp();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
    scrollState.lenis = lenis as unknown as typeof scrollState.lenis;
    lenis.on("scroll", (l: Lenis) => {
      scrollState.velocity = l.velocity;
      scrollState.direction = l.direction === -1 ? -1 : 1;
      ScrollTrigger.update();
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      document.documentElement.classList.add("is-loading");
      return;
    }
    document.documentElement.classList.remove("is-loading");
    window.scrollTo(0, 0);
    scrollState.lenis?.start();
    const id = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(id);
  }, [loaded]);

  return null;
}
