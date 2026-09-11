#!/usr/bin/env node
// build-index.mjs — the assembly step for talentpulse-demo.
//
// WHY THIS EXISTS
// The stock `assemble-index.mjs` from the product-launch-video workflow pins each `<audio>`
// voice clip to its frame's start time (frame-keyed `voices[]`), and Step 5's
// `audio.mjs sync-durations` would then overwrite every frame duration in STORYBOARD.md with
// the voice file's own length. Neither is compatible with this project: the script is LOCKED
// (line text and target timecodes both), while the measured speech ran 29.21s against 30s of
// delivered scene windows, so scenes and voice deliberately disagreed at five of six boundaries.
//
// THIS BUILD HAS NO VOICE AT ALL. The narration was removed and replaced by burned-in French
// subtitles (see captions.json). So this file now differs from the stock assembler in three
// ways:
//   1. frame durations come from STORYBOARD.md verbatim (no duration sync),
//   2. there is no `<audio>` element of any kind — no voice, no BGM, no SFX. The delivery
//      MP4 therefore carries no audio stream, and render.mjs enforces that,
//   3. each subtitle line is emitted as a `.tp-subtitle` clip on track 2, plus a root GSAP
//      timeline that fades each one in and out over `fade_s`.
//
// Validate with:  npx hyperframes lint   (and then check)
//
// Usage: node build-index.mjs [--hyperframes .] [--storyboard STORYBOARD.md] [--captions captions.json]

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : def;
};
const die = (m) => {
  console.error(`\u2717 build-index: ${m}`);
  process.exitCode = 1;
  throw new Error(m);
};

const root = resolve(flag("hyperframes", "."));
const storyboardPath = resolve(flag("storyboard", join(root, "STORYBOARD.md")));
const captionsPath = resolve(flag("captions", join(root, "captions.json")));
const outPath = resolve(flag("out", join(root, "index.html")));

if (!existsSync(storyboardPath)) die(`STORYBOARD.md not found at ${storyboardPath}`);
const sb = readFileSync(storyboardPath, "utf8");

// ---------- parse the storyboard (frames in document order) ----------
const HEADING = /^#{2,3}\s+(?:frame|beat|scene)\b\s*[^\d]*(\d+)/i;
const lines = sb.split(/\r?\n/);
const frames = [];
let cur = null;
for (const line of lines) {
  const h = line.match(HEADING);
  if (h) {
    if (cur) frames.push(cur);
    cur = { number: Number(h[1]), src: null, duration: null, title: line.replace(/^#+\s*/, "") };
    continue;
  }
  if (!cur) continue;
  const src = line.match(/^\s*[-*]\s+src\s*:\s*(\S+)/i);
  if (src) cur.src = src[1];
  const dur = line.match(/^\s*[-*]\s+duration\s*:\s*([\d.]+)\s*s?\s*$/i);
  if (dur) cur.duration = Number(dur[1]);
}
if (cur) frames.push(cur);

if (!frames.length) die("no `## Frame N — …` sections parsed from STORYBOARD.md");

// ---------- canvas ----------
const fmt = sb.match(/^format:\s*(\d+)x(\d+)\s*$/m);
const WIDTH = fmt ? Number(fmt[1]) : 1920;
const HEIGHT = fmt ? Number(fmt[2]) : 1080;

// ---------- captions.json ----------
let cap = { total_duration_s: null, fade_s: 0.2, captions: [] };
if (!existsSync(captionsPath)) die(`captions.json not found at ${captionsPath}`);
try {
  cap = { ...cap, ...JSON.parse(readFileSync(captionsPath, "utf8")) };
} catch (e) {
  die(`captions.json parse: ${e.message}`);
}
const captions = (cap.captions ?? []).filter((c) => c && c.text);
if (!captions.length) die("captions.json declares no captions — this build has no voice-over");
const FADE = Number.isFinite(Number(cap.fade_s)) ? Number(cap.fade_s) : 0.2;
if (FADE < 0.15 || FADE > 0.25)
  die(`captions.fade_s is ${FADE}s; the brief locks a 150–250ms fade`);

// ---------- mount + cumulative starts ----------
const mounted = [];
for (const f of frames) {
  if (!f.src) die(`frame ${f.number} has no \`src\` — the orchestrator must write it`);
  const abs = join(root, f.src);
  if (!existsSync(abs)) die(`frame ${f.number}: ${f.src} is not on disk`);
  const html = readFileSync(abs, "utf8");
  if (!html.trim() || !/<\w/.test(html)) die(`frame ${f.number}: ${f.src} is empty or has no HTML`);
  const compId = basename(f.src).replace(/\.html?$/i, "");
  if (!html.includes(`data-composition-id="${compId}"`))
    die(`frame ${f.number}: ${f.src} has no data-composition-id="${compId}" (host/inner id must match)`);
  if (html.match(/<(video|audio)(?=[\s/>])/i))
    die(`frame ${f.number}: ${f.src} contains <video>/<audio> — media belongs at the host root`);
  if (!Number.isFinite(f.duration) || f.duration <= 0)
    die(`frame ${f.number}: no positive \`- duration:\` in STORYBOARD.md`);
  mounted.push({ ...f, compId });
}

let acc = 0;
for (const m of mounted) {
  m.start = Math.round(acc * 1000) / 1000;
  acc += m.duration;
}
let TOTAL = Math.round(acc * 1000) / 1000;
if (cap.total_duration_s != null) {
  const declared = Number(cap.total_duration_s);
  if (!Number.isFinite(declared) || declared <= 0) die("captions.total_duration_s must be positive");
  if (Math.abs(declared - TOTAL) > 0.001)
    console.warn(
      `  ! captions.total_duration_s (${declared}s) != sum of STORYBOARD durations (${TOTAL}s)` +
        ` — using the storyboard sum`,
    );
}
const sceneById = new Map(mounted.map((m) => [m.compId, m]));

// ---------- ground colour from frame.md ----------
const frameMdPath = join(root, "frame.md");
let ground = null;
if (existsSync(frameMdPath)) {
  const m = readFileSync(frameMdPath, "utf8").match(/^\s{2}canvas:\s*"([^"]+)"/m);
  if (m) ground = m[1];
}

// ---------- body ----------
const body = [];
const r3 = (x) => Math.round(x * 1000) / 1000;

mounted.forEach((m) => {
  body.push(
    `      <div`,
    `        id="el-${m.compId}"`,
    `        class="scene"`,
    `        data-composition-id="${m.compId}"`,
    `        data-composition-src="${m.src}"`,
    `        data-start="${m.start}"`,
    `        data-duration="${r3(m.duration)}"`,
    `        data-track-index="1"`,
    `      ></div>`,
    ``,
  );
});

// ---------- subtitles (track 2) ----------
// One timed clip per line, as a direct child of the root. The framework owns whether a
// caption is visible (its `data-start` / `data-duration` window); the root timeline below
// owns only its opacity, so the fade is a tween and the kill is still the framework's.
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let capCount = 0;
for (const c of captions) {
  const i = capCount;
  const scene = sceneById.get(c.scene);
  const start = Number(c.start_s);
  const dur = Number(c.duration_s);
  if (!Number.isFinite(start) || !Number.isFinite(dur) || dur <= 0)
    die(`caption ${i + 1} (${c.scene}) needs a numeric start_s and a positive duration_s`);
  if (start < 0 || start + dur > TOTAL + 0.001)
    die(`caption ${i + 1} runs ${start}→${r3(start + dur)}s, outside the ${TOTAL}s film`);
  if (dur < 2 * FADE + 0.1)
    die(`caption ${i + 1} is only ${dur}s long — too short to fade in and out`);
  if (c.variant !== "ink" && c.variant !== "paper")
    die(`caption ${i + 1} has variant "${c.variant}" — must be "ink" or "paper"`);
  if (scene && (start < scene.start - 0.001 || start + dur > scene.start + scene.duration + 0.001))
    console.warn(
      `  ! caption ${i + 1} (${r3(start)}→${r3(start + dur)}s) crosses the bounds of scene ` +
        `${c.scene} (${r3(scene.start)}→${r3(scene.start + scene.duration)}s)`,
    );
  body.push(
    `      <!-- subtitle ${i + 1}/6 — ${c.scene} · ${c.variant} plate · ${r3(start)}→${r3(start + dur)}s -->`,
    `      <div`,
    `        id="caption-${i + 1}"`,
    `        class="clip tp-subtitle tp-subtitle--${c.variant}"`,
    `        style="opacity: 0"`,
    `        data-start="${r3(start)}"`,
    `        data-duration="${r3(dur)}"`,
    `        data-track-index="2"`,
    `        data-layout-allow-caption-zone`,
    `      >`,
    `        <p class="tp-subtitle__text">${esc(c.text)}</p>`,
    `      </div>`,
    ``,
  );
  capCount++;
}
// ---------- shared scene stylesheet ----------
// Each frame also `<link>`s scene-base.css so it lints and previews standalone, but the
// assembler's CSS scoper does NOT carry a linked sheet's descendant rules into the
// composed page. Measured, not assumed: with the <link> alone the browser frame rendered
// at its intrinsic width, its hairline/bar/dots disappeared, and `.browser-shot`'s
// `width:100%` never applied (caught by `hyperframes snapshot --at 6.5`). Injecting the
// same file into the HOST head, outside the scoper, makes every shared rule apply.
// scene-base.css stays the single source of truth; the build does the copy. It also means
// the subtitle skin (`.tp-subtitle`) — declared in that same sheet — reaches the host page,
// which is the only page the subtitles live on.
const sharedCss = readFileSync(join(root, "compositions/scene-base.css"), "utf8");

const headStyle = [
  "      * {",
  "        margin: 0;",
  "        padding: 0;",
  "        box-sizing: border-box;",
  "      }",
  "      html,",
  "      body {",
  `        width: ${WIDTH}px;`,
  `        height: ${HEIGHT}px;`,
  "        overflow: hidden;",
  "        background: #000;",
  "      }",
  "      #root {",
  "        position: relative;",
  `        width: ${WIDTH}px;`,
  `        height: ${HEIGHT}px;`,
  "        overflow: hidden;",
  ...(ground ? [`        background: ${ground};`] : []),
  "      }",
  "      .scene {",
  "        position: absolute;",
  "        inset: 0;",
  "        width: 100%;",
  "        height: 100%;",
  "      }",
].join("\n");

// ---------- root timeline: the caption fades ----------
// The host timeline stays EMPTY of picture work (every scene animates inside its own
// sub-composition). It carries exactly one thing: a 200ms opacity fade on each caption.
// Plain `opacity`, never `autoAlpha` — see the hard rule at the head of scene-base.css;
// `autoAlpha` writes `visibility: hidden` ahead of the tween and the seek-based renderer
// never lifts it, which is how the first cut of this film lost five surimpressions.
//
// Each caption's hidden state is authored DIRECTLY as inline `style="opacity: 0"` on the
// element, not as a `tl.set(..., 0)`: a zero-duration set at position 0 does not animate
// while the playhead sits exactly at 0, so frame 0 would show the caption un-hidden for
// exactly one worker (`lint`: gsap_timeline_set_initial_hide, and it is right). The inline
// style is the state GSAP reads as the start value, so every seek — including t=0 — is
// reproducible from the time value alone.
//
// Selector is `#caption-N`: the `caption…` id token is what the linter's track-density
// audit recognises as a caption cue (so six subtitles on one display track is not read as a
// six-scene pile-up), and `#caption-N` exists nowhere else in the assembled document, so it
// cannot collide with a scene's own `#id` rules.
const fadeLines = [];
captions.forEach((c, i) => {
  const start = r3(Number(c.start_s));
  const dur = r3(Number(c.duration_s));
  const out = r3(Number(c.start_s) + Number(c.duration_s) - FADE);
  const sel = `#caption-${i + 1}`;
  fadeLines.push(
    `      // ${i + 1}/6  ${r3(start)}→${r3(Number(start) + Number(dur))}s  ${JSON.stringify(c.text).slice(0, 46)}…`,
    `      tl.fromTo(`,
    `        '${sel}',`,
    `        { opacity: 0 },`,
    `        { opacity: 1, duration: ${FADE}, ease: "power1.out", immediateRender: false },`,
    `        ${r3(Number(start) + FADE)},`,
    `      );`,
    `      tl.to('${sel}', { opacity: 0, duration: ${FADE}, ease: "power1.in" }, ${out});`,
    ``,
  );
});

const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${WIDTH}, height=${HEIGHT}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js" integrity="sha384-sG0Hv1tP1lZCk9KQmrIbY/XNwi+OY84GQqhMscbnsoBFqAz8KNCil1kvfL3Hbbk2" crossorigin="anonymous"></script>
    <!-- shared scene base, injected from compositions/scene-base.css at build time -->
    <style>
${sharedCss}
    </style>
    <style>
${headStyle}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${TOTAL}"
      data-width="${WIDTH}"
      data-height="${HEIGHT}"
    >
${body.join("\n")}
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });

      // Burned-in subtitles: opacity only. The framework owns each caption's
      // visibility window from its data-start / data-duration; this timeline
      // owns the 200ms fade in and out inside that window.
${fadeLines.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

writeFileSync(outPath, html);

// ---------- summary ----------
console.log(`\u2713 wrote ${outPath}`);
console.log(`  canvas:            ${WIDTH}\u00d7${HEIGHT}`);
console.log(`  ground (#root):    ${ground ?? "(none — body letterbox)"}`);
console.log(`  frames (track 1):  ${mounted.length}`);
for (const m of mounted)
  console.log(`    ${String(m.number).padStart(2)}  ${r3(m.start).toString().padStart(6)}s \u2192 ${r3(m.start + m.duration).toString().padStart(6)}s   ${m.src}`);
console.log(`  subtitles (track 2): ${capCount}  ·  fade ${FADE}s`);
for (const c of captions)
  console.log(
    `    ${String(c.frame).padStart(2)}  ${r3(c.start_s).toString().padStart(6)}s \u2192 ${r3(Number(c.start_s) + Number(c.duration_s)).toString().padStart(6)}s   ` +
      `${c.variant.padEnd(5)}  ${c.text}`,
  );
console.log(`  audio:             0 (no voice-over, no BGM — the film is silent)`);
console.log(`  total duration:    ${TOTAL}s`);

