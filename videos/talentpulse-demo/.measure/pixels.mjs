#!/usr/bin/env node
// .measure/pixels.mjs — screenshot the bottom band and read the actual painted pixels.
// The DOM getBoundingClientRect for the caption disagreed with the rendered plate under
// this Chrome build, so the plate's real extent is measured from pixels instead.
// Not part of the build. Delete .measure/ when done.

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, "..");
const CHROME =
  "/Users/titouanwajda/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7977.30/chrome-headless-shell-mac-arm64/chrome-headless-shell";

/** Minimal PNG reader: handles the 8-bit RGB(A) non-interlaced output Chrome writes. */
function readPng(file) {
  const buf = readFileSync(file);
  let pos = 8;
  let w = 0,
    h = 0,
    colorType = 0,
    bitDepth = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error("only 8-bit PNG supported");
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(w * h * channels);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[rp++];
    const line = raw.subarray(rp, rp + stride);
    rp += stride;
    const off = y * stride;
    const prev = off - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[off + x - channels] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = x >= channels && y > 0 ? out[prev + x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[off + x] = v & 0xff;
    }
  }
  return { w, h, channels, data: out };
}

const shared = readFileSync(join(PROJECT, "compositions/scene-base.css"), "utf8");
const tpl = readFileSync(join(HERE, "measure.html"), "utf8");
const white = (r, g, b) => r > 246 && g > 246 && b > 245; // #FAFAF8 is 250,250,248
const inkish = (r, g, b) => r < 60 && g < 60 && b < 60;

const caps = JSON.parse(readFileSync(join(PROJECT, "captions.json"), "utf8")).captions;
const only = process.argv[2] ? Number(process.argv[2]) : null;

for (const [i, c] of caps.entries()) {
  if (only && i + 1 !== only) continue;
  const html = tpl
    .replace("__SHARED_CSS__", shared)
    .replace("__TEXT__", c.text.replace(/&/g, "&amp;").replace(/</g, "&lt;"))
    .replace("</body>", '<script>document.getElementById("cap").style.opacity="1";document.getElementById("captext").style.background="#00FFFF";</script>\n</body>');
  writeFileSync(join(HERE, "run.html"), html);
  const png = join(HERE, "shot.png");
  execFileSync(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--window-size=1920,1080",
      "--virtual-time-budget=2500",
      "--screenshot=" + png,
      "file://" + join(HERE, "run.html"),
    ],
    { stdio: "pipe" },
  );

  const { w, h, channels, data } = readPng(png);
  // measure.html paints its ground MAGENTA (#FF00FF), so the paper-coloured plate and the
  // ink glyphs inside it are unambiguous against the sentinel: a pixel is "plate" when it
  // is neither magenta nor ink.
  const magenta = (r, g, b) => r > 200 && g < 60 && b > 200;
  const cyan = (r, g, b) => r < 60 && g > 200 && b > 200;
  let minX = 1e9,
    maxX = -1,
    minY = 1e9,
    maxY = -1;
  for (let y = 900; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * channels;
      const r = data[o],
        g = data[o + 1],
        b = data[o + 2];
      if (!cyan(r, g, b)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  // Ink pixels inside the plate = the caption text's painted extent.
  let tMinX = 1e9,
    tMaxX = -1,
    tMinY = 1e9,
    tMaxY = -1;
  for (let y = 900; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * channels;
      if (inkish(data[o], data[o + 1], data[o + 2])) {
        if (x < tMinX) tMinX = x;
        if (x > tMaxX) tMaxX = x;
        if (y < tMinY) tMinY = y;
        if (y > tMaxY) tMaxY = y;
      }
    }
  }
  console.log(`— caption ${i + 1}: ${c.text.slice(0, 52)}${c.text.length > 52 ? "…" : ""}`);
  console.log(`    plate  x ${minX}→${maxX}  y ${minY}→${maxY}`);
  console.log(`    glyphs x ${tMinX}→${tMaxX}  y ${tMinY}→${tMaxY}`);
}
try {
  unlinkSync(join(HERE, "shot.png"));
} catch {}
