---
version: 1
name: TalentPulse — Frame (video / frame layer)
description: >
  Video-first design system for TalentPulse, derived from the product's own "institutional light"
  tokens (frontend/tailwind.config.ts) and the locked charte in the brief. A sober, print-inspired
  register a DRH can show to a COMEX: warm paper ground, deep ink, one cobalt accent, deep semantic
  risk colours, 1px hairlines, square-ish corners, NO shadow, NO gradient, NO glow.
  Seeded from the `blue-professional` frame-preset (consulting-grade restraint, executive-readable);
  the preset's cream/indigo palette and Space Grotesk ramp were replaced by the brand's locked
  tokens above — preset colours and font substitutes are explicitly forbidden here.
unit: the frame — 1920×1080 primary
principle: one accent · hairlines only · calm ease-out motion · numbers carry the argument

colors:
  # — ground & surfaces —
  canvas: "#FAFAF8"
  surface: "#FFFFFF"
  surface-sunken: "#F3F2ED"
  # — ink ladder —
  ink: "#14161A"
  ink-2: "#4B5058"
  ink-3: "#82868E"
  ink-4: "#A9ADB4"
  # — the single accent —
  accent: "#1A43C4"
  accent-700: "#1536A0"
  accent-50: "#EEF2FE"
  accent-100: "#DBE4FD"
  # — hairlines —
  line: "#E6E4DD"
  line-strong: "#D5D2C8"
  # — semantic risk ladder —
  risk-high: "#B3261E"
  risk-high-bg: "#FDF3F2"
  risk-watch: "#B9651B"
  risk-watch-bg: "#FDF7EC"
  risk-healthy: "#0B6B4F"
  risk-healthy-bg: "#EFF8F3"

radii:
  none: "0px"
  soft: "3px"
  card: "4px"
  circle: "50%"

typography:
  # — text face: Inter (body, headings, UI) —
  body:        { fontFamily: "Inter", cqw: 0.86, weight: 400, lineHeight: 1.6, color: "ink-2" }
  body-strong: { fontFamily: "Inter", cqw: 0.86, weight: 500, lineHeight: 1.6, color: "ink" }
  h4:          { fontFamily: "Inter", cqw: 1.15, weight: 600, lineHeight: 1.35, tracking: "-0.01em", color: "ink" }
  h3:          { fontFamily: "Inter", cqw: 1.55, weight: 600, lineHeight: 1.3, tracking: "-0.015em", color: "ink" }
  h2:          { fontFamily: "Inter", cqw: 2.40, weight: 650, lineHeight: 1.14, tracking: "-0.02em", color: "ink" }
  h1:          { fontFamily: "Inter", cqw: 4.10, weight: 650, lineHeight: 1.08, tracking: "-0.025em", color: "ink" }
  # — editorial accents ONLY: Instrument Serif 400 / 400 italic —
  editorial:      { fontFamily: "Instrument Serif", cqw: 4.60, weight: 400, lineHeight: 1.06, color: "ink" }
  editorial-italic: { fontFamily: "Instrument Serif", cqw: 4.60, weight: 400, italic: true, lineHeight: 1.06, color: "accent" }
  # — figures & technical chrome: IBM Plex Mono —
  mono-label:  { fontFamily: "IBM Plex Mono", px: 15, weight: 500, tracking: "0.20em", upper: true, color: "ink-3" }
  mono-figure: { fontFamily: "IBM Plex Mono", cqw: 2.20, weight: 500, lineHeight: 1.0, tracking: "-0.01em", color: "ink" }
  mono-small:  { fontFamily: "IBM Plex Mono", px: 14, weight: 400, tracking: "0.06em", color: "ink-2" }

spacing:
  pad-x: "104px"
  pad-y: "84px"
  safe-top: "72px"
  safe-bottom: "80px"
  hairline: "1px"

components:
  hairline-rule:
    border: "1px solid {colors.line}"
    rounded: "0"
    shadow: "none"
    description: "The only separator. Never a filled divider, never a heavier rule."
  label-chrome:
    typography: "{typography.mono-label}"
    color: "{colors.ink-3}"
    description: "UPPERCASE IBM Plex Mono, 0.20em tracking — exactly the site's technical labels."
  browser-frame:
    backgroundColor: "{colors.surface}"
    border: "1px solid {colors.line-strong}"
    rounded: "{radii.card}"
    shadow: "none"
    chrome: "48px bar, #F3F2ED, one hairline under it, three 9px dots in {colors.line-strong}"
    description: "The captured product lives in this. No glow, no drop shadow, no gradient."
  stat-cell:
    borderTop: "2px solid {colors.accent}"
    typography: "{typography.mono-figure} + {typography.mono-label}"
    description: "Figures in IBM Plex Mono. Risk cells take the semantic colour, never the accent."
  risk-high: { color: "{colors.risk-high}", bg: "{colors.risk-high-bg}" }
  risk-watch: { color: "{colors.risk-watch}", bg: "{colors.risk-watch-bg}" }
  risk-healthy: { color: "{colors.risk-healthy}", bg: "{colors.risk-healthy-bg}" }
  wordmark:
    typography: "Inter 600, tracking -0.01em, {colors.ink}; the 'Pulse' half takes {colors.accent}"
    mark: "the product's own 24×24 pulse path — M3 13h3.2l2.1-6.2 3.4 11.4 2.4-7.1 1.6 3.9H21, stroke 1.9, round caps"
    description: "Never redraw it. The same path the product's Sidebar/Topbar/landing use."
  overlay-label:
    typography: "{typography.mono-label}"
    color: "{colors.ink-3}"
    rule: "a 28px × 1px {colors.accent} rule above, then the label"
    description: "The surimpression. Bottom-left of the frame, never over the subject's critical UI."
  film-grain: "none"
---

# TalentPulse — Frame (video / frame layer)

## Overview

Frame scale for TalentPulse is **restraint with one commitment**. A warm paper ground (`#FAFAF8`),
deep ink (`#14161A`) for every headline, white surfaces for anything captured from the product, and
a single cobalt (`#1A43C4`) that carries the eyebrow rules, the editorial word, the figures that
matter, and the closing pulse stroke. Risk traffic is the **only** place a second colour appears,
and it is deep and serious (`#B3261E` / `#B9651B` / `#0B6B4F`) — never fluorescent, never a fill
behind a headline.

Depth is **hairlines and paper**. A frame lifts an element with a `1px #E6E4DD` rule, a slightly
whiter surface, and air — never a shadow, never a gradient, never a halo. That absence is the
premium signal and it is non-negotiable.

Three faces in fixed roles: **Inter** carries every word of prose and every heading; **Instrument
Serif** appears at most twice in the whole film, always upright or italic on a single editorial
word, always in cobalt when italic; **IBM Plex Mono** carries every figure, percentage, threshold
and technical label — uppercase, `0.20em` tracking, tiny. Substituting a face, or setting body copy
in the serif, breaks the system.

**Key characteristics at frame scale:**

- **Paper ground** on every frame; **one cobalt** as the only accent.
- **Hairlines only** — `1px #E6E4DD`, `1px #D5D2C8` around captured surfaces. **Zero** box-shadow.
- **Square-ish corners** — 3–4px. Nothing pill, nothing rounded-heavy.
- **Captures are the subject** — the real product screenshot occupies at least 55 % of frame height
  and stays pixel-legible; chrome around it is minimal.
- **Overlays are technical** — uppercase IBM Plex Mono, small, tracked, with a short cobalt rule.
- **Calm motion** — ease-out only, 0.5–1.1s, long holds. Nothing bounces, nothing overshoots.

## The Frame

### Frame Craft Bar

- **Squint** — one near-black headline or one mono figure dominates at 3–6× its neighbour.
- **Silence** — an ink frame breathes (≥55 % empty); a capture frame is full but never crowded.
- **Restraint** — a single cobalt accent carries everything; headlines stay ink, never cobalt.
- **Reference** — aim at a printed annual-report plate. Failure looks like a colourful dashboard.

- **Primary:** 1920×1080 (16:9).
- **Safe area:** `pad-x` 104px, `pad-y` 84px. Overlay labels sit on the bottom-left safe corner and
  must never cover a headline or a figure inside the capture.

## Colors

`canvas` `#FAFAF8` is the universal ground and the video's base. `ink` `#14161A` is every headline
and the ground of the two ink frames. `surface` `#FFFFFF` is only for captured product chrome.
`accent` `#1A43C4` is the sole accent: eyebrow rules, the editorial italic word, active figures,
the closing pulse stroke, the URL. `ink-2/3/4` is the text ladder — body, labels, and inert chrome.
`line` / `line-strong` are the only borders. `risk-high/watch/healthy` appear **only** on risk
figures and their 4 % tinted plates — never as a decorative accent, never as a headline colour.

## Typography

Three ramps, no crossing:

- **Reading ramp (Inter).** `body` 0.86cqw / ink-2, line-height 1.6. Headings `h4` → `h1` in ink
  with negative tracking. Legibility floor for load-bearing copy: **≥ 1.4cqw**.
- **Editorial ramp (Instrument Serif 400).** Exactly one word per use. Upright in ink on the ink
  frames; **italic in cobalt** only where the brief names it ("moitié"). Never a full sentence.
- **Technical ramp (IBM Plex Mono 400/500).** Every figure, percentage, threshold, and overlay
  label. Labels uppercase at 0.20em tracking, 15px; figures 2.2cqw+. This is the site's own idiom.

## Depth & Surface

Depth is **paper and hairline**:

- **1px rules** — `#E6E4DD` inside a frame, `#D5D2C8` around a captured surface.
- **Surface shift** — `#FFFFFF` on `#FAFAF8`, a 2 % lift you feel rather than see.
- **Space** — the primary device. Gaps of 40–72px do the work a shadow would do elsewhere.

**Ceiling:** zero `box-shadow`, zero `text-shadow`, zero `filter: drop-shadow`, zero `gradient`,
zero `backdrop-filter`, zero glow, zero neon. A coloured shadow is a hard failure.

## Shapes

- **3–4px** — cards and the browser frame. Nothing else.
- **0** — full-bleed ink plates, hairline rules, the accent rule above an overlay label.
- **50%** — only the three browser dots and the closing pulse dot.
- **100px pill** — not used. This system has no pill chrome.

## Components

- **browser-frame** — the shell every captured screen lives in: white, hairline, 48px `#F3F2ED`
  bar, one hairline beneath it, three 9px `#E6E4DD` dots. No traffic-light colours.
- **label-chrome** — the uppercase mono label; the film's connective tissue.
- **overlay-label** — a 28×1px cobalt rule, then the mono label. Bottom-left safe corner.
- **stat-cell** — figures in IBM Plex Mono under a 2px cobalt top rule; risk cells go semantic.
- **wordmark** — Inter 600, "Talent" ink + "Pulse" cobalt, optionally with the product's own pulse
  path. Never redrawn, never re-lettered.

## Frame Treatments

> Recipe: ground · composes · focal · chrome · accent · silence.

### 1 · Ink statement (0–4s)

**Ground** full-bleed `ink`. **Composes** a single left h1 (2 lines), one editorial italic word in
cobalt, one mono label at the bottom-left, and a hairline at the very bottom edge carrying
`TALENTPULSE / 01`. **Focal** the h1 at h1 scale — 3–4× its neighbours. **Accent** the italic word
and a 40×2px cobalt rule under it. **Silence** ~62 % empty. **Density** low.

### 2 · Product in browser (4–10.5s)

**Ground** `canvas`. **Composes** eyebrow + `dashboard.png` in a browser-frame, push-in, one
overlay label, one mono caption bottom-right. **Focal** the capture — ≥ 60 % of frame height.
**Chrome** eyebrow top-left, hairline top rule. **Accent** the eyebrow rule. **Density** high but
ordered — this is the one dense frame.

### 3 · Risk close-up (10.5–16s)

**Ground** `canvas`. **Composes** the same browser-frame product, scaled and panned so the critical
banner and the Top-5 register fill the plate; a small mono risk legend pinned bottom-right; overlay
label bottom-left. **Focal** the risk rows and their figures. **Accent** only the cobalt figures;
risk rows carry `risk-high` / `risk-watch`. **Density** dense.

### 4 · Portrait document scroll (16–21.9s)

**Ground** `canvas`. **Composes** the portrait `plan-retention.png` centred at ~74 % height in a
hairline frame, travelling slowly upward; a mono label + two hairline ticks on the left margin as a
scroll index. **Focal** the document. **Accent** the margin ticks. **Silence** ~35 % each side.

### 5 · Executive report (21.9–26s)

**Ground** `canvas`. **Composes** `rapport.png` in the browser-frame with a slow push-in and a
single mono figure pulled out at the right on a hairline plate. **Focal** the report. **Accent** the
pulled figure. **Density** ordered.

### 6 · Closing ink (26–30.9s)

**Ground** full-bleed `ink`. **Composes** the wordmark centred at h1 scale, the product's pulse path
drawn left-to-right in cobalt beneath it, one line of Inter body in ink-3, and `talentpulse.app` in
mono at the bottom. **Focal** the wordmark and the stroke. **Accent** the cobalt stroke + `Pulse`.
**Silence** ~64 %. **Density** low.

## Composition Rules

### Do

- Ground every content frame on `canvas`; ground the two statement frames on `ink`.
- Let the captured product be the subject — sized, legible, hairline-framed, unretouched.
- Keep every figure, percentage and label in IBM Plex Mono; every label uppercase at 0.20em.
- Separate with 1px `#E6E4DD` hairlines and space. Lift with white surface, never with shadow.
- Move with soft ease-out, 0.5–1.1s, then hold. Let the frame settle and stay settled.

### Don't

- No gradient, no halo, no glow, no neon, no coloured shadow, no drop shadow of any kind.
- No emoji, no icon font, no second accent colour, no cobalt headline.
- No bounce, no `back.out`, no overshoot, no elastic — a "bounce" ease is a hard failure.
- No pill chrome, no heavy radii, no filled colour blocks behind text.
- No font substitutes: no Space Grotesk, no JetBrains Mono, no Georgia fallback in a render.
- Don't let an overlay label cover a figure or a headline inside the capture.

## Numerals & Claims (hard rule)

Every number on screen must come from the product's own captured screens or the locked narration —
`5 SIGNAUX`, `1 SCORE`, `≥ 70 %`, `13 SEMAINES`, `1-1`, `LA MOITIÉ D'UN SALAIRE ANNUEL`. Never
invent a customer name, a logo, a percentage or a date. Any slot without a source renders as a
hairline placeholder, not a guess.

## Pre-Render Self-Audit

- **Squint** — one ink headline or one mono figure dominates per frame.
- **Silence** — ink frames ≥ 55 % empty; capture frames full but ordered.
- **Single accent** — cobalt only for accents; semantic colours only on risk figures.
- **Type** — Inter prose/headings; Instrument Serif on at most one word per frame; IBM Plex Mono
  on every figure and label; body ≥ 1.4cqw.
- **Depth** — hairlines and space only; grep the frames for `shadow`, `gradient`, `filter` → zero.
- **Fabrication** — every numeral traces to a capture or to the locked script.
