"""Builds a 61s music bed from a clip of "meaningful love - instrumental" (Silo, Steven Cranberry),
cut on the song's beat grid so its drop lands exactly when the hook ends, and ducked under the voice.
Usage: python3 scripts/build_song_bed.py <song_clip.wav (44.1k stereo)> <out.wav>"""
import sys, wave, json, numpy as np
SR = 44100
P = 0.8892          # song beat (s), measured
CLIP_DROP = 7.928   # where the drop is inside the clip (s), measured
CLIP_INTRO = 1.704  # first beat of the sparse intro in the clip
LOOP_BEATS = 24     # full post-drop section used as the loop (6 bars)
DROP = 4.08         # our video: hook ends, beat drops
STRIP_BEATS = 55    # beats after the drop until the strip-down (lands at ~52.99s, by "If you remember one thing")
END = 61.0
VO = 'public/vo/voiceover.wav'
GRID_OUT = 'src/song-grid.json'
# optional overrides: build_song_bed.py <clip> <out> <drop> <strip_beats> <end> <vo.wav> <grid.json>
if len(sys.argv) > 3:
    DROP, STRIP_BEATS, END, VO, GRID_OUT = float(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), sys.argv[6], sys.argv[7]

w = wave.open(sys.argv[1]); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch) / 32768
seg = lambda a, b: x[int(round(a * SR)):int(round(b * SR))]
out = np.zeros((int(END * SR), ch), np.float32)
XF = int(0.012 * SR)

def place(at, clip, fade_in=True, fade_out=True):
    clip = clip.copy()
    if fade_in: clip[:XF] *= np.linspace(0, 1, XF)[:, None]
    if fade_out: clip[-XF:] *= np.linspace(1, 0, XF)[:, None]
    i = int(round(at * SR)); j = min(len(out), i + len(clip)); out[i:j] += clip[: j - i]

# 1) hook: the build-up that leads into the drop
place(0, seg(CLIP_DROP - DROP, CLIP_DROP), fade_in=False)
# 2) argument: post-drop section looped on the beat grid
loop = seg(CLIP_DROP, CLIP_DROP + LOOP_BEATS * P)
t = DROP; left = STRIP_BEATS
while left > 0:
    b = min(left, LOOP_BEATS)
    place(t, loop[: int(round(b * P * SR))])
    t += b * P; left -= b
strip_at = t
# 3) conclusion: back to the sparse intro, fading out
outro = seg(CLIP_INTRO, CLIP_DROP)
fl = int(2.0 * SR); outro[-fl:] *= np.linspace(1, 0, fl)[:, None]
place(strip_at, outro)
# overall fade at the very end
fe = int(1.0 * SR); out[-fe:] *= np.linspace(1, 0, fe)[:, None]

# 4) duck under the voiceover
v = wave.open(VO); vsr = v.getframerate(); vch = v.getnchannels()
vo = np.frombuffer(v.readframes(v.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, vch).mean(1) / 32768
if vsr != SR: vo = np.interp(np.arange(int(len(vo) * SR / vsr)) * vsr / SR, np.arange(len(vo)), vo)
win = int(0.05 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(win) / win, 'same'))
talking = (env > 0.02).astype(np.float32)
# smooth: fast attack, slow release
sm = np.zeros_like(talking); a, r = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.35 * SR)); s = 0.0
for i, val in enumerate(talking):
    s = (a if val > s else r) * s + (1 - (a if val > s else r)) * val; sm[i] = s
gain = np.ones(len(out)); n = min(len(sm), len(out)); gain[:n] = 1 - 0.45 * sm[:n]
out *= gain[:, None]
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(sys.argv[2], 'wb') as o:
    o.setnchannels(ch); o.setsampwidth(2); o.setframerate(SR); o.writeframes((out * 32767).astype(np.int16).tobytes())
json.dump({'beat': P, 'drop': DROP, 'strip': round(strip_at, 3)}, open(GRID_OUT, 'w'))
print('strip at', round(strip_at, 3))
