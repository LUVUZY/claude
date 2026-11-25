"""Music-sync helpers for "Maybe Later" (structure copied from cryothum's music):
  0 -> DROP   : hook, almost no music
  DROP        : the beat drops in (end of the hook line)
  DROP->STRIP : steady beat at BPM under the argument
  STRIP->end  : bass drops out for the conclusion
Writes public/music/demo-beat.wav (a simple original beat to preview the sync)
and public/music/beat-guide.wav (clicks on every beat, accent on beat 1 of each bar).
Run: python3 scripts/make_beat.py"""
import wave, os, numpy as np
SR = 44100; BPM = 99.0; DROP = 4.08; STRIP = 53.16; END = 61.0
P = 60 / BPM
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'music')
os.makedirs(OUT, exist_ok=True)
n = int(SR * END); t = np.arange(n) / SR
rng = np.random.default_rng(3)

def put(buf, at, x):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += x[: j - i]

def kick():
    tt = np.arange(int(SR * 0.45)) / SR
    f = 45 + 110 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)

def hat():
    m = int(SR * 0.06); x = rng.standard_normal(m)
    x = x - np.convolve(x, np.ones(6) / 6, 'same')
    return x * np.exp(-np.arange(m) / (SR * 0.012)) * 0.25

def sub(freq, dur):
    tt = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, tt / 0.02) * np.minimum(1, (dur - tt) / 0.08)
    return (np.sin(2 * np.pi * freq * tt) + 0.2 * np.sin(4 * np.pi * freq * tt)) * env * 0.55

def save(name, x, peak):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

# --- demo beat ---
mix = np.zeros(n)
# soft pad the whole time (quieter in the hook and the ending)
chord = [110.0, 164.81, 220.0, 261.63, 329.63]
pad = sum(np.sin(2 * np.pi * f * t + i) / (1 + i * 0.5) for i, f in enumerate(chord))
padlevel = np.where((t < DROP) | (t > STRIP), 0.10, 0.06) * np.minimum(1, np.minimum(t / 1.5, (END - t) / 2))
mix += pad * padlevel
bass_notes = [55.0, 55.0, 43.65, 49.0]  # A A F G, one per bar
beats = np.arange(DROP, STRIP - 1e-6, P)
for k, b in enumerate(beats):
    put(mix, b, kick() * (1.0 if k % 2 == 0 else 0.75))
    put(mix, b + P / 2, hat())
    if k % 4 == 0:
        put(mix, b, sub(bass_notes[(k // 4) % 4], P * 4 - 0.05))
# riser into the drop
rt = np.arange(int(SR * 1.2)) / SR
riser = rng.standard_normal(len(rt)) * (rt / 1.2) ** 2 * 0.25
put(mix, DROP - 1.2, riser)
# the ending: just a single low hit and the pad
put(mix, STRIP, kick() * 0.8)
save('demo-beat.wav', mix, 0.8)

# --- beat guide (clicks) ---
g = np.zeros(n)
def click(freq):
    m = int(SR * 0.03); tt = np.arange(m) / SR
    return np.sin(2 * np.pi * freq * tt) * np.exp(-tt * 200)
for k, b in enumerate(beats):
    put(g, b, click(1800 if k % 4 == 0 else 1200) * (1 if k % 4 == 0 else 0.6))
save('beat-guide.wav', g, 0.7)
print('beats:', len(beats), 'period', round(P, 4))
