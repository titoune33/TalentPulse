# SCRIPT — talentpulse-demo

**Delivery:** burned-in French subtitles. **There is no voice-over.** The narration was removed
and replaced by the script below rendered as text on the picture (see `captions.json` for the
machine-readable grid and `compositions/scene-base.css` for the skin).

**Five of the six lines are burned in. Line 6 is not.** Its sentence is already on screen for the
whole of scene 06 as the signature line drawn by `06-signature.html` — burning the identical
sentence underneath it for the last three seconds read as a duplicate, not as a subtitle. The line
is therefore withheld, not lost: scene 06 keeps its wordmark, its `pulse` stroke and its
`talentpulse.app` label, and the film's last 4.9 s carry no caption.

**Language:** French. **Mode:** `verbatim` — the text below is the locked script and is not
rewritten, reordered or lengthened. It is the same six sentences that the voice-over read.

**Captions:** burned in for scenes 01–05 (one line each), appearing with a 200 ms opacity fade and
leaving the same way. Never `autoAlpha` (see the hard rule at the head of `scene-base.css`).

> **Placement policy.** The caption grid is deliberately **not** the old voice grid. The speech ran
> 29.21 s across 30.9 s of delivered scene windows, so voice and scenes disagreed at five of six
> boundaries; a subtitle has no such constraint — it only has to be readable inside its own scene.
> Each caption therefore starts just after its scene's cut and ends shortly before the next one, so
> no line ever straddles a cut; the first 0.5 s and the last 1.6 s of the film carry no caption
> at all, which is the breathing room the brief asks for.

**Measured caption durations (seconds):** 3.576 · 4.900 · 4.850 · 5.250 · 3.300 — line 6 is not
burned in.

---

## Line 1 — L'annonce (Frame 1)

**Time:** 0.000 – 3.576s · scene 01 runs 0.000 – 4.000s
**Variant:** ink (scene ground `#14161A`) → text `#FAFAF8`

    Un départ non anticipé coûte la moitié d'un salaire annuel.

## Line 2 — Le score (Frame 2)

**Time:** 4.350 – 9.250s · scene 02 runs 4.000 – 10.500s
**Variant:** paper (scene ground `#FAFAF8`) → text `#14161A`

    TalentPulse note chaque collaborateur de zéro à cent pour cent, à partir de cinq signaux RH.

## Line 3 — Les cas critiques (Frame 3)

**Time:** 10.850 – 15.700s · scene 03 runs 10.500 – 16.000s
**Variant:** paper → text `#14161A`

    Les profils critiques remontent en tête, avec l'exposition financière correspondante.

## Line 4 — Le plan de rétention (Frame 4)

**Time:** 16.350 – 21.600s · scene 04 runs 16.000 – 21.900s
**Variant:** paper → text `#14161A`

    Pour chacun : un diagnostic, un guide d'entretien et un simulateur de contre-mesure.

## Line 5 — La restitution (Frame 5)

**Time:** 22.250 – 25.550s · scene 05 runs 21.900 – 26.000s
**Variant:** paper → text `#14161A`

    Et un rapport prêt pour le comité de direction.

## Line 6 — La signature (Frame 6) — NOT burned in

**On screen:** 26.000 – 30.900s, as the signature line inside `06-signature.html`, not as a
subtitle.

    TalentPulse. Sachez qui va partir, avant qu'il ne démissionne.

Scene 06 is the only scene whose own artwork already sets the script line in full, so a caption
there was pure duplication. The scene keeps everything it had: the wordmark at y 430, the `pulse`
stroke drawing 0.35–1.55 s, the signature line at y 640, the centred `talentpulse.app` label
(raised to y 966), and the closing darkening to `#0C0E11` over the last 0.35 s. The film's final
4.9 s therefore breathe with no caption at all, which also satisfies the brief's 1.5 s tail.

### Placement grid (authoritative)

| Line | Scene | Scene window   | Caption start | Caption end | On screen | Variant |
| ---- | ----- | -------------- | ------------- | ----------- | --------- | ----- |
| 1    | 01    | 0.000–4.000    | 0.000         | 3.576       | 3.576     | ink   |
| 2    | 02    | 4.000–10.500   | 4.350         | 9.250       | 4.900     | paper |
| 3    | 03    | 10.500–16.000  | 10.850        | 15.700      | 4.850     | paper |
| 4    | 04    | 16.000–21.900  | 16.350        | 21.600      | 5.250     | paper |
| 5    | 05    | 21.900–26.000  | 22.250        | 25.550      | 3.300     | paper |
| 6    | 06    | 26.000–30.900  | —             | —           | 4.900     | none  |

Total video: **30.900 s**. No line is cut, rewritten, stretched or time-compressed. The fade is
200 ms at each end of every **burned-in** window, so the fully opaque time is 400 ms shorter than
the numbers above. Line 6 has no caption window: it is on screen for the whole of scene 06 as scene
artwork, not as a subtitle.
