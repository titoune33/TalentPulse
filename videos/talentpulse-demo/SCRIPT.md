# SCRIPT — talentpulse-demo

**Delivery:** burned-in French subtitles. **There is no voice-over.** The narration was removed
and replaced by the six lines below, which are rendered as text on the picture (see
`captions.json` for the machine-readable grid and `compositions/scene-base.css` for the skin).

**Language:** French. **Mode:** `verbatim` — the text below is the locked script and is not
rewritten, reordered or lengthened. It is the same six sentences that the voice-over read.

**Captions:** burned in, one line per scene, appearing with a 200 ms opacity fade and leaving the
same way. Never `autoAlpha` (see the hard rule at the head of `scene-base.css`).

> **Placement policy.** The caption grid is deliberately **not** the old voice grid. The speech ran
> 29.21 s across 30.9 s of delivered scene windows, so voice and scenes disagreed at five of six
> boundaries; a subtitle has no such constraint — it only has to be readable inside its own scene.
> Each caption therefore starts just after its scene's cut and ends shortly before the next one, so
> no line ever straddles a cut; the first 0.5 s and the last 1.6 s of the film carry no caption
> at all, which is the breathing room the brief asks for.

**Measured caption durations (seconds):** 3.576 · 4.900 · 4.850 · 5.250 · 3.300 · 3.000

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

## Line 6 — La signature (Frame 6)

**Time:** 26.300 – 29.300s · scene 06 runs 26.000 – 30.900s

    TalentPulse. Sachez qui va partir, avant qu'il ne démissionne.

---

### Why the closing caption ends before the scene does

Scene 06 runs to 30.900 s and carries the only darkening in the film (the ink plate easing to
`#0C0E11` over 30.55 – 30.90 s). The brief asks for a 1.5 s breath at the end, so line 6 leaves the
screen at 29.300 s and the last 1.6 s belongs to the wordmark, the pulse stroke and the darkening.
Nothing is cut: the sentence is on screen complete for 2.8 s after its fade-in.

### Placement grid (authoritative)

| Line | Scene | Scene window   | Caption start | Caption end | On screen | Variant |
| ---- | ----- | -------------- | ------------- | ----------- | --------- | ----- |
| 1    | 01    | 0.000–4.000    | 0.000         | 3.576       | 3.576     | ink   |
| 2    | 02    | 4.000–10.500   | 4.350         | 9.250       | 4.900     | paper |
| 3    | 03    | 10.500–16.000  | 10.850        | 15.700      | 4.850     | paper |
| 4    | 04    | 16.000–21.900  | 16.350        | 21.600      | 5.250     | paper |
| 5    | 05    | 21.900–26.000  | 22.250        | 25.550      | 3.300     | paper |
| 6    | 06    | 26.000–30.900  | 26.300        | 29.300      | 3.000     | ink   |

Total video: **30.900 s**. No line is cut, rewritten, stretched or time-compressed. The fade is
200 ms at each end of every window, so the fully opaque time is 400 ms shorter than the numbers
above.
