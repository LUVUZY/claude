---
name: buyers-mind-reels
description: Make a monochrome animated explainer reel for The Buyers Mind, in the premium thin-line style (default) or the cryothum figure style (Remotion + Inworld voice + Whisper timing + beat-synced music). Use when asked to make, script, or fix a Buyers Mind animated video.
---

# Buyers Mind reels: the house style

Everything here was measured from 18 reference videos by a creator who gets thousands of likes on fresh accounts with
this exact format. Follow it literally. Deviating from it is what made earlier attempts look "mid".

## 0. Which style (read first)

There are **two saved styles. Keep both; neither replaces the other.** The owner asks for one or the other by name
(or for "both", which means one new video in each).
- **V1 — cryothum figure style** (sections 2–4): grey figures with arms, props, bloom haze, scene cuts with zoom/blur.
  Examples: `src/EveryMillionaire.tsx`, `src/WhoTheyBecome.tsx`.
- **V2 — premium thin-line style** (this section): pure black, thin glowing line art, pills, one gliding camera.
  Examples: `src/LessTime.tsx`, `src/LineStyleTest.tsx`. Kit: `src/LineKit.tsx`.
The script formula (section 1), voice, Whisper timing, captions and delivering rules apply to both.

### V2 — premium line style, measured from @cps_user and @krynoth_11 (6 videos)

**Kit:** `src/LineKit.tsx` (all pieces below) and `src/LineStyleTest.tsx` (a working 15 s example). Build every new
video from the kit; add to the kit instead of drawing one-offs.

**Look**
- Pure black `#000`, a barely visible dot grid, a very soft lift in the centre and a vignette. Mid brightness p50 ≈ 2
  (much darker than cryothum's haze); no bloom pass. Glow comes from `drop-shadow` on the white strokes (`GLOW`).
- Everything is thin white line art, stroke ≈ 4–5 px at 1080p, round caps/joins. Active = white + glow;
  inactive/past = grey `#6E6E6E` without glow; gauge tracks `#2E2E2E`.
- Figure = `Pawn`: round head over an arch body, **no arms, no legs**. Three looks: `hero` (filled white, glowing),
  `line` (outline), `ghost` (grey outline, the crowd). Optional graduation cap or tie for identity.
  The point of a scene is usually *one hero among ghosts* (spotlight, brightness, or a pill above them).
- Type: Inter 800, uppercase, wide letter-spacing (0.14em on pills, ~0.32em on small captions).
  `Pill` (outlined, or solid white with black text for the key phrase; old phrases turn `ghost`), `Bubble`
  (white speech bubble, black text), `Stat` (huge number + small spaced caption), `Caption` under icons,
  `WordBox` (outlined or white card with one bold word).
- Data pieces: `Ring` gauge (grey track, white arc, counting %), `Bars` (white bars growing, values counting),
  `Trend` (line that draws itself; `rider` puts a hero pawn on the tip), `Rows` (account-balance table),
  `DotField` (a crowd of millions, one dot lit).
- Icons: `Icon` draws itself on (school, building, doc, cert, briefcase, globe, bell, shield, bank, phone, search,
  door, question, arrow, network, cart, box, tag, coin, eye, chat, star, lock, chart). Add new ones to `ICONS`.
- Symbols for argument: a big `Cross` drawn over the wrong idea (two strokes), a dashed `Ground` line, a soft
  `Spot` cone on the hero, seesaws/scales, ladders, doors multiplying, `=` between two equal pawns.

**Motion (the part that makes it feel premium)**
- **One continuous world, not cuts.** Lay scenes out side by side / stacked on one big canvas and move a `Camera`
  between them (`CamKey[]`): hold, then glide 0.35–0.8 s with ease-in-out and slight motion blur. Typical moves:
  pan sideways to the next idea; **pull back to reveal more** (2 doors → 4 doors, 1 pawn → a crowd);
  push in on the hero. Camera drifts ±1 % while holding.
- New element every ~1–3 s, in sync with the word. Entrances are calm: fade + 14 px rise, pills pop with a soft
  spring, lines and icons draw themselves on, numbers count up. Nothing bounces wildly.
- Replace, don't stack: when the idea changes, the old label turns ghost/grey (or gets a `Cross`) and the new one
  appears solid next to it.
- Measured: @cps_user ≈ 11–22 picture changes/min, motion ≈ 2.4–2.7, active ≈ 35–49 %. @krynoth_11 is slower and
  sparser (1–5 % active): fewer, smaller elements, lots of empty black. Aim for the @cps_user pace.
- Layout keeps the TikTok-safe zone: important things in the middle 70 % of the height, nothing key bottom-right.

**Script differences vs cryothum**
- Same formula (hook → common belief → mechanism → payoff → caveat → flip), 135–170 words, **~145–150 wpm**
  (55–70 s), calmer read.
- **Cite real, named sources** for the key numbers: "the Bank of England said in a 2014 report…",
  "Kahneman and Tversky found…", "a study of 2.7 million founders…". Only use a source you can actually name and
  that says what you claim. If there's no real number, use a pill/word instead of a stat — never invent one.
- Reference hooks: "School was built to make good employees, not rich people." · "A master's degree is the new
  bachelor's." · "The most popular degree in Europe is business. That's exactly the problem." · "Where does money
  come from?" · "Staying calm helps you build wealth." · "If you're between 17 and 24, you have two choices."
- Closing line flips the hook: "Fear does not make you poor. Reacting to it does." · "School made you an employee.
  What you do next decides if you stay one." · "When everyone climbs the same ladder, the ladder stops being the advantage."

**Music for V2:** the owner's second clip (an instrumental, ~62 BPM, beat ≈ 0.97 s; the clip was filmed IRL and is
only used for its audio; its name doesn't matter). Saved outside git at `scratchpad/song/song2.wav`. Loud for the
first ~45 s with short dips around 16 s, 30 s and 39 s, then quiet. Bed: the clip from 0 s, faded out at the end and
side-chain ducked under the voice (`ffmpeg ... sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500`),
saved as `public/music/song-bed-N.wav` (git-ignored). V1 keeps using "meaningful love" (section 5).
SFX for V2: `sfx-soft/whoosh` under every camera glide + ~7 accents, same rules as section 5.

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
- Use concrete numbers and timeframes: "ten thousand vs a hundred thousand dollars", "six months", "three millionaires for one year".
- Frame it as who you become, not what to do. "If you hang around 3 millionaires for a year, you'll become the next one"
  beats "talk to 3 buyers and you'll know more than 10 courses".
- It should sound wrong or provocative at first glance.
- Tie it back to buyers only after the hook: the Buyers Mind angle lives in steps 3–6, not in the first line.

Reference hooks (all 18 follow the same shape: a short claim that sounds backwards):
"Trying to save money might be the reason you're not making more." · "The first ten thousand dollars is way harder than the next
hundred thousand." · "Surround yourself with two millionaires, and you will become the third." · "Having no friends is actually
the biggest advantage when it comes to getting rich." · "Motivation is the reason most people never get rich." ·
"Being called delusional is usually the first stage of being called successful." · "The most money you will ever lose
is the money you never tried to make." · "The easiest money you'll ever make is solving a problem you already solved for yourself."
Their closing lines resolve the hook in one breath, e.g. "...money avoids the people who need it the most and finds the
people who are too busy to notice it."

Topic rule: money-adjacent and buyer-psychology. Every claim must be true; no invented statistics.
Facts that are real and safe: the wine price experiment (people rated the same wine better when told it cost more).

## 2. Visual formula (V1, cryothum figure style)

- **Opening = payoff first.** A big money counter climbs (e.g. a SALES counter running from 18,142 to over a million dollars) over a spectacle shot:
  money piling up, camera pulling out to reveal it, character ends arms-up. Then the video explains how.
- **One clean metaphor per sentence.** New picture roughly every 1.5–4 s. Never a slide with a title.
- **Ending = growth curve.** A flat or sawtooth line turns exponential, a small figure rides the tip, the counter
  climbs to about a million, and the closing line appears in bold caps at the top.
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
- Always put `grayscale(1)` on the world layers: emoji/icons otherwise render in colour and break the look.
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
- Looping particles (coins, bills, sparkles) must fade in **and** out (`opacity = sin(life·π)`); a plain `1 - life` makes them teleport when the loop restarts.
- Crowds walk in from off-screen and stay put in a queue; never slide a figure back through others.
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
- SFX (measured on the reference: ~2 accents/min, dull ~800 Hz, gone in ~0.13 s). Use the soft palette in
  `public/sfx-soft/` (built by `scripts/make_soft_sfx.py`): `whoosh` under every cut (vol ~0.2), plus **8–10 accents
  per video total** on key beats only: `coins` (payoff), `riser` into the drop, one `chime` for the big win, `pop`
  for reveals, `thud` for punchlines/closing line, `tick` rarely. Never: rapid repeated rows (ticks per counter step,
  coin per bill), arcade/8-bit sounds, error buzzers, bright UI clicks. The old `public/sfx-real/` set sounded cheap ("mid").

## 6. Pipeline

1. Script (formula above) → `public/voN/script.txt`.
2. Inworld TTS (one take) → `public/voN/voiceover.wav`; Whisper → `src/voN-words.json`.
3. Song bed with the drop at the end of the hook and the strip at "If you remember…"/closing section.
4. Build `src/<Name>.tsx`: one `Shot` per sentence, scenes from the vocabulary, bloom pass, vignette.
5. Render ~12 stills across the timeline, check overlaps and empty moments, fix, then full render
   (bloom doubles render time: ~30–40 min for 60 s at 1920×1080 on this machine).
6. Check the full render (contact sheet + a strip of transitions) before sending.

## 7. Delivering

Every time a video is sent to the owner, include a ready-to-paste **TikTok caption** with it. Keep it plain:
- **One sentence.** No emojis. About **3 hashtags**.
- Example: `Every millionaire just figured out what people will pay for. #entrepreneur #sales #business`
- No pitches, questions, or pinned-comment suggestions unless asked.
Also say which file to post (music-ready + song added in-app at ≈1:48 is the safer choice).

## 8. Measured targets (averages of 18 reference videos)

Run `python3 scripts/measure_video.py <render.mp4> <speech_end>` on every render. Reference values:
| metric | reference | what it means |
|---|---|---|
| active % | **64** (range 33–88) | share of time something visibly moves. Our early videos sat at 18–49: the #1 gap. Aim ≥ 65. |
| mid brightness (p50) | **~10–12** | they are near-black with a soft ambient haze, not pure black. p50 of 2–4 looks too dead. |
| black level (p5) | ~2–3 | true blacks. |
| words per minute | ~180 | continuous, brisk narration. |
| length | **64–75 s** | scripts of ~160–190 words. Ours ran 49–55 s: too short. |
| picture changes / min | ~8.5 | |
The script also lists every still stretch ≥ 1.5 s, fix each one.

## 9. Quality checklist (each was a real complaint)

- [ ] Hook shows the payoff/spectacle in frame 1, no empty axes.
- [ ] No scene sits still for more than ~1.5 s.
- [ ] Every scene has 2+ things moving or accumulating.
- [ ] No overlapping labels; nothing important in TikTok's bottom 25% / right edge.
- [ ] Arms look natural; no identical motion on two figures.
- [ ] Near-black background, spotlights, bloom.
- [ ] Pacing: continuous voice, no dead gaps between lines.
