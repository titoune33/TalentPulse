#!/usr/bin/env node
// render.mjs — Step 6 delivery for talentpulse-demo.
//
// 1. render the assembled composition at high quality
// 2. MUX/VALIDATE the delivery file: the targets are 1920×1080 H.264 yuv420p with the moov
//    atom first, so the <video> on the product page can start before the whole file lands.
//    We never blindly re-encode: the picture is checked first and only the container is
//    touched when it already conforms.
//    THIS BUILD IS SILENT. The voice-over was removed and replaced by burned-in French
//    subtitles, so the delivery must carry NO audio stream at all — a leftover AAC track
//    would be either silence or, worse, a stale voice. The check below fails on any audio
//    stream, and both ffmpeg passes strip one with `-an`.
// 3. extract the poster at 6.2s, then VERIFY it is not a black/empty frame.
//
// Usage: node render.mjs [--skip-render]

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const HERE = resolve(new URL(".", import.meta.url).pathname);
const skipRender = process.argv.includes("--skip-render");

const RENDERS = join(HERE, "renders");
const RAW = join(RENDERS, "video.mp4");
const DEST_DIR = resolve(HERE, "../../frontend/public/product");
const DEST = join(DEST_DIR, "demo.mp4");
const POSTER = join(DEST_DIR, "demo-poster.jpg");
// Mid-scene-2. NOT 5.0s: scene 2 runs 4.0→10.5s and its surimpression only lands at local
// 1.65s, i.e. video 5.65s — a poster grabbed at exactly 5.0s came out with the label still
// invisible (verified by measuring the band, not by eye). 6.2s is local 2.2s: dashboard
// settled, label in place, push-in still breathing, and the second subtitle (4.35→9.25s)
// fully faded in, so the poster shows the product WITH its caption.
const POSTER_AT = 6.2;

const CLI = "hyperframes@0.8.34";
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  return r.status ?? 1;
};
const capture = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return { status: r.status ?? 1, out: (r.stdout || "") + (r.stderr || "") };
};
const die = (m) => {
  console.error(`\n\u2717 render: ${m}`);
  process.exit(1);
};
const r3 = (x) => Math.round(x * 1000) / 1000;

mkdirSync(RENDERS, { recursive: true });
if (!existsSync(DEST_DIR)) die(`delivery directory does not exist: ${DEST_DIR}`);

// ---------- 1. render ----------
if (!skipRender) {
  console.log("\u25b8 rendering…");
  const status = run("npx", [
    "--yes",
    CLI,
    "render",
    "--skill=product-launch-video",
    "--quality",
    "high",
    "--output",
    RAW,
  ]);
  if (status !== 0) die(`render exited ${status}`);
} else if (!existsSync(RAW)) {
  die(`--skip-render but ${RAW} does not exist`);
}
if (!existsSync(RAW) || statSync(RAW).size === 0) die(`render produced no usable output at ${RAW}`);

// ---------- 2. inspect ----------
function probe(file) {
  const { status, out } = capture("ffprobe", [
    "-v", "error",
    "-show_entries", "stream=index,codec_type,codec_name,width,height,pix_fmt",
    "-show_entries", "format=duration,size",
    "-of", "json",
    file,
  ]);
  if (status !== 0) die(`ffprobe failed on ${file}:\n${out}`);
  const j = JSON.parse(out);
  const v = (j.streams || []).find((s) => s.codec_type === "video");
  const a = (j.streams || []).find((s) => s.codec_type === "audio");
  return { video: v, audio: a, duration: Number(j.format?.duration), size: Number(j.format?.size) };
}

let info = probe(RAW);
console.log(
  `\u25b8 rendered: ${info.video?.codec_name} ${info.video?.width}\u00d7${info.video?.height} ` +
    `${info.video?.pix_fmt} \u00b7 audio ${info.audio?.codec_name ?? "NONE"} \u00b7 ${r3(info.duration)}s ` +
    `\u00b7 ${(info.size / 1e6).toFixed(1)} MB`,
);
if (info.audio)
  die(
    `the render carries an ${info.audio.codec_name} audio track — this film has no voice-over ` +
      `and no music, so the delivery must be silent. Remove the <audio> element from the ` +
      `composition; do not just mute it.`,
  );
if (info.video?.codec_name !== "h264" || info.video?.pix_fmt !== "yuv420p")
  die(
    `the render is ${info.video?.codec_name}/${info.video?.pix_fmt}; the delivery contract is ` +
      `h264/yuv420p. Refusing to silently transcode a render that should already conform.`,
  );
if (info.video?.width !== 1920 || info.video?.height !== 1080)
  die(`the render is ${info.video?.width}\u00d7${info.video?.height}, expected 1920\u00d71080`);

// ---------- 2b. container pass: moov atom must lead ----------
// `+faststart` is a container operation. With -c copy it rewrites the sample tables only, so the
// H.264 bitstream stays identical to the render — no generational quality loss. `-an` is
// belt-and-braces on top of the no-audio contract above: if a stray stream ever appeared it is
// dropped here rather than shipped.
//
// NOTE for anyone editing this: the first version of this file remuxed `RAW` to a temporary
// `video.faststart.mp4` and then ran a SECOND `-c copy` from that temp to DEST. That second pass
// silently re-ordered the atoms (mdat before moov) and the delivered file lost faststart while
// every log line still said it had been applied. So: write DEST in ONE pass from RAW, and read
// the byte-level box order back out of DEST rather than trusting the encoder's own report.
console.log("\u25b8 writing the delivery container (faststart, streams copied, one pass)…");

// Top-level box order, read straight from the file. `ftyp` is always first; the delivery
// contract is that `moov` precedes `mdat`, so the browser can start before the file lands.
function boxOrder(file, limit = 5) {
  const buf = readFileSync(file);
  const order = [];
  let pos = 0;
  while (pos + 8 <= buf.length && order.length < limit) {
    let size = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    if (size === 1) {
      if (pos + 16 > buf.length) break;
      size = Number(buf.readBigUInt64BE(pos + 8));
    }
    if (size < 8) break;
    order.push(type);
    pos += size;
  }
  return order;
}
// `free` / `wide` are legal padding boxes and are skipped; the question is only moov vs mdat.
const faststartOk = (file) => {
  const o = boxOrder(file, 6).filter((t) => t === "moov" || t === "mdat");
  return o[0] === "moov";
};

let status = run("ffmpeg", [
  "-y", "-v", "error",
  "-i", RAW,
  "-c", "copy",
  "-an",
  "-movflags", "+faststart",
  DEST,
]);
if (status !== 0 || !faststartOk(DEST)) {
  console.warn(
    status !== 0
      ? "  ! faststart remux failed; re-encoding instead"
      : `  ! remux produced ${boxOrder(DEST, 6).join(" -> ")} — moov is not first; re-encoding instead`,
  );
  status = run("ffmpeg", [
    "-y", "-v", "error",
    "-i", RAW,
    "-c:v", "libx264", "-preset", "slow", "-crf", "17",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.1",
    "-an",
    "-movflags", "+faststart",
    DEST,
  ]);
  if (status !== 0) die("could not produce an MP4 with the moov atom first");
}
const order = boxOrder(DEST, 6);
console.log(`  box order: ${order.join(" -> ")}`);
if (!faststartOk(DEST))
  die(`the delivered file is not faststart (${order.join(" -> ")}) — a <video> would stall`);

info = probe(DEST);
console.log(
  `\u2713 ${DEST}\n  ${info.video?.codec_name} ${info.video?.width}\u00d7${info.video?.height} ` +
    `${info.video?.pix_fmt} \u00b7 audio ${info.audio?.codec_name ?? "NONE"} \u00b7 ${r3(info.duration)}s`,
);
if (info.audio) die(`the delivered file still carries an audio stream (${info.audio.codec_name})`);

// ---------- 3. poster ----------
// Taken at 6.2s: scene 2's dashboard is fully settled, its overlay label has landed, the second
// subtitle is fully faded in, and the product fills the frame — never the ink plate of scene 1.
console.log(`\u25b8 poster at ${POSTER_AT}s…`);
status = run("ffmpeg", [
  "-y", "-v", "error",
  "-ss", String(POSTER_AT),
  "-i", DEST,
  "-frames:v", "1",
  "-q:v", "2",
  POSTER,
]);
if (status !== 0) die("poster extraction failed");

// A black or near-empty poster is the classic silent failure — measure it instead of trusting it.
// `signalstats` + `metadata=print` was tried first and produced nothing parseable (that metadata
// filter reports on a different stream than the one the CLI prints), so this decodes one frame to
// raw grey and averages it directly. Deterministic, no filter-graph surprises.
{
  const r = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", POSTER, "-vf", "scale=64:36,format=gray", "-f", "rawvideo", "-"],
    { maxBuffer: 1 << 20 },
  );
  const buf = r.stdout;
  if (r.status === 0 && buf && buf.length) {
    let sum = 0;
    let dark = 0;
    for (const v of buf) {
      sum += v;
      if (v < 16) dark++;
    }
    const yavg = sum / buf.length;
    const darkPct = (100 * dark) / buf.length;
    console.log(
      `  poster mean luma ${yavg.toFixed(1)}/255 · ${darkPct.toFixed(1)}% near-black pixels`,
    );
    if (yavg < 12) die(`the poster is essentially black (mean luma ${yavg.toFixed(1)}) — pick another timecode`);
    if (yavg > 252) die(`the poster is essentially blank (mean luma ${yavg.toFixed(1)}) — pick another timecode`);
    if (darkPct > 90) die(`the poster is ${darkPct.toFixed(0)}% near-black — likely the ink plate, not the product`);
  } else {
    console.warn("  ! could not measure the poster luma; inspect it by eye");
  }
}

console.log(`\n\u2713 delivered:`);
console.log(`  ${DEST}`);
console.log(`  ${POSTER}`);
