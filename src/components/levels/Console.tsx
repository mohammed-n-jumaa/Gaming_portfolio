"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, scrollToId } from "@/lib/gsap";
import { LINKS, SKILLS } from "@/lib/content";
import { THEMES, type ThemeId } from "@/lib/themes";
import { useApp } from "../AppProvider";
import { LevelHead } from "./LevelHead";
import { game, levelOf } from "@/lib/game";
import { confetti } from "@/lib/confetti";

type Line = { kind: "in" | "out" | "err" | "ok" | "ascii"; text: string };

const BANNER = String.raw`
 __  __ _   _
|  \/  | \ | |   mohammed.os v3.0
| |\/| |  \| |   full stack · sharepoint · motion
| |  | | |\  |   type 'help' to begin
|_|  |_|_| \_|
`;

export function Console() {
  const { t, lang, switchLang, switchTheme } = useApp();
  const root = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const matrix = useRef<HTMLCanvasElement>(null);
  const [lines, setLines] = useState<Line[]>([{ kind: "ascii", text: BANNER }]);
  const [val, setVal] = useState("");
  const hist = useRef<string[]>([]);
  const hIdx = useRef(-1);
  const booted = useRef(false);

  const print = useCallback((...ls: Line[]) => setLines((p) => [...p, ...ls]), []);

  const runMatrix = useCallback(() => {
    const c = matrix.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const w = (c.width = c.clientWidth);
    const h = (c.height = c.clientHeight);
    const cols = Math.floor(w / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const glyphs = "アイウエオカキクケコ01محمدنضال<>/{}=+";
    const ac = getComputedStyle(document.documentElement).getPropertyValue("--ac").trim();
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    c.style.opacity = "1";
    const t0 = performance.now();
    const frame = (now: number) => {
      ctx.fillStyle = bg + "22";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ac;
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * 14, y * 14);
        drops[i] = y * 14 > h && Math.random() > 0.97 ? 0 : y + 1;
      });
      if (now - t0 < 4000) requestAnimationFrame(frame);
      else gsap.to(c, { opacity: 0, duration: 0.8, onComplete: () => ctx.clearRect(0, 0, w, h) });
    };
    requestAnimationFrame(frame);
  }, []);

  const exec = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      print({ kind: "in", text: cmd });
      if (!cmd) return;
      hist.current.unshift(cmd);
      hIdx.current = -1;
      const [name, ...args] = cmd.split(/\s+/);
      const arg = args.join(" ").toLowerCase();
      const o = (text: string): Line => ({ kind: "out", text });
      switch (name.toLowerCase()) {
        case "help":
          print(
            o(
              [
                "available commands:",
                "  about        who is this guy",
                "  skills       list the stack",
                "  work         jump to projects",
                "  experience   career timeline",
                "  contact      ways to reach me",
                "  theme [id]   list / switch palettes   e.g. theme volt",
                "  lang [en|ar] switch language",
                "  hire         …you know you want to",
                "  joke         ask Mohammed for a joke",
                "  xp           show your progress",
                "  matrix       ¯\\_(ツ)_/¯",
                "  clear        clean the screen",
                "",
                "psst: real gamers know a few cheat codes 🤫",
              ].join("\n")
            )
          );
          break;
        case "about":
        case "whoami":
          print(
            o(
              lang === "ar"
                ? "محمد نضال — مطوّر Full Stack ومهندس SharePoint.\nReact · Laravel · ASP.NET · SPFx"
                : "Mohammed Nedal — Full Stack Developer & SharePoint Engineer.\nReact · Laravel · ASP.NET · SPFx. Currently @ K-Apps."
            )
          );
          break;
        case "skills":
        case "ls": {
          const groups = ["frontend", "backend", "data", "platform"] as const;
          print(o(groups.map((g) => `${g.padEnd(10)} ${SKILLS.filter((s) => s.c === g).map((s) => s.n).join(", ")}`).join("\n")));
          break;
        }
        case "work":
        case "projects":
          print({ kind: "ok", text: "→ scrolling to /work" });
          setTimeout(() => scrollToId("work"), 300);
          break;
        case "experience":
        case "cv":
          print(o(t.exp.items.map((e) => `${(e.from + " – " + e.to).padEnd(24)} ${e.co} · ${e.role}`).join("\n")));
          break;
        case "contact":
        case "social":
          print(o(`email     ${LINKS.email}\nphone     ${LINKS.phonePretty}\nlinkedin  ${LINKS.linkedin}\ngithub    ${LINKS.github}`));
          break;
        case "theme": {
          if (!arg || arg === "list") {
            print(o(THEMES.map((x) => `  ${x.id.padEnd(7)} ${x.name}${x.mix ? "  (mix)" : ""}`).join("\n") + "\nusage: theme <id>"));
          } else {
            const th = THEMES.find((x) => x.id === arg || x.name.toLowerCase() === arg);
            if (th) {
              print({ kind: "ok", text: `✓ palette → ${th.name}` });
              const r = input.current?.getBoundingClientRect();
              switchTheme(th.id as ThemeId, r ? { x: r.left + 20, y: r.top } : undefined);
            } else print({ kind: "err", text: `theme '${arg}' not found. try: theme list` });
          }
          break;
        }
        case "lang":
          if (arg === "ar" || arg === "en") {
            print({ kind: "ok", text: `✓ language → ${arg}` });
            setTimeout(() => switchLang(arg), 300);
          } else print({ kind: "err", text: "usage: lang en | lang ar" });
          break;
        case "hire":
          print({ kind: "ok", text: "✓ excellent decision. opening mail client…" });
          setTimeout(() => (window.location.href = `mailto:${LINKS.email}?subject=Let's work together`), 700);
          break;
        case "sudo":
          print({ kind: "err", text: "nice try. this incident will be reported 👀" });
          break;
        case "joke":
          print({ kind: "ok", text: "→ Mohammed is warming up his best material…" });
          game.act("joke");
          break;
        case "xp": {
          const g = game.get();
          print(o(`level      ${levelOf(g.xp)}\nxp         ${g.xp}\ntrophies   ${g.ach.length}\nlevels     ${g.visited.length}/7 visited\njokes      ${g.jokes} survived`));
          break;
        }
        case "iddqd":
        case "godmode":
          print({ kind: "ok", text: "★ GOD MODE ENABLED — all bugs are now features." });
          game.unlock("cheater");
          confetti();
          break;
        case "idkfa":
        case "motherlode":
          print({ kind: "ok", text: "💰 +500 XP. Your bank account remains unchanged." });
          game.unlock("cheater");
          game.addXp(500);
          break;
        case "rosebud":
        case "konami":
          print({ kind: "ok", text: "↑↑↓↓←→←→BA — try it on your keyboard, outside the console 😉" });
          game.unlock("cheater");
          break;
        case "matrix":
          print({ kind: "ok", text: "wake up, neo…" });
          runMatrix();
          break;
        case "date":
          print(o(new Date().toString()));
          break;
        case "echo":
          print(o(args.join(" ")));
          break;
        case "clear":
          setLines([]);
          break;
        case "exit":
          print(o("there is no escape. scroll down instead ↓"));
          break;
        default:
          print({ kind: "err", text: `command not found: ${name}. type 'help'` });
      }
    },
    [lang, print, runMatrix, switchLang, switchTheme, t.exp.items]
  );

  // auto-type "help" the first time the terminal enters view
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top 60%",
      once: true,
      onEnter: () => {
        if (booted.current) return;
        booted.current = true;
        const word = "help";
        let i = 0;
        const id = setInterval(() => {
          i++;
          setVal(word.slice(0, i));
          if (i === word.length) {
            clearInterval(id);
            setTimeout(() => {
              exec(word);
              setVal("");
            }, 350);
          }
        }, 120);
      },
    });
    return () => st.kill();
  }, [exec]);

  useEffect(() => {
    const s = screen.current;
    if (s) s.scrollTop = s.scrollHeight;
  }, [lines]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".tm-win",
        { clipPath: "inset(48% 10% 48% 10% round 20px)", rotateX: 18, transformPerspective: 1400 },
        {
          clipPath: "inset(0% 0% 0% 0% round 20px)",
          rotateX: 0,
          duration: 1.4,
          ease: "expo.inOut",
          scrollTrigger: { trigger: ".tm-win", start: "top 80%" },
        }
      );
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(val);
      setVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      hIdx.current = Math.min(hist.current.length - 1, hIdx.current + 1);
      setVal(hist.current[hIdx.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIdx.current = Math.max(-1, hIdx.current - 1);
      setVal(hIdx.current < 0 ? "" : hist.current[hIdx.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const all = ["help", "about", "skills", "work", "experience", "contact", "theme", "lang", "hire", "joke", "xp", "matrix", "clear"];
      const m = all.find((c) => c.startsWith(val));
      if (m) setVal(m + " ");
    }
  };

  return (
    <section className="lvl term" id="console" ref={root}>
      <LevelHead
        n={6}
        title={lang === "ar" ? "الكونسول *السري*" : "Secret *console*"}
        sub={lang === "ar" ? "Shell حقيقي للموقع. جرّب help أو joke… أو cheat code." : "A real shell for this site. Try help, joke… or a cheat code."}
      />
      <div className="tm-win" onClick={() => input.current?.focus()} dir="ltr">
        <div className="tm-bar">
          <span className="tm-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="mono">guest@mohammed: ~</span>
          <span className="mono tm-bar-r">zsh — 80×24</span>
        </div>
        <div className="tm-screen mono" ref={screen} data-lenis-prevent>
          {lines.map((l, i) =>
            l.kind === "in" ? (
              <div key={i} className="tm-l tm-in">
                <span className="tm-ps">➜ ~</span> {l.text}
              </div>
            ) : (
              <pre key={i} className={`tm-l tm-${l.kind}`}>
                {l.text}
              </pre>
            )
          )}
          <label className="tm-l tm-prompt">
            <span className="tm-ps">➜ ~</span>
            <input
              ref={input}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              aria-label="Terminal input"
            />
          </label>
        </div>
        <canvas className="tm-matrix" ref={matrix} aria-hidden />
      </div>
    </section>
  );
}
