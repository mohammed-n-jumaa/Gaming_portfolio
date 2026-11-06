"use client";

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&01ABCDEFGHJKMNPQRSTUVWXYZ";
const running = new WeakMap<HTMLElement, number>();

/** "Decoder" text effect: characters resolve left→right through random glyphs. */
export function scramble(el: HTMLElement | null, to: string, duration = 700) {
  if (!el) return;
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);
  const from = el.textContent ?? "";
  const len = Math.max(from.length, to.length);
  const queue = Array.from({ length: len }, (_, i) => {
    const start = Math.floor(Math.random() * 0.4 * duration);
    const end = start + Math.floor(0.3 * duration + Math.random() * 0.3 * duration);
    return { from: from[i] ?? "", to: to[i] ?? "", start, end };
  });
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = now - t0;
    let out = "";
    let done = 0;
    for (const q of queue) {
      if (t >= q.end) {
        done++;
        out += q.to;
      } else if (t >= q.start) {
        out += q.to === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      } else out += q.from;
    }
    el.textContent = out;
    if (done < queue.length) running.set(el, requestAnimationFrame(tick));
    else {
      el.textContent = to;
      running.delete(el);
    }
  };
  running.set(el, requestAnimationFrame(tick));
}

/**
 * Variable-font proximity: each glyph's width/weight responds to the cursor distance.
 * Values are lerped per frame so the type "breathes" like a liquid.
 */
export function attachProximity(
  container: HTMLElement,
  selector: string,
  opts: { radius?: number; wght?: [number, number]; wdth?: [number, number] } = {}
) {
  const radius = opts.radius ?? 260;
  const [w0, w1] = opts.wght ?? [300, 900];
  const [d0, d1] = opts.wdth ?? [75, 125];
  const els = Array.from(container.querySelectorAll<HTMLElement>(selector));
  if (!els.length || matchMedia("(pointer: coarse)").matches) return () => {};
  const state = els.map(() => ({ v: 0 }));
  let centers: { x: number; y: number }[] = [];
  let mx = -9999;
  let my = -9999;
  let raf = 0;
  let visible = true;

  const measure = () => {
    centers = els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 + window.scrollY };
    });
  };
  const onMove = (e: PointerEvent) => {
    mx = e.clientX;
    my = e.clientY + window.scrollY;
  };
  const onLeave = () => {
    mx = my = -9999;
  };
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    for (let i = 0; i < els.length; i++) {
      const c = centers[i];
      if (!c) continue;
      const d = Math.hypot(mx - c.x, my - c.y);
      const target = Math.max(0, 1 - d / radius);
      const s = state[i];
      s.v += (target - s.v) * 0.12;
      if (Math.abs(target - s.v) < 0.001 && target === 0 && s.v < 0.002) {
        if (s.v !== 0) {
          s.v = 0;
          els[i].style.fontVariationSettings = "";
        }
        continue;
      }
      const e = s.v * s.v * (3 - 2 * s.v);
      els[i].style.fontVariationSettings = `"wght" ${Math.round(w0 + (w1 - w0) * e)}, "wdth" ${Math.round(d0 + (d1 - d0) * e)}`;
    }
  };
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) measure();
  });
  io.observe(container);
  measure();
  const t = setTimeout(measure, 600);
  window.addEventListener("resize", measure);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(t);
    io.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    els.forEach((el) => (el.style.fontVariationSettings = ""));
  };
}

/** Magnetic hover: element is pulled toward the cursor, inner content pulled further (parallax). */
export function attachMagnetic(el: HTMLElement, strength = 0.35) {
  if (matchMedia("(pointer: coarse)").matches) return () => {};
  const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
  let raf = 0;
  let tx = 0,
    ty = 0,
    x = 0,
    y = 0;
  const loop = () => {
    x += (tx - x) * 0.15;
    y += (ty - y) * 0.15;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (inner) inner.style.transform = `translate3d(${x * 0.5}px, ${y * 0.5}px, 0)`;
    if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(loop);
    else raf = 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    tx = (e.clientX - (r.left + r.width / 2)) * strength;
    ty = (e.clientY - (r.top + r.height / 2)) * strength;
    kick();
  };
  const leave = () => {
    tx = ty = 0;
    kick();
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    cancelAnimationFrame(raf);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
}
