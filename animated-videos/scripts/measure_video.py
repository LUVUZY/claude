"""Measure a reel against the reference averages (18 cryothum videos).
Usage: python3 scripts/measure_video.py <video.mp4> [speech_end_seconds]"""
import sys, subprocess, numpy as np
TARGET = {'black_p5': 2.4, 'mid_p50': 9.8, 'motion': 2.7, 'active_pct': 64, 'cuts_per_min': 8.5}
video = sys.argv[1]
end = float(sys.argv[2]) if len(sys.argv) > 2 else float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout)
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-t', str(end), '-i', video, '-vf', 'fps=10,scale=192:108,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.uint8).reshape(-1, 108, 192).astype(float)
d = np.abs(np.diff(v, axis=0)).mean((1, 2))
got = {
    'black_p5': np.percentile(v, 5),
    'mid_p50': np.percentile(v, 50),
    'motion': d.mean(),
    'active_pct': (d > 1.0).mean() * 100,
    'cuts_per_min': sum(1 for i in range(1, len(d) - 1) if d[i] > 12 and d[i] >= d[i - 1] and d[i] >= d[i + 1]) / (end / 60),
}
for k, t in TARGET.items():
    flag = 'OK ' if abs(got[k] - t) <= max(1.5, t * 0.25) or (k == 'active_pct' and got[k] >= t) else 'FIX'
    print(f'{flag} {k:13} {got[k]:7.2f}   (reference {t})')
# where the video sits still: stretches of 1.5s+ with almost no change
still, start = [], None
for i, x in enumerate(d):
    if x <= 1.0 and start is None: start = i
    if (x > 1.0 or i == len(d) - 1) and start is not None:
        if (i - start) / 10 >= 1.5: still.append((start / 10, i / 10))
        start = None
print('still stretches (s):', ', '.join(f'{a:.1f}-{b:.1f}' for a, b in still) or 'none')
