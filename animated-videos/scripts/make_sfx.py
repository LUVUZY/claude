"""Generate the reel's sound effects from scratch (no samples, no licences needed).
Run: python3 scripts/make_sfx.py  -> writes WAV files into public/sfx/"""
import wave, numpy as np, os
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t(sec): return np.arange(int(SR * sec)) / SR

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y

def highpass(x, cutoff): return x - lowpass(x, cutoff)

def env(n, attack, decay):
    e = np.ones(n); a = int(SR * attack)
    if a: e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-np.arange(n - a) / (SR * decay))
    return e

def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

# 1. dark room hum (loops for the whole reel)
d = 27; tt = t(d)
hum = 0.5 * np.sin(2*np.pi*41*tt) + 0.3 * np.sin(2*np.pi*55*tt + 1) + 0.15*np.sin(2*np.pi*82*tt)
hum *= 0.8 + 0.2 * np.sin(2*np.pi*0.13*tt)
noise = lowpass(rng.standard_normal(len(tt)), 140) * 3
fade = np.minimum(1, np.minimum(tt / 0.5, (d - tt) / 0.5))
save('hum.wav', (hum + noise) * fade, 0.6)

# 2. typewriter tick
n = int(SR*0.05); x = highpass(rng.standard_normal(n), 1800) * env(n, 0.0005, 0.006)
x += 0.4*np.sin(2*np.pi*1150*t(0.05)) * env(n, 0, 0.004)
save('type.wav', x, 0.5)

# 3. whoosh (filtered noise swell)
d = 0.55; n = int(SR*d); x = rng.standard_normal(n)
x = highpass(lowpass(x, 3500), 500) * np.sin(np.pi*np.linspace(0, 1, n))**2
save('whoosh.wav', x, 0.55)

# 4. footstep (soft low thud)
n = int(SR*0.12); x = lowpass(rng.standard_normal(n), 400) * env(n, 0.002, 0.025)
x += 0.6*np.sin(2*np.pi*90*t(0.12)) * env(n, 0.001, 0.03)
save('step.wav', x, 0.45)

# 5. pop (thought bubble)
tt = t(0.15); f = 380 + 900*np.exp(-tt*40)
save('pop.wav', np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.001, 0.035), 0.6)

# 6. thunk (feature block lands) at a few pitches
for i, f0 in enumerate([120, 105, 95, 85, 75]):
    tt = t(0.35); n = len(tt)
    x = np.sin(2*np.pi*f0*tt) * env(n, 0.002, 0.08) + 0.5*lowpass(rng.standard_normal(n), 900)*env(n, 0.001, 0.02)
    x += 0.25*np.sin(2*np.pi*f0*2.7*tt) * env(n, 0.001, 0.05)
    save(f'thunk{i}.wav', x, 0.8)

# 7. coin dings: rising pentatonic scale (bell = sine + inharmonic partials)
scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.7, 1318.5, 1568.0, 1760.0]
for i, f0 in enumerate(scale):
    tt = t(0.9); n = len(tt)
    x = (np.sin(2*np.pi*f0*tt) + 0.35*np.sin(2*np.pi*f0*2.76*tt)*env(n, 0, 0.12) + 0.2*np.sin(2*np.pi*f0*5.4*tt)*env(n, 0, 0.05))
    save(f'ding{i}.wav', x * env(n, 0.002, 0.28), 0.5)

# 8. low boom (impact)
tt = t(2.2); f = 30 + 60*np.exp(-tt*6)
x = np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.003, 0.7)
x += 0.5*lowpass(rng.standard_normal(len(tt)), 250) * env(len(tt), 0.001, 0.15)
save('boom.wav', x, 0.95)

# 9. shimmer (doubt removed: rising sparkle)
d = 1.4; tt = t(d); n = len(tt); x = np.zeros(n)
for k in range(14):
    st = int(k * n / 18); f0 = 900 * 2**(k/7)
    seg = tt[:n-st]; x[st:] += np.sin(2*np.pi*f0*seg) * np.exp(-seg/0.35) * 0.5
x *= np.minimum(1, (d - tt)/0.3)
save('shimmer.wav', x, 0.45)

# 10. sad falling tone
tt = t(1.2); f = 330 * 2**(-tt*0.6)
save('fall.wav', np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(tt), 0.05, 0.5), 0.35)

# 11. final bright ping (loop point)
tt = t(1.5); n = len(tt)
x = np.sin(2*np.pi*3136*tt) + 0.3*np.sin(2*np.pi*6272*tt)*env(n, 0, 0.2)
save('ping.wav', x * env(n, 0.001, 0.4), 0.4)

# 12. wobble creak (feature tower wobbling)
tt = t(0.8); f = 140 + 40*np.sin(2*np.pi*3*tt)
x = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * 0.3
save('creak.wav', lowpass(x, 700) * np.sin(np.pi*np.linspace(0, 1, len(tt))), 0.35)
print(sorted(os.listdir(OUT)))
