"""Soft ambient pad that sits quietly under a voiceover (like the held tone under cryothum's narration).
Run: python3 scripts/make_pad.py [seconds]  -> public/sfx/pad.wav"""
import sys, wave, os, numpy as np
SR = 44100
d = float(sys.argv[1]) if len(sys.argv) > 1 else 62
t = np.arange(int(SR * d)) / SR
# A minor 9 voicing, slightly detuned pairs for width
notes = [110.0, 164.81, 220.0, 261.63, 329.63, 493.88]
x = np.zeros_like(t)
for i, f in enumerate(notes):
    for det in (-0.6, 0.6):
        x += np.sin(2 * np.pi * (f + det) * t + i) / (1 + i * 0.6)
# slow breathing swell and a gentle overall fade in/out
x *= 0.75 + 0.25 * np.sin(2 * np.pi * t / 9.0)
x *= np.minimum(1, np.minimum(t / 2.5, (d - t) / 2.5))
# soften: simple one-pole lowpass
a = np.exp(-2 * np.pi * 1200 / SR); y = np.zeros_like(x); s = 0.0
for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
y = y / np.abs(y).max() * 0.5
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx', 'pad.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print('wrote', out)
