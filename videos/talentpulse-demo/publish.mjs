/**
 * Copies the rendered MP4 into the Next.js public folder, web-optimised.
 *
 * The raw render is ~16 MB at 4.3 Mb/s — far too heavy for a landing page.
 * CRF 21 on UI footage is visually indistinguishable (text stays crisp) and
 * lands around 4.5 MB. `+faststart` moves the moov atom up front so the
 * browser can start playing before the whole file arrives.
 *
 * `-an` keeps the delivery silent: this film has no voice-over (it was replaced
 * by burned-in French subtitles) and no music. Without it, ffmpeg would happily
 * carry through any audio stream the source happened to have.
 *
 * Run after every render: `npm run render:publish`
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const DEST_DIR = resolve(REPO, "frontend/public/product");

/** Newest output of the last render. `render.mjs` writes renders/video.mp4. */
const candidates = [
  "renders/video.mp4",
  "out/talentpulse-demo.mp4",
  "renders/talentpulse-demo.mp4",
  "out/video.mp4",
];
let source = null;
for (const candidate of candidates) {
  try {
    statSync(resolve(HERE, candidate));
    source = resolve(HERE, candidate);
    break;
  } catch {
    /* try the next candidate */
  }
}
if (!source) {
  console.error("Aucun rendu trouvé. Lancez `npm run render` d'abord.");
  process.exit(1);
}

mkdirSync(DEST_DIR, { recursive: true });
const target = resolve(DEST_DIR, "demo.mp4");

execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-y",
    "-i", source,
    "-c:v", "libx264", "-preset", "slow", "-crf", "21",
    "-pix_fmt", "yuv420p",
    "-an",
    "-movflags", "+faststart",
    target,
  ],
  { stdio: "inherit" }
);

const mb = (statSync(target).size / 1048576).toFixed(2);
console.log(`✓ ${target} (${mb} Mo, faststart, CRF 21, sans audio)`);
