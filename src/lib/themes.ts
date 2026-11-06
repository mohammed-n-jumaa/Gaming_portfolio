export type ThemeId = "neon" | "solar" | "volt" | "dusk" | "wine" | "ember" | "royal" | "lagoon" | "nightsky" | "pop";

export type Theme = {
  id: ThemeId;
  name: string;
  nameAr: string;
  /** [background, foreground, accent] — used for the swatch preview */
  swatch: [string, string, string];
  mix?: boolean;
};

/** Values live in globals.css under :root[data-theme=…]. This list drives the UI. */
export const THEMES: Theme[] = [
  { id: "neon", name: "Neon Navy", nameAr: "كحلي نيون", swatch: ["#031326", "#FFFFFF", "#D100D1"] },
  { id: "solar", name: "Graphite Sun", nameAr: "غرافيت وشمس", swatch: ["#1C1D20", "#F2F4F1", "#FFC928"] },
  { id: "volt", name: "Midnight Lime", nameAr: "تيل وليموني", swatch: ["#0B3048", "#F2F0E9", "#B9F12F"] },
  { id: "dusk", name: "Powder Peach", nameAr: "بودرة وخوخ", swatch: ["#E9E8F8", "#8DB9F0", "#F5B69E"] },
  { id: "wine", name: "Sage Wine", nameAr: "مريمية ونبيذي", swatch: ["#E8D2B5", "#A5A79B", "#590907"] },
  { id: "ember", name: "Ember", nameAr: "جمر", swatch: ["#1C1D20", "#E8D2B5", "#F5B69E"], mix: true },
  { id: "royal", name: "Royal Wine", nameAr: "نبيذي ملكي", swatch: ["#590907", "#E8D2B5", "#FFC928"], mix: true },
  { id: "lagoon", name: "Lagoon", nameAr: "بحيرة", swatch: ["#0B3048", "#F2F0E9", "#F5B69E"], mix: true },
  { id: "nightsky", name: "Night Sky", nameAr: "سما الليل", swatch: ["#031326", "#E9E8F8", "#8DB9F0"], mix: true },
  { id: "pop", name: "Pop Cloud", nameAr: "غيمة بوب", swatch: ["#F2F4F1", "#0B3048", "#D100D1"], mix: true },
];

export const DEFAULT_THEME: ThemeId = "neon";

export type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Read the live theme tokens from CSS so canvas/WebGL layers stay in sync with the DOM. */
export function readThemeColors() {
  const s = getComputedStyle(document.documentElement);
  const get = (v: string) => s.getPropertyValue(v).trim() || "#000000";
  return {
    bg: hexToRgb(get("--bg")),
    fg: hexToRgb(get("--fg")),
    ac: hexToRgb(get("--ac")),
    ac2: hexToRgb(get("--ac2")),
    glShadow: hexToRgb(get("--gl-s")),
    glLight: hexToRgb(get("--gl-l")),
    hex: { bg: get("--bg"), fg: get("--fg"), ac: get("--ac"), ac2: get("--ac2"), onAc: get("--on-ac") },
  };
}

export const THEME_EVENT = "mn:theme";
