---
format: 1920x1080
duration: 30s
message: "Sachez qui va partir, avant qu'il ne démissionne."
arc: Hook (cost) → Mechanism (score) → Evidence (critical cases) → Remedy (retention plan) → Restitution (board report) → Sign-off
audience: DRH, DG et comités de direction (SaaS RH français)
mode: autonomous
music: none
voice: none (removed)
captions: burned-in French subtitles (six lines, one per scene)
---

# Video direction

**Register.** Sobre & institutionnel clair. A printed annual-report plate, not an ad. Every frame is
either an **ink plate** (`#14161A`) or a **paper plate** (`#FAFAF8`); nothing else. White
(`#FFFFFF`) is reserved for the chrome of a captured product surface. One accent only: cobalt
`#1A43C4`. Risk traffic (`#B3261E` high / `#B9651B` watch / `#0B6B4F` healthy) appears **only** on
risk figures inside a capture and its 4 % tinted plate — never as decoration.

**Depth.** Hairlines (`1px #E6E4DD`, `1px #D5D2C8` around a captured surface) and air. **Zero**
box-shadow, zero gradient, zero halo, zero glow anywhere in the film. Corners are 3–4px, never
pills. This absence is the premium signal.

**Type.** Inter for every heading and every word of prose. Instrument Serif 400 appears on exactly
one word in the whole film ("moitié", italic cobalt) — that scarcity is the point. IBM Plex Mono for
every figure, percentage, threshold and overlay label: uppercase, 0.20em tracking, tiny, ink-3.
Body never drops below ~1.4cqw (≈27px) on a load-bearing line.

**Chrome.** Every content frame carries the same quiet three-part chrome: a hairline rule across
the top edge of the safe area, a mono eyebrow at its left, a mono counter at its right
(`02 / 06`). It holds the film together at cuts and costs almost nothing.

**Surimpressions.** Bottom-left safe corner, always: a 28×1px cobalt rule, then the label in
IBM Plex Mono uppercase 0.20em. Positioned at **y ≈ 1000px**, in the safe margin below the capture,
so it never covers a product figure. Enters with a 0.5s ease-out mask/rise, holds, exits on the cut.

**Sous-titres.** Burned in, one line per scene, on the bottom band. They are **host-level clips**:
`build-index.mjs` emits one `.tp-subtitle` per line as a direct child of `#root` on track 2, and a
single root GSAP timeline fades each one in and out over 200 ms. The scenes know nothing about
them. The strip's block is a fixed 1500px parked at x = 380 → its content box runs x 380→1824, so
the line centres on **x ≈ 1102** and even the longest caption (1392px of glyphs, line 2) begins
57px to the right of the surimpression column — that reserve is what keeps "no collision, ever"
true at every timestamp. Scenes 01 and 06 (ink) take `#FAFAF8` text; scenes 02–05 (paper) take
`#14161A`. There is **no backing plate**: the strip sits on plain ground, where the text already
measures 16.3:1 / 16.1:1, and a plate wide enough to hold a caption could not clear the
surimpression. Frame 06's centred `talentpulse.app` label is raised to y 966 for the same reason,
and the ink frames' footer hairline moves from y 1032 to y 954.

**Motion doctrine.** Calm, precise, ease-out only. `power2.out` / `power3.out` for entrances,
`none`/`power1.inOut` for the continuous push-ins and the document scroll. Durations 0.5–1.1s
entrances, then **hold** — every scene must be still for its last 40 % so the eye can read the
capture. Banned: `back`, `elastic`, `bounce`, any overshoot, any rotation, any scale above 1.06.

**Continuity model.** Deliberate clean cuts between all six scenes — no crossfade. The only element
that visibly continues across a boundary is the **paper ground**, which is identical on scenes 2–5,
so those cuts read as a change of subject on one continuous page. Scenes 1 and 6 are ink plates and
therefore read as hard, intentional bookends.

**Capture discipline.** No screenshot is ever re-coloured, filtered, blurred or replaced by a
mock-up. The captures stay at or above ~55 % of frame height for the main capture (scenes 2, 3, 5;
scene 4 is a portrait document at 74 % height). Push-ins never exceed 1.06× so text inside the
product stays crisp.

## Frame 1 — L'annonce (ink statement)

- scene: Plein écran encre. La phrase coût, le mot « moitié » en Instrument Serif italique cobalt.
- duration: 4.0s
- poster: 2.8s
- transition_in: cut
- status: animated
- caption: "Un départ non anticipé coûte la moitié d'un salaire annuel."
- caption_start: 0.0
- caption_end: 3.576
- caption_variant: ink
- src: compositions/frames/01-annonce.html

Ground: full-bleed `ink`, with a single vertical hairline (`#2A2E35`, 1px, at x = 1488) rising
0.9s to mark the measure — the only structure on the plate.

- **0.00–0.70s** — A 40×2px cobalt rule draws left→right at x=104, y=330 (`scaleX 0→1`,
  `power3.out`). The mono label `PRÉVISION DU TURNOVER` clips in under it (y=356, `y +10→0`,
  opacity fade, 0.5s from 0.25s). Layout: left column at `pad-x` 104, hairline-safe.
- **0.55–1.35s** — Headline line 1 « Un départ non anticipé » rises 26px with a clip-path mask
  reveal (`yPercent 18→0`, mask `inset(0 0 100% 0)` → `inset(0 0 -20% 0)`, 0.8s, `power3.out`),
  Inter 650 at h1 (≈78px), ink → white on the ink plate (`#FFFFFF`), tracking −0.025em.
- **0.95–1.75s** — Headline line 2 « coûte la » (same treatment, 0.4s stagger) followed at
  1.25–2.05s by the editorial word « moitié » in **Instrument Serif 400 italic, cobalt**, ≈92px,
  with a 96×1px cobalt rule wiping in beneath it (2.0–2.5s, `scaleX 0→1`, `power2.out`).
- **1.45–2.25s** — Headline line 3 « d'un salaire annuel. » completes the sentence in Inter 650
  Inter-white. The three parts sit on two measured lines so the italic word reads as a correction,
  not decoration.
- **2.30–3.10s** — Bottom-left minimal: `TALENTPULSE` in IBM Plex Mono 500, 0.20em, `#82868E`
  (y=908). Bottom hairline at y=954 in `#2A2E35`. Right side of the hairline carries `01 / 06`.
  Both were raised 78px for the subtitle build, which owns the y 1020→1058 band.
- **2.8–4.0s** — Full hold. Nothing moves. The plate is 62 % empty.

## Frame 2 — Le score (product in browser)

- scene: dashboard.png dans un cadre navigateur, push-in lent. Surimpression « 5 SIGNAUX · 1 SCORE ».
- duration: 6.5s
- poster: 5.5s
- transition_in: cut
- status: animated
- caption: "TalentPulse note chaque collaborateur de zéro à cent pour cent, à partir de cinq signaux RH."
- caption_start: 4.35
- caption_end: 9.25
- caption_variant: paper
- src: compositions/frames/02-score.html
- asset_candidates: assets/product/dashboard.png

Ground: `canvas`. Chrome: hairline at y=64, eyebrow `LE MOTEUR` at left, counter `02 / 06` at right.
The capture occupies y=120→940 (820px = **76 % of frame height**), centred, in a `browser-frame`.

- **0.00–0.55s** — Browser frame scales `0.994→1.0` and fades in (`power3.out`), its hairline
  border visible from the first frame. The 48px `#F3F2ED` bar is already there; the three 9px
  `#E6E4DD` dots fade in with a 0.06s stagger from 0.2s.
- **0.35–1.45s** — Slow push-in begins: the capture wrapper travels `scale 1.0 → 1.045` over 5.4s
  with `power1.inOut`, easing out of the move as the scene ends. Never above 1.06 so the
  product's own text stays at native sharpness.
- **0.60–1.20s** — Eyebrow `LE MOTEUR` masks in at the top-left; a 28×1px cobalt rule draws in
  above the overlay label position at 0.9–1.4s.
- **1.10–1.70s** — Surimpression returns: `5 SIGNAUX · 1 SCORE` in IBM Plex Mono uppercase, 15px,
  0.20em, ink-3, rising 12px into place at x=104, y=1000 (below the capture — never over it).
- **1.60–2.40s** — Bottom-right mono caption `SCORE 0 – 100 % · 13 SEMAINES` in ink-4 at 14px,
  0.06em, wiping in from the right edge of the safe area.
- **2.40–6.5s** — Hold. Only the push-in breathes. Nothing else moves, so the dashboard is fully
  readable for four full seconds.

## Frame 3 — Les cas critiques (risk close-up)

- scene: Pan et échelle sur la bannière critique et le Top 5. Surimpression « CAS CRITIQUES ≥ 70 % ».
- duration: 5.5s
- poster: 4.4s
- transition_in: cut
- status: animated
- caption: "Les profils critiques remontent en tête, avec l'exposition financière correspondante."
- caption_start: 10.85
- caption_end: 15.7
- caption_variant: paper
- src: compositions/frames/03-cas-critiques.html
- asset_candidates: assets/product/dashboard.png
- handoff_in: same product surface as frame 2 — browser-frame chrome identical (white, 1px #D5D2C8, 4px radius, 48px #F3F2ED bar, three 9px #E6E4DD dots); only the inner crop differs, so the cut reads as a reframe, not a new object.

Ground: `canvas`, identical to frame 2. Chrome identical (hairline y=64, eyebrow `LE MOTEUR`,
counter `03 / 06`). The **same** browser-frame geometry (y=120→940). The inner capture is held at
`scale 1.30` and translated `(-160, -217)` — the viewport anchored to the FOOT of the image,
which is what lifts the critical banner to frame y≈269 and brings the whole Top-5 register
(risk scores included) into the field. A first attempt at `(-160, -135)` showed almost exactly
the same window as frame 2 and produced no reframe at all; the correction came from measuring
the applied crop, not from deriving it.

- **0.00–0.80s** — The frame arrives already scaled (no reset animation on the frame itself —
  continuity). The inner capture settles `scale 1.34 → 1.30` with `x/y` easing toward its crop
  (`power2.out`), so the reframe lands rather than cuts twice.
- **0.45–1.10s** — Surimpression `CAS CRITIQUES ≥ 70 %` rises into place at x=104, y=1000.
- **0.70–1.60s** — A small risk legend pinned bottom-right inside the safe area (y 972→990; its row
  gap tightens from 26px to 18px in the subtitle build so its left edge stays clear of the caption):
  three rows, each a 7px dot + mono label — `≥ 70 %` in `risk-high`, `40–69 %` in `risk-watch`, `< 40 %` in
  `risk-healthy`, with the three rows staggering 0.08s and fading up. This is the only place the
  semantic ladder appears as chrome.
- **1.30–2.30s** — A thin cobalt bracket (two 1px rules + a 24px vertical tie) draws over the
  critical banner inside the capture, then fades to 35 % so it annotates without covering. Draw is
  `scaleX/scaleY 0→1`, 0.5s each, `power2.out`.
- **2.30–4.20s** — Slow drift continues: inner capture `scale 1.30 → 1.275` with `power1.inOut`,
  keeping the risk rows legible while the frame stays alive.
- **4.20–5.5s** — Hold.

## Frame 4 — Le plan de rétention (portrait document scroll)

- scene: plan-retention.png format portrait centré, défilement vertical lent. Surimpression « PLAN DE RÉTENTION 1-1 ».
- duration: 5.9s
- poster: 4.8s
- transition_in: cut
- status: animated
- caption: "Pour chacun : un diagnostic, un guide d'entretien et un simulateur de contre-mesure."
- caption_start: 16.35
- caption_end: 21.6
- caption_variant: paper
- src: compositions/frames/04-plan-retention.html
- asset_candidates: assets/product/plan-retention.png

Ground: `canvas`. Chrome: hairline y=64, eyebrow `LE PLAN`, counter `04 / 06`.

- **0.00–0.65s** — Hairline document frame (white surface, 1px `#D5D2C8`, 4px radius) fades in at
  a fixed 1120×800 window centred on x=960 (y=170→970 = **74 % of frame height**). The portrait
  document inside is 1120×1752 at scale 1.0, so it must scroll.
- **0.30–5.3s** — The document translates upward inside the window: `y 0 → −430px` over 5.0s with
  `power1.inOut` — a slow, even, readable pan (≈86px/s), never a whip. Entrances and the pan overlap
  so the frame is never static-then-sudden.
- **0.55–1.15s** — Surimpression `PLAN DE RÉTENTION 1-1` rises into place at x=104, y=1000.
- **0.80–1.60s** — Left margin scroll index: a 1px `#E6E4DD` vertical rule at x=88 from y=170 to
  y=970, with two cobalt 16×1px ticks that travel with the document (`y` mirrored at 22 % and 64 %
  of the pan) and a mono label `DIAGNOSTIC → ENTRETIEN → CONTRE-MESURE` set vertically at 13px
  reading bottom-to-top in ink-4 at x=64.
- **1.40–2.10s** — Right margin: three mono micro-labels fade in at 56 % opacity, `1-1`,
  `GUIDE`, `SIMULATEUR`, spaced down the right safe edge at x=1832, each with a 20×1px hairline
  above it. They annotate the document without covering it.
- **5.3–5.9s** — Pan settles and holds.

## Frame 5 — La restitution (executive report)

- scene: rapport.png, léger push-in. Surimpression « RESTITUTION DIRIGEANT ».
- duration: 4.1s
- poster: 3.2s
- transition_in: cut
- status: animated
- caption: "Et un rapport prêt pour le comité de direction."
- caption_start: 22.25
- caption_end: 25.55
- caption_variant: paper
- src: compositions/frames/05-restitution.html
- asset_candidates: assets/product/rapport.png

Ground: `canvas`. Chrome: hairline y=64, eyebrow `LE COMITÉ`, counter `05 / 06`. Capture in the same
browser-frame geometry as frames 2/3 (y=120→940), at scale 1.0, so the report is fully readable.

- **0.00–0.55s** — Browser frame fades in and scales `0.994→1.0` (`power3.out`). Same chrome as
  frames 2/3 — the continuity is the point.
- **0.30–4.1s** — Very slow push-in `scale 1.0 → 1.035`, `power1.inOut`, so the last product frame
  is still moving gently as the voice finishes.
- **0.50–1.10s** — Surimpression `RESTITUTION DIRIGEANT` rises into place at x=104, y=1000.
- **0.85–1.65s** — A hairline plate fades in at the bottom-right safe corner (x=1608→1816,
  y=974→1026) carrying one pulled figure in IBM Plex Mono 500 with a mono label above it. The
  figure is `1 PAGE` / `SORTIE COMEX` — sourced from the script's own claim, never invented. It was
  256×84 at y=962 before the subtitle build; it is shortened to 208×52 and nudged right so it stays
  clear of the caption strip, which is the only reason those numbers changed.
- **1.65–4.1s** — Hold.

## Frame 6 — La signature (closing ink)

- scene: Retour au fond encre. Wordmark TalentPulse + « Pulse » tracé cobalt (tracé SVG du site). Surimpression finale « talentpulse.app ».
- duration: 4.9s
- poster: 3.8s
- transition_in: cut
- status: animated
- caption: "TalentPulse. Sachez qui va partir, avant qu'il ne démissionne."
- caption_start: 26.3
- caption_end: 29.3
- caption_variant: ink
- src: compositions/frames/06-signature.html

Ground: full-bleed `ink`. The paper of scenes 2–5 is gone — the bookend closes.

- **0.00–0.60s** — Wordmark fades up: `Talent` in Inter 650 at h1 (≈78px) in `#FFFFFF` +
  `Pulse` in cobalt, tracking −0.01em, centred at x=960, y=430. No scale, no bounce — opacity plus
  a 14px rise, `power3.out`.
- **0.35–1.75s** — **The pulse stroke.** The product's own path
  (`M3 13h3.2l2.1-6.2 3.4 11.4 2.4-7.1 1.6 3.9H21`) is drawn beneath the wordmark as a wide SVG
  (960×120 viewBox 0 0 24 24 preserved, `vector-effect: non-scaling-stroke` off, stroke-width 1.9
  scaled). `stroke-dasharray`/`stroke-dashoffset` draw left→right over 1.2s with `power2.out` in
  cobalt — the *same* path the site draws, never redrawn.
- **1.05–1.75s** — One line of Inter 400 at ≈1.6cqw in `#82868E` centred at y=560:
  « Sachez qui va partir, avant qu'il ne démissionne. » Fades up 12px as the stroke lands.
- **1.55–2.25s** — Surimpression finale `talentpulse.app` in IBM Plex Mono 500, 0.20em, cobalt,
  centred, under a centred 28×1px cobalt rule. **Raised to y=966 for the subtitle build**: this label
  is centred on the same axis as the caption, so unlike the bottom-left surimpressions it cannot
  dodge it sideways, and the caption strip owns y 1020→1058. Rule at y 966, text at y 980, box ends
  ≈ 999 — 21px of clear air above the caption.
- **2.25–3.40s** — Hold, fully still.
- **4.55–4.9s** — A 0.35s fade of the whole ink plate to `#0C0E11` — the site's `graphite-950`,
  the only darkening in the film. No fade to black.

## Handoff notes

- **The caption strip is a host-level layer, not scene furniture.** It is emitted by
  `build-index.mjs` from `captions.json`, styled by `scene-base.css`, and sits on `#root` at
  z-index 4 so it paints over every scene layer. A scene must never reposition it; if a scene's own
  bottom furniture moves, the reserve it must respect is **x 380→1824, y 1020→1058**.
- **Frames 2 → 3 → 5 share one browser-frame component geometry** (outer x=224→1696, y=120→940,
  4px radius, 1px `#D5D2C8`, 48px `#F3F2ED` bar, three 9px `#E6E4DD` dots at 20/38/56px from the
  bar's left). Each frame re-declares it identically; do not vary the numbers.
- **The paper ground `#FAFAF8` is identical on frames 2–5** and the ink ground `#14161A` is
  identical on frames 1 and 6 — those cuts must not flash.
- **The chrome hairline sits at y=64 and the counter at y=44** on every content frame.
- **No element is expected to persist across a cut.** These are deliberate clean cuts; the
  continuity is the ground, the chrome and the browser-frame geometry.
