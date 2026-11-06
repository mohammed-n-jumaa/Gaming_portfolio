"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, scrollState } from "@/lib/gsap";
import { LINKS } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { confetti } from "@/lib/confetti";
import { useApp } from "../AppProvider";
import { Roll } from "../Split";

const T = {
  en: {
    q: "Continue?",
    sub: "Hire Mohammed before the timer runs out. (It restarts. He's patient.)",
    over: "Game over?",
    over2: "Nah — insert coin to continue:",
    yes: "YES — let's work together",
    copy: "Copy email",
    copied: "Copied! +1 coin",
    credits: ["Designed & engineered by Mohammed Nedal", "Character: Mohammed (sticker edition)", "Jokes: also Mohammed, sorry", "Thanks for playing ♥"],
    back: "Back to title",
    time: "Local time",
  },
  ar: {
    q: "بدك تكمّل؟",
    sub: "وظّف محمد قبل ما يخلص الوقت. (بيرجع يعد من جديد. هو صبور.)",
    over: "خلصت اللعبة؟",
    over2: "لأ — حط عملة عشان تكمّل:",
    yes: "أكيد — يلا نشتغل سوا",
    copy: "انسخ الإيميل",
    copied: "تم النسخ! +1 عملة",
    credits: ["تصميم وبرمجة محمد نضال", "الشخصية: محمد (نسخة الستيكر)", "النكت: كمان محمد، آسفين", "شكراً إنك لعبت ♥"],
    back: "رجوع للبداية",
    time: "الوقت",
  },
};

export function Continue() {
  const { lang } = useApp();
  const c = T[lang];
  const root = useRef<HTMLElement>(null);
  const [n, setN] = useState(9);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: root.current, start: "top 60%", end: "bottom top", onToggle: (s) => setRunning(s.isActive) });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setN((v) => {
        const next = v <= 0 ? 9 : v - 1;
        sfx.click();
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
    const tick = () => setTime(f.format(new Date()));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(".co-num", { scale: 1.6, autoAlpha: 0.2 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(3)" });
    },
    { scope: root, dependencies: [n] }
  );
  useGSAP(
    () => {
      gsap.from(".co-reveal", { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 65%" } });
      gsap.to(".co-credits-in", { yPercent: -50, ease: "none", repeat: -1, duration: 14 });
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
      setCopied(true);
      sfx.coin();
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const over = n === 0;

  return (
    <section className="lvl co" id="contact" ref={root}>
      <div className="co-screen panel">
        <span className="co-scan" aria-hidden />
        <div className="co-top px co-reveal">
          <span>{lang === "ar" ? "المرحلة الأخيرة" : "FINAL LEVEL"}</span>
          <span>
            {c.time} {time}
          </span>
        </div>

        <div className="co-center">
          <h2 className="co-q co-reveal">{over ? c.over : c.q}</h2>
          <span className={`co-num px ${over ? "is-over" : ""}`} key={n} aria-live="off">
            {n}
          </span>
          <p className="co-sub co-reveal">{over ? c.over2 : c.sub}</p>

          <div className="co-actions co-reveal">
            <a
              className="btn btn--ac co-yes"
              href={`mailto:${LINKS.email}?subject=${encodeURIComponent("Let's work together")}`}
              onClick={(e) => confetti(e.clientX, e.clientY)}
            >
              <Roll text={c.yes} />
            </a>
            <button className="btn btn--ghost" onClick={copy}>
              <Roll text={copied ? c.copied : c.copy} />
            </button>
          </div>

          <div className="co-links co-reveal">
            <a href={`mailto:${LINKS.email}`} className="chip">✉ {LINKS.email}</a>
            <a href={`tel:${LINKS.phone}`} className="chip" dir="ltr">☎ {LINKS.phonePretty}</a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="chip">in LinkedIn ↗</a>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="chip">⌘ GitHub ↗</a>
          </div>
        </div>

        <div className="co-foot">
          <div className="co-credits px" aria-label="Credits">
            <div className="co-credits-in">
              {[...c.credits, ...c.credits].map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>
          <button
            className="px co-back"
            onClick={() => (scrollState.lenis ? scrollState.lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
          >
            ↑ {c.back}
          </button>
        </div>
      </div>
    </section>
  );
}
