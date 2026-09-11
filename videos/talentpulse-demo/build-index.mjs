#!/usr/bin/env node
// build-index.mjs — the assembly step for talentpulse-demo.
//
// WHY THIS EXISTS
// The stock `assemble-index.mjs` from the product-launch-video workflow pins each `<audio>`
// voice clip to its frame's start time (frame-keyed `voices[]`), and Step 5's
// `audio.mjs sync-durations` would then overwrite every frame duration in STORYBOARD.md with
// the voice file's own length. Neither is compatible with this project: the script is LOCKED
// (line text and target timecodes both), while the measured speech runs 29.21s against 30s of
// delivered scene windows, so scenes and voice deliberately disagree at five of six boundaries.
//
// So this project keeps the workflow's *conventions* — scene sub-compositions on track 1, voice
// on track 10, the project ground painted on #root, capture assets staged into assets/ — and
// makes only the two changes the locked brief requires:
//   1. frame durations come from STORYBOARD.md verbatim (no duration sync), and
//   2. each voice clip is placed at its ABSOLUTE `start_s` from audio_meta.json.
//
// Validate with:  npx hyperframes lint   (and then check)
//
// Usage: node build-index.mjs [--hyperframes .] [--storyboard STORYBOARD.md] [--audio-meta audio_meta.json]

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
const audioMetaPath = resolve(flag("audio-meta", join(root, "audio_meta.json")));
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

// ---------- audio_meta ----------
let meta = { bgm: null, voices: [], sfx: [], total_duration_s: null };
if (existsSync(audioMetaPath)) {
  try {
    meta = { ...meta, ...JSON.parse(readFileSync(audioMetaPath, "utf8")) };
  } catch (e) {
    die(`audio_meta.json parse: ${e.message}`);
  }
}
const voiceByFrame = new Map();
for (const v of meta.voices ?? []) if (v.frame != null) voiceByFrame.set(Number(v.frame), v);

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
if (meta.total_duration_s != null) {
  const declared = Number(meta.total_duration_s);
  if (!Number.isFinite(declared) || declared <= 0) die("audio_meta.total_duration_s must be positive");
  if (Math.abs(declared - TOTAL) > 0.001)
    console.warn(
      `  ! audio_meta.total_duration_s (${declared}s) != sum of STORYBOARD durations (${TOTAL}s)` +
        ` — using the storyboard sum`,
    );
}

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
let voiceCount = 0;

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
  );
  const v = voiceByFrame.get(m.number);
  if (v?.path) {
    if (!existsSync(join(root, v.path))) {
      console.warn(`  ! frame ${m.number}: voice ${v.path} not on disk — skipped`);
    } else {
      // ABSOLUTE placement, not the frame's own data-start. See the header.
      if (!Number.isFinite(v.start_s))
        die(`frame ${m.number}: voice ${v.path} has no numeric \`start_s\` in audio_meta.json`);
      const voDur = Number.isFinite(v.duration_s) ? r3(v.duration_s) : r3(m.duration);
      body.push(
        `      <audio`,
        `        id="el-${m.compId}-voice"`,
        `        src="${v.path}"`,
        `        data-start="${r3(v.start_s)}"`,
        `        data-duration="${voDur}"`,
        `        data-track-index="${10 + voiceCount}"`,
        `        data-volume="1"`,
        `      ></audio>`,
      );
      voiceCount++;
    }
  }
  body.push("");
});

// BGM — this project ships voice alone (see BRIEF.md § Music). Emit only what meta says.
let bgmEmitted = false;
if (meta.bgm?.path) {
  if (!existsSync(join(root, meta.bgm.path))) die(`bgm ${meta.bgm.path} not on disk`);
  body.push(
    `      <!-- BGM -->`,
    `      <audio`,
    `        id="el-bgm"`,
    `        src="${meta.bgm.path}"`,
    `        data-start="0"`,
    `        data-duration="${TOTAL}"`,
    `        data-track-index="11"`,
    `        data-volume="${meta.bgm.volume ?? 0.12}"`,
    `      ></audio>`,
    "",
  );
  bgmEmitted = true;
}

// ---------- shared scene stylesheet ----------
// Each frame also `<link>`s scene-base.css so it lints and previews standalone, but the
// assembler's CSS scoper does NOT carry a linked sheet's descendant rules into the
// composed page. Measured, not assumed: with the <link> alone the browser frame rendered
// at its intrinsic width, its hairline/bar/dots disappeared, and `.browser-shot`'s
// `width:100%` never applied (caught by `hyperframes snapshot --at 6.5`). Injecting the
// same file into the HOST head, outside the scoper, makes every shared rule apply.
// scene-base.css stays the single source of truth; the build does the copy.
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
      window.__timelines["main"] = gsap.timeline({ paused: true });
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
console.log(`  voice  (track 10): ${voiceCount}`);
for (const m of mounted) {
  const v = voiceByFrame.get(m.number);
  if (v?.path && existsSync(join(root, v.path)))
    console.log(`    ${String(m.number).padStart(2)}  ${r3(v.start_s).toString().padStart(6)}s \u2192 ${r3(v.start_s + v.duration_s).toString().padStart(6)}s   ${v.path}`);
}
console.log(`  bgm    (track 11): ${bgmEmitted ? "yes" : "no"}`);
console.log(`  captions (track 2): no (brief: none)`);
console.log(`  total duration:    ${TOTAL}s`);
