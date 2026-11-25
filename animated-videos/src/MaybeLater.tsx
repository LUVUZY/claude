import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import songGrid from './song-grid.json';
import voWords from './vo-words.json';
import {Captions, buildChunks} from './Captions';

const CAPTIONS = buildChunks(voWords, {'23.61': 'more'});

// "Maybe Later": a buyer-psychology reel in the cryothum style
// (black and white, blob figures, thin glowing outlines, spotlights, dotted grid, voiceover-led).
// All timings are in seconds of the voiceover (public/vo/voiceover.wav, voice "Jane"), timed with Whisper.

export const MAYBE_LATER_FRAMES = 1830; // 61s at 30fps
export const FPS = 30;
export const fr = (sec: number) => Math.round(sec * FPS);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const W = '#EDEDED';
export const DIM = '#5E5E63';
export const FONT = 'Inter, sans-serif';
export const glow = (a = 0.45, r = 24) => `drop-shadow(0 0 ${r}px rgba(255,255,255,${a}))`;
export const FLOOR = 1500;
// music structure (copied from cryothum): hook with no beat, drop when the hook line ends,
// steady beat under the argument, beat strips out for the conclusion.
// beat grid of "meaningful love - instrumental" (Silo, Steven Cranberry), measured from the song
export const DROP = songGrid.drop;
export const STRIP = songGrid.strip;
const BEAT = songGrid.beat; // 0.889s = 67.5 BPM, hi-hats in double time
const TEXT = 1.3; // global text size boost (v1 text was too small on a phone)

// ---------- time helpers (absolute seconds, read from the global frame) ----------
export const useSec = () => useCurrentFrame() / FPS;
export const pop = (sec: number, at: number, damping = 12) => spring({frame: fr(sec - at), fps: FPS, config: {damping, mass: 0.6}});
export const ramp = (sec: number, a: number, b: number, from = 0, to = 1, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(sec, [a, b], [from, to], {...clamp, easing: ease});

// ---------- scene shots with whip transitions + real motion blur during the whip ----------
const WHIP = 0.28; // seconds each side of a cut
export const ShotInner: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]}> = ({start, end, children, zoom}) => {
  const s = useSec();
  const enter = ramp(s, start - WHIP, start + WHIP, 1, 0, Easing.out(Easing.cubic));
  const exit = ramp(s, end - WHIP, end + WHIP, 0, 1, Easing.in(Easing.cubic));
  const x = (enter - exit) * 1150;
  const z = zoom ? interpolate(s, [start, end], zoom, clamp) : 1;
  return <AbsoluteFill style={{translate: `${x}px 0`, scale: z}}>{children}</AbsoluteFill>;
};

export const Shot: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; first?: boolean; last?: boolean; total?: number}> = ({
  start,
  end,
  children,
  zoom,
  first,
  last,
  total = MAYBE_LATER_FRAMES,
}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const from = first ? 0 : fr(start - WHIP);
  const to = last ? total : fr(end + WHIP);
  if (frame < from || frame >= to) return null;
  const inner = (
    <ShotInner start={first ? -10 : start} end={last ? 999 : end} zoom={zoom}>
      {children}
    </ShotInner>
  );
  const whipping = (!first && Math.abs(s - start) < WHIP) || (!last && Math.abs(s - end) < WHIP);
  return whipping ? (
    <CameraMotionBlur shutterAngle={300} samples={10}>
      {inner}
    </CameraMotionBlur>
  ) : (
    inner
  );
};

// ---------- building blocks ----------
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#09090A'}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.6px, transparent 1.8px)', backgroundSize: '46px 46px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,255,255,0.05), transparent 70%)'}} />
    <Dust />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)'}} />
  </AbsoluteFill>
);

export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const Dust: React.FC = () => {
  const s = useSec();
  return (
    <>
      {Array.from({length: 46}, (_, i) => {
        const x = rand(i) * 1080 + Math.sin(s * 0.3 + i) * 18;
        const y = (((rand(i + 50) * 1920 - s * (14 + rand(i + 99) * 22)) % 1920) + 1920) % 1920;
        const r = 1.5 + rand(i + 7) * 2.5;
        const a = 0.08 + 0.18 * (0.5 + 0.5 * Math.sin(s * (0.8 + rand(i + 3)) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: `rgba(255,255,255,${a})`, filter: 'blur(0.6px)'}} />;
      })}
    </>
  );
};

// a short punch on every beat between the drop and the strip-down
const beatPulse = (sec: number) => {
  if (sec < DROP || sec > STRIP) return 0;
  const since = (sec - DROP) % BEAT;
  const half = (sec - DROP) % (BEAT / 2);
  return Math.max(Math.exp(-since / 0.1), 0.35 * Math.exp(-half / 0.07));
};

export const Floor: React.FC<{y?: number}> = ({y = FLOOR}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: y,
      height: 3,
      backgroundImage: 'linear-gradient(90deg, rgba(237,237,237,0.45) 55%, transparent 55%)',
      backgroundSize: '26px 3px',
    }}
  />
);

export const Spotlight: React.FC<{x: number; width?: number; strength?: number; to?: number}> = ({x, width = 520, strength = 1, to = FLOOR}) => (
  <>
    {/* faint beam */}
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: 0,
        width,
        height: to + 40,
        background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${0.045 * strength}) 100%)`,
        clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)',
        filter: 'blur(28px)',
      }}
    />
    {/* soft pool of light on the floor */}
    <div
      style={{
        position: 'absolute',
        left: x - width * 0.75,
        top: to - 160,
        width: width * 1.5,
        height: 320,
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${0.10 * strength}) 0%, rgba(255,255,255,0) 70%)`,
      }}
    />
  </>
);

type Arms = 'none' | 'up' | 'point';
export const Blob: React.FC<{x: number; y?: number; scale?: number; arms?: Arms; dim?: number; squash?: number}> = ({x, y = FLOOR, scale = 1, arms = 'none', dim = 0, squash = 0}) => {
  const c = dim > 0 ? `rgb(${237 - dim * 150},${237 - dim * 150},${237 - dim * 145})` : W;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, scale: `${scale}`}}>
      <div style={{position: 'absolute', left: -110, top: -14, width: 220, height: 28, borderRadius: '50%', border: '3px dashed rgba(237,237,237,0.35)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, filter: dim > 0.5 ? 'none' : glow(0.35, 30), scale: `${1 + squash * 0.12} ${1 - squash * 0.15}`, transformOrigin: '0 0'}}>
        {arms === 'up' && (
          <>
            <div style={{position: 'absolute', left: -128, top: -205, width: 30, height: 140, borderRadius: 15, background: c, rotate: '-38deg', transformOrigin: '50% 100%'}} />
            <div style={{position: 'absolute', left: 98, top: -205, width: 30, height: 140, borderRadius: 15, background: c, rotate: '38deg', transformOrigin: '50% 100%'}} />
          </>
        )}
        {arms === 'point' && <div style={{position: 'absolute', left: 40, top: -150, width: 150, height: 30, borderRadius: 15, background: c, rotate: '-12deg'}} />}
        <div style={{position: 'absolute', left: -80, top: -180, width: 160, height: 180, borderRadius: '80px 80px 22px 22px', background: c}} />
        <div style={{position: 'absolute', left: -56, top: -306, width: 112, height: 112, borderRadius: 56, background: c}} />
      </div>
    </div>
  );
};

export const Label: React.FC<{x: number; y: number; text: string; size?: number; at?: number; color?: string; spacing?: number; weight?: number; align?: 'center' | 'left'}> = ({
  x,
  y,
  text,
  size = 30,
  at = -99,
  color = W,
  spacing = 5,
  weight = 800,
  align = 'center',
}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 14);
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? x - 500 : x,
        width: align === 'center' ? 1000 : undefined,
        top: y,
        textAlign: align,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size * TEXT,
        letterSpacing: spacing,
        color,
        opacity: Math.min(1, p * 1.5),
        translate: `0 ${(1 - p) * 24}px`,
        filter: color === W ? glow(0.3, 14) : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

export const Outline: React.FC<{x: number; y: number; w: number; h: number; at?: number; r?: number; dim?: number; children?: React.ReactNode; fill?: string}> = ({
  x,
  y,
  w,
  h,
  at = -99,
  r = 22,
  dim = 0,
  children,
  fill = 'rgba(9,9,10,0.9)',
}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 13);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: r,
        border: `4px solid ${dim > 0.5 ? DIM : W}`,
        background: fill,
        scale: `${0.85 + 0.15 * p}`,
        opacity: Math.min(1, p * 1.4) * (1 - dim * 0.5),
        filter: dim > 0.5 ? undefined : glow(0.28, 18),
      }}
    >
      {children}
    </div>
  );
};

export const Check: React.FC<{size?: number}> = ({size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 44 44">
    <circle cx={22} cy={22} r={19} fill="none" stroke={W} strokeWidth={4} />
    <path d="M13 23 L19.5 29 L31 16" fill="none" stroke={W} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

// ---------- scene 1: hook — carts leaving, a lost-sales counter climbing ----------
export const Cart: React.FC<{size?: number; color?: string}> = ({size = 64, color = W}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 80 64">
    <path d="M4 6 H16 L24 42 H66 L74 16 H20" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={30} cy={54} r={6} fill={color} />
    <circle cx={60} cy={54} r={6} fill={color} />
  </svg>
);

const HookChart: React.FC = () => {
  const s = useSec();
  const lost = ramp(s, 0, 3.9, 0, 48312, Easing.in(Easing.quad)) + (Math.floor(s * 30) % 3) * 9;
  const nowhere = s >= 2.8 ? pop(s, 2.8, 10) : 0;
  const carts = Array.from({length: 26}, (_, i) => 0.05 + i * 0.14);
  return (
    <AbsoluteFill>
      <Spotlight x={330} width={760} strength={1.4} />
      {/* lost sales counter, big like cryothum's NET WORTH */}
      <Label x={540} y={250} text="LOST SALES" size={30} spacing={8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: W, letterSpacing: 2, filter: glow(0.5, 30)}}>
        {money(lost)}
      </div>
      {/* desk + laptop */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glow(0.3, 16)}} width={1080} height={1920}>
        <rect x={250} y={1130} width={300} height={190} rx={14} fill="rgba(9,9,10,0.95)" stroke={W} strokeWidth={5} />
        <rect x={278} y={1158} width={244} height={134} rx={6} fill="none" stroke={W} strokeWidth={3} opacity={0.6} />
        <line x1={230} y1={1330} x2={570} y2={1330} stroke={W} strokeWidth={6} strokeLinecap="round" />
        <line x1={150} y1={1330} x2={640} y2={1330} stroke={W} strokeWidth={6} />
        <line x1={170} y1={1330} x2={170} y2={FLOOR} stroke={W} strokeWidth={5} />
        <line x1={620} y1={1330} x2={620} y2={FLOOR} stroke={W} strokeWidth={5} />
      </svg>
      <Blob x={120} scale={1.25} arms="point" />
      {/* carts leave the screen: one in five goes to a competitor, the rest go nowhere */}
      {carts.map((t0, i) => {
        if (s < t0) return null;
        const p = ramp(s, t0, t0 + 1.25, 0, 1, Easing.inOut(Easing.quad));
        const toComp = i % 5 === 2;
        const tx = toComp ? 880 : 760 + rand(i) * 260;
        const ty = toComp ? 1400 : 620 + rand(i + 9) * 260;
        const x = interpolate(p, [0, 1], [400, tx]);
        const y = interpolate(p, [0, 1], [1200, ty]) - Math.sin(p * Math.PI) * (toComp ? 120 : 320);
        const fade = toComp ? 1 - ramp(s, t0 + 1.1, t0 + 1.3) : 1 - p * p;
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 40, opacity: fade, scale: `${toComp ? 1 : 1 - p * 0.6}`, rotate: `${(rand(i + 3) - 0.5) * 60 * p}deg`, filter: glow(0.4, 12)}}>
            <Cart size={100} />
          </div>
        );
      })}
      {/* where they went */}
      <div style={{position: 'absolute', left: 800, top: 1340, width: 160, height: 120, border: `4px solid ${W}`, borderRadius: 16, opacity: s > 1.6 ? pop(s, 1.6) : 0, filter: glow(0.3, 14)}} />
      <Label x={880} y={1480} text="COMPETITORS" size={20} spacing={3} at={1.9} />
      <div
        style={{
          position: 'absolute',
          left: 700,
          top: 560,
          width: 380,
          height: 380,
          borderRadius: 190,
          background: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0.6) 55%, rgba(255,255,255,0.10) 68%, transparent 72%)',
          opacity: nowhere,
          scale: `${0.6 + 0.4 * nowhere}`,
        }}
      />
      <Label x={890} y={960} text="NOWHERE" size={44} spacing={6} at={2.8} />
    </AbsoluteFill>
  );
};

// ---------- scene 2: the real competitor is doing nothing ----------
const Couch: React.FC<{x: number; y: number; lit: number}> = ({x, y, lit}) => (
  <svg style={{position: 'absolute', left: x - 190, top: y - 200, overflow: 'visible', filter: glow(0.2 + 0.4 * lit, 20 + 20 * lit)}} width={380} height={200}>
    <rect x={20} y={20} width={340} height={120} rx={36} fill="rgba(9,9,10,0.9)" stroke={W} strokeWidth={4} />
    <rect x={0} y={80} width={70} height={100} rx={30} fill="rgba(9,9,10,0.95)" stroke={W} strokeWidth={4} />
    <rect x={310} y={80} width={70} height={100} rx={30} fill="rgba(9,9,10,0.95)" stroke={W} strokeWidth={4} />
    <rect x={60} y={118} width={260} height={62} rx={16} fill="rgba(9,9,10,0.95)" stroke={W} strokeWidth={4} />
  </svg>
);

const DoNothing: React.FC = () => {
  const s = useSec();
  const toCouch = ramp(s, 8.0, 8.6);
  const bx = interpolate(toCouch, [0, 1], [540, 800]);
  const by = interpolate(toCouch, [0, 1], [FLOOR, FLOOR - 70]);
  const sit = s > 8.55 && s < 8.8 ? 1 : 0;
  const productDim = ramp(s, 8.2, 8.9);
  return (
    <AbsoluteFill>
      <Spotlight x={540} strength={1 - toCouch * 0.6} />
      <Spotlight x={800} strength={toCouch} width={600} />
      {/* product page */}
      <Outline x={60} y={860} w={330} h={420} at={4.3} dim={productDim}>
        <div style={{margin: 30, height: 170, borderRadius: 14, border: `3px solid ${productDim > 0.5 ? DIM : W}`}} />
        <div style={{margin: '0 30px', height: 16, borderRadius: 8, background: productDim > 0.5 ? DIM : W, width: '70%'}} />
        <div style={{margin: '16px 30px', height: 16, borderRadius: 8, background: productDim > 0.5 ? DIM : W, width: '45%'}} />
        <div
          style={{
            margin: '28px 30px 0',
            height: 64,
            borderRadius: 32,
            background: productDim > 0.5 ? DIM : W,
            color: '#09090A',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          BUY NOW
        </div>
      </Outline>
      <Label x={225} y={1300} text="YOUR PRODUCT" size={22} spacing={3} at={4.5} color={productDim > 0.5 ? DIM : W} />
      <Couch x={800} y={FLOOR} lit={toCouch} />
      <Label x={800} y={1520} text="DOING NOTHING" size={24} spacing={4} at={7.9} />
      {/* "your real competitor" tag */}
      <Label x={800} y={800} text="YOUR REAL" size={34} at={6.45} />
      <Label x={800} y={845} text="COMPETITOR" size={52} spacing={3} at={6.6} />
      {s > 6.7 && <div style={{position: 'absolute', left: 798, top: 920, width: 4, height: interpolate(pop(s, 6.7), [0, 1], [0, 90]), background: W, filter: glow(0.4, 10)}} />}
      <Blob x={bx} y={by} squash={sit} />
      {/* why doing nothing wins */}
      {[
        {t: 10.36, txt: 'COSTS $0'},
        {t: 11.23, txt: 'FAMILIAR'},
        {t: 12.41, txt: "CAN'T GO WRONG"},
      ].map((r, i) =>
        s >= r.t ? (
          <div key={r.txt} style={{position: 'absolute', left: 520, top: 520 + i * 92, display: 'flex', alignItems: 'center', gap: 22, opacity: pop(s, r.t), translate: `${(1 - pop(s, r.t)) * 40}px 0`, filter: glow(0.35, 14)}}>
            <Check />
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 3, color: W}}>{r.txt}</div>
          </div>
        ) : null,
      )}
      <Label x={240} y={560} text="DOING" size={34} at={9.2} />
      <Label x={240} y={605} text="NOTHING" size={52} at={9.35} />
    </AbsoluteFill>
  );
};

// ---------- the balance scale (used twice) ----------
type Weight = {label: string; side: 'L' | 'R'; in: number; out?: number; mass: number; doubtAt?: number; ghost?: boolean};
const PIVOT = {x: 540, y: 760};
const ARM = 330;

const Scale: React.FC<{weights: Weight[]; leftLabel: string; rightLabel: string; labelsAt?: number; verdict?: {at: number; text: string}}> = ({
  weights,
  leftLabel,
  rightLabel,
  verdict,
}) => {
  const s = useSec();
  // each weight contributes smoothly as it lands and leaves
  let torque = 0;
  for (const w of weights) {
    const on = pop(s, w.in + 0.25, 10) - (w.out !== undefined ? pop(s, w.out, 12) : 0);
    torque += (w.side === 'R' ? 1 : -1) * w.mass * Math.max(0, on);
  }
  const angle = Math.max(-17, Math.min(17, torque * 6));
  const a = (angle * Math.PI) / 180;
  const ends = {
    L: {x: PIVOT.x - Math.cos(a) * ARM, y: PIVOT.y - Math.sin(a) * ARM},
    R: {x: PIVOT.x + Math.cos(a) * ARM, y: PIVOT.y + Math.sin(a) * ARM},
  };
  const PAN_DROP = 300;
  const pan = (side: 'L' | 'R') => ({x: ends[side].x, y: ends[side].y + PAN_DROP});
  const stack: Record<'L' | 'R', number> = {L: 0, R: 0};
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glow(0.3, 16)}} width={1080} height={1920}>
        {/* stand */}
        <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={FLOOR - 20} stroke={W} strokeWidth={6} />
        <path d={`M${PIVOT.x - 120} ${FLOOR} L${PIVOT.x + 120} ${FLOOR} L${PIVOT.x + 60} ${FLOOR - 30} L${PIVOT.x - 60} ${FLOOR - 30} Z`} fill="none" stroke={W} strokeWidth={5} />
        <polygon points={`${PIVOT.x},${PIVOT.y - 34} ${PIVOT.x - 26},${PIVOT.y + 8} ${PIVOT.x + 26},${PIVOT.y + 8}`} fill={W} />
        {/* beam */}
        <line x1={ends.L.x} y1={ends.L.y} x2={ends.R.x} y2={ends.R.y} stroke={W} strokeWidth={8} strokeLinecap="round" />
        {(['L', 'R'] as const).map((side) => {
          const p = pan(side);
          return (
            <g key={side}>
              <line x1={ends[side].x} y1={ends[side].y} x2={p.x - 130} y2={p.y} stroke={W} strokeWidth={3} />
              <line x1={ends[side].x} y1={ends[side].y} x2={p.x + 130} y2={p.y} stroke={W} strokeWidth={3} />
              <path d={`M${p.x - 150} ${p.y} Q${p.x} ${p.y + 70} ${p.x + 150} ${p.y}`} fill="rgba(9,9,10,0.9)" stroke={W} strokeWidth={5} />
            </g>
          );
        })}
      </svg>
      {/* weights sitting in the pans */}
      {weights.map((w) => {
        if (s < w.in) return null;
        const p = pan(w.side);
        const slot = stack[w.side]++;
        const land = pop(s, w.in, 11);
        const leave = w.out !== undefined ? ramp(s, w.out, w.out + 0.45, 0, 1, Easing.in(Easing.cubic)) : 0;
        if (leave >= 1) {
          stack[w.side]--;
          return null;
        }
        const restY = p.y - 18 - (slot + 1) * 70;
        const y = interpolate(land, [0, 1], [restY - 500, restY]) - leave * 700;
        const doubt = w.doubtAt !== undefined && s >= w.doubtAt ? pop(s, w.doubtAt, 9) : 0;
        return (
          <div
            key={w.label}
            style={{
              position: 'absolute',
              left: p.x - 125,
              top: y,
              width: 250,
              height: 62,
              borderRadius: 14,
              background: w.ghost ? 'rgba(9,9,10,0.9)' : W,
              border: `4px solid ${W}`,
              color: w.ghost ? W : '#09090A',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 21,
              letterSpacing: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1 - leave,
              filter: glow(0.4, 16),
              rotate: `${(slot % 2 ? 1 : -1) * 2}deg`,
            }}
          >
            {w.label}
            {doubt > 0 && (
              <div
                style={{
                  position: 'absolute',
                  right: -18,
                  top: -20,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: '#09090A',
                  border: `3px solid ${W}`,
                  color: W,
                  fontSize: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  scale: `${doubt}`,
                }}
              >
                ?
              </div>
            )}
          </div>
        );
      })}
      <Label x={pan('L').x} y={pan('L').y + 60} text={leftLabel} size={22} spacing={3} />
      <Label x={pan('R').x} y={pan('R').y + 60} text={rightLabel} size={22} spacing={3} />
      {verdict && <Label x={540} y={1560} text={verdict.text} size={44} spacing={4} at={verdict.at} />}
    </AbsoluteFill>
  );
};

const RiskScale: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      <Label x={540} y={330} text="THE QUIET TEST" size={56} spacing={4} at={21.4} />
      <Label x={540} y={410} text="IS STAYING MORE PAINFUL THAN CHANGING?" size={26} spacing={2} at={22.6} weight={600} />
      <Scale
        leftLabel="PAIN OF STAYING"
        rightLabel="RISK OF CHANGING"
        weights={[
          {label: 'THE PROBLEM', side: 'L', in: 13.5, mass: 1.5},
          {label: 'WASTED MONEY', side: 'R', in: 15.88, mass: 1},
          {label: 'WASTED TIME', side: 'R', in: 17.02, mass: 1},
          {label: 'LOOKING STUPID', side: 'R', in: 18.2, mass: 1},
        ]}
        verdict={{at: 23.9, text: s > 23.9 ? 'RISK WINS' : ''}}
      />
      <Label x={540} y={1560} text="BUYING MEANS RISK" size={30} spacing={4} at={14.6} color={s > 23.9 ? 'transparent' : W} />
    </AbsoluteFill>
  );
};

// ---------- scene: maybe later ----------
const MaybeLaterScene: React.FC = () => {
  const s = useSec();
  const close = ramp(s, 28.0, 28.35, 1, 0, Easing.in(Easing.back(1.6)));
  const stamp = s > 28.2 ? pop(s, 28.2, 9) : 0;
  const walk = ramp(s, 29.3, 30.6, 0, 1, Easing.in(Easing.quad));
  const days = Math.round(ramp(s, 29.43, 30.4, 1, 90, Easing.in(Easing.quad)));
  return (
    <AbsoluteFill>
      <Spotlight x={540} strength={1 - walk * 0.5} />
      <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 560, scale: `${close}`, opacity: close, transformOrigin: '50% 50%'}}>
        <Outline x={0} y={0} w={800} h={560}>
          <div style={{height: 58, borderBottom: `3px solid ${W}`, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 24}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 16, height: 16, borderRadius: 8, border: `3px solid ${W}`}} />
            ))}
            <div style={{marginLeft: 'auto', marginRight: 24, fontFamily: FONT, fontWeight: 800, color: W, fontSize: 30}}>✕</div>
          </div>
          <div style={{display: 'flex', gap: 30, padding: 36}}>
            <div style={{width: 230, height: 230, borderRadius: 18, border: `3px solid ${W}`}} />
            <div style={{flex: 1}}>
              <div style={{height: 18, borderRadius: 9, background: W, width: '80%', marginTop: 20}} />
              <div style={{height: 18, borderRadius: 9, background: W, width: '50%', marginTop: 20}} />
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: W, marginTop: 30}}>IN CART (1)</div>
            </div>
          </div>
          <div
            style={{
              margin: '0 36px',
              height: 80,
              borderRadius: 40,
              background: W,
              color: '#09090A',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 32,
              letterSpacing: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            CHECKOUT
          </div>
        </Outline>
      </div>
      {/* the buyer hesitates, then leaves */}
      <Blob x={540 + walk * 700} arms={s > 25.4 && s < 27.6 ? 'point' : 'none'} dim={walk * 0.8} />
      <Label x={540} y={360} text={s < 27.6 ? 'NOT A NO.' : ''} size={56} spacing={4} at={26.6} />
      {stamp > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 330,
            top: 700,
            width: 660,
            height: 150,
            border: `8px solid ${W}`,
            borderRadius: 16,
            color: W,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 76,
            letterSpacing: 4,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            rotate: '-8deg',
            scale: `${interpolate(stamp, [0, 1], [2.2, 1])}`,
            opacity: Math.min(1, stamp * 2),
            filter: glow(0.6, 30),
          }}
        >
          MAYBE LATER
        </div>
      )}
      {s >= 29.43 && (
        <>
          <Label x={540} y={1000} text="DAYS SINCE LAST VISIT" size={24} spacing={4} at={29.43} />
          <Label x={540} y={1040} text={String(days)} size={110} spacing={2} at={29.43} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- two sellers ----------
export const Stall: React.FC<{x: number; dim?: number; lit?: number}> = ({x, dim = 0, lit = 0}) => {
  const c = dim > 0.5 ? DIM : W;
  return (
    <svg style={{position: 'absolute', left: x - 200, top: FLOOR - 560, overflow: 'visible', filter: dim > 0.5 ? undefined : glow(0.25 + lit * 0.35, 18 + lit * 24)}} width={400} height={560}>
      <line x1={30} y1={60} x2={30} y2={560} stroke={c} strokeWidth={5} />
      <line x1={370} y1={60} x2={370} y2={560} stroke={c} strokeWidth={5} />
      <path d="M0 60 L400 60 L400 120 Q375 150 350 120 Q325 150 300 120 Q275 150 250 120 Q225 150 200 120 Q175 150 150 120 Q125 150 100 120 Q75 150 50 120 Q25 150 0 120 Z" fill="rgba(9,9,10,0.95)" stroke={c} strokeWidth={5} />
      <rect x={10} y={360} width={380} height={200} rx={10} fill="rgba(9,9,10,0.95)" stroke={c} strokeWidth={5} />
    </svg>
  );
};

export const ProductBox: React.FC<{x: number; y: number; dim?: number}> = ({x, y, dim = 0}) => (
  <div style={{position: 'absolute', left: x - 60, top: y - 100, width: 120, height: 100, borderRadius: 12, border: `4px solid ${dim > 0.5 ? DIM : W}`, background: 'rgba(9,9,10,0.95)'}}>
    <div style={{height: 22, borderBottom: `4px solid ${dim > 0.5 ? DIM : W}`}} />
  </div>
);

const TwoSellersScene: React.FC = () => {
  const s = useSec();
  const cards = [
    {t: 35.32, txt: '+ FEATURES'},
    {t: 36.19, txt: '+ BONUSES'},
    {t: 37.0, txt: '− 40% OFF'},
  ];
  return (
    <AbsoluteFill>
      <Spotlight x={270} />
      <Spotlight x={810} />
      <Label x={540} y={420} text="SAME PRODUCT" size={44} spacing={5} at={32.2} />
      <Label x={270} y={1560} text="SELLER 1" size={24} spacing={4} at={31.4} />
      <Label x={810} y={1560} text="SELLER 2" size={24} spacing={4} at={31.6} />
      <Stall x={270} />
      <Stall x={810} />
      <Blob x={270} y={FLOOR - 230} scale={0.75} />
      <Blob x={810} y={FLOOR - 230} scale={0.75} />
      <ProductBox x={270} y={FLOOR - 200} />
      <ProductBox x={810} y={FLOOR - 200} />
      {/* seller 1 piles on more */}
      {cards.map((c, i) =>
        s >= c.t ? (
          <div
            key={c.txt}
            style={{
              position: 'absolute',
              left: 270 - 120 + (i % 2 ? 14 : -10),
              top: interpolate(pop(s, c.t, 11), [0, 1], [300, FLOOR - 372 - i * 66]),
              width: 240,
              height: 62,
              borderRadius: 14,
              background: W,
              color: '#09090A',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              rotate: `${(i % 2 ? 1 : -1) * 4}deg`,
              filter: glow(0.45, 18),
            }}
          >
            {c.txt}
          </div>
        ) : null,
      )}
      <Label x={270} y={560} text="MORE" size={64} spacing={4} at={34.7} />
    </AbsoluteFill>
  );
};

// more on the scale = more doubt, then seller 2 takes risk away
const FixScale: React.FC = () => {
  const s = useSec();
  const goods = [
    {t: 43.86, txt: 'PROOF IT WORKS'},
    {t: 45.26, txt: 'CLEAR PICTURE'},
    {t: 47.47, txt: 'EASY WAY OUT'},
  ];
  return (
    <AbsoluteFill>
      <Label x={540} y={330} text={s < 42.2 ? 'MORE = MORE TO DOUBT' : 'LESS RISK'} size={52} spacing={3} at={s < 42.2 ? 39.6 : 42.4} />
      <Scale
        leftLabel="PAIN OF STAYING"
        rightLabel="RISK OF CHANGING"
        weights={[
          {label: 'THE PROBLEM', side: 'L', in: 37.9, mass: 1.5},
          {label: 'WASTED MONEY', side: 'R', in: 37.9, out: 43.86, mass: 1},
          {label: 'WASTED TIME', side: 'R', in: 37.9, out: 45.26, mass: 1},
          {label: 'LOOKING STUPID', side: 'R', in: 37.9, out: 47.47, mass: 1},
          {label: '+ FEATURES', side: 'R', in: 38.6, out: 43.13, mass: 0.35, doubtAt: 40.33, ghost: true},
          {label: '+ BONUSES', side: 'R', in: 38.9, out: 43.13, mass: 0.35, doubtAt: 40.6, ghost: true},
          {label: '− 40% OFF', side: 'R', in: 39.2, out: 43.13, mass: 0.35, doubtAt: 40.9, ghost: true},
        ]}
        verdict={{at: 48.4, text: 'THEY BUY'}}
      />
      {goods.map((g, i) =>
        s >= g.t ? (
          <div key={g.txt} style={{position: 'absolute', left: 120, top: 440 + i * 78, display: 'flex', alignItems: 'center', gap: 20, opacity: pop(s, g.t), filter: glow(0.4, 14)}}>
            <Check size={40} />
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: W}}>{g.txt}</div>
          </div>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

// ---------- same product, only one feels safe ----------
const SafeScene: React.FC = () => {
  const s = useSec();
  const rev = ramp(s, 50.2, 53.4, 0, 84210, Easing.out(Easing.quad)) + (Math.floor(s * 30) % 3) * 7;
  const buyers = [49.6, 50.2, 50.8, 51.4];
  return (
    <AbsoluteFill>
      <Spotlight x={270} strength={0.25} />
      <Spotlight x={810} strength={1.4} width={640} />
      <Stall x={270} dim={1} />
      <Stall x={810} lit={1} />
      <Blob x={270} y={FLOOR - 230} scale={0.75} dim={0.8} />
      <Blob x={810} y={FLOOR - 230} scale={0.75} />
      <ProductBox x={270} y={FLOOR - 200} dim={1} />
      <ProductBox x={810} y={FLOOR - 200} />
      {buyers.map((t, i) => {
        if (s < t) return null;
        const x = interpolate(ramp(s, t, t + 0.9, 0, 1, Easing.out(Easing.cubic)), [0, 1], [1200, 760 + i * 0]);
        return <Blob key={t} x={x + i * 70 + 80} y={FLOOR + 60} scale={0.5} />;
      })}
      <Label x={270} y={1512} text="REVENUE" size={22} spacing={4} color={DIM} />
      <Label x={270} y={1544} text="$0" size={56} color={DIM} />
      <Label x={810} y={1512} text="REVENUE" size={22} spacing={4} />
      <Label x={810} y={1544} text={money(s > 50.2 ? rev : 0)} size={56} />
      <Label x={810} y={760} text="YES" size={110} spacing={6} at={52.4} />
      <Label x={540} y={420} text="FEELS SAFE" size={52} spacing={4} at={51.5} />
    </AbsoluteFill>
  );
};

// ---------- the line to remember ----------
const Remember: React.FC = () => {
  const s = useSec();
  const l1 = ['PEOPLE', "DON'T", 'BUY', 'THE', 'BEST', 'PRODUCT.'];
  const l1t = [55.86, 56.28, 56.64, 56.86, 57.2, 57.37];
  const l2 = ['THEY', 'BUY', 'THE', 'ONE', 'THAT', 'FEELS', 'SAFEST.'];
  const l2t = [57.99, 58.13, 58.26, 58.41, 58.58, 58.79, 59.05];
  const word = (w: string, t: number, big: boolean) => (
    <span key={w + t} style={{display: 'inline-block', marginRight: 22, opacity: s >= t ? pop(s, t, 14) : 0, translate: `0 ${s >= t ? (1 - pop(s, t, 14)) * 20 : 20}px`}}>
      {w}
    </span>
  );
  const walk = ramp(s, 55.5, 60.5, 0, 1, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <Label x={540} y={430} text="IF YOU REMEMBER ONE THING" size={30} spacing={6} at={53.4} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 560, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 66, lineHeight: 1.2, color: '#9C9CA2', letterSpacing: 2}}>
        {l1.map((w, i) => word(w, l1t[i], false))}
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 760, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 80, lineHeight: 1.15, color: W, letterSpacing: 2, filter: glow(0.5, 26)}}>
        {l2.map((w, i) => word(w, l2t[i], true))}
      </div>
      <Spotlight x={720} strength={1.3} />
      <ProductBox x={720} y={FLOOR} />
      <Blob x={180 + walk * 380} scale={0.8} />
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUTS = [4.08, 13.28, 25.24, 30.58, 38.12, 49.24, 53.16];
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.25, src: 'sfx/whoosh.wav', vol: 0.55})),
  {t: 0.1, src: SFX('select-002'), vol: 0.5},
  {t: 1.55, src: SFX('drop-002'), vol: 0.6},
  {t: 2.95, src: SFX('impact-wood-heavy-001'), vol: 0.9},
  {t: 4.35, src: SFX('select-002'), vol: 0.5},
  {t: 6.45, src: SFX('notification-pop'), vol: 0.45},
  {t: 8.5, src: SFX('impact-generic-light-002'), vol: 0.6},
  {t: 10.36, src: SFX('switch-002'), vol: 0.45},
  {t: 11.23, src: SFX('switch-002'), vol: 0.45},
  {t: 12.41, src: SFX('switch-002'), vol: 0.45},
  {t: 13.55, src: SFX('impact-wood-heavy-001'), vol: 0.6},
  {t: 16.1, src: SFX('impact-wood-heavy-001'), vol: 0.75},
  {t: 17.25, src: SFX('impact-wood-heavy-001'), vol: 0.75},
  {t: 18.45, src: SFX('impact-wood-heavy-001'), vol: 0.75},
  {t: 21.4, src: SFX('notification-pop'), vol: 0.4},
  {t: 23.9, src: SFX('error-002'), vol: 0.5},
  {t: 28.0, src: SFX('close-002'), vol: 0.7},
  {t: 28.2, src: SFX('impact-wood-heavy-001'), vol: 0.9},
  ...Array.from({length: 9}, (_, i) => ({t: 29.45 + i * 0.1, src: SFX('tick-001'), vol: 0.5})),
  {t: 32.2, src: SFX('select-002'), vol: 0.5},
  {t: 35.32, src: SFX('drop-002'), vol: 0.6},
  {t: 36.19, src: SFX('drop-002'), vol: 0.6},
  {t: 37.0, src: SFX('drop-002'), vol: 0.6},
  {t: 38.85, src: SFX('impact-generic-light-002'), vol: 0.5},
  {t: 39.15, src: SFX('impact-generic-light-002'), vol: 0.5},
  {t: 39.45, src: SFX('impact-generic-light-002'), vol: 0.5},
  {t: 40.33, src: SFX('notification-pop'), vol: 0.35},
  {t: 40.6, src: SFX('notification-pop'), vol: 0.35},
  {t: 40.9, src: SFX('notification-pop'), vol: 0.35},
  {t: 43.13, src: 'sfx/whoosh.wav', vol: 0.4},
  {t: 43.86, src: SFX('confirmation-002'), vol: 0.45},
  {t: 45.26, src: SFX('confirmation-002'), vol: 0.45},
  {t: 47.47, src: SFX('confirmation-002'), vol: 0.45},
  {t: 48.4, src: SFX('success-chime'), vol: 0.6},
  {t: 50.2, src: SFX('coin-collect'), vol: 0.45},
  {t: 50.9, src: SFX('coin-collect'), vol: 0.45},
  {t: 51.6, src: SFX('handle-coins'), vol: 0.45},
  {t: 52.4, src: SFX('success-chime'), vol: 0.55},
  {t: 57.99, src: SFX('select-002'), vol: 0.4},
];

// ---------- composition ----------
export const MaybeLater: React.FC<{music?: 'none' | 'demo' | 'guide' | 'song'; captions?: boolean}> = ({music = 'none', captions = true}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fadeOut = interpolate(frame, [MAYBE_LATER_FRAMES - 20, MAYBE_LATER_FRAMES], [1, 0], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: '#09090A'}}>
      <Audio src={staticFile('vo/voiceover.wav')} />
      {music === 'demo' && <Audio src={staticFile('music/demo-beat.wav')} volume={0.55} />}
      {music === 'song' && <Audio src={staticFile('music/song-bed.wav')} volume={0.42} />}
      {music === 'guide' && <Audio src={staticFile('music/beat-guide.wav')} volume={0.6} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Backdrop />
        <AbsoluteFill style={{scale: `${1 + bp * 0.012}`, filter: `brightness(${1 + bp * 0.08})`}}>
        <Floor />
        <Shot start={0} end={4.08} first zoom={[1, 1.05]}>
          <HookChart />
        </Shot>
        <Shot start={4.08} end={13.28} zoom={[1, 1.06]}>
          <DoNothing />
        </Shot>
        <Shot start={13.28} end={25.24} zoom={[1, 1.07]}>
          <RiskScale />
        </Shot>
        <Shot start={25.24} end={30.58}>
          <MaybeLaterScene />
        </Shot>
        <Shot start={30.58} end={38.12} zoom={[1, 1.05]}>
          <TwoSellersScene />
        </Shot>
        <Shot start={38.12} end={49.24} zoom={[1, 1.06]}>
          <FixScale />
        </Shot>
        <Shot start={49.24} end={53.16}>
          <SafeScene />
        </Shot>
        <Shot start={53.16} end={61} last zoom={[1, 1.05]}>
          <Remember />
        </Shot>
        </AbsoluteFill>
        {captions && <Captions chunks={CAPTIONS} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
