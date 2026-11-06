"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { buildMaskedTexture } from "@/lib/portraitGL";
import { PORTRAIT } from "@/lib/content";

export type PuppetHandle = { talk: (on: boolean) => void };

// Landmarks measured on the 800×800 source photo
const CROP = { x: 130, y: 20, w: 560, h: 620 };
const PAD = 22;
const EYES = [
  { x: 355, y: 247 },
  { x: 455, y: 245 },
];
// lip line measured at 4× zoom: corners x≈356–439, parting y≈343
const MOUTH = { x: 398, y: 343, w: 34 };
const CHIN = { x: 398, y: 386, rx: 88, ry: 52 };
const SKIN = { x: 405, y: 190 };
const SCALE = 0.62;

/**
 * Die-cut "sticker" puppet built from the real photo:
 * flood-fill cut-out → white outline → hinged jaw that flaps while talking + blinking eyelids.
 */
export const Puppet = forwardRef<PuppetHandle, { className?: string }>(function Puppet({ className }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const talking = useRef(false);

  useImperativeHandle(ref, () => ({ talk: (on) => void (talking.current = on) }), []);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const W = CROP.w + PAD * 2;
    const H = CROP.h + PAD * 2;
    cv.width = Math.round(W * SCALE);
    cv.height = Math.round(H * SCALE);
    let raf = 0;
    let alive = true;
    const L = (x: number, y: number) => ({ x: x - CROP.x + PAD, y: y - CROP.y + PAD });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!alive) return;
      const masked = buildMaskedTexture(img);
      const mk = () => {
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        return [c, c.getContext("2d")!] as const;
      };
      // 1. cut-out crop
      const [c0, x0] = mk();
      x0.drawImage(masked, CROP.x, CROP.y, CROP.w, CROP.h, PAD, PAD, CROP.w, CROP.h);
      // 2. white silhouette → outline by stamping around a circle
      const [s, xs] = mk();
      xs.drawImage(c0, 0, 0);
      xs.globalCompositeOperation = "source-in";
      xs.fillStyle = "#fff";
      xs.fillRect(0, 0, W, H);
      const [base, xb] = mk();
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        xb.drawImage(s, Math.cos(a) * 12, Math.sin(a) * 12);
      }
      xb.drawImage(c0, 0, 0);
      // 3. jaw piece: everything under the lip line inside the chin ellipse
      const [chin, xc] = mk();
      const m = L(MOUTH.x, MOUTH.y);
      const ch = L(CHIN.x, CHIN.y);
      xc.save();
      xc.beginPath();
      xc.rect(0, m.y, W, H);
      xc.clip();
      xc.beginPath();
      xc.ellipse(ch.x, ch.y, CHIN.rx, CHIN.ry, 0, 0, Math.PI * 2);
      xc.clip();
      xc.drawImage(c0, 0, 0);
      xc.restore();
      // 4. skin tone for eyelids
      const px = masked.getContext("2d")!.getImageData(SKIN.x, SKIN.y, 1, 1).data;
      const skin = `rgb(${px[0]},${px[1]},${px[2]})`;
      const lid = `rgb(${px[0] * 0.55},${px[1] * 0.45},${px[2] * 0.42})`;

      let jaw = 0;
      let jawT = 0;
      let nextFlap = 0;
      let blinkUntil = 0;
      let nextBlink = performance.now() + 1800;
      const eyes = EYES.map((e) => L(e.x, e.y));

      const draw = (now: number) => {
        raf = requestAnimationFrame(draw);
        if (talking.current) {
          if (now > nextFlap) {
            jawT = jawT > 5 ? Math.random() * 2 : 6 + Math.random() * 7;
            nextFlap = now + 70 + Math.random() * 60;
          }
        } else jawT = 0;
        jaw += (jawT - jaw) * 0.45;
        if (now > nextBlink) {
          blinkUntil = now + 130;
          nextBlink = now + 2500 + Math.random() * 3500;
        }
        ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(base, 0, 0);
        if (jaw > 0.6) {
          // mouth cavity between the lips: dark-red gradient + a soft hint of upper teeth
          const g = ctx.createLinearGradient(0, m.y - 2, 0, m.y + jaw + 2);
          g.addColorStop(0, "#5a1a1a");
          g.addColorStop(1, "#1e0606");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(m.x, m.y + jaw / 2, MOUTH.w, jaw / 2 + 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(240,232,225,0.85)";
          ctx.beginPath();
          ctx.ellipse(m.x, m.y + 0.5, MOUTH.w * 0.62, Math.min(2.6, jaw * 0.22), 0, 0, Math.PI);
          ctx.fill();
          ctx.drawImage(chin, 0, jaw);
        }
        if (now < blinkUntil) {
          for (const e of eyes) {
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.ellipse(e.x, e.y, 21, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = lid;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(e.x, e.y + 2, 18, 5, 0, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.stroke();
          }
        }
      };
      raf = requestAnimationFrame(draw);
    };
    img.src = PORTRAIT;
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvas} className={className} aria-label="Mohammed, your guide" role="img" />;
});
