"""Cuts a voiceover into phrases at its pauses and re-places each phrase so speech starts on the song's beat grid.
Writes public/vo2/voiceover.wav and src/vo2-timeline.json (phrase start/end times, drop and strip)."""
import wave, json, numpy as np
BEAT = 0.8892
CUTS = [0, 2.9, 7.67, 11.55, 13.9, 17.4, 20.2, 24.56, 26.95, 28.37, 29.56, 36.47, 39.19, 41.15, 44.45, 47.41, 49.29, None]
# which phrases start a new scene (placed on a full beat); others go on half-beats
SCENE = {1, 2, 4, 5, 6, 7, 10, 11, 12, 14}
FIRST_ONSET = 0.25
w = wave.open('public/vo2/raw.wav'); sr = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch).mean(1) / 32768
CUTS[-1] = len(x) / sr
win = int(0.01 * sr); e = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, 'same'))
def onset(a, b):
    i0, i1 = int(a * sr), int(b * sr); idx = np.nonzero(e[i0:i1] > 0.01)[0]
    return (i0 + (idx[0] if len(idx) else 0)) / sr
def offset(a, b):
    i0, i1 = int(a * sr), int(b * sr); idx = np.nonzero(e[i0:i1] > 0.01)[0]
    return (i0 + (idx[-1] if len(idx) else i1 - i0)) / sr
phr = []
for k in range(len(CUTS) - 1):
    a, b = CUTS[k], CUTS[k + 1]
    phr.append({'a': a, 'b': b, 'on': onset(a, b), 'off': offset(a, b)})
out_len = int(70 * sr); out = np.zeros(out_len, np.float32)
t_on = FIRST_ONSET; drop = None; placed = []
for k, p in enumerate(phr):
    if k == 0:
        start_on = t_on
    else:
        prev_end = placed[-1]['end']
        if drop is None:
            drop = prev_end + 0.12  # the beat drops right after the hook line
        step = BEAT if k in SCENE else BEAT / 2
        n = np.ceil((prev_end + 0.12 - drop) / step - 1e-9)
        start_on = drop + max(0, n) * step
    shift = start_on - p['on']
    seg = x[int(p['a'] * sr):int(p['b'] * sr)].copy()
    f = int(0.008 * sr); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(round((p['a'] + shift) * sr)); out[i:i + len(seg)] += seg
    placed.append({'k': k, 'start': round(start_on, 3), 'end': round(p['off'] + shift, 3), 'shift': round(shift, 3)})
end = placed[-1]['end'] + 2.2
out = out[:int(end * sr)]
with wave.open('public/vo2/voiceover.wav', 'wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
strip = placed[14]['start']
json.dump({'beat': BEAT, 'drop': round(drop, 3), 'strip': round(strip, 3), 'end': round(end, 2), 'phrases': placed}, open('src/vo2-timeline.json', 'w'), indent=1)
for p in placed: print(p)
print('drop', round(drop, 3), 'strip', round(strip, 3), 'end', round(end, 2))
