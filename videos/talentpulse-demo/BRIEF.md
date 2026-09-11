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
- **Captions:** none. The French voice-over carries comprehension; see `## Captions`.
- **Deliverables:** `frontend/public/product/demo.mp4` (1920×1080, H.264, yuv420p, AAC, ~30 s,
  `moov` atom first) and `frontend/public/product/demo-poster.jpg`.

## Captions

`captions: skipped (brief explicitly rules out burned-in subtitles; the voice-over suffices)`.

## Voice

- **Provider:** ElevenLabs, reached through the Zapier MCP app (`elevenlabs_convert_text_to_speech`).
  HyperFrames' own path was unavailable: `hyperframes auth status` reports *not signed in to
  HeyGen*, and the `heygen` CLI is not installed, so `media-use`'s BGM/voice resolver has no
  provider. ElevenLabs was the reliable path and it is the one the requester named.
- **Voice:** Daniel — *Steady Broadcaster* (`onwK4e9ZLuTAKqWW03F9`), model `eleven_multilingual_v2`,
  output `mp3_44100_128`. Chosen for a calm, posed, executive register (not advertising-bright).
- **Per-line files:** `assets/voice/01.mp3` … `06.mp3`, one per scene, generated separately so each
  line could be placed at its own timecode rather than inheriting a container's padding.
- **Measured durations (s):** 3.576 · 6.873 · 5.619 · 6.316 · 2.461 · 4.365 → **29.21 s of speech**.

## Timing policy (locked script, adjusted silences)

The script text is untouched. The requester authorised shortening **silences** rather than speeding
the voice up, and the delivered line table's windows sum to exactly 30 s while the speech itself
runs 29.21 s — so the scene boundaries were nudged, never the words. Scene boundaries and voice
starts therefore differ. Full table in `STORYBOARD.md` / `SCRIPT.md`; `audio_meta.json` carries the
authoritative per-line start.

## Music

- **Provider:** none available. HeyGen is signed out, the `heygen` CLI is absent, so `media-use`'s
  BGM resolver has no catalogue; ElevenLabs via Zapier exposes text-to-speech only (no music
  generation). No royalty-free track could be **obtained and licensed** in this run.
- **Decision:** ship **voice alone, clean** — the explicit fallback the brief allows ("sinon, voix
  seule et propre"). No improvised synthesiser bed: a synthetic drone under an executive voice-over
  would read as cheap and would risk the calm register.
- `music: none` in `STORYBOARD.md`; there are no SFX cues either.

## Run shape

- `flow: standard`, `storyboard: no` (no Studio board — autonomous, one build pass), `mode: autonomous`.
- Length target `30s`; format `1920x1080`; destination: inline `<video>` on the product page.
