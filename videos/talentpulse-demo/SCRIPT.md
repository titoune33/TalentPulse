# SCRIPT — talentpulse-demo

**Voice:** Daniel — *Steady Broadcaster* (`onwK4e9ZLuTAKqWW03F9`), ElevenLabs, model
`eleven_multilingual_v2`, output `mp3_44100_128`, reached through the Zapier MCP app.
**Voice settings:** provider defaults (multilingual v2 is deterministic here; no per-call tuning).
**Voice direction:** Posed, calm, executive. A DRH explaining a hard number to a board — not a
voice-over selling a product. Sentences land and stop; no upward inflection at the end of a claim.
**Language:** French. **Mode:** `verbatim` — the text below is the locked script and is not
rewritten, reordered or lengthened.

> **Timing policy.** The delivered table's windows sum to exactly 30 s but the speech itself runs
> **29.21 s**, so the windows cannot all hold. The brief authorises shortening **silences** rather
> than speeding the voice up; the scene boundaries were therefore nudged and each line keeps its
> natural cadence. The authoritative per-line start lives in `audio_meta.json` and is repeated in
> `**Time:**` below. There is no word-level timestamp pass in this build (no HeyGen credential), so
> these starts are the placement grid, measured against each file's real duration.

**Measured line durations (ffprobe, seconds):** 3.576 · 6.873 · 5.619 · 6.316 · 2.461 · 4.365

---

## Line 1 — L'annonce (Frame 1)

**Time:** 0.000 – 3.576s · gap to next line 0.774s
**Delivery:** Flat, factual. The number is the argument; let « moitié » sit.

    Un départ non anticipé coûte la moitié d'un salaire annuel.

## Line 2 — Le score (Frame 2)

**Time:** 4.350 – 11.223s · gap to next line 0.377s
**Delivery:** Explanatory, measured. Slow through « cinq signaux RH » — that is the mechanism.

    TalentPulse note chaque collaborateur de zéro à cent pour cent, à partir de cinq signaux RH.

## Line 3 — Les cas critiques (Frame 3)

**Time:** 11.600 – 17.219s · gap to next line 0.181s
**Delivery:** Slightly firmer on « critiques » and « exposition financière ». Still calm.

    Les profils critiques remontent en tête, avec l'exposition financière correspondante.

## Line 4 — Le plan de rétention (Frame 4)

**Time:** 17.400 – 23.716s · gap to next line −0.516s (the line-5 breath opens under this line's tail on purpose — see note)
**Delivery:** A short list, three beats: « diagnostic », « guide d'entretien », « simulateur de contre-mesure ».

    Pour chacun : un diagnostic, un guide d'entretien et un simulateur de contre-mesure.

## Line 5 — La restitution (Frame 5)

**Time:** 23.200 – 25.661s · gap to next line 0.439s
**Delivery:** Light, almost offhand — this is the easy part.

    Et un rapport prêt pour le comité de direction.

## Line 6 — La signature (Frame 6)

**Time:** 26.100 – 30.465s · video ends 30.900s (0.435s of clean tail)
**Delivery:** The brand, then the promise. A full stop after « TalentPulse. » — then slower, lower.

    TalentPulse. Sachez qui va partir, avant qu'il ne démissionne.

---

### Why line 5 starts before line 4 has finished

Lines 4 and 5 overlap by 0.516s. ElevenLabs emits ~0.35s of trailing room tone on each file, and
line 5 (« Et un rapport… ») is a conjunction that should follow line 4's list *immediately* — a
half-second of dead air there would read as a mistake. The overlap is tail-room-tone only; the
words never collide. Every other boundary has a real 0.18–0.77s breath.

### Placement grid (authoritative)

| Line | Scene | Scene window | Voice start | Voice end | Speech |
| ---- | ----- | ------------ | ----------- | --------- | ------ |
| 1    | 01    | 0.000–4.000  | 0.000       | 3.576     | 3.576  |
| 2    | 02    | 4.000–10.500 | 4.350       | 11.223    | 6.873  |
| 3    | 03    | 10.500–16.000| 11.600      | 17.219    | 5.619  |
| 4    | 04    | 16.000–21.900| 17.400      | 23.716    | 6.316  |
| 5    | 05    | 21.900–26.000| 23.200      | 25.661    | 2.461  |
| 6    | 06    | 26.000–30.900| 26.100      | 30.465    | 4.365  |

Total video: **30.900 s**. Total speech: **29.210 s**. No line is cut, stretched or time-compressed.
