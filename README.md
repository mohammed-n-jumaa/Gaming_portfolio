# MOHAMMED.EXE — a playable portfolio

Next.js 16 (static) · React 19 · TypeScript · GSAP + ScrollTrigger · Lenis · Canvas 2D · WebAudio.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static production build (deploy to Vercel as-is)
```

## The idea
The portfolio is a small game. A sticker version of Mohammed — cut out of his real photo in the browser,
with a hinged jaw that talks and eyes that blink — greets every visitor, asks whether they want a guided tour,
walks them level by level, tells programmer jokes and reacts to what they do.

| Level | Section | Concept |
|---|---|---|
| 00 | Title screen | Synthwave sun + moving 3D grid, keyboard-driven game menu |
| 01 | Character sheet | Holographic trading-card portrait, RPG stat bars, traits |
| 02 | Inventory | Skills as loot with rarity (legendary / epic / rare), inspect panel |
| 03 | Abilities | Services as holographic cards that tilt and flip |
| 04 | Quest log | Projects as quests with generative, theme-reactive covers |
| 05 | World map | Career as a winding road; Mohammed's head walks it as you scroll |
| 06 | Console | Real shell + cheat codes (`iddqd`, `idkfa`, `joke`, `xp`…) |
| 07 | Continue? | Arcade countdown screen with CRT scanlines = contact |

Game systems: XP + levels, 12 achievements with toasts, saved progress (localStorage),
synthesised sounds (mute in the HUD), Konami code, confetti.

## Where things live
- Copy & data: `src/lib/content.ts` (projects, jobs, links), `src/lib/dialogue.ts` (guide script, jokes, achievements) — English + Arabic.
- Guide: `src/components/guide/` — `Puppet.tsx` (the character), `Guide.tsx` (dialogue engine + tour).
- Game state: `src/lib/game.ts` · sounds: `src/lib/sfx.ts`.
- Palettes: 7 themes in `src/app/globals.css` (switch with the dock, the **T** key, or `theme <id>` in the console).

## Swapping in an illustrated avatar
`Puppet.tsx` draws the character from `PORTRAIT`. To use PNG poses instead (idle / talking / waving / pointing / laughing),
replace the canvas with the images and map them to the `pose` + `talk()` calls already emitted by `Guide.tsx`.
