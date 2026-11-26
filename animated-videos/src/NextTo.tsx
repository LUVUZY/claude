import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES} from './CryoFigure';
import {FONT, FPS, clamp, fr, money, pop, ramp, rand, useSec} from './MaybeLater';
import grid from './song-grid-3.json';

// "Next To The Wrong Thing" — built in the cryothum-matched style (calibrated against their opening shot):
// grey arch-body figures, soft bloom, dark grey stage, dot grid, things that pile up, light from inside the scene,
// almost no on-screen text. Voice: Inworld "Jane", each line placed on the beat of the song.
export const NEXT_TO_FRAMES = fr(62.5);
const BEAT = grid.beat;
const DROP = grid.drop; // 6.623
const STRIP = grid.strip; // 53.751
export const FLOOR = 965;
export const G = '#D6D6D6';

const beatPulse = (sec: number) => {
  if (sec < DROP || sec > STRIP) return 0;
  const since = (sec - DROP) % BEAT;
  const half = (sec - DROP) % (BEAT / 2);
  return Math.max(Math.exp(-since / 0.1), 0.3 * Math.exp(-half / 0.07));
};

// ---------- kit ----------
export const Floor: React.FC = () => (
  <div style={{position: 'absolute', left: -3000, right: -3000, top: FLOOR, height: 3, backgroundImage: 'linear-gradient(90deg, rgba(215,215,215,0.45) 55%, transparent 55%)', backgroundSize: '26px 3px'}} />
);
export const Glow: React.FC<{x: number; y: number; r?: number; a?: number}> = ({x, y, r = 450, a = 0.12}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, rgba(255,255,255,${a}) 0%, rgba(255,255,255,${a * 0.3}) 40%, transparent 70%)`}} />
);
export const Spot: React.FC<{x: number; w?: number; a?: number}> = ({x, w = 560, a = 1}) => (
  <>
    <div style={{position: 'absolute', left: x - w / 2, top: -40, width: w, height: FLOOR + 60, background: `linear-gradient(180deg, rgba(255,255,255,${0.02 * a}) 0%, rgba(255,255,255,${0.13 * a}) 100%)`, clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)', filter: 'blur(18px)'}} />
    <div style={{position: 'absolute', left: x - w * 0.6, top: FLOOR - 70, width: w * 1.2, height: 140, borderRadius: '50%', background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${0.2 * a}) 0%, transparent 70%)`}} />
  </>
);
export const Counter: React.FC<{x: number; y: number; label: string; value: string; size?: number; at?: number; dim?: boolean}> = ({x, y, label, value, size = 100, at = -9, dim}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 14);
  return (
    <div style={{position: 'absolute', left: x - 400, width: 800, top: y, textAlign: 'center', fontFamily: FONT, opacity: p, translate: `0 ${(1 - p) * 20}px`}}>
      <div style={{fontWeight: 700, fontSize: 24, letterSpacing: 7, color: '#A8A8A8'}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 1.05, color: dim ? '#6E6E6E' : '#E8E8E8', filter: dim ? undefined : 'drop-shadow(0 0 20px rgba(255,255,255,0.35))'}}>{value}</div>
    </div>
  );
};
export const Tag: React.FC<{x: number; y: number; text: string; scale?: number; dim?: number; str?: number; swing?: number; bright?: number}> = ({x, y, text, scale = 1, dim = 0, str = 110, swing = 0, bright = 0}) => {
  const s = useSec();
  const c = dim > 0.5 ? '#6A6A6A' : G;
  return (
    <div style={{position: 'absolute', left: x, top: y, scale: `${scale}`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: -2, top: -str, width: 4, height: str, background: c}} />
      <div style={{position: 'absolute', rotate: `${Math.sin(s * 2 + x * 0.01) * 3 + swing}deg`, transformOrigin: '0 0'}}>
        <div style={{position: 'absolute', left: -135, top: 0, width: 270, height: 140, borderRadius: 20, border: `5px solid ${c}`, background: bright ? `rgba(255,255,255,${0.15 + bright * 0.75})` : 'rgba(18,18,18,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 78, color: bright > 0.5 ? '#151515' : c, boxShadow: bright ? `0 0 ${50 * bright}px rgba(255,255,255,${0.6 * bright})` : '0 0 24px rgba(255,255,255,0.15)'}}>
          <div style={{position: 'absolute', left: 118, top: 10, width: 26, height: 26, borderRadius: 13, border: `4px solid ${c}`}} />
          <span style={{marginTop: 20}}>{text}</span>
        </div>
      </div>
    </div>
  );
};
export const Monitor: React.FC<{x: number; y: number; w?: number; on?: number; children?: React.ReactNode}> = ({x, y, w = 420, on = 1, children}) => {
  const h = w * 0.62;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h - 30, width: w, height: h, borderRadius: 14, border: `5px solid ${G}`, background: 'rgba(14,14,14,0.95)', boxShadow: `0 0 ${50 * on}px rgba(255,255,255,${0.16 * on}), inset 0 0 30px rgba(255,255,255,0.05)`, overflow: 'visible'}}>
      {children ?? (
        <>
          <div style={{position: 'absolute', left: '22%', top: '12%', width: '56%', height: '42%', background: '#3A3A3A', borderRadius: 3}} />
          <div style={{position: 'absolute', left: '50%', top: '33%', width: w * 0.11, height: w * 0.11, translate: '-50% -50%', borderRadius: '50%', background: '#EFEFEF'}} />
          {[0, 1].map((r) => (
            <div key={r} style={{position: 'absolute', left: '8%', right: '8%', top: `${64 + r * 14}%`, height: '8%', display: 'flex', gap: '4%'}}>
              {[22, 34, 18, 26].map((ww, k) => (
                <div key={k} style={{width: `${ww}%`, background: (r + k) % 3 ? '#E2E2E2' : '#8E8E8E', borderRadius: 2}} />
              ))}
            </div>
          ))}
        </>
      )}
      <div style={{position: 'absolute', left: '43%', bottom: -30, width: '14%', height: 26, background: '#B8B8B8'}} />
    </div>
  );
};
export const Desk: React.FC<{x: number; w?: number; y?: number}> = ({x, w = 560, y = 790}) => (
  <>
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: 14, border: `5px solid ${G}`, borderRadius: 3}} />
    <div style={{position: 'absolute', left: x - w / 2 + 20, top: y + 14, width: 5, height: FLOOR - y - 14, background: G}} />
    <div style={{position: 'absolute', left: x + w / 2 - 25, top: y + 14, width: 5, height: FLOOR - y - 14, background: G}} />
  </>
);
export const Bill: React.FC<{x: number; y: number; rot?: number; op?: number; s?: number}> = ({x, y, rot = 0, op = 1, s = 1}) => (
  <div style={{position: 'absolute', left: x - 46 * s, top: y - 28 * s, width: 92 * s, height: 56 * s, borderRadius: 5, background: '#DEDEDE', border: '3px solid #8A8A8A', rotate: `${rot}deg`, opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontFamily: FONT, fontWeight: 900, fontSize: 24 * s, color: '#575757', boxShadow: '0 0 14px rgba(255,255,255,0.2)'}}>
    <span>$</span>
    <span>$</span>
  </div>
);
export const Cup: React.FC<{x: number; y: number; s?: number; steam?: boolean}> = ({x, y, s = 1, steam}) => {
  const t = useSec();
  return (
    <div style={{position: 'absolute', left: x - 30 * s, top: y - 70 * s, width: 60 * s, height: 70 * s}}>
      <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(0 12%, 100% 12%, 88% 100%, 12% 100%)', background: '#DADADA'}} />
      <div style={{position: 'absolute', left: -4 * s, top: 0, width: 68 * s, height: 12 * s, borderRadius: 4, background: '#EDEDED'}} />
      <div style={{position: 'absolute', left: 6 * s, right: 6 * s, top: 34 * s, height: 16 * s, background: '#8C8C8C'}} />
      {steam &&
        [0, 1, 2].map((i) => (
          <div key={i} style={{position: 'absolute', left: (14 + i * 14) * s, top: -40 * s - ((t * 30 + i * 10) % 30) * s, width: 5 * s, height: 22 * s, borderRadius: 3, background: 'rgba(230,230,230,0.5)', opacity: 1 - ((t * 30 + i * 10) % 30) / 30}} />
        ))}
    </div>
  );
};
export const Card: React.FC<{x: number; y: number; w?: number; label?: string; op?: number; sc?: number}> = ({x, y, w = 150, label, op = 1, sc = 1}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.32, width: w, height: w * 0.64, borderRadius: 10, border: `4px solid ${G}`, background: 'rgba(30,30,30,0.95)', opacity: op, scale: `${sc}`, boxShadow: '0 0 18px rgba(255,255,255,0.12)'}}>
    <div style={{position: 'absolute', left: '50%', top: '50%', width: w * 0.22, height: w * 0.22, translate: '-50% -50%', borderRadius: '50%', border: `3px solid ${G}`}} />
    <div style={{position: 'absolute', left: '50%', top: '50%', translate: '-35% -50%', width: 0, height: 0, borderTop: `${w * 0.05}px solid transparent`, borderBottom: `${w * 0.05}px solid transparent`, borderLeft: `${w * 0.075}px solid ${G}`}} />
    {label && <div style={{position: 'absolute', right: 6, top: 6, padding: '2px 8px', borderRadius: 6, background: '#E6E6E6', color: '#151515', fontFamily: FONT, fontWeight: 900, fontSize: w * 0.13}}>{label}</div>}
  </div>
);
export const Phone: React.FC<{x: number; y: number; h?: number; rot?: number; children?: React.ReactNode}> = ({x, y, h = 300, rot = 0, children}) => (
  <div style={{position: 'absolute', left: x - h * 0.25, top: y - h / 2, width: h * 0.5, height: h, borderRadius: h * 0.07, border: `5px solid ${G}`, background: 'rgba(16,16,16,0.97)', rotate: `${rot}deg`, boxShadow: '0 0 40px rgba(255,255,255,0.22)', overflow: 'hidden'}}>
    {children}
  </div>
);
export const Flame: React.FC<{x: number; y: number; s?: number; i: number}> = ({x, y, s = 1, i}) => {
  const t = useSec();
  const f = 1 + 0.18 * Math.sin(t * 13 + i * 2) + 0.1 * Math.sin(t * 21 + i);
  return (
    <div style={{position: 'absolute', left: x - 40 * s, top: y - 120 * s * f, width: 80 * s, height: 120 * s * f, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%', background: 'radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.95), rgba(230,230,230,0.55) 55%, rgba(200,200,200,0) 75%)', filter: 'blur(1.5px)', rotate: `${Math.sin(t * 7 + i) * 6}deg`, transformOrigin: '50% 100%'}} />
  );
};
export const Walker: React.FC<{from: number; to: number; t0: number; t1: number; R?: number; dim?: number; pose?: keyof typeof POSES}> = ({from, to, t0, t1, R = 42, dim = 0}) => {
  const s = useSec();
  if (s < t0) return null;
  const p = ramp(s, t0, t1, 0, 1, Easing.inOut(Easing.quad));
  const x = interpolate(p, [0, 1], [from, to]);
  const moving = p > 0 && p < 1;
  return <CryoFigure x={x} y={FLOOR - (moving ? Math.abs(Math.sin(s * 9)) * 8 : 0)} R={R} front={POSES.rest.front} back={POSES.rest.back} facing={to < from ? -1 : 1} dim={dim} tilt={moving ? (to < from ? -4 : 4) : 0} />;
};
export const Label: React.FC<{x: number; y: number; text: string; at?: number; size?: number; dim?: boolean}> = ({x, y, text, at = -9, size = 26, dim}) => {
  const s = useSec();
  if (s < at) return null;
  return <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: 5, color: dim ? '#6A6A6A' : '#BDBDBD', opacity: pop(s, at, 14)}}>{text}</div>;
};

// ---------- shots: cryothum-style zoom/blur crossfade + slow drift ----------
const T = 0.34; // transition length (s)
const ShotInner: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean; last?: boolean}> = ({start, end, children, zoom, origin = '50% 70%', first, last}) => {
  const s = useSec();
  const pin = first ? 1 : ramp(s, start - T / 2, start + T / 2, 0, 1, Easing.out(Easing.cubic));
  const pout = last ? 0 : ramp(s, end - T / 2, end + T / 2, 0, 1, Easing.in(Easing.cubic));
  const drift = zoom ? interpolate(s, [start, end], zoom, {...clamp, easing: Easing.inOut(Easing.sin)}) : 1;
  const sc = drift * (1 + 0.14 * (1 - pin)) * (1 + 0.22 * pout);
  const blur = 16 * (1 - pin) + 18 * pout;
  return (
    <AbsoluteFill style={{scale: `${sc}`, transformOrigin: origin, opacity: Math.min(pin, 1 - pout), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};
const Shot: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean; last?: boolean}> = (p) => {
  const frame = useCurrentFrame();
  if (frame < (p.first ? 0 : fr(p.start - T / 2)) || frame >= (p.last ? NEXT_TO_FRAMES : fr(p.end + T / 2))) return null;
  return <ShotInner {...p} />;
};

// ---------- scenes ----------
// 0. hook: coffee bought without thinking -> pan -> a $1.99 app and an endless scroll of reviews
const Hook: React.FC = () => {
  const s = useSec();
  const pan = ramp(s, 3.0, 3.55, 0, 1, Easing.inOut(Easing.cubic));
  const paid = s >= 1.36 ? pop(s, 1.36, 10) : 0;
  const scroll = Math.max(0, s - 4.6) * 420;
  return (
    <AbsoluteFill style={{translate: `${-pan * 1920}px 0`}}>
      {/* --- coffee shop (left screen) --- */}
      <Glow x={960} y={560} r={600} a={0.12} />
      <div style={{position: 'absolute', left: 820, top: 690, width: 700, height: FLOOR - 690, border: `5px solid ${G}`, borderBottom: 'none', borderRadius: '10px 10px 0 0', background: 'rgba(16,16,16,0.95)'}} />
      {/* espresso machine */}
      <div style={{position: 'absolute', left: 1240, top: 470, width: 220, height: 220, borderRadius: 14, border: `5px solid ${G}`, background: 'rgba(20,20,20,0.95)'}}>
        <div style={{position: 'absolute', left: 30, top: 30, width: 160, height: 50, borderRadius: 8, background: '#3A3A3A'}} />
        <div style={{position: 'absolute', left: 90, top: 110, width: 40, height: 30, background: G}} />
      </div>
      {/* register */}
      <div style={{position: 'absolute', left: 900, top: 560, width: 220, height: 130, borderRadius: 12, border: `5px solid ${G}`, background: paid ? `rgba(255,255,255,${0.1 + 0.2 * paid})` : 'rgba(20,20,20,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#E8E8E8', boxShadow: paid ? `0 0 ${60 * paid}px rgba(255,255,255,0.4)` : undefined}}>{paid > 0.5 ? '✓' : '$6'}</div>
      <Spot x={560} />
      <CryoFigure x={560} y={FLOOR} R={78} front={paid > 0.3 ? POSES.hold.front : POSES.point.front} back={POSES.rest.back}>
        {paid > 0.3 && (
          <g transform="translate(0 10)">
            <rect x={-30} y={-6} width={60} height={70} rx={8} fill="#2A2A2A" stroke="#EDEDED" strokeWidth={6} />
            <rect x={-34} y={-14} width={68} height={14} rx={4} fill="#EDEDED" />
          </g>
        )}
      </CryoFigure>
      {/* the queue: everyone pays instantly */}
      {[0, 1, 2].map((i) => {
        const t0 = 1.8 + i * 0.35;
        const leave = ramp(s, t0, t0 + 0.6, 0, 1, Easing.in(Easing.quad));
        return <CryoFigure key={i} x={300 - i * 150 - leave * 600} y={FLOOR} R={46} front={s > t0 ? POSES.hold.front : POSES.rest.front} back={POSES.rest.back} facing={-1} dim={0.25} />;
      })}
      {[0, 1, 2, 3].map((i) => (s > 1.4 + i * 0.3 ? <Cup key={i} x={1340 + (i - 1.5) * 70} y={690} s={0.8} steam /> : null))}
      {/* --- the app (right screen) --- */}
      <Glow x={1920 + 900} y={520} r={520} a={0.16} />
      <Spot x={1920 + 560} />
      <CryoFigure x={1920 + 520} y={FLOOR} R={82} front={POSES.hold.front} back={POSES.rest.back} tilt={-3} />
      <Phone x={1920 + 760} y={470} h={360} rot={6}>
        <div style={{padding: 22, fontFamily: FONT, color: '#E6E6E6'}}>
          <div style={{width: 90, height: 90, borderRadius: 22, background: '#CFCFCF', margin: '10px auto'}} />
          <div style={{textAlign: 'center', fontWeight: 900, fontSize: 40, marginTop: 10}}>$1.99</div>
          <div style={{margin: '16px auto 0', width: 110, padding: '8px 0', borderRadius: 20, background: '#E6E6E6', color: '#141414', textAlign: 'center', fontWeight: 900, fontSize: 22}}>GET</div>
        </div>
      </Phone>
      {/* endless reviews */}
      <div style={{position: 'absolute', left: 1920 + 1060, top: 60, width: 640, height: 880, overflow: 'hidden', maskImage: 'linear-gradient(180deg, transparent, black 15%, black 85%, transparent)'}}>
        {Array.from({length: 40}, (_, i) => {
          const y = i * 120 - scroll + 900 * Math.min(1, ramp(s, 4.4, 4.9));
          if (y < -140 || y > 900) return null;
          return (
            <div key={i} style={{position: 'absolute', left: 0, top: y, width: 600, height: 100, borderRadius: 14, border: `4px solid ${G}`, background: 'rgba(22,22,22,0.95)', padding: '14px 22px', boxSizing: 'border-box'}}>
              <div style={{fontSize: 30, letterSpacing: 4, color: '#E6E6E6'}}>{'★★★★★'.slice(0, 2 + Math.floor(rand(i) * 4))}<span style={{color: '#555'}}>{'★★★★★'.slice(2 + Math.floor(rand(i) * 4))}</span></div>
              <div style={{height: 10, width: `${50 + rand(i + 5) * 40}%`, background: '#7A7A7A', borderRadius: 5, marginTop: 10}} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 1. nobody knows what anything is worth (beat drops here)
const Worth: React.FC = () => {
  const s = useSec();
  const items = ['cup', 'phone', 'shoe', 'laptop', 'watch'];
  return (
    <AbsoluteFill>
      <Glow x={960} y={600} r={800} a={0.08 + 0.12 * Math.exp(-(s - 6.62) * 2)} />
      {items.map((it, i) => {
        const x = 260 + i * 350;
        const t0 = 6.65 + i * 0.12;
        const p = s >= t0 ? pop(s, t0, 12) : 0;
        return (
          <React.Fragment key={it}>
            <div style={{position: 'absolute', left: x - 110, top: 700, width: 220, height: FLOOR - 700, border: `5px solid ${G}`, borderBottom: 'none', borderRadius: '12px 12px 0 0', opacity: p}} />
            <div style={{position: 'absolute', left: x - 70, top: 560, width: 140, height: 140, opacity: p, scale: `${p}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
              {it === 'cup' && <Cup x={70} y={140} s={1.4} />}
              {it === 'phone' && <div style={{width: 64, height: 120, borderRadius: 10, border: `5px solid ${G}`}} />}
              {it === 'shoe' && <div style={{width: 130, height: 60, borderRadius: '40px 60px 10px 10px', background: '#D0D0D0'}} />}
              {it === 'laptop' && <div style={{width: 130, height: 90, borderRadius: 8, border: `5px solid ${G}`, borderBottom: '10px solid #D0D0D0'}} />}
              {it === 'watch' && <div style={{width: 80, height: 80, borderRadius: 40, border: `8px solid ${G}`}} />}
            </div>
            <div style={{opacity: p}}>
              <Tag x={x} y={300} text="$?" scale={0.6} str={300} swing={Math.sin(s * 3 + i) * 6} />
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// 2. the brain's shortcut: compare to whatever's next to it
const Shortcut: React.FC = () => {
  const s = useSec();
  const pull = ramp(s, 12.3, 13.4, 0, 1, Easing.inOut(Easing.cubic));
  const line = ramp(s, 13.4, 14.2);
  return (
    <AbsoluteFill>
      <Glow x={700} y={480} r={420} a={0.18} />
      <Spot x={420} />
      <CryoFigure x={420} y={FLOOR} R={84} front={s > 10.4 ? POSES.point.front : POSES.rest.front} back={POSES.rest.back} />
      {/* the thinking light in the head */}
      <Glow x={420} y={FLOOR - 84 * 3.7 - 84 * 1.28} r={110} a={0.25 + 0.2 * Math.sin(s * 6)} />
      <div style={{position: 'absolute', left: 1080 + pull * 260, top: 360}}>
        <Tag x={0} y={0} text="$?" scale={0.8} str={180} />
      </div>
      {/* the neighbour it gets compared to */}
      <div style={{position: 'absolute', left: 1500, top: 560, width: 200, height: 200, borderRadius: 18, border: `5px solid ${G}`, background: 'rgba(20,20,20,0.95)', boxShadow: '0 0 40px rgba(255,255,255,0.2)'}} />
      <div style={{position: 'absolute', left: 1560, top: 760, width: 80, height: FLOOR - 760, borderLeft: `5px solid ${G}`, borderRight: `5px solid ${G}`}} />
      {line > 0 && (
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
          <line x1={1340} y1={480} x2={1340 + 160 * line} y2={560 + 100 * line} stroke="#E6E6E6" strokeWidth={5} strokeDasharray="12 10" />
        </svg>
      )}
      <Label x={1450} y={200} text="COMPARED TO WHAT'S NEXT TO IT" at={13.5} size={24} />
    </AbsoluteFill>
  );
};

// 3. coffee next to coffee: $6 feels normal
const CoffeeRow: React.FC = () => {
  const s = useSec();
  const ok = s >= 18.91 ? pop(s, 18.91, 10) : 0;
  return (
    <AbsoluteFill>
      <Glow x={960} y={620} r={700} a={0.12} />
      <div style={{position: 'absolute', left: 260, top: 760, width: 1400, height: 12, border: `5px solid ${G}`, borderRadius: 3}} />
      {Array.from({length: 7}, (_, i) => {
        const x = 380 + i * 195;
        const t0 = 15.1 + i * 0.12;
        const p = s >= t0 ? pop(s, t0, 12) : 0;
        const mid = i === 3;
        return (
          <React.Fragment key={i}>
            <div style={{opacity: p, translate: `0 ${(1 - p) * -60}px`}}>
              <Cup x={x} y={760} s={mid ? 1.5 : 1.3} steam={mid} />
            </div>
            {s > 17.9 && <div style={{opacity: pop(s, 17.9 + i * 0.05)}}><Tag x={x} y={420} text="$6" scale={0.5} str={140} bright={mid ? ok : 0} /></div>}
          </React.Fragment>
        );
      })}
      <Label x={960} y={880} text="NORMAL" at={18.95} size={34} />
    </AbsoluteFill>
  );
};

// 4. apps next to free apps: $2 feels like a lot
const AppGrid: React.FC = () => {
  const s = useSec();
  const shake = s > 22.8 && s < 23.6 ? Math.sin(s * 60) * 8 : 0;
  return (
    <AbsoluteFill>
      <Glow x={960} y={500} r={650} a={0.14} />
      <Phone x={960} y={520} h={860}>
        <div style={{position: 'absolute', inset: 30, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26}}>
          {Array.from({length: 15}, (_, i) => {
            const t0 = 20.0 + i * 0.07;
            const paid = i === 7;
            const p = s >= t0 ? pop(s, t0, 12) : 0;
            return (
              <div key={i} style={{opacity: paid ? 1 : p * (s > 21.9 ? 0.45 : 1), scale: `${p * (paid && s > 21.9 ? 1.25 : 1)}`, zIndex: paid ? 2 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, translate: paid ? `${shake}px 0` : undefined}}>
                <div style={{width: 92, height: 92, borderRadius: 22, background: paid ? '#151515' : '#BDBDBD', border: paid ? `5px solid ${G}` : undefined}} />
                <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 20, padding: '3px 10px', borderRadius: 10, background: paid ? '#151515' : '#E6E6E6', color: paid ? '#E6E6E6' : '#151515', border: paid ? `3px solid ${G}` : undefined, boxShadow: paid && s > 21.9 ? '0 0 30px rgba(255,255,255,0.6)' : undefined}}>{paid ? '$1.99' : 'FREE'}</div>
              </div>
            );
          })}
        </div>
      </Phone>
      <Spot x={330} />
      <CryoFigure x={330} y={FLOOR} R={72} front={POSES.shrug.front} back={POSES.shrug.back} />
      <Label x={1560} y={460} text="A LOT" at={22.9} size={40} />
    </AbsoluteFill>
  );
};

// 5. two sellers, same $99 course
const SellerSet: React.FC<{x: number; dim?: number; front?: keyof typeof POSES}> = ({x, dim = 0}) => {
  const s = useSec();
  return (
    <>
      <Spot x={x - 100} a={1 - dim * 0.7} />
      <Desk x={x + 60} w={460} />
      <Monitor x={x + 120} y={790} w={300} on={1 - dim} />
      <CryoFigure x={x - 150} y={FLOOR} R={62} front={POSES.type(Math.sin(s * 18) * 3).front} back={null} tilt={5} dim={dim} />
    </>
  );
};
const TwoSellers: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      <Glow x={500} y={600} r={460} a={0.14} />
      <Glow x={1420} y={600} r={460} a={0.14} />
      <SellerSet x={480} />
      <SellerSet x={1400} />
      <Tag x={600} y={210} text="$99" scale={0.6} str={210} />
      <Tag x={1520} y={210} text="$99" scale={0.6} str={210} />
      {s >= 26.5 && <div style={{position: 'absolute', left: 900, top: 520, width: 120, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#E6E6E6', opacity: pop(s, 26.5), filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))'}}>=</div>}
    </AbsoluteFill>
  );
};

// 6. seller 1: buried in free videos
const Buried: React.FC = () => {
  const s = useSec();
  const heavy = s >= 34.5 ? pop(s, 34.5, 8) : 0;
  const cards: {x: number; y: number}[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) cards.push({x: 160 + c * 200, y: 120 + r * 130});
  return (
    <AbsoluteFill>
      <Glow x={960} y={500} r={800} a={0.1} />
      {cards.map((c, i) => {
        const t0 = 29.6 + rand(i) * 0.6 + (i % 9) * 0.05 + (s > 31.7 ? 0 : 3);
        const inner = c.x > 680 && c.x < 1240 && c.y > 300;
        if (inner) return null;
        const p = s >= t0 ? pop(s, t0, 11) : 0;
        return <Card key={i} x={c.x} y={c.y} w={170} label={s > 31.7 ? 'FREE' : undefined} op={Math.min(1, p * 2)} sc={0.7 + 0.3 * p} />;
      })}
      <Desk x={1000} w={440} />
      <Monitor x={1040} y={790} w={280} on={0.8} />
      <Spot x={760} />
      <CryoFigure x={760} y={FLOOR} R={58} front={POSES.type(Math.sin(s * 18) * 3).front} back={null} tilt={5} />
      <div style={{translate: `0 ${heavy * 60}px`}}>
        <Tag x={1040} y={380} text="$99" scale={0.7 + heavy * 0.15} str={150} swing={heavy ? Math.sin(s * 14) * 8 * (1 - ramp(s, 34.5, 35.6)) : 0} />
      </div>
      <Walker from={2100} to={-200} t0={34.6} t1={36.9} R={40} dim={0.3} />
      <Walker from={2300} to={-100} t0={34.9} t1={37.0} R={40} dim={0.3} />
    </AbsoluteFill>
  );
};

// 7. seller 2: next to a $2,000 mistake (a burning pile of money)
const PILE: {x: number; y: number}[] = [];
for (let r = 0; r < 6; r++) for (let k = 0; k < 7 - r; k++) PILE.push({x: 1180 + r * 48 + k * 96, y: FLOOR - 28 - r * 54});
const Mistake: React.FC = () => {
  const s = useSec();
  const loss = ramp(s, 39.6, 41.6, 0, 2000, Easing.out(Easing.quad));
  const cheap = s >= 42.8 ? pop(s, 42.8, 10) : 0;
  return (
    <AbsoluteFill>
      <Glow x={1460} y={720} r={560} a={0.26 + 0.05 * Math.sin(s * 11)} />
      <Desk x={540} w={420} />
      <Monitor x={580} y={790} w={260} on={1} />
      <Spot x={330} />
      <CryoFigure x={330} y={FLOOR} R={56} front={POSES.type(Math.sin(s * 18) * 3).front} back={null} tilt={5} />
      <Tag x={580} y={300} text="$99" scale={0.6} str={160} bright={cheap} />
      {PILE.map((b, i) => (s > 37.0 + i * 0.03 ? <Bill key={i} x={b.x} y={b.y} rot={(rand(i) - 0.5) * 6} /> : null))}
      {s > 38.6 && Array.from({length: 9}, (_, i) => <Flame key={i} i={i} x={1200 + i * 75} y={FLOOR - 40 - (i > 1 && i < 7 ? 120 : 40)} s={1 + rand(i) * 0.6} />)}
      {s > 39.0 &&
        Array.from({length: 10}, (_, i) => {
          const life = ((s - 39) * 0.9 + rand(i + 3)) % 1;
          return <div key={i} style={{position: 'absolute', left: 1220 + rand(i) * 520 + Math.sin(life * 8 + i) * 20, top: 700 - life * 500, width: 10, height: 10, borderRadius: 5, background: '#EDEDED', opacity: (1 - life) * 0.8}} />;
        })}
      <Counter x={1460} y={70} label="MISTAKE" value={`-${money(loss)}`} size={110} at={39.5} />
      <Label x={580} y={480} text="CHEAP" at={42.9} size={40} />
    </AbsoluteFill>
  );
};

// 8. same course, same price, different comparison -> different results
const Compare: React.FC = () => {
  const s = useSec();
  const rev = ramp(s, 45.0, 47.8, 0, 48230, Easing.out(Easing.quad)) + (Math.floor(s * 30) % 3) * 7;
  return (
    <AbsoluteFill>
      <Glow x={1440} y={620} r={520} a={0.2} />
      {/* left: next to free */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Card key={i} x={200 + (i % 3) * 190} y={200 + Math.floor(i / 3) * 130} w={160} label="FREE" op={0.55} />
      ))}
      <SellerSet x={480} dim={0.6} />
      <Tag x={600} y={430} text="$99" scale={0.5} str={80} dim={1} />
      <Counter x={480} y={40} label="REVENUE" value="$0" size={70} dim />
      {/* right: next to the problem */}
      {[0, 1, 2, 3, 4].map((i) => <Flame key={i} i={i} x={1690 + i * 40} y={FLOOR - 10} s={0.7} />)}
      <SellerSet x={1300} />
      <Tag x={1420} y={430} text="$99" scale={0.5} str={80} bright={0.6} />
      <Counter x={1360} y={40} label="REVENUE" value={money(rev)} size={70} at={44.9} />
      {[0, 1, 2].map((i) => <Walker key={i} from={2200 + i * 150} to={1700 + i * 110} t0={44.2 + i * 0.25} t1={45.2 + i * 0.25} R={34} />)}
    </AbsoluteFill>
  );
};

// 9. the comparison has to be honest: the fire was a cardboard cutout
const Honest: React.FC = () => {
  const s = useSec();
  const fall = ramp(s, 51.6, 52.2, 0, 1, Easing.in(Easing.quad));
  const leave = ramp(s, 52.5, 53.6, 0, 1, Easing.in(Easing.quad));
  const angry = s >= 52.3 ? pop(s, 52.3, 9) : 0;
  return (
    <AbsoluteFill>
      <Glow x={1150} y={640} r={500} a={0.2 * (1 - fall)} />
      <SellerSet x={480} />
      <Tag x={600} y={300} text="$99" scale={0.55} str={160} />
      {/* cutout */}
      <div style={{position: 'absolute', left: 950, top: 520, width: 420, height: FLOOR - 520, transformOrigin: '50% 100%', scale: `1 ${1 - fall * 0.93}`, translate: `${Math.sin(fall * Math.PI) * -20}px 0`}}>
        <div style={{position: 'absolute', inset: 0, border: `5px solid ${G}`, borderRadius: 10, background: 'rgba(28,28,28,0.95)'}} />
        {Array.from({length: 5}, (_, i) => <Flame key={i} i={i} x={60 + i * 75} y={250} s={0.9} />)}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#E6E6E6'}}>$2,000</div>
      </div>
      {s > 52.1 && <div style={{position: 'absolute', left: 950, top: 800, width: 420, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: '#9A9A9A', opacity: pop(s, 52.1)}}>CARDBOARD</div>}
      {[1500, 1660, 1820].map((x, i) => (
        <React.Fragment key={x}>
          <CryoFigure x={x + leave * 500} y={FLOOR} R={44} front={angry > 0.5 && leave < 0.1 ? POSES.shrug.front : POSES.rest.front} back={angry > 0.5 && leave < 0.1 ? POSES.shrug.back : POSES.rest.back} facing={leave > 0 ? 1 : -1} dim={leave * 0.6} />
          {angry > 0 && leave < 0.6 && <div style={{position: 'absolute', left: x - 18, top: FLOOR - 330, fontFamily: FONT, fontWeight: 900, fontSize: 90, color: '#E6E6E6', opacity: angry * (1 - leave * 1.6), filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.5))'}}>!</div>}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// 10. the line to remember (beat strips out)
const Remember: React.FC = () => {
  const s = useSec();
  const line = (t: number, text: string, size: number, dim: boolean) => {
    const p = s >= t ? pop(s, t, 13) : 0;
    return <div style={{fontSize: size, color: dim ? '#8C8C8C' : '#ECECEC', opacity: p, translate: `0 ${(1 - p) * 40}px`, filter: dim ? undefined : 'drop-shadow(0 0 24px rgba(255,255,255,0.45))'}}>{text}</div>;
  };
  return (
    <AbsoluteFill>
      <Spot x={960} w={820} a={0.6 + ramp(s, 58.6, 59.6)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 900, lineHeight: 1.12, letterSpacing: 2}}>
        {line(56.8, "PEOPLE DON'T JUDGE YOUR PRICE.", 70, true)}
        <div style={{height: 22}} />
        {line(58.7, "THEY JUDGE WHAT'S NEXT TO IT.", 104, false)}
      </div>
      <Tag x={860} y={640} text="$99" scale={0.6} str={120} />
      {s > 59.2 && Array.from({length: 4}, (_, i) => <Flame key={i} i={i} x={1060 + i * 45} y={FLOOR - 10} s={0.6} />)}
      <Floor />
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUTS = [6.623, 10.18, 15.515, 19.961, 24.407, 28.853, 36.856, 43.969, 48.415, 53.751];
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.22, src: 'sfx/whoosh.wav', vol: 0.45})),
  {t: 3.0, src: 'sfx/whoosh.wav', vol: 0.5},
  {t: 1.36, src: SFX('coin-collect'), vol: 0.5},
  {t: 1.9, src: SFX('select-002'), vol: 0.35},
  {t: 2.25, src: SFX('select-002'), vol: 0.35},
  {t: 2.6, src: SFX('select-002'), vol: 0.35},
  ...Array.from({length: 12}, (_, i) => ({t: 4.7 + i * 0.13, src: SFX('tick-001'), vol: 0.35})),
  ...Array.from({length: 5}, (_, i) => ({t: 6.65 + i * 0.12, src: SFX('drop-002'), vol: 0.45})),
  {t: 13.4, src: SFX('switch-002'), vol: 0.45},
  ...Array.from({length: 7}, (_, i) => ({t: 15.1 + i * 0.12, src: SFX('drop-002'), vol: 0.3})),
  {t: 18.91, src: SFX('confirmation-002'), vol: 0.45},
  {t: 22.9, src: SFX('error-002'), vol: 0.5},
  {t: 26.5, src: SFX('select-002'), vol: 0.45},
  ...Array.from({length: 10}, (_, i) => ({t: 31.75 + i * 0.07, src: SFX('notification-pop'), vol: 0.18})),
  {t: 34.5, src: SFX('impact-wood-heavy-001'), vol: 0.7},
  {t: 39.5, src: SFX('impact-generic-light-002'), vol: 0.5},
  {t: 42.8, src: SFX('success-chime'), vol: 0.5},
  {t: 45.0, src: SFX('handle-coins'), vol: 0.45},
  {t: 46.2, src: SFX('coin-collect'), vol: 0.4},
  {t: 51.6, src: SFX('impact-wood-heavy-001'), vol: 0.8},
  {t: 52.3, src: SFX('error-002'), vol: 0.5},
  {t: 58.7, src: SFX('impact-generic-light-002'), vol: 0.5},
];

// ---------- composition ----------
const World: React.FC = () => (
  <AbsoluteFill>
    <Shot start={0} end={6.623} first zoom={[1.06, 1.0]}>
      <Floor />
      <Hook />
    </Shot>
    <Shot start={6.623} end={10.18} zoom={[1.0, 1.06]}>
      <Floor />
      <Worth />
    </Shot>
    <Shot start={10.18} end={15.515} zoom={[1.0, 1.05]}>
      <Floor />
      <Shortcut />
    </Shot>
    <Shot start={15.515} end={19.961} zoom={[1.0, 1.06]}>
      <Floor />
      <CoffeeRow />
    </Shot>
    <Shot start={19.961} end={24.407} zoom={[1.0, 1.05]}>
      <Floor />
      <AppGrid />
    </Shot>
    <Shot start={24.407} end={28.853} zoom={[1.0, 1.04]}>
      <Floor />
      <TwoSellers />
    </Shot>
    <Shot start={28.853} end={36.856} zoom={[1.12, 1.0]} origin="50% 75%">
      <Floor />
      <Buried />
    </Shot>
    <Shot start={36.856} end={43.969} zoom={[1.1, 1.0]} origin="40% 80%">
      <Floor />
      <Mistake />
    </Shot>
    <Shot start={43.969} end={48.415} zoom={[1.0, 1.04]}>
      <Floor />
      <Compare />
    </Shot>
    <Shot start={48.415} end={53.751} zoom={[1.0, 1.05]}>
      <Floor />
      <Honest />
    </Shot>
    <Shot start={53.751} end={62.5} last zoom={[1.0, 1.06]}>
      <Remember />
    </Shot>
  </AbsoluteFill>
);

export const NextTo: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fade = interpolate(frame, [NEXT_TO_FRAMES - 24, NEXT_TO_FRAMES], [1, 0], clamp);
  const world = (
    <AbsoluteFill style={{scale: `${1 + bp * 0.012}`}}>
      <World />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <Audio src={staticFile('vo3/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-3.wav')} volume={0.42} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px'}} />
        <AbsoluteFill style={{filter: `blur(0.5px) contrast(1.18) brightness(${0.95 + bp * 0.08})`}}>{world}</AbsoluteFill>
        {/* bloom pass */}
        <AbsoluteFill style={{filter: 'blur(16px) brightness(1.3)', opacity: 0.45, mixBlendMode: 'screen'}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, rgba(0,0,0,0.78) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
