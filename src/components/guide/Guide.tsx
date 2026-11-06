"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, scrollToId } from "@/lib/gsap";
import { game, LEVEL_IDS, type Action } from "@/lib/game";
import { SCRIPT, type Choice, type Line, type Pose } from "@/lib/dialogue";
import { LINKS } from "@/lib/content";
import { sfx } from "@/lib/sfx";
import { useApp } from "../AppProvider";
import { Puppet, type PuppetHandle } from "./Puppet";

const POSE_STICKER: Record<Pose, string> = { idle: "", wave: "👋", point: "👉", laugh: "😂", think: "🤔", party: "🎉" };

export function Guide() {
  const { lang, loaded } = useApp();
  const S = SCRIPT[lang];
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const puppet = useRef<PuppetHandle>(null);
  const [line, setLine] = useState<Line | null>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [pose, setPose] = useState<Pose>("idle");
  const [hidden, setHidden] = useState(false);
  const tourIdx = useRef(-1);
  const typer = useRef<number>(0);
  const autoClose = useRef<number>(0);
  const fullText = useRef("");
  const jokeBag = useRef<number[]>([]);
  const busy = useRef(false);
  const lineRef = useRef<Line | null>(null);
  useEffect(() => {
    lineRef.current = line;
  }, [line]);

  const finishTyping = useCallback(() => {
    clearInterval(typer.current);
    setTyped(fullText.current);
    setDone(true);
    puppet.current?.talk(false);
  }, []);

  const say = useCallback(
    (l: Line) => {
      clearInterval(typer.current);
      clearTimeout(autoClose.current);
      setHidden(false);
      setLine(l);
      setPose(l.pose ?? "idle");
      setTyped("");
      setDone(false);
      fullText.current = l.text;
      sfx.pop();
      const chars = Array.from(l.text);
      let i = 0;
      puppet.current?.talk(true);
      typer.current = window.setInterval(() => {
        i++;
        setTyped(chars.slice(0, i).join(""));
        if (i % 2 === 0 && chars[i - 1] !== " ") sfx.blip();
        if (i >= chars.length) {
          clearInterval(typer.current);
          puppet.current?.talk(false);
          setDone(true);
          if (l.auto) autoClose.current = window.setTimeout(() => setLine(null), l.auto);
        }
      }, 26);
    },
    []
  );

  const nextJoke = useCallback(() => {
    if (!jokeBag.current.length) jokeBag.current = S.jokes.map((_, i) => i).sort(() => Math.random() - 0.5);
    return S.jokes[jokeBag.current.pop()!];
  }, [S.jokes]);

  const step = useCallback(() => {
    const s = S.tour[tourIdx.current];
    if (!s) {
      game.set({ mode: "free" });
      tourIdx.current = -1;
      say(S.tourEnd);
      return;
    }
    setLine(null);
    scrollToId(s.id);
    window.setTimeout(() => say({ text: s.text, pose: s.pose, choices: S.tourChoices }), 1500);
  }, [S, say]);

  const act = useCallback(
    (a: Action) => {
      sfx.click();
      switch (a) {
        case "tour-start":
          game.set({ mode: "tour" });
          game.unlock("start");
          game.unlock("guided");
          tourIdx.current = 0;
          step();
          break;
        case "tour-next":
          tourIdx.current = tourIdx.current < 0 ? 0 : tourIdx.current + 1;
          step();
          break;
        case "tour-stop":
        case "free":
          game.unlock("start");
          tourIdx.current = -1;
          game.set({ mode: "free" });
          say(S.freeOk);
          break;
        case "joke": {
          const n = game.get().jokes + 1;
          game.set({ jokes: n });
          game.unlock("laugh");
          if (n >= 3) game.unlock("comedian");
          const touring = tourIdx.current >= 0;
          say({ text: nextJoke(), pose: "laugh", choices: touring ? S.afterJokeTour : S.afterJokeFree });
          break;
        }
        case "hire":
          window.location.href = `mailto:${LINKS.email}?subject=${encodeURIComponent("Let's work together")}`;
          break;
        case "hide":
          setLine(null);
          setHidden(true);
          break;
        case "show":
          setHidden(false);
          say(S.menu);
          break;
        case "menu":
          say(S.menu);
          break;
        case "close":
          setLine(null);
          break;
      }
    },
    [S, nextJoke, say, step]
  );

  // external commands (title screen, console, HUD)
  useEffect(() => game.on<Action>("act", act), [act]);

  // greeting once the curtain is up
  useEffect(() => {
    if (!loaded || busy.current) return;
    busy.current = true;
    const id = window.setTimeout(() => say(game.get().returning ? S.welcomeBack : S.greet), 1600);
    return () => clearTimeout(id);
  }, [loaded, S, say]);

  // a quick comment the first time a level is reached in free-roam
  useEffect(() => {
    if (!loaded) return;
    const sts = LEVEL_IDS.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 55%",
        onEnter: () => {
          const fresh = game.visit(id);
          if (id === "contact") game.unlock("boss");
          if (fresh && game.get().mode === "free" && tourIdx.current < 0) say({ text: S.comments[id], pose: "point", auto: 3600 });
        },
      })
    );
    // visitor scrolled away without answering → quietly switch to free-roam
    sts.push(
      ScrollTrigger.create({
        trigger: "#about",
        start: "top 70%",
        onEnter: () => {
          if (game.get().mode === null && tourIdx.current < 0) {
            game.set({ mode: "free" });
            clearInterval(typer.current);
            puppet.current?.talk(false);
            setLine(null);
          }
        },
      })
    );
    return () => sts.forEach((s) => s.kill());
  }, [loaded, S, say]);

  // idle nudge
  useEffect(() => {
    if (!loaded) return;
    let t = 0;
    const reset = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        if (tourIdx.current < 0 && !document.hidden && !lineRef.current) say(S.idle);
      }, 40000);
    };
    reset();
    const evs = ["scroll", "pointerdown", "keydown"] as const;
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [loaded, S, say]);

  // head follows the cursor + idle bob
  useEffect(() => {
    if (!body.current) return;
    const el = body.current;
    gsap.set(el, { transformPerspective: 700 });
    const rx = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3" });
    const ry = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      rx(gsap.utils.clamp(-18, 18, dx * 40));
      ry(gsap.utils.clamp(-10, 10, -dy * 22));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // pose animations
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    gsap.killTweensOf(el, "y,rotation,scale");
    if (pose === "laugh") gsap.fromTo(el, { y: 0 }, { y: -10, duration: 0.12, repeat: 7, yoyo: true, ease: "power1.inOut" });
    else if (pose === "wave" || pose === "party") gsap.fromTo(el, { rotation: -6 }, { rotation: 6, duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut", onComplete: () => void gsap.to(el, { rotation: 0 }) });
    else if (pose === "think") gsap.to(el, { rotation: -5, duration: 0.6, ease: "back.out(2)" });
    else gsap.to(el, { rotation: 0, y: 0, duration: 0.5 });
  }, [pose, line]);

  // entrance
  useEffect(() => {
    if (!loaded || !root.current) return;
    gsap.fromTo(root.current, { yPercent: 120 }, { yPercent: 0, duration: 1.2, ease: "back.out(1.4)", delay: 1.1 });
  }, [loaded]);

  const onPuppet = () => (line ? (done ? act("menu") : finishTyping()) : act("menu"));

  return (
    <>
      <div className={`guide ${hidden ? "is-hidden" : ""} ${line ? "is-talking" : ""}`} ref={root} aria-live="polite">
        {line && (
          <div className="bubble" onClick={() => !done && finishTyping()}>
            <span className="bubble-name px">{S.name}</span>
            <p className="bubble-text">
              {typed}
              {!done && <span className="bubble-caret">▍</span>}
            </p>
            {done && line.choices && (
              <div className="bubble-choices">
                {line.choices.map((c: Choice, i) => (
                  <button key={c.label} onClick={() => act(c.act)} style={{ animationDelay: `${i * 70}ms` }}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {!done && <span className="bubble-skip px">{S.skip}</span>}
            <button className="bubble-x" onClick={() => act("close")} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <button className="guide-body" onClick={onPuppet} aria-label="Talk to Mohammed">
          <div className="guide-3d" ref={body}>
            <Puppet ref={puppet} className="guide-puppet" />
            {POSE_STICKER[pose] && (
              <span className={`guide-sticker guide-sticker--${pose}`} key={pose + (line?.text ?? "")}>
                {POSE_STICKER[pose]}
              </span>
            )}
          </div>
          <span className="guide-shadow" />
        </button>
      </div>
      {hidden && (
        <button className="guide-tab" onClick={() => act("show")}>
          {S.hiddenTab}
        </button>
      )}
    </>
  );
}
