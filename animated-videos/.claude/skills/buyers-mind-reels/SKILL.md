---
name: buyers-mind-reels
description: Make a monochrome animated explainer reel for The Buyers Mind in the cryothum-style format (Remotion + Inworld voice + Whisper timing + beat-synced music). Use when asked to make, script, or fix a Buyers Mind animated video.
---

# Buyers Mind reels: the house style

Everything here was measured from 18 reference videos by a creator who gets thousands of likes on fresh accounts with
this exact format. Follow it literally. Deviating from it is what made earlier attempts look "mid".

## 1. Script formula (150–170 words, 60–75 s spoken)

Write in plain spoken English, short clauses, no jargon. Exactly this order:

1. **Contrarian hook**, one sentence, a claim that sounds wrong: "Lowering your price might be the reason nobody's buying."
2. **"Most people / most sellers …"** the common belief, and why it feels true.
3. **"Imagine someone …" / "Picture someone …"** one concrete person living it (often two people side by side).
4. **"This happens because …"** the hidden mechanism.
5. **What changes once you see it** (the payoff, concrete).
6. **"Of course, …"** one honest caveat.
7. **Closing line** that flips or sharpens the hook. It is also shown on screen in caps.

**Hook rules (the owner's #1 note: explanatory hooks are "mid"):**
- Promise money, status or identity, not business advice: rich, millionaire, broke, "a completely different life".
- Use concrete numbers and timeframes: "$10,000 vs $100,000", "six months", "three millionaires for one year".
- Frame it as who you become, not what to do. "If you hang around 3 millionaires for a year, you'll become the next one"
  beats "talk to 3 buyers and you'll know more than 10 courses".
- It should sound wrong or provocative at first glance.
- Tie it back to buyers only after the hook: the Buyers Mind angle lives in steps 3–6, not in the first line.

Reference hooks (all 18 follow the same shape: a short claim that sounds backwards):
"Trying to save money might be the reason you're not making more." · "The first $10,000 is way harder than the next
$100,000." · "Surround yourself with two millionaires, and you will become the third." · "Having no friends is actually
the biggest advantage when it comes to getting rich." · "Motivation is the reason most people never get rich." ·
"Being called delusional is usually the first stage of being called successful." · "The most money you will ever lose
is the money you never tried to make." · "The easiest money you'll ever make is solving a problem you already solved for yourself."
Their closing lines resolve the hook in one breath, e.g. "...money avoids the people who need it the most and finds the
people who are too busy to notice it."

Topic rule: money-adjacent and buyer-psychology. Every claim must be true; no invented statistics.
Facts that are real and safe: the wine price experiment (people rated the same wine better when told it cost more).

## 2. Visual formula

- **Opening = payoff first.** A big money counter climbs (e.g. "SALES $18,142 → $1,004,083") over a spectacle shot:
  money piling up, camera pulling out to reveal it, character ends arms-up. Then the video explains how.
- **One clean metaphor per sentence.** New picture roughly every 1.5–4 s. Never a slide with a title.
- **Ending = growth curve.** A flat or sawtooth line turns exponential, a small figure rides the tip, the counter
  climbs to ~$1M, and the closing line appears in bold caps at the top.
- **Almost no text.** Allowed: money/number counters, tiny uppercase labels under things (14–18 px, letter-spacing
  ~0.28em, #C8C8C8), white speech/label pills, the final line. No scene titles, no burned-in subtitles
  (TikTok's own UI and captions cover the bottom 25% and right edge).

### Scene vocabulary (reuse these, they are the format)
Money counter on top · money pyramid / stacks · spotlight on one figure in a dim crowd · row of identical figures with
speech pills · thought cloud (dashed) with icons · signpost NOW → FUTURE · gauge / speedometer · progress or battery bar ·
calendar grid filling with checks · DAYS / HOURS counter ticking · desk + monitor · shop stall with awning · houses row ·
building with lit windows · door · ladder / staircase (IMPOSSIBLE → ACHIEVABLE) · iceberg (what you see vs what shapes it) ·
balance scale · bell curve made of dots · radar sweep · cage that dissolves · two floating islands with a distance counter ·
compass · flowchart · "TODAY" figure projecting a light onto a giant dashed "TOMORROW" figure.

## 3. Look (measured, do not eyeball)

- Background near-black: `#030303`–`#050505`. Their darkest pixels ≈ 2/255, typical ≈ 10–19/255. Grey backgrounds look cheap.
- Faint dot grid `rgba(255,255,255,0.045)` 38 px, dashed floor line, strong vignette.
- Whites ≈ `#E6E6E6`, outlines 3–6 px `#D6D6D6`. Global `contrast(1.15–1.18)`.
- **Bloom:** render the scene twice, second copy `blur(14–16px) brightness(1.3)` at ~45–50% opacity with `mix-blend-mode: screen`.
- **Lighting:** an overhead spotlight cone + floor pool over every main character. Glowing objects (screens, phones, lamps) light their surroundings.

### Figure (src/CryoFigure.tsx)
Circle head floating above an arch-shaped body, no legs, soft grey gradient. Arms are single rounded bars from the
shoulders; use the `POSES` presets (`rest`, `type`, `cheer`, `point`, `hold`, `shrug`), never ad-hoc angles.
- Typing: `POSES.type(typing(s, seed))` with a **different seed per figure**. Never a plain sine wiggle (looks copy-pasted).
- Arms have a minimum on-screen thickness; don't shrink R below ~22 for anything the eye should read.
- Sizes: "close" scenes R 60–85; "minimal" scenes (lots of dark space) R 22–34.

## 4. Motion

- **Transitions:** cryothum zoom/blur crossfade (~0.34 s): old scene scales up ×1.22 + blurs to 18 px + fades, new scene
  starts ×1.14 + 16 px blur and settles. No sideways whips.
- **Every shot drifts:** slow zoom 1.00 ↔ 1.04–1.08 across the shot.
- **Something always moves:** counters ticking, items accumulating, dust/sparkles, typing.
- React gotcha: CSS `scale` must be a **string** (`` scale: `${z}` ``). A number silently becomes "px" and is ignored.
- Things land on the word: key animations start at the exact Whisper word time.

## 5. Sound

- Voice: Inworld TTS voice `peppy-coral-6339__jane`, model `inworld-tts-1-max`, **one continuous take** of the whole
  script (separate lines spaced onto the beat made the pacing slow). Key header lives only in the session scratchpad.
- Word timing: whisper.cpp `ggml-base.en.bin`, `-ml 1 -sow`. Use timings only; the script is the source of truth for words.
- Music: "meaningful love – instrumental" (Silo, Steven Cranberry). Structure copied from the reference:
  quiet build-up during the hook, **beat drops when the hook line ends**, steady beat (0.889 s, 67.5 BPM) under the
  argument, **strips out** on the closing section. Built by `scripts/build_song_bed.py <clip> <out> <drop> <strip_beats> <end> <vo> <grid.json>`,
  ducked under the voice. Song files and renders that contain it stay out of git (copyright). For posting, prefer the
  music-ready render + the song added in-app (start ≈1:48 so the drop lands after the hook).
- Visual beat pulse: tiny scale/brightness bump on each beat between drop and strip.
- SFX: real CC0 sounds in `public/sfx-real/` (pops on reveals, ticks on counters, chimes on wins, thuds on impacts), quiet.

## 6. Pipeline

1. Script (formula above) → `public/voN/script.txt`.
2. Inworld TTS (one take) → `public/voN/voiceover.wav`; Whisper → `src/voN-words.json`.
3. Song bed with the drop at the end of the hook and the strip at "If you remember…"/closing section.
4. Build `src/<Name>.tsx`: one `Shot` per sentence, scenes from the vocabulary, bloom pass, vignette.
5. Render ~12 stills across the timeline, check overlaps and empty moments, fix, then full render
   (bloom doubles render time: ~30–40 min for 60 s at 1920×1080 on this machine).
6. Check the full render (contact sheet + a strip of transitions) before sending.

## 7. Quality checklist (each was a real complaint)

- [ ] Hook shows the payoff/spectacle in frame 1, no empty axes.
- [ ] No scene sits still for more than ~1.5 s.
- [ ] Every scene has 2+ things moving or accumulating.
- [ ] No overlapping labels; nothing important in TikTok's bottom 25% / right edge.
- [ ] Arms look natural; no identical motion on two figures.
- [ ] Near-black background, spotlights, bloom.
- [ ] Pacing: continuous voice, no dead gaps between lines.
