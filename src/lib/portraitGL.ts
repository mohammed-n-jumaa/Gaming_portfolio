import { readThemeColors, type RGB } from "./themes";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uMouse;
uniform float uVel;
uniform float uHover;
uniform float uTime;
uniform float uReveal;
uniform float uScroll;
uniform vec3 uFg;
uniform vec3 uAc;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0., a = .5; for(int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= .5; } return v; }
vec2 fit(vec2 uv){
  float ca = uRes.x / uRes.y;
  if (ca > 1.) uv.y = (uv.y - .5) / ca + .5; else uv.x = (uv.x - .5) * ca + .5;
  return uv;
}
vec4 img(vec2 uv){
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return vec4(0.);
  return texture2D(uTex, uv);
}

void main(){
  vec2 uv = vUv;
  float ca = uRes.x / uRes.y;

  // ---- liquid lens around the cursor
  vec2 d = uv - uMouse; d.x *= ca;
  float dist = length(d);
  float R = .24 + uVel * .06;
  float lens = (1. - smoothstep(R * .3, R, dist)) * uHover;

  vec2 flow = vec2(fbm(uv * 3. + vec2(uTime * .25, 0.)), fbm(uv * 3. + vec2(0., uTime * .25))) - .5;
  vec2 tuv = fit(uv + flow * (.07 * lens + .05 * uScroll));

  // chromatic split driven by cursor velocity
  float split = (.002 + uVel * .035) * lens + .012 * uScroll;
  vec4 cg = img(tuv);
  float r = img(tuv + vec2(split, 0.)).r;
  float b = img(tuv - vec2(split, 0.)).b;
  vec3 photo = vec3(r, cg.g, b);

  // ---- halftone duotone in theme colours
  float cell = max(5., 6.5 * uDpr);
  vec2 px = gl_FragCoord.xy;
  vec2 cc = (floor(px / cell) + .5) * cell;
  vec2 cuv = cc / uRes + flow * .04 * uScroll;
  vec4 cs = img(fit(cuv));
  float lum = dot(cs.rgb, vec3(.299, .587, .114));
  float rad = (1. - lum) * .46 + .17;
  float dd = length(px - cc) / cell;
  float dotm = (1. - smoothstep(rad - .12, rad, dd)) * cs.a;
  vec3 dotCol = mix(uAc, uFg, smoothstep(.22, .78, lum));

  vec3 col = dotCol;
  float a = dotm;

  // lens shows the real photograph + a thin accent rim
  col = mix(col, photo, lens);
  a = mix(a, cg.a, lens);
  float rim = (1. - smoothstep(0., .004 * ca + .002, abs(dist - R * .82))) * uHover * .9;
  vec4 base = img(fit(uv));
  col = mix(col, uAc, rim * base.a);
  a = max(a, rim * base.a);

  // ---- noise dissolve intro with glowing edge
  float th = fbm(uv * 4. + 3.) * .7 + (1. - uv.y) * .5;
  float rv = uReveal * 1.35 - .1;
  float vis = smoothstep(th - .015, th + .015, rv);
  float edge = (1. - smoothstep(0., .035, abs(th - rv))) * step(.001, uReveal) * (1. - step(.999, uReveal));
  col = mix(col, uAc, edge * base.a);
  a = max(a * vis, edge * base.a);

  gl_FragColor = vec4(col * a, a);
}
`;

/** Remove the white studio background with a border flood-fill, then feather the alpha. */
export function buildMaskedTexture(img: HTMLImageElement) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const N = w * h;
  const isBg = (i: number) => {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    return r > 218 && g > 218 && b > 218 && Math.max(r, g, b) - Math.min(r, g, b) < 28;
  };
  const mask = new Uint8Array(N); // 1 = background
  const stack = new Int32Array(N);
  let sp = 0;
  const push = (i: number) => {
    if (!mask[i] && isBg(i)) {
      mask[i] = 1;
      stack[sp++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (sp) {
    const i = stack[--sp];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < N - w) push(i + w);
  }
  // separable box blur on alpha for a soft edge, then slight erosion to kill the white halo
  const a = new Float32Array(N);
  for (let i = 0; i < N; i++) a[i] = mask[i] ? 0 : 1;
  const tmp = new Float32Array(N);
  const R = 2;
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let k = -R; k <= R; k++) {
          const xx = x + k;
          if (xx >= 0 && xx < w) { s += a[y * w + xx]; n++; }
        }
        tmp[y * w + x] = s / n;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let k = -R; k <= R; k++) {
          const yy = y + k;
          if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++; }
        }
        a[y * w + x] = s / n;
      }
  }
  for (let i = 0; i < N; i++) {
    const v = Math.min(1, Math.max(0, (a[i] - 0.35) / 0.65));
    px[i * 4 + 3] = Math.round(v * 255);
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

export class PortraitGL {
  private gl: WebGLRenderingContext;
  private prog!: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private visible = true;
  private ready = false;
  private start = performance.now();
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  private mouse = { x: 0.5, y: 0.55 };
  private target = { x: 0.5, y: 0.55 };
  private vel = 0;
  private hover = 0;
  private hoverTarget = 0;
  private lastMove = -1e9;
  private inside = false;
  reveal = 0;
  scroll = 0;
  private fg: RGB = [1, 1, 1];
  private ac: RGB = [1, 0, 1];

  constructor(private canvas: HTMLCanvasElement, src: string, onReady?: () => void) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) throw new Error("webgl unavailable");
    this.gl = gl;
    this.compile();
    this.syncColors();

    const img = new Image();
    img.onload = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildMaskedTexture(img));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.ready = true;
      onReady?.();
    };
    img.crossOrigin = "anonymous";
    img.src = src;

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
    this.io.observe(canvas);
    window.addEventListener("pointermove", this.onMove, { passive: true });
    this.resize();
    this.loop();
  }

  private compile() {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    gl.useProgram(p);
    this.prog = p;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uTex", "uRes", "uDpr", "uMouse", "uVel", "uHover", "uTime", "uReveal", "uScroll", "uFg", "uAc"])
      this.u[n] = gl.getUniformLocation(p, n);
  }

  syncColors() {
    const c = readThemeColors();
    this.fg = c.glLight;
    this.ac = c.glShadow;
  }

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    this.inside = x > -0.1 && x < 1.1 && y > -0.1 && y < 1.1;
    if (this.inside) {
      this.target.x = x;
      this.target.y = y;
      this.lastMove = performance.now();
    }
  };

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || !this.ready || document.hidden) return;
    const now = performance.now();
    const t = (now - this.start) / 1000;
    const idle = now - this.lastMove > 2200;
    if (idle) {
      // autonomous drift so touch devices still see the effect
      this.target.x = 0.5 + Math.sin(t * 0.55) * 0.22;
      this.target.y = 0.62 + Math.sin(t * 0.83) * 0.18;
      this.hoverTarget = 0.75;
    } else this.hoverTarget = this.inside ? 1 : 0;

    const px = this.mouse.x, py = this.mouse.y;
    this.mouse.x += (this.target.x - this.mouse.x) * 0.09;
    this.mouse.y += (this.target.y - this.mouse.y) * 0.09;
    const v = Math.min(1, Math.hypot(this.mouse.x - px, this.mouse.y - py) * 40);
    this.vel += (v - this.vel) * 0.08;
    this.hover += (this.hoverTarget - this.hover) * 0.06;

    const gl = this.gl;
    const u = this.u;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uDpr, Math.min(window.devicePixelRatio || 1, 2));
    gl.uniform2f(u.uMouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(u.uVel, this.vel);
    gl.uniform1f(u.uHover, this.hover * Math.min(1, this.reveal * 1.2));
    gl.uniform1f(u.uTime, t);
    gl.uniform1f(u.uReveal, this.reveal);
    gl.uniform1f(u.uScroll, this.scroll);
    gl.uniform3fv(u.uFg, this.fg);
    gl.uniform3fv(u.uAc, this.ac);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    this.ro.disconnect();
    window.removeEventListener("pointermove", this.onMove);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
