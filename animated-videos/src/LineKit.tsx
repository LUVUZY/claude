import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';

// "Premium line" kit: the look of @cps_user / @krynoth_11 (measured from their videos).
// Pure black, thin glowing white strokes, pill labels, one continuous camera that glides between ideas.
// All sizes are for a 1920x1080 canvas.

export const FPS = 30;
export const fr = (s: number) => Math.round(s * FPS);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const useSec = () => useCurrentFrame() / FPS;
const io = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);

// ---------- tokens ----------
export const C = {
  bg: '#000000',
  line: '#F4F4F4', // active stroke
  dim: '#6E6E6E', // inactive stroke (crowd, past state)
  faint: '#2E2E2E', // gauge tracks, ghost shapes
  text: '#E8E8E8',
  sub: '#9A9A9A', // letter-spaced captions
};
export const FONT = 'Inter, sans-serif';
export const STROKE = 4.5;
export const GLOW = 'drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(255,255,255,0.35))';
export const GLOW_SOFT = 'drop-shadow(0 0 10px rgba(255,255,255,0.25))';

// ---------- timing helpers ----------
export const fade = (s: number, at: number, d = 0.35) => interpolate(s, [at, at + d], [0, 1], {...clamp, easing: out});
export const fadeOut = (s: number, at: number, d = 0.3) => interpolate(s, [at, at + d], [1, 0], {...clamp, easing: io});
export const pop = (s: number, at: number, damping = 14) => (s < at ? 0 : spring({frame: fr(s - at), fps: FPS, config: {damping, mass: 0.5, stiffness: 170}}));
export const count = (s: number, at: number, d: number, to: number, from = 0) =>
  from + (to - from) * interpolate(s, [at, at + d], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
/** Entrance used for everything: fade + 14px rise. */
export const enter = (s: number, at: number): React.CSSProperties => {
  const p = fade(s, at, 0.4);
  return {opacity: p, translate: `0 ${(1 - p) * 14}px`};
};

// ---------- camera ----------
// One continuous world. Keys say where the camera looks (world x,y = screen centre) and how close.
// Moves ease in/out and pick up a little directional blur at speed, like their pans.
export type CamKey = {t: number; x: number; y: number; z?: number};
export const camAt = (keys: CamKey[], s: number) => {
  let a = keys[0];
  let b = keys[0];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].t <= s) a = keys[i];
    if (keys[i].t > s) {
      b = keys[i];
      break;
    }
    b = keys[i];
  }
  // Big moves (a new idea): hold, then glide in the last 0.35–0.8 s. Small moves (same spot, push in/out or a
  // short slide): spread over the whole interval, so the camera is never frozen between ideas.
  const far = Math.hypot(b.x - a.x, b.y - a.y) > 220 || Math.abs((b.z ?? 1) - (a.z ?? 1)) > 0.12;
  const MOVE = Math.min(0.8, Math.max(0.35, (b.t - a.t) * 0.4));
  const p = a === b ? 0 : far ? interpolate(s, [b.t - MOVE, b.t], [0, 1], {...clamp, easing: io}) : interpolate(s, [a.t, b.t], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const lerp = (u: number, v: number) => u + (v - u) * p;
  return {x: lerp(a.x, b.x), y: lerp(a.y, b.y), z: lerp(a.z ?? 1, b.z ?? 1)};
};
export const Camera: React.FC<{keys: CamKey[]; drift?: number; children: React.ReactNode}> = ({keys, drift = 0.012, children}) => {
  const s = useSec();
  const c = camAt(keys, s);
  const c2 = camAt(keys, s + 1 / FPS);
  const speed = Math.hypot(c2.x - c.x, c2.y - c.y) + Math.abs(c2.z - c.z) * 900;
  const blur = Math.min(6, speed * 0.12);
  const z = c.z * (1 + drift * Math.sin(s * 0.5)); // never fully still
  return (
    <AbsoluteFill style={{filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      <div style={{position: 'absolute', left: 960, top: 540, width: 0, height: 0, transform: `scale(${z}) translate(${-c.x}px, ${-c.y}px)`}}>{children}</div>
    </AbsoluteFill>
  );
};

// ---------- background ----------
export const Backdrop: React.FC<{lift?: number}> = ({lift = 0.05}) => (
  <AbsoluteFill style={{background: C.bg}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1.2px, transparent 1.4px)', backgroundSize: '34px 34px'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 40% at 50% 52%, rgba(255,255,255,${lift}), transparent 70%)`}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.85) 100%)'}} />
  </AbsoluteFill>
);

/** Dashed ground line, drawn left to right. */
export const Ground: React.FC<{y: number; x0?: number; x1?: number; at?: number; s: number}> = ({y, x0 = -2000, x1 = 4000, at = -1, s}) => {
  const p = at < 0 ? 1 : interpolate(s, [at, at + 0.6], [0, 1], {...clamp, easing: out});
  return <div style={{position: 'absolute', left: x0, top: y, width: (x1 - x0) * p, height: 2, backgroundImage: 'linear-gradient(90deg, rgba(200,200,200,0.55) 60%, transparent 60%)', backgroundSize: '30px 2px'}} />;
};

/** Soft spotlight cone from above onto x, ending at floor y. */
export const Spot: React.FC<{x: number; y: number; w?: number; op?: number}> = ({x, y, w = 360, op = 1}) => (
  <div style={{position: 'absolute', left: x - w, top: y - 1400, width: w * 2, height: 1400, opacity: op, clipPath: `polygon(${50 - 9}% 0, ${50 + 9}% 0, 100% 100%, 0 100%)`, background: 'linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.07) 70%, rgba(255,255,255,0.10))', filter: 'blur(14px)', maskImage: 'linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)'}} />
);

// ---------- figure ----------
// Round head over an arch body, no limbs. Three looks: 'hero' (filled, glowing), 'line' (outline), 'ghost' (dim outline).
export const Pawn: React.FC<{x: number; y: number; h?: number; look?: 'hero' | 'line' | 'ghost'; cap?: boolean; tie?: boolean; op?: number; bob?: number}> = ({x, y, h = 150, look = 'line', cap, tie, op = 1, bob = 0}) => {
  const w = h * 0.5;
  const r = h * 0.17;
  const col = look === 'ghost' ? C.dim : C.line;
  const fill = look === 'hero' ? C.line : 'transparent';
  const sw = look === 'hero' ? 0 : STROKE * (h / 150) ** 0.4;
  const yb = y - bob;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: yb - h, width: w, height: h, opacity: op, filter: look === 'ghost' ? undefined : GLOW}}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible'}}>
        <circle cx={w / 2} cy={r + 2} r={r} fill={fill} stroke={col} strokeWidth={sw} />
        <path d={`M ${sw / 2} ${h} L ${sw / 2} ${h * 0.62} A ${w / 2 - sw / 2} ${w / 2 - sw / 2} 0 0 1 ${w - sw / 2} ${h * 0.62} L ${w - sw / 2} ${h}`} fill={fill} stroke={col} strokeWidth={sw} />
        {tie && <path d={`M ${w / 2} ${h * 0.5} l ${-w * 0.07} ${h * 0.08} l ${w * 0.07} ${h * 0.18} l ${w * 0.07} ${-h * 0.18} z`} fill={look === 'hero' ? '#111' : col} />}
        {cap && (
          <g>
            <path d={`M ${w / 2 - r * 1.9} ${r * 0.25} L ${w / 2} ${-r * 0.55} L ${w / 2 + r * 1.9} ${r * 0.25} L ${w / 2} ${r * 1.0} Z`} fill={look === 'hero' ? '#0A0A0A' : 'transparent'} stroke={col} strokeWidth={Math.max(2.5, sw)} strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
};

/** Row of pawns; `hi` index is the hero, the rest dim. Each fades in with a stagger. */
export const Crowd: React.FC<{x: number; y: number; n: number; gap: number; h?: number; hi?: number; s: number; at: number; stagger?: number; cap?: boolean; ghost?: boolean; walk?: number}> = ({x, y, n, gap, h = 110, hi = -1, s, at, stagger = 0.04, cap, ghost = true, walk = 0}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      // walk: px to walk in from (negative = from the left). Each pawn arrives with a small hop and stays put.
      const t0 = at + i * (walk ? 0.12 : stagger);
      const p = walk ? interpolate(s, [t0, t0 + 0.9], [0, 1], {...clamp, easing: out}) : 1;
      const hop = walk && p > 0 && p < 1 ? Math.abs(Math.sin(p * Math.PI * 4)) * h * 0.06 : 0;
      return <Pawn key={i} x={x + i * gap + (1 - p) * walk} y={y} h={h} cap={cap} bob={hop} look={i === hi ? 'hero' : ghost ? 'ghost' : 'line'} op={fade(s, t0, 0.3)} />;
    })}
  </>
);

// ---------- text ----------
/** Pill label. 'outline' = dark fill + light border; 'solid' = white with black text; 'ghost' = dim, past state. */
export const Pill: React.FC<{x: number; y: number; text: string; size?: number; look?: 'outline' | 'solid' | 'ghost'; s: number; at: number; out?: number}> = ({x, y, text, size = 22, look = 'outline', s, at, out: o}) => {
  const p = pop(s, at);
  const op = Math.min(1, p * 1.4) * (o === undefined ? 1 : fadeOut(s, o));
  const solid = look === 'solid';
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: `${0.85 + 0.15 * p}`, opacity: op, whiteSpace: 'nowrap', padding: `${size * 0.42}px ${size * 0.95}px`, borderRadius: 999, border: `${Math.max(2, size * 0.1)}px solid ${look === 'ghost' ? '#3A3A3A' : solid ? '#FFFFFF' : '#CFCFCF'}`, background: solid ? '#F2F2F2' : 'rgba(10,10,10,0.92)', color: solid ? '#0A0A0A' : look === 'ghost' ? '#5A5A5A' : C.text, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: '0.14em', filter: look === 'ghost' ? undefined : solid ? 'drop-shadow(0 0 16px rgba(255,255,255,0.45))' : GLOW_SOFT}}>
      {text}
    </div>
  );
};

/** Speech bubble (white, black text, small tail). */
export const Bubble: React.FC<{x: number; y: number; text: string; size?: number; s: number; at: number; dim?: boolean}> = ({x, y, text, size = 40, s, at, dim}) => {
  const p = pop(s, at);
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: `${0.8 + 0.2 * p}`, opacity: Math.min(1, p * 1.4) * (dim ? 0.45 : 1), transformOrigin: '40% 100%'}}>
      <div style={{whiteSpace: 'nowrap', padding: `${size * 0.5}px ${size * 0.7}px`, borderRadius: size * 0.75, background: dim ? '#7A7A7A' : '#F4F4F4', color: '#0A0A0A', fontFamily: FONT, fontWeight: 800, fontSize: size, filter: dim ? undefined : 'drop-shadow(0 0 18px rgba(255,255,255,0.35))'}}>{text}</div>
      <div style={{position: 'absolute', left: '38%', bottom: -size * 0.38, width: 0, height: 0, borderLeft: `${size * 0.32}px solid transparent`, borderTop: `${size * 0.42}px solid ${dim ? '#7A7A7A' : '#F4F4F4'}`}} />
    </div>
  );
};

/** Big number + small letter-spaced caption under it. Pass `value` already formatted. */
export const Stat: React.FC<{x: number; y: number; value: string; caption?: string; size?: number; s: number; at: number; dim?: boolean}> = ({x, y, value, caption, size = 150, s, at, dim}) => (
  <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', textAlign: 'center', whiteSpace: 'nowrap', opacity: dim ? 0.35 : 1, ...enter(s, at)}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1, color: '#F6F6F6', letterSpacing: '-0.01em', filter: 'drop-shadow(0 0 22px rgba(255,255,255,0.4))', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
    {caption && <div style={{marginTop: size * 0.2, fontFamily: FONT, fontWeight: 700, fontSize: Math.max(16, size * 0.16), letterSpacing: '0.32em', color: C.sub}}>{caption}</div>}
  </div>
);

/** Small uppercase caption (under icons). */
export const Caption: React.FC<{x: number; y: number; text: string; size?: number; s: number; at: number; dim?: boolean}> = ({x, y, text, size = 24, s, at, dim}) => (
  <div style={{position: 'absolute', left: x, top: y, translate: '-50% 0', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: '0.34em', color: dim ? '#4A4A4A' : '#C9C9C9', ...enter(s, at)}}>{text}</div>
);

/** Outlined box with a bold word inside ("BUSINESS"). solid = white card with black text. */
export const WordBox: React.FC<{x: number; y: number; w: number; h: number; text: string; size?: number; solid?: boolean; s: number; at: number}> = ({x, y, w, h, text, size = 48, solid, s, at}) => {
  const p = pop(s, at);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, scale: `${0.9 + 0.1 * p}`, opacity: Math.min(1, p * 1.5), borderRadius: 14, border: `${STROKE}px solid ${C.line}`, background: solid ? '#F2F2F2' : '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, color: solid ? '#0A0A0A' : '#F4F4F4', letterSpacing: '0.02em', filter: GLOW}}>
      {text}
    </div>
  );
};

/** Big X drawn over something (two strokes, one after another). */
export const Cross: React.FC<{x: number; y: number; size: number; s: number; at: number}> = ({x, y, size, s, at}) => {
  const a = interpolate(s, [at, at + 0.18], [0, 1], {...clamp, easing: out});
  const b = interpolate(s, [at + 0.12, at + 0.3], [0, 1], {...clamp, easing: out});
  const L = size * 1.42;
  return (
    <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', filter: GLOW}} width={size} height={size}>
      <line x1={0} y1={0} x2={size} y2={size} stroke={C.line} strokeWidth={STROKE * 1.3} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - a)} />
      <line x1={size} y1={0} x2={0} y2={size} stroke={C.line} strokeWidth={STROKE * 1.3} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - b)} />
    </svg>
  );
};

// ---------- data ----------
/** Ring gauge: grey track, white arc filling to pct, number counting in the middle. */
export const Ring: React.FC<{x: number; y: number; r?: number; pct: number; s: number; at: number; d?: number; label?: string; dim?: boolean; v?: number}> = ({x, y, r = 120, pct, s, at, d = 1.2, label, dim, v: vIn}) => {
  const v = vIn ?? count(s, at + 0.2, d, pct);
  const L = 2 * Math.PI * r;
  return (
    <div style={{position: 'absolute', left: x - r - 20, top: y - r - 20, width: 2 * r + 40, height: 2 * r + 40, opacity: dim ? 0.35 : 1, ...enter(s, at)}}>
      <svg width={2 * r + 40} height={2 * r + 40} style={{overflow: 'visible'}}>
        <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={C.faint} strokeWidth={r * 0.1} />
        <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={C.line} strokeWidth={r * 0.1} strokeDasharray={`${(L * v) / 100} ${L}`} transform={`rotate(-90 ${r + 20} ${r + 20})`} style={{filter: GLOW}} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: r * 0.48, color: '#F4F4F4', fontVariantNumeric: 'tabular-nums'}}>{Math.round(v)}%</div>
      {label && <div style={{position: 'absolute', left: 0, right: 0, top: -r * 0.42, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: r * 0.22, color: '#DADADA', letterSpacing: '0.06em'}}>{label}</div>}
    </div>
  );
};

/** Bars that grow from the floor, value counting above, label below. */
export const Bars: React.FC<{x: number; y: number; items: {label: string; value: number; text: (v: number) => string}[]; max: number; h?: number; w?: number; gap?: number; s: number; at: number}> = ({x, y, items, max, h = 420, w = 150, gap = 110, s, at}) => (
  <>
    {items.map((it, i) => {
      const t0 = at + i * 0.35;
      const g = interpolate(s, [t0, t0 + 0.9], [0, 1], {...clamp, easing: out});
      const bh = (h * it.value * g) / max;
      const bx = x + i * (w + gap);
      return (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: bx, top: y - bh, width: w, height: bh, borderRadius: 8, background: 'linear-gradient(180deg, #FFFFFF, #CFCFCF)', filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.35))'}} />
          <div style={{position: 'absolute', left: bx + w / 2, top: y - bh - 70, translate: '-50% 0', fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#F4F4F4', opacity: g, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{it.text(it.value * g)}</div>
          <Caption x={bx + w / 2} y={y + 24} text={it.label} s={s} at={t0} size={20} />
        </React.Fragment>
      );
    })}
  </>
);

/** Line chart that draws itself; optional dot riding the tip. points in local px, y down. */
export const Trend: React.FC<{x: number; y: number; pts: [number, number][]; s: number; at: number; d?: number; dot?: boolean; dim?: boolean; rider?: number}> = ({x, y, pts, s, at, d = 1.4, dot = true, dim, rider}) => {
  const p = interpolate(s, [at, at + d], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  let L = 0;
  const seg = pts.slice(1).map((q, i) => {
    const l = Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]);
    L += l;
    return l;
  });
  let rem = L * p;
  let tip = pts[0];
  for (let i = 0; i < seg.length; i++) {
    if (rem <= seg[i]) {
      const u = rem / seg[i];
      tip = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
      break;
    }
    rem -= seg[i];
    tip = pts[i + 1];
  }
  return (
    <>
    {rider && p > 0 && <Pawn x={x + tip[0]} y={y + tip[1] - 6} h={rider} look="hero" op={Math.min(1, p * 6)} />}
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', filter: dim ? undefined : GLOW, opacity: dim ? 0.35 : 1}} width={1} height={1}>
      <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke={C.line} strokeWidth={STROKE * 0.7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
      {dot && !rider && p > 0 && <circle cx={tip[0]} cy={tip[1]} r={8} fill="#FFFFFF" />}
    </svg>
    </>
  );
};

/** Bordered table rows (account-balance style), rows fade in one after another. */
export const Rows: React.FC<{x: number; y: number; w?: number; title?: string; rows: string[]; s: number; at: number; hi?: number}> = ({x, y, w = 560, title, rows, s, at, hi = -1}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y, width: w}}>
    {title && <div style={{textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 20, letterSpacing: '0.34em', color: '#CFCFCF', marginBottom: 22, ...enter(s, at)}}>{title}</div>}
    {rows.map((r, i) => (
      <div key={i} style={{height: 46, marginBottom: 12, borderRadius: 8, border: `2px solid ${i === hi ? '#FFFFFF' : '#5A5A5A'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#EDEDED', fontVariantNumeric: 'tabular-nums', ...enter(s, at + 0.15 + i * 0.07), filter: i === hi ? GLOW : undefined}}>
        <div style={{width: 40 + ((i * 37) % 50), height: 6, borderRadius: 3, background: '#6A6A6A'}} />
        {r}
      </div>
    ))}
  </div>
);

// ---------- line icons ----------
// Each icon is drawn on with its stroke (draw = 0..1), then glows. Size is the box edge in px.
type IconName = 'calendar' | 'clock' | 'hourglass' | 'gift' | 'school' | 'building' | 'doc' | 'cert' | 'briefcase' | 'globe' | 'bell' | 'shield' | 'bank' | 'phone' | 'search' | 'door' | 'question' | 'arrow' | 'network' | 'cart' | 'box' | 'tag' | 'coin' | 'eye' | 'chat' | 'star' | 'lock' | 'chart';
const ICONS: Record<IconName, string> = {
  calendar: 'M12 20 H88 V88 H12 Z M12 38 H88 M30 10 V28 M70 10 V28 M26 52 H36 M46 52 H56 M66 52 H76 M26 70 H36 M46 70 H56',
  clock: 'M10 50 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0 M50 24 V50 L66 62',
  hourglass: 'M24 8 H76 M24 92 H76 M30 8 C30 36 50 40 50 50 C50 60 30 64 30 92 M70 8 C70 36 50 40 50 50 C50 60 70 64 70 92',
  gift: 'M12 36 H88 V52 H12 Z M18 52 V90 H82 V52 M50 36 V90 M50 36 C40 18 22 22 30 34 M50 36 C60 18 78 22 70 34',
  school: 'M10 45 L50 15 L90 45 M18 40 V88 H82 V40 M42 88 V64 H58 V88 M26 52 H38 V62 H26 Z M62 52 H74 V62 H62 Z M44 34 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0',
  building: 'M24 10 H76 V90 H24 Z M34 22 H46 V34 H34 Z M54 22 H66 V34 H54 Z M34 44 H46 V56 H34 Z M54 44 H66 V56 H54 Z M42 90 V70 H58 V90',
  doc: 'M24 8 H62 L78 24 V92 H24 Z M62 8 V24 H78 M34 40 H68 M34 52 H68 M34 64 H68 M34 76 H56',
  cert: 'M8 22 H92 V78 H8 Z M20 36 H70 M20 48 H70 M20 60 H50 M70 66 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0',
  briefcase: 'M10 32 H90 V84 H10 Z M36 32 V20 H64 V32 M10 52 H90',
  globe: 'M10 50 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0 M10 50 H90 M50 10 C28 30 28 70 50 90 M50 10 C72 30 72 70 50 90',
  bell: 'M28 70 V46 a22 22 0 0 1 44 0 V70 L80 78 H20 Z M44 86 a6 6 0 0 0 12 0 M50 18 V24',
  shield: 'M50 8 L84 20 V48 C84 70 68 84 50 92 C32 84 16 70 16 48 V20 Z M34 50 L46 62 L68 38',
  bank: 'M10 36 L50 12 L90 36 Z M18 42 V78 M34 42 V78 M50 42 V78 M66 42 V78 M82 42 V78 M8 86 H92',
  phone: 'M30 6 H70 a6 6 0 0 1 6 6 V88 a6 6 0 0 1 -6 6 H30 a6 6 0 0 1 -6 -6 V12 a6 6 0 0 1 6 -6 Z M44 84 H56',
  search: 'M14 42 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0 M62 62 L88 88',
  door: 'M24 8 H76 V92 H24 Z M64 52 a3 3 0 1 0 0.1 0',
  question: 'M32 32 a18 18 0 1 1 26 16 C52 52 50 56 50 64 M50 78 V80',
  arrow: 'M8 50 H86 M70 34 L88 50 L70 66',
  network: 'M50 16 a6 6 0 1 0 0.1 0 M18 80 a6 6 0 1 0 0.1 0 M82 80 a6 6 0 1 0 0.1 0 M47 27 L22 74 M53 27 L78 74 M28 82 H72',
  cart: 'M6 18 H20 L30 66 H80 L88 32 H24 M36 82 a5 5 0 1 0 0.1 0 M74 82 a5 5 0 1 0 0.1 0',
  box: 'M14 30 L50 14 L86 30 V72 L50 88 L14 72 Z M14 30 L50 46 L86 30 M50 46 V88',
  tag: 'M50 10 H88 V48 L48 88 L12 52 Z M70 28 a4 4 0 1 0 0.1 0',
  coin: 'M14 50 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0 M58 34 C54 30 42 30 42 38 C42 48 60 44 60 56 C60 66 46 66 40 60 M50 26 V74',
  eye: 'M6 50 C26 22 74 22 94 50 C74 78 26 78 6 50 Z M38 50 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0',
  chat: 'M10 16 H90 V68 H40 L22 84 V68 H10 Z',
  star: 'M50 10 L61 38 L90 38 L66 56 L75 86 L50 68 L25 86 L34 56 L10 38 L39 38 Z',
  lock: 'M22 44 H78 V90 H22 Z M32 44 V30 a18 18 0 0 1 36 0 V44 M50 62 V72',
  chart: 'M10 10 V90 H90 M22 72 L42 52 L56 62 L84 26',
};
export const Icon: React.FC<{name: IconName; x: number; y: number; size?: number; s: number; at: number; dim?: boolean; label?: string}> = ({name, x, y, size = 160, s, at, dim, label}) => {
  const draw = interpolate(s, [at, at + 0.7], [0, 1], {...clamp, easing: out});
  return (
    <>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', opacity: Math.min(1, draw * 3), filter: dim ? undefined : GLOW}}>
        <path d={ICONS[name]} fill="none" stroke={dim ? C.dim : C.line} strokeWidth={(STROKE * 100) / size} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
      {label && <Caption x={x} y={y + size / 2 + 24} text={label} s={s} at={at + 0.3} dim={dim} />}
    </>
  );
};

/** Grid of small dots/pawns that fill in (crowd of millions). */
export const DotField: React.FC<{x: number; y: number; cols: number; rows: number; gap: number; s: number; at: number; hi?: number}> = ({x, y, cols, rows, gap, s, at, hi = -1}) => (
  <>
    {Array.from({length: cols * rows}, (_, i) => {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      const t0 = at + (cx + cy) * 0.015;
      const on = i === hi;
      return <div key={i} style={{position: 'absolute', left: x + cx * gap - 5, top: y + cy * gap - 5, width: on ? 14 : 9, height: on ? 14 : 9, borderRadius: 7, background: on ? '#FFFFFF' : '#8C8C8C', opacity: fade(s, t0, 0.25), boxShadow: on ? '0 0 16px #fff' : undefined}} />;
    })}
  </>
);

/** Faint drifting dust in world space; spread over [x0,x1]x[y0,y1]. Gives the camera depth and keeps holds alive. */
export const Dust: React.FC<{x0: number; x1: number; y0: number; y1: number; n?: number}> = ({x0, x1, y0, y1, n = 90}) => {
  const s = useSec();
  const r = (i: number) => {
    const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const life = (s * (0.04 + r(i + 5) * 0.05) + r(i)) % 1;
        const x = x0 + r(i + 1) * (x1 - x0) + Math.sin(s * 0.4 + i) * 30;
        const y = y0 + r(i + 2) * (y1 - y0) - life * 160;
        const size = 2 + r(i + 3) * 3;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, background: '#FFFFFF', opacity: Math.sin(life * Math.PI) * (0.12 + r(i + 4) * 0.25)}} />;
      })}
    </>
  );
};

/** Pricing card: small spaced title, big price, optional note. 'solid' = the one you want them to pick. */
export const PriceCard: React.FC<{x: number; y: number; title: string; price: string; note?: string; look?: 'outline' | 'solid' | 'ghost'; w?: number; s: number; at: number; out?: number; priceAt?: number}> = ({x, y, title, price, note, look = 'outline', w = 330, s, at, out: o, priceAt}) => {
  const p = pop(s, at);
  const gone = o === undefined ? 0 : interpolate(s, [o, o + 0.5], [0, 1], {...clamp, easing: io});
  const solid = look === 'solid';
  const ghost = look === 'ghost';
  const fg = solid ? '#0A0A0A' : ghost ? '#5E5E5E' : '#F2F2F2';
  const h = w * 1.18;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2 - gone * 120, width: w, height: h, opacity: Math.min(1, p * 1.4) * (1 - gone), scale: `${0.9 + 0.1 * p}`, borderRadius: 22, border: `${STROKE}px solid ${ghost ? '#3E3E3E' : solid ? '#FFFFFF' : C.line}`, background: solid ? '#F2F2F2' : '#050505', filter: ghost ? undefined : solid ? 'drop-shadow(0 0 26px rgba(255,255,255,0.45))' : GLOW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: w * 0.06, fontFamily: FONT}}>
      <div style={{fontWeight: 800, fontSize: w * 0.075, letterSpacing: '0.24em', color: solid ? '#333' : ghost ? '#555' : '#BDBDBD', whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{fontWeight: 800, fontSize: w * 0.26, color: fg, fontVariantNumeric: 'tabular-nums', opacity: priceAt === undefined ? 1 : fade(s, priceAt, 0.3)}}>{price}</div>
      {note && <div style={{fontWeight: 700, fontSize: w * 0.06, letterSpacing: '0.2em', color: solid ? '#444' : '#7A7A7A'}}>{note}</div>}
    </div>
  );
};
