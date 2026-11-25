import React from 'react';
import {spring, useCurrentFrame} from 'remotion';

// Word-by-word captions for sound-off viewers.
// Words come from Whisper timings; `fixes` corrects words Whisper misheard (the script is the source of truth).
export type Word = {t: number; w: string};
type Chunk = {start: number; end: number; words: Word[]};

const FPS = 30;
const MAX_WORDS = 3;

export const buildChunks = (raw: Word[], fixes: Record<string, string> = {}, until = Infinity): Chunk[] => {
  const words = raw.filter((x) => x.t < until).map((x) => ({t: x.t, w: fixes[`${x.t}`] ?? x.w}));
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) chunks.push({start: cur[0].t, end: 0, words: cur});
    cur = [];
  };
  words.forEach((wd, i) => {
    cur.push(wd);
    const next = words[i + 1];
    const pause = next ? next.t - wd.t > 0.7 : true;
    if (cur.length >= MAX_WORDS || /[.,?!]$/.test(wd.w) || pause) flush();
  });
  flush();
  chunks.forEach((c, i) => {
    const last = c.words[c.words.length - 1].t;
    const next = chunks[i + 1]?.start ?? last + 0.9;
    c.end = Math.min(next, last + 0.75);
  });
  return chunks;
};

export const toSrt = (chunks: Chunk[]) => {
  const ts = (s: number) => {
    const ms = Math.round(s * 1000);
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), sec = Math.floor((ms % 60000) / 1000), r = ms % 1000;
    const p = (n: number, l = 2) => String(n).padStart(l, '0');
    return `${p(h)}:${p(m)}:${p(sec)},${p(r, 3)}`;
  };
  return chunks.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.words.map((w) => w.w).join(' ')}\n`).join('\n');
};

export const Captions: React.FC<{chunks: Chunk[]; top?: number}> = ({chunks, top = 128}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const chunk = chunks.find((c) => s >= c.start && s < c.end);
  if (!chunk) return null;
  const p = spring({frame: frame - Math.round(chunk.start * FPS), fps: FPS, config: {damping: 14, mass: 0.5}});
  return (
    <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: top + 150, background: 'linear-gradient(180deg, rgba(5,5,6,0.85) 0%, rgba(5,5,6,0.6) 60%, transparent 100%)'}} />
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top,
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 900,
        fontSize: 58,
        letterSpacing: 1,
        lineHeight: 1.1,
        scale: `${0.92 + 0.08 * p}`,
        opacity: Math.min(1, p * 1.6),
      }}
    >
      {chunk.words.map((wd, i) => {
        const nextT = chunk.words[i + 1]?.t ?? chunk.end;
        const active = s >= wd.t && s < nextT;
        const said = s >= wd.t;
        return (
          <React.Fragment key={wd.t}>
          <span
            style={{
              display: 'inline-block',
              margin: '0 12px',
              color: said ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
              textShadow: active
                ? '0 0 26px rgba(255,255,255,0.8), 0 4px 18px rgba(0,0,0,0.9)'
                : '0 4px 18px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
              scale: active ? '1.08' : '1',
            }}
          >
            {wd.w.toUpperCase()}
          </span>{' '}
          </React.Fragment>
        );
      })}
    </div>
    </>
  );
};
