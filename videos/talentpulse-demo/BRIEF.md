# BRIEF — talentpulse-demo

> Locked by the requester (delegating agent) before the build. This brief is the only routing
> artifact later steps read. Mode is **autonomous**: there is no human at the board, so the Step 3
> and Step 6 gates are "post the summary as a heads-up and proceed" (brief-contract.md § 1).

## Intent

A 30-second French-language product demo / showcase video for **TalentPulse**, a French HR SaaS that
predicts employee turnover. Sell-and-show: it markets the product, and the product's **own captured
screens are the video's main visuals** — no invented mock-ups.

## Source

- No website crawl. The product screens are provided as files on disk and are the visual source of
  truth:
  `frontend/public/product/{dashboard,analytique,talents,rapport,plan-retention,dashboard-mobile,landing-hero}.png`
- Typography is provided as files: `frontend/app/fonts/*.woff2`.
- The narration is a **locked, verbatim** script supplied with the request. `VO_MODE: verbatim` —
  it is not rewritten, not lengthened, not reordered.
- Brand tokens come from the requester's charte and from the product's own
  `frontend/tailwind.config.ts`. This is a **no-capture** project: `capture/extracted/tokens.json`
  and friends were authored by hand from those sources.

## Customizations

- **Subtitles replace the voice-over** (see `## Captions`) — the one change that supersedes the
  original brief below.
- **Feature the captured screens as the assets.** Every product frame uses a real screenshot.
- **Style preset:** `blue-professional` (consulting-grade restraint, single accent, no shadow) —
  chosen because it is the closest shipped preset to the requester's locked charte. Its palette
  (cream `#fdfae7` + indigo `#1e2bfa`) and its Space Grotesk ramp were then **replaced wholesale**
  by the charte tokens: paper `#FAFAF8`, ink `#14161A`, cobalt `#1A43C4`, Inter + Instrument Serif
  + IBM Plex Mono. The charte is authoritative; the preset only supplies structure.
- **Charte (binding):** canvas `#FAFAF8`, ink `#14161A`, surface `#FFFFFF`, hairline `#E6E4DD`,
  single accent cobalt `#1A43C4`, risk-high `#B3261E`, risk-watch `#B9651B`, risk-healthy
  `#0B6B4F`. Faces: Inter (text), Instrument Serif (editorial accents only), IBM Plex Mono (figures
  and technical labels). **Forbidden:** gradients, halos, coloured shadows, emoji, neon, bounce
  transitions. Motion must be calm and precise on soft ease-out.
- **Layout constraint:** the main capture never drops below ~55 % of frame height.
- **Surimpressions:** IBM Plex Mono, uppercase, very small, tracked — like the site's own labels.
- **Captions:** burned-in French subtitles for scenes 01–05 (see `## Captions`). Scene 06 carries
  no caption — its line is already set by the frame as the signature line. The voice-over that
  originally carried comprehension has been **removed**.
- **Deliverables:** `frontend/public/product/demo.mp4` (1920×1080, H.264, yuv420p,
  **no audio stream**, ~30 s, `moov` atom first) and `frontend/public/product/demo-poster.jpg`.

## Captions

`captions: burned-in French subtitles (five lines, scenes 01-05; scene 06 carries its line as artwork)` — this **supersedes** the original
brief, which read `captions: skipped (brief explicitly rules out burned-in subtitles; the
voice-over suffices)`. The follow-up request removed the voice-over entirely and asked for the same
six sentences as burned-in subtitles, with the constraints below. The grid lives in
`captions.json`; the skin lives in `compositions/scene-base.css`; `README.md` documents how it was
measured.

- **Type:** Inter only (already in `assets/fonts/`), weight 500, no italic.
- **Scene 06 has no caption on purpose**: it is the only scene whose own artwork already sets the
  script line in full, so a caption there duplicated it verbatim on the closing card.
- **Colour:** ink `#14161A` on the paper scenes (02–05), paper `#FAFAF8` on the ink scenes (01/06) —
  both ≥ 16:1, i.e. comfortably past AA.
- **No full-width opaque band.** No backing plate at all: the strip sits on plain ground, and a
  plate wide enough to hold the longest line (1392px) could not clear the bottom-left
  surimpression. Measured, not assumed.
- **No collision with the bottom surimpression, ever.** The caption block reserves the
  surimpression's column (anchored at x 380), and the two elements that could not move out of its
  way — frame 06's centred `talentpulse.app` label, and the ink frames' footer hairline — were
  raised instead.
- **Fade:** 200 ms in, 200 ms out, opacity only.
- **Breathing room:** nothing on screen during the first 0.5 s or the last 1.5 s.

## Voice

**Removed.** The film carries no audio stream at all — no voice-over, no music, no SFX. The original
build's narration (ElevenLabs *Daniel — Steady Broadcaster*, `eleven_multilingual_v2`, one
`assets/voice/NN.mp3` per scene) is preserved on disk but is no longer referenced by anything:
`audio_meta.json` was deleted and replaced by `captions.json`, `build-index.mjs` emits no `<audio>`
element, and both `render.mjs` and `publish.mjs` strip audio and **fail** if a stream is present.
The original measured speech durations were 3.576 · 6.873 · 5.619 · 6.316 · 2.461 · 4.365 s
(29.21 s); the subtitle windows are a different, tighter grid because a caption only has to be
readable inside its own scene — see `SCRIPT.md`.

## Timing policy (locked script, locked scene grid, new caption grid)

The script text is untouched and the six scene windows are unchanged (30.9 s total). The caption
starts are **not** the old voice starts: each window opens just after its scene's cut and closes
just before the next one, so no caption straddles a cut, and the first 0.5 s and last 1.5 s of the
film stay empty. Full table in `SCRIPT.md`; `captions.json` carries the authoritative per-line
start and duration.

## Music

- **Provider:** none available. HeyGen is signed out and the `heygen` CLI is absent, so
  `media-use`'s BGM resolver has no catalogue. No royalty-free track could be **obtained and
  licensed** in this run.
- **Decision:** the film is **entirely silent**. With the narration gone, a music bed would be the
  only sound in the piece, which changes its register rather than supporting it; the original brief
  allowed "voix seule et propre", and the honest extension of that fallback to a caption-only cut is
  no bed at all. No improvised synthesiser drone.
- `music: none` in `STORYBOARD.md`; there are no SFX cues either.

## Run shape

- `flow: standard`, `storyboard: no` (no Studio board — autonomous, one build pass), `mode: autonomous`.
- Length target `30s`; format `1920x1080`; destination: inline `<video>` on the product page.
