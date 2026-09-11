#!/usr/bin/env node
// .measure/measure.mjs — render the bottom band at 1920x1080 in the real headless
// Chrome and print the exact pixel boxes. Used to place the burned-in subtitles
// against the surimpression, the risk legend, the frame-05 plate and the ink footer.
//
// Not part of the build. Delete .measure/ when done.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, "..");
const CHROME =
  "/Users/titouanwajda/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7977.30/chrome-headless-shell-mac-arm64/chrome-headless-shell";

const shared = readFileSync(join(PROJECT, "compositions/scene-base.css"), "utf8");
const tpl = readFileSync(join(HERE, "measure.html"), "utf8");

const PROBE = `<script>
(function(){
  function b(sel){
    var el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if(!el) return null;
    var r = el.getBoundingClientRect();
    return {x1:+r.left.toFixed(1),x2:+r.right.toFixed(1),y1:+r.top.toFixed(1),y2:+r.bottom.toFixed(1)};
  }
  var out = {
    caption_plate: b("#cap"),
    caption_text:  b("#captext"),
    overlay_rule:  b(".overlay-rule"),
    overlay_text:  b("#ov-text"),
    risk_caption:  b("#risk"),
    f5_plate:      b("#plate"),
    f2_caption:    b("#f2cap"),
    ink_meta:      b("#inkmeta"),
    ink_rule:      b("#inkrule"),
    _style: (function(){
      var el = document.getElementById("captext");
      var cs = getComputedStyle(el);
      return {
        fontSize: cs.fontSize, lineHeight: cs.lineHeight,
        paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight,
        display: cs.display, alignSelf: cs.alignSelf, color: cs.color,
        background: cs.backgroundColor, fontFamily: cs.fontFamily, fontWeight: cs.fontWeight,
        boxHeight: el.offsetHeight, boxWidth: el.offsetWidth
      };
    })()
  };
  var s = document.createElement("script");
  s.id = "__probe__";
  s.type = "application/json";
  s.textContent = JSON.stringify(out);
  document.body.appendChild(s);
})();
</script>`;

const TEXTS = JSON.parse(readFileSync(join(PROJECT, "captions.json"), "utf8")).captions.map(
  (c) => c.text,
);

const n = (v) => (v == null ? "    —" : String(v).padStart(5));
const rows = [];
for (const text of TEXTS) {
  const html = tpl
    .replace("__SHARED_CSS__", shared)
    .replace("__TEXT__", text.replace(/&/g, "&amp;").replace(/</g, "&lt;"))
    .replace("</body>", PROBE + "\n</body>");
  const file = join(HERE, "run.html");
  writeFileSync(file, html);
  const out = execFileSync(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--window-size=1920,1080",
      "--virtual-time-budget=2000",
      "--dump-dom",
      "file://" + file,
    ],
    { maxBuffer: 1 << 26, encoding: "utf8" },
  );
  const m = out.match(/<script id="__probe__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) {
    console.error("probe did not run for:", text);
    continue;
  }
  const json = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  rows.push({ text, boxes: JSON.parse(json), dom: out });
}

for (const { text, boxes, dom } of rows) {
  console.log("═".repeat(78));
  console.log("CAPTION:", text);
  for (const [k, v] of Object.entries(boxes)) {
    if (!v) {
      console.log("  " + k.padEnd(16), "        (absent)");
      continue;
    }
    if (k.startsWith("_")) {
      console.log("  " + k.padEnd(16), JSON.stringify(v));
      continue;
    }
    console.log(
      "  " +
        k.padEnd(16) +
        " x " + n(v.x1) + " →" + n(v.x2) +
        "   y " + n(v.y1) + " →" + n(v.y2),
    );
  }
  // Did the shared sheet survive into the document at all? Print the injected
  // <style> body around the subtitle block so a broken replacement is visible.
  const style = dom.match(/<style>\s*\/\* =+\s*\n\s*talentpulse-demo[\s\S]*?<\/style>/);
  if (!style) console.log("  !! shared sheet NOT found in the dumped DOM");
  else {
    const i = style[0].indexOf(".tp-subtitle {");
    console.log("  sheet bytes:", style[0].length, "| .tp-subtitle at", i);
    if (i >= 0) console.log(style[0].slice(i, i + 320).replace(/\n/g, " ⏎ "));
  }
}
