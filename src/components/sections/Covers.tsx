import type { CoverKind } from "@/lib/content";

// deterministic PRNG so server & client render identical SVG
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Rings() {
  const rings = [
    { r: 110, p: 0.82 },
    { r: 82, p: 0.64 },
    { r: 54, p: 0.9 },
  ];
  return (
    <svg viewBox="0 0 400 300" className="cv cv-rings">
      {rings.map(({ r, p }, i) => {
        const c = 2 * Math.PI * r;
        return (
          <g key={i} transform="rotate(-90 200 150)">
            <circle cx="200" cy="150" r={r} className="cv-track" />
            <circle
              cx="200"
              cy="150"
              r={r}
              className={`cv-ring cv-ring--${i}`}
              strokeDasharray={c}
              style={{ ["--c" as string]: c, ["--p" as string]: c * (1 - p), animationDelay: `${i * 0.25}s` }}
            />
          </g>
        );
      })}
      <text x="200" y="146" className="cv-big">1,840</text>
      <text x="200" y="168" className="cv-small">KCAL · TODAY</text>
      <text x="24" y="34" className="cv-small cv-l">● LIVE CHAT</text>
      <text x="376" y="280" className="cv-small cv-r">PAYPAL ✓</text>
    </svg>
  );
}

function Orbit() {
  return (
    <svg viewBox="0 0 400 300" className="cv cv-orbit">
      {[60, 95, 130].map((r, i) => (
        <g key={r} className="cv-spin" style={{ animationDuration: `${8 + i * 5}s`, animationDirection: i % 2 ? "reverse" : "normal" }}>
          <ellipse cx="200" cy="150" rx={r} ry={r * 0.62} className="cv-track" />
          <circle cx={200 + r} cy="150" r={8 - i} className="cv-dot" />
          <circle cx={200 - r} cy="150" r={4} className="cv-dot2" />
        </g>
      ))}
      <text x="200" y="164" className="cv-glyph">{"{ }"}</text>
    </svg>
  );
}

function Candles() {
  const r = rng(7);
  let price = 150;
  const candles = Array.from({ length: 22 }, (_, i) => {
    const open = price;
    price += (r() - 0.42) * 34;
    price = Math.max(60, Math.min(240, price));
    const close = price;
    const hi = Math.max(open, close) + r() * 16;
    const lo = Math.min(open, close) - r() * 16;
    return { x: 28 + i * 16, open, close, hi, lo, up: close >= open };
  });
  const line = candles.map((c, i) => `${i ? "L" : "M"}${c.x} ${300 - (c.open + c.close) / 2}`).join(" ");
  return (
    <svg viewBox="0 0 400 300" className="cv cv-candles">
      {[60, 120, 180, 240].map((y) => (
        <line key={y} x1="0" x2="400" y1={y} y2={y} className="cv-grid" />
      ))}
      {candles.map((c, i) => (
        <g key={i} className="cv-candle" style={{ animationDelay: `${i * 0.06}s` }}>
          <line x1={c.x} x2={c.x} y1={300 - c.hi} y2={300 - c.lo} className={c.up ? "cv-up-l" : "cv-dn-l"} />
          <rect
            x={c.x - 5}
            y={300 - Math.max(c.open, c.close)}
            width="10"
            height={Math.max(2, Math.abs(c.close - c.open))}
            className={c.up ? "cv-up" : "cv-dn"}
          />
        </g>
      ))}
      <path d={line} className="cv-line" pathLength={1} />
      <text x="24" y="34" className="cv-small cv-l">BTC / USD</text>
      <text x="376" y="34" className="cv-small cv-r cv-pos">▲ 4.21%</text>
    </svg>
  );
}

function Scales() {
  return (
    <svg viewBox="0 0 400 300" className="cv cv-scales">
      <line x1="200" y1="60" x2="200" y2="250" className="cv-stroke" />
      <path d="M150 250 h100" className="cv-stroke" />
      <circle cx="200" cy="56" r="8" className="cv-dot" />
      <g className="cv-beam">
        <line x1="90" y1="80" x2="310" y2="80" className="cv-stroke" />
        <g className="cv-pan cv-pan--l">
          <line x1="90" y1="80" x2="62" y2="150" className="cv-thin" />
          <line x1="90" y1="80" x2="118" y2="150" className="cv-thin" />
          <path d="M56 150 h68 a34 18 0 0 1 -68 0z" className="cv-fill" />
        </g>
        <g className="cv-pan cv-pan--r">
          <line x1="310" y1="80" x2="282" y2="150" className="cv-thin" />
          <line x1="310" y1="80" x2="338" y2="150" className="cv-thin" />
          <path d="M276 150 h68 a34 18 0 0 1 -68 0z" className="cv-fill2" />
        </g>
      </g>
      <text x="24" y="280" className="cv-small cv-l">§ 01 — BOOK A LAWYER</text>
    </svg>
  );
}

function Network() {
  const r = rng(42);
  const nodes = Array.from({ length: 14 }, () => ({ x: 40 + r() * 320, y: 40 + r() * 220 }));
  const edges: [number, number][] = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 110) edges.push([i, j]);
    })
  );
  return (
    <svg viewBox="0 0 400 300" className="cv cv-net">
      {edges.map(([a, b], k) => (
        <line
          key={k}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          className={k % 4 === 0 ? "cv-edge cv-edge--hot" : "cv-edge"}
          pathLength={1}
          style={{ animationDelay: `${(k % 7) * 0.4}s` }}
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 5 === 0 ? 9 : 5} className={i % 5 === 0 ? "cv-node cv-node--big" : "cv-node"} style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </svg>
  );
}

function Droste() {
  const levels = 9;
  const nest = (k: number): React.ReactNode =>
    k >= levels ? null : (
      <g className="cv-nest" style={{ animationDelay: `${k * -0.4}s` }}>
        <rect x="-150" y="-105" width="300" height="210" rx="10" className={k % 2 ? "cv-frame2" : "cv-frame"} />
        <g transform="scale(.8)">{nest(k + 1)}</g>
      </g>
    );
  return (
    <svg viewBox="0 0 400 300" className="cv cv-droste">
      <g transform="translate(200 150)">{nest(0)}</g>
    </svg>
  );
}

/** WorkFlow: an approval flowchart with a token travelling through it */
function Flow() {
  const boxes = [
    { x: 40, y: 50, t: "REQUEST" },
    { x: 160, y: 50, t: "HR" },
    { x: 280, y: 50, t: "MANAGER" },
    { x: 160, y: 175, t: "KPI" },
    { x: 280, y: 175, t: "✓ DONE" },
  ];
  const path = "M120 72 H160 M240 72 H280 M320 94 V135 H200 V175 M240 197 H280";
  return (
    <svg viewBox="0 0 400 300" className="cv cv-flow">
      <path d={path} className="cv-flow-line" />
      <path d={path} className="cv-flow-run" pathLength={1} />
      {boxes.map((b, i) => (
        <g key={i} className="cv-flow-box" style={{ animationDelay: `${i * 0.55}s` }}>
          <rect x={b.x} y={b.y} width="80" height="44" rx="8" className={i === 4 ? "cv-fill" : "cv-flow-rect"} />
          <text x={b.x + 40} y={b.y + 26} className="cv-flow-t">{b.t}</text>
        </g>
      ))}
      <text x="24" y="280" className="cv-small cv-l">SPFx · SHAREPOINT LISTS · .NET MAIL</text>
    </svg>
  );
}

/** Floward: stacked course cards with progress bars filling up */
function Courses() {
  const rows = [0.92, 0.64, 0.38];
  return (
    <svg viewBox="0 0 400 300" className="cv cv-courses">
      {rows.map((p, i) => (
        <g key={i} className="cv-course" style={{ animationDelay: `${i * 0.3}s` }}>
          <rect x={60 + i * 14} y={40 + i * 70} width={280 - i * 28} height="56" rx="10" className="cv-flow-rect" />
          <circle cx={88 + i * 14} cy={68 + i * 70} r="12" className={i === 0 ? "cv-dot" : "cv-dot2"} />
          <rect x={112 + i * 14} y={58 + i * 70} width="120" height="6" rx="3" className="cv-bar-bg" />
          <rect x={112 + i * 14} y={72 + i * 70} width={(200 - i * 28) * p} height="6" rx="3" className="cv-bar" style={{ animationDelay: `${0.4 + i * 0.3}s` }} />
        </g>
      ))}
      <text x="376" y="34" className="cv-small cv-r">AI PROGRAM · TEAMS ✓</text>
    </svg>
  );
}

/** KPI: department score bars + a target line */
function Kpi() {
  const deps = [
    { t: "HR", v: 0.82 },
    { t: "IT", v: 0.94 },
    { t: "OPS", v: 0.68 },
    { t: "FIN", v: 0.88 },
    { t: "MKT", v: 0.74 },
  ];
  return (
    <svg viewBox="0 0 400 300" className="cv cv-kpi">
      {[90, 150, 210].map((y) => (
        <line key={y} x1="40" x2="380" y1={y} y2={y} className="cv-grid" />
      ))}
      <line x1="40" x2="380" y1="90" y2="90" className="cv-kpi-target" />
      {deps.map((d, i) => {
        const h = d.v * 190;
        return (
          <g key={d.t}>
            <rect x={62 + i * 64} y={250 - h} width="36" height={h} rx="5" className={d.v >= 0.85 ? "cv-fill cv-kpi-bar" : "cv-flow-rect cv-kpi-bar"} style={{ animationDelay: `${i * 0.15}s` }} />
            <text x={80 + i * 64} y="270" className="cv-flow-t">{d.t}</text>
            <text x={80 + i * 64} y={240 - h} className="cv-flow-t">{Math.round(d.v * 100)}</text>
          </g>
        );
      })}
      <text x="24" y="34" className="cv-small cv-l">DEPARTMENT KPI · Q4</text>
      <text x="376" y="34" className="cv-small cv-r cv-pos">TARGET 85%</text>
    </svg>
  );
}

export function Cover({ kind }: { kind: CoverKind }) {
  switch (kind) {
    case "kpi":
      return <Kpi />;
    case "flow":
      return <Flow />;
    case "courses":
      return <Courses />;
    case "rings":
      return <Rings />;
    case "orbit":
      return <Orbit />;
    case "candles":
      return <Candles />;
    case "scales":
      return <Scales />;
    case "network":
      return <Network />;
    default:
      return <Droste />;
  }
}
