"""Places separately-recorded voice lines so each one starts on the song's beat grid.
Line 0 is the hook (no beat); the beat drops right after it; the last line is the strip-down.
Usage: python3 scripts/place_lines_on_beat.py <dir with lineNN.wav + lines.json> <timeline.json out>"""
import sys, json, wave, glob, numpy as np
BEAT = 0.8892
d = sys.argv[1]; lines = json.load(open(f'{d}/lines.json'))
def load(p):
    w = wave.open(p); sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch).mean(1) / 32768
    e = np.sqrt(np.convolve(x ** 2, np.ones(int(0.01 * sr)) / int(0.01 * sr), 'same')); idx = np.nonzero(e > 0.01)[0]
    a, b = max(0, idx[0] - int(0.02 * sr)), min(len(x), idx[-1] + int(0.06 * sr))
    return x[a:b], sr
clips = [load(f'{d}/line{i:02}.wav') for i in range(len(lines))]
sr = clips[0][1]; out = np.zeros(int(90 * sr), np.float32); placed = []; drop = None; t = 0.25
for i, (x, _) in enumerate(clips):
    if i > 0:
        prev_end = placed[-1]['end']
        if drop is None: drop = prev_end + 0.15
        step = BEAT if lines[i]['scene'] else BEAT / 2
        t = drop + max(0, np.ceil((prev_end + 0.15 - drop) / step - 1e-9)) * step
    i0 = int(round(t * sr)); out[i0:i0 + len(x)] += x
    placed.append({'k': i, 'start': round(float(t), 3), 'end': round(float(t + len(x) / sr), 3), 'text': lines[i]['text']})
end = placed[-1]['end'] + 2.2; out = out[:int(end * sr)]
with wave.open(f'{d}/voiceover.wav', 'wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
tl = {'beat': BEAT, 'drop': round(float(drop), 3), 'strip': placed[-1]['start'], 'end': round(float(end), 2), 'phrases': placed}
json.dump(tl, open(sys.argv[2], 'w'), indent=1)
for p in placed: print(p['start'], p['end'], p['text'][:50])
print('drop', tl['drop'], 'strip', tl['strip'], 'end', tl['end'], 'strip beats', round((tl['strip'] - tl['drop']) / BEAT, 3))
