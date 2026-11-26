"""Soft SFX palette matched to the reference: few hits, dull (~600-900 Hz centroid), fast decay (~0.1-0.2 s)."""
import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(7)
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx-soft')
os.makedirs(out, exist_ok=True)

def lp(x, fc):  # one-pole low-pass, run twice
    a = np.broadcast_to(np.exp(-2 * np.pi * np.asarray(fc, float) / SR), x.shape)
    for _ in range(2):
        y = np.empty_like(x); p = 0.0
        for i, v in enumerate(x): p = (1 - a[i]) * v + a[i] * p; y[i] = p
        x = y
    return x
def hp(x, fc): return x - lp(x, fc)
def t(d): return np.arange(int(d * SR)) / SR
def save(name, x, peak=0.7):
    x = x / (np.abs(x).max() + 1e-9) * peak
    fade = min(len(x), int(0.01 * SR)); x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

# airy whoosh: band-limited noise swelling into the cut, then gone
tt = t(0.42); env = np.sin(np.pi * np.clip(tt / 0.42, 0, 1)) ** 2.2
n = rng.standard_normal(len(tt)); sweep = lp(n, 900) * env
save('whoosh', hp(sweep, 120), 0.6)
# soft thud: low body + tiny felt click, 0.15 s
tt = t(0.22); f = 95 * np.exp(-tt * 9) + 55
body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22)
click = lp(rng.standard_normal(len(tt)), 1200) * np.exp(-tt * 120) * 0.5
save('thud', body + click, 0.8)
# muted tick: wooden, short
tt = t(0.06); save('tick', lp(rng.standard_normal(len(tt)), 1800) * np.exp(-tt * 140) + 0.6 * np.sin(2 * np.pi * 700 * tt) * np.exp(-tt * 90), 0.5)
# soft pop for reveals: rounded sine blip with slight upward bend
tt = t(0.12); f = 380 + 260 * (1 - np.exp(-tt * 40))
save('pop', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 38) * (1 - np.exp(-tt * 900)), 0.6)
# warm chime for the one big win: low bell partials, short tail, low-passed
tt = t(0.6); ch = sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * d) for fr, a, d in [(523, 1, 7), (784, 0.5, 9), (1046, 0.25, 12)])
save('chime', lp(ch * (1 - np.exp(-tt * 600)), 2200), 0.55)
# coins: a few soft low clinks spread out, not an arcade jingle
tt = t(0.5); c = np.zeros(len(tt))
for k, (st, fr) in enumerate([(0, 1250), (0.07, 1480), (0.15, 1180), (0.26, 1390)]):
    m = tt >= st; u = tt[m] - st
    c[m] += (0.8 ** k) * np.sin(2 * np.pi * fr * u) * np.exp(-u * 40)
save('coins', lp(c, 1600), 0.45)
# low riser into the drop / closing line
tt = t(1.2); env = (tt / 1.2) ** 2.5
save('riser', lp(rng.standard_normal(len(tt)), 300 + 900 * tt / 1.2) * env, 0.5)
print('ok', sorted(os.listdir(out)))
