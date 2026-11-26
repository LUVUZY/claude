import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES, typing} from './CryoFigure';
import {FONT, FPS, clamp, fr, money, pop, ramp, rand, useSec} from './MaybeLater';
import {Desk, G, Glow, Monitor, Tag} from './NextTo';
import grid from './song-grid-9.json';

// "Who They Become" (V1 cryothum figure style) — hook: "Nobody buys a product. They buy the person they become after owning it."
// Built to the buyers-mind-reels house style (payoff-first opening, one metaphor per sentence, growth-curve ending).
export const WTB_FRAMES = fr(62);
const BEAT = grid.beat;
const DROP = grid.drop;
const STRIP = grid.strip;
const FLOOR = 905;
const CUTS = [4.22, 10.6, 20.8, 24.5, 34.6, 41.0, 48.6, 55.6];
const beatPulse = (sec: number) => (sec < DROP || sec > STRIP ? 0 : Math.exp(-((sec - DROP) % BEAT) / 0.1));

// ---------- kit ----------
const Floor: React.FC = () => <div style={{position: 'absolute', left: -2000, right: -2000, top: FLOOR, height: 3, backgroundImage: 'linear-gradient(90deg, rgba(215,215,215,0.45) 55%, transparent 55%)', backgroundSize: '24px 3px'}} />;
const Beam: React.FC<{x: number; w?: number; a?: number}> = ({x, w = 420, a = 1}) => (
  <>
    <div style={{position: 'absolute', left: x - w / 2, top: -20, width: w, height: FLOOR + 30, background: `linear-gradient(180deg, rgba(255,255,255,${0.02 * a}), rgba(255,255,255,${0.13 * a}))`, clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)', filter: 'blur(16px)'}} />
    <div style={{position: 'absolute', left: x - w * 0.65, top: FLOOR - 55, width: w * 1.3, height: 110, borderRadius: '50%', background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${0.2 * a}), transparent 70%)`}} />
  </>
);
const Tiny: React.FC<{x: number; y: number; text: string; at?: number; size?: number; w?: number; dim?: boolean}> = ({x, y, text, at = -9, size = 16, w = 500, dim}) => {
  const s = useSec();
  if (s < at) return null;
  return <div style={{position: 'absolute', left: x - w / 2, width: w, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: size * 0.28, color: dim ? '#6A6A6A' : '#C8C8C8', opacity: pop(s, at, 14)}}>{text}</div>;
};
const Pill: React.FC<{x: number; y: number; text: string; at: number; out?: number; dark?: boolean; size?: number}> = ({x, y, text, at, out = 999, dark, size = 20}) => {
  const s = useSec();
  if (s < at || s > out + 0.3) return null;
  const p = pop(s, at, 11) * (1 - ramp(s, out, out + 0.3));
  return <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: `${0.6 + 0.4 * p}`, opacity: p, padding: '8px 18px', borderRadius: 18, background: dark ? 'rgba(14,14,14,0.96)' : '#ECECEC', border: dark ? `3px solid ${G}` : undefined, color: dark ? '#E6E6E6' : '#141414', fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: 1.5, whiteSpace: 'nowrap', boxShadow: '0 0 24px rgba(255,255,255,0.35)'}}>{text}</div>;
};
const Counter: React.FC<{x: number; y: number; label: string; value: string; size?: number; at?: number; dim?: boolean}> = ({x, y, label, value, size = 110, at = -9, dim}) => {
  const s = useSec();
  if (s < at) return null;
  return (
    <div style={{position: 'absolute', left: x - 450, width: 900, top: y, textAlign: 'center', fontFamily: FONT, opacity: pop(s, at, 14)}}>
      <div style={{fontWeight: 700, fontSize: 24, letterSpacing: 7, color: '#A0A0A0'}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 1.05, color: dim ? '#6A6A6A' : '#E8E8E8', filter: dim ? undefined : 'drop-shadow(0 0 20px rgba(255,255,255,0.35))'}}>{value}</div>
    </div>
  );
};
const Money: React.FC<{x: number; y: number; rot?: number; op?: number}> = ({x, y, rot = 0, op = 1}) => (
  <div style={{position: 'absolute', left: x - 44, top: y - 27, width: 88, height: 54, borderRadius: 5, background: '#DCDCDC', border: '3px solid #8A8A8A', rotate: `${rot}deg`, opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontFamily: FONT, fontWeight: 900, fontSize: 22, color: '#555', boxShadow: '0 0 14px rgba(255,255,255,0.2)'}}>
    <span>$</span>
    <span>$</span>
  </div>
);
const Coin: React.FC<{x: number; y: number; op?: number}> = ({x, y, op = 1}) => <div style={{position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: 13, background: '#EDEDED', border: '3px solid #9A9A9A', opacity: op, boxShadow: '0 0 14px rgba(255,255,255,0.6)', fontFamily: FONT, fontWeight: 900, fontSize: 14, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>$</div>;
const Box: React.FC<{x: number; y: number; w?: number; h?: number; op?: number; lit?: number}> = ({x, y, w = 120, h = 90, op = 1, lit = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, borderRadius: 8, border: `4px solid ${G}`, background: lit ? `rgba(255,255,255,${0.1 + 0.4 * lit})` : 'rgba(22,22,22,0.97)', opacity: op, boxShadow: lit ? `0 0 ${40 * lit}px rgba(255,255,255,0.4)` : undefined}}>
    <div style={{height: h * 0.25, borderBottom: `4px solid ${G}`}} />
  </div>
);
const Cloud: React.FC<{x: number; y: number; at: number; w?: number; children?: React.ReactNode}> = ({x, y, at, w = 170, children}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 11);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.36, width: w, height: w * 0.72, opacity: p, scale: `${0.6 + 0.4 * p}`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: '3px dashed rgba(220,220,220,0.75)', background: 'rgba(16,16,16,0.9)'}} />
      <div style={{position: 'absolute', left: '40%', bottom: -26, width: 14, height: 14, borderRadius: 7, border: '3px dashed rgba(220,220,220,0.6)'}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, color: '#ECECEC', fontSize: w * 0.3}}>{children}</div>
    </div>
  );
};
const Stall: React.FC<{x: number; s?: number; dim?: number}> = ({x, s = 1, dim = 0}) => {
  const c = dim > 0.5 ? '#6A6A6A' : G;
  return (
    <svg style={{position: 'absolute', left: x - 230 * s, top: FLOOR - 600 * s, overflow: 'visible', filter: dim > 0.5 ? undefined : 'drop-shadow(0 0 16px rgba(255,255,255,0.25))'}} width={460 * s} height={600 * s} viewBox="0 0 460 600">
      <line x1={34} y1={70} x2={34} y2={600} stroke={c} strokeWidth={6} />
      <line x1={426} y1={70} x2={426} y2={600} stroke={c} strokeWidth={6} />
      <path d="M0 70 L460 70 L460 135 Q431 168 402 135 Q373 168 345 135 Q316 168 287 135 Q259 168 230 135 Q201 168 172 135 Q144 168 115 135 Q86 168 57 135 Q29 168 0 135 Z" fill="rgba(16,16,16,0.97)" stroke={c} strokeWidth={6} />
      <rect x={12} y={390} width={436} height={210} rx={12} fill="rgba(16,16,16,0.97)" stroke={c} strokeWidth={6} />
    </svg>
  );
};
type PoseName = 'rest' | 'cheer' | 'point' | 'hold' | 'shrug';
const P: React.FC<{x: number; y?: number; R?: number; pose?: PoseName; dim?: number; facing?: 1 | -1; tilt?: number}> = ({x, y = FLOOR, R = 30, pose = 'rest', dim = 0, facing = 1, tilt = 0}) => {
  const p = POSES[pose] as {front: any; back: any};
  return <CryoFigure x={x} y={y} R={R} front={p.front} back={p.back} dim={dim} facing={facing} tilt={tilt} ring={false} />;
};

// ---------- shots ----------
const T = 0.34;
const Shot: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean; last?: boolean}> = ({start, end, children, zoom = [1, 1.05], origin = '50% 65%', first, last}) => {
  const s = useSec();
  if (s < (first ? -1 : start - T / 2) || s > (last ? 999 : end + T / 2)) return null;
  const pin = first ? 1 : ramp(s, start - T / 2, start + T / 2, 0, 1, Easing.out(Easing.cubic));
  const pout = last ? 0 : ramp(s, end - T / 2, end + T / 2, 0, 1, Easing.in(Easing.cubic));
  const drift = interpolate(s, [start, end], zoom, {...clamp, easing: Easing.inOut(Easing.sin)});
  const blur = 16 * (1 - pin) + 18 * pout;
  return <AbsoluteFill style={{scale: `${drift * (1 + 0.14 * (1 - pin)) * (1 + 0.22 * pout)}`, transformOrigin: origin, opacity: Math.min(pin, 1 - pout), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

// ---------- scenes ----------
const Shoe: React.FC<{x: number; y: number; s?: number; dim?: boolean}> = ({x, y, s = 1, dim}) => (
  <svg style={{position: 'absolute', left: x - 90 * s, top: y - 70 * s, overflow: 'visible', filter: dim ? undefined : 'drop-shadow(0 0 14px rgba(255,255,255,0.35))'}} width={180 * s} height={70 * s} viewBox="0 0 180 70">
    <path d="M8 62 L8 30 Q10 14 30 14 L62 14 Q72 30 96 34 L150 44 Q174 50 174 62 Z" fill="rgba(20,20,20,0.97)" stroke={dim ? '#6A6A6A' : G} strokeWidth={5} strokeLinejoin="round" />
    <path d="M40 22 L52 40 M54 20 L66 38 M8 54 H174" stroke={dim ? '#6A6A6A' : G} strokeWidth={4} fill="none" />
  </svg>
);
// a dashed outline figure: who they want to become
const Ghost: React.FC<{x: number; R: number; solid: number; pose?: PoseName}> = ({x, R, solid, pose = 'cheer'}) => (
  <div style={{position: 'absolute', inset: 0, opacity: 0.35 + 0.65 * solid}}>
    <div style={{position: 'absolute', inset: 0, filter: `blur(${(1 - solid) * 2}px)`}}>
      <P x={x} R={R} pose={pose} dim={0.55 * (1 - solid)} />
    </div>
  </div>
);

// 1. payoff first: a plain buyer, a glowing future self in the mirror, money piling up
const PYR: {x: number; y: number}[] = [];
for (let r = 0; r < 7; r++) for (let k = 0; k < 8 - r; k++) PYR.push({x: 1380 + r * 50 + k * 100, y: FLOOR - 27 - r * 56});
const Hook: React.FC = () => {
  const s = useSec();
  const zoom = interpolate(s, [0, 4.2], [1.3, 0.94], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lit = ramp(s, 1.44, 2.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{scale: `${zoom}`, transformOrigin: '35% 85%'}}>
        <Beam x={520} w={520} a={0.6 + lit} />
        {/* mirror */}
        <div style={{position: 'absolute', left: 640, top: 330, width: 400, height: FLOOR - 340, borderRadius: '200px 200px 10px 10px', border: `6px solid ${G}`, background: `rgba(255,255,255,${0.03 + 0.1 * lit})`, boxShadow: `0 0 ${60 * lit}px rgba(255,255,255,${0.35 * lit})`}} />
        <Glow x={840} y={620} r={260} a={0.25 * lit} />
        <div style={{opacity: lit}}>
          <P x={840} R={46} pose={s > 2.6 ? 'cheer' : 'rest'} />
        </div>
        <P x={440} R={40} pose={s > 0.8 ? 'hold' : 'rest'} dim={0.15 - lit * 0.15} />
        <Tiny x={840} y={FLOOR + 22} text="WHO THEY BECOME" at={2.2} />
        {/* the box they bought */}
        <div style={{position: 'absolute', left: 300, top: FLOOR - 70, width: 90, height: 70, border: `4px solid ${G}`, borderRadius: 6, background: 'rgba(20,20,20,0.97)', opacity: 1 - lit * 0.6}} />
        {PYR.map((b, i) => {
          const t0 = 0.25 + i * 0.05;
          if (s < t0) return null;
          const p = pop(s, t0, 12);
          return <Money key={i} x={b.x} y={interpolate(p, [0, 1], [b.y - 500, b.y])} op={Math.min(1, p * 2)} rot={(rand(i) - 0.5) * 6} />;
        })}
        {s > 0.4 && Array.from({length: 8}, (_, i) => {
          const life = ((s - 0.4) * 1.1 + i / 8) % 1;
          return <Coin key={i} x={1300 + (i % 4) * 140} y={-40 + life * 700} op={Math.sin(life * Math.PI)} />;
        })}
        <Floor />
      </AbsoluteFill>
      <Counter x={960} y={40} label="WHAT THEY PAID" value={money(interpolate(s, [0, 4], [0, 1], clamp) ** 2.4 * 993000 + 8400)} size={128} />
    </AbsoluteFill>
  );
};

// 2. most sellers list features, buyers walk past
const Features: React.FC = () => {
  const s = useSec();
  const feats = [['SIZE', 6.26], ['SPEED', 6.96], ['MATERIALS', 7.54]] as const;
  return (
    <AbsoluteFill>
      <Beam x={620} w={460} a={1} />
      <P x={620} R={40} pose={s > 9.5 ? 'shrug' : 'point'} />
      <div style={{position: 'absolute', left: 840, top: 330, width: 380, padding: '26px 30px', borderRadius: 12, border: `5px solid ${G}`, background: 'rgba(20,20,20,0.97)', opacity: pop(s, 5.0), boxShadow: '0 0 30px rgba(255,255,255,0.12)'}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 18, letterSpacing: 5, color: '#9A9A9A', marginBottom: 14}}>FEATURES</div>
        {feats.map(([t, at]) => (
          <div key={t} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#E6E6E6', opacity: s > at ? pop(s, at) : 0}}>
            <span>{t}</span>
            <span style={{fontSize: 26}}>✓</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 940, top: FLOOR - 120, width: 160, height: 120, border: `5px solid ${G}`, borderRadius: 8, background: 'rgba(20,20,20,0.97)'}} />
      {/* buyers walk straight past */}
      {Array.from({length: 5}, (_, i) => {
        const t0 = 8.3 + i * 0.35;
        const x = interpolate(s, [t0, t0 + 3.2], [2100, -200], clamp);
        return <P key={i} x={x} y={FLOOR - (x > -100 && x < 2000 ? Math.abs(Math.sin(s * 9 + i)) * 6 : 0)} R={26} facing={-1} dim={0.3} />;
      })}
      <Cloud x={620} y={300} at={9.66} w={150}>
        ?
      </Cloud>
      <Tiny x={1500} y={FLOOR + 22} text="NOBODY CARES" at={9.9} />
    </AbsoluteFill>
  );
};

// 3-4. same shoes, two pitches
const TwoSellers: React.FC = () => {
  const s = useSec();
  const sun = ramp(s, 18.9, 20.4);
  return (
    <AbsoluteFill>
      <Beam x={560} w={420} a={s > 16.9 ? 0.45 : 1} />
      <Beam x={1360} w={420} a={s > 16.9 ? 1.2 : 0.6} />
      <P x={460} R={36} pose={s > 14.0 && s < 16.9 ? 'point' : 'rest'} dim={s > 16.9 ? 0.3 : 0} />
      <P x={1260} R={36} pose={s > 17.6 ? 'point' : 'rest'} />
      <Shoe x={640} y={FLOOR - 120} s={1.1} dim={s > 16.9} />
      <Shoe x={1440} y={FLOOR - 120} s={1.1} />
      <div style={{position: 'absolute', left: 560, top: FLOOR - 100, width: 160, height: 100, border: `4px solid ${s > 16.9 ? '#6A6A6A' : G}`, borderTop: 'none'}} />
      <div style={{position: 'absolute', left: 1360, top: FLOOR - 100, width: 160, height: 100, border: `4px solid ${G}`, borderTop: 'none'}} />
      {s > 12.43 && <div style={{position: 'absolute', left: 960, top: FLOOR - 170, translate: '-50% 0', fontFamily: FONT, fontWeight: 900, fontSize: 90, color: '#DADADA', opacity: pop(s, 12.43)}}>=</div>}
      <Tiny x={960} y={FLOOR + 22} text="EXACT SAME SHOES" at={12.6} />
      <Pill x={560} y={330} text="LIGHTWEIGHT FOAM" at={14.56} dark={s > 16.9} />
      <Pill x={560} y={400} text="BREATHABLE MESH" at={15.96} dark={s > 16.9} />
      {/* the other pitch: a sunrise and a runner */}
      <Cloud x={1360} y={300} at={18.2} w={330}>
        <svg width={250} height={150} viewBox="0 0 250 150" style={{overflow: 'visible'}}>
          <line x1={10} y1={110} x2={240} y2={110} stroke="#DADADA" strokeWidth={4} />
          <circle cx={125} cy={110 - 50 * sun} r={30} fill="#EDEDED" opacity={0.4 + 0.6 * sun} />
          {s > 19.5 && <circle cx={60 + ((s * 60) % 140)} cy={86} r={9} fill="#EDEDED" />}
          {s > 19.5 && <rect x={53 + ((s * 60) % 140)} y={96} width={14} height={14} rx={6} fill="#EDEDED" />}
        </svg>
      </Cloud>
      <Tiny x={1360} y={460} text="BECOME A RUNNER" at={20.3} />
    </AbsoluteFill>
  );
};

// 5. compared on price vs bought
const PriceVsBought: React.FC = () => {
  const s = useSec();
  const prices = ['$89', '$79', '$69', '$59'];
  const pi = Math.min(3, Math.floor(ramp(s, 21.85, 23.0, 0, 3.99, Easing.linear)));
  return (
    <AbsoluteFill>
      <Beam x={520} w={400} a={0.5} />
      <Beam x={1380} w={460} a={1.2} />
      <P x={420} R={32} pose="shrug" dim={0.25} />
      <Shoe x={600} y={FLOOR - 40} dim />
      {[0, 1, 2].map((k) => <Tag key={k} x={380 + k * 170} y={330 + (k % 2) * 40} text={prices[Math.min(3, k + (pi >= 2 ? 1 : 0))]} scale={0.55} dim={1} swing={Math.sin(s * 3 + k) * 6} />)}
      <Tiny x={520} y={FLOOR + 22} text="COMPARED ON PRICE" at={22.4} dim />
      <P x={1260} R={36} pose={s > 23.9 ? 'cheer' : 'hold'} />
      <Shoe x={1440} y={FLOOR - 40} />
      {Array.from({length: 6}, (_, i) => {
        const t0 = 23.1 + i * 0.18;
        const p = ramp(s, t0, t0 + 0.8, 0, 1, Easing.out(Easing.cubic));
        return <P key={i} x={interpolate(p, [0, 1], [2150, 1560 + i * 62])} R={22} facing={-1} dim={0.15} />;
      })}
      {s > 23.7 && Array.from({length: 6}, (_, i) => {
        const life = ((s - 23.7) * 1.4 + i / 6) % 1;
        return <Coin key={i} x={1560 + i * 50 - life * 200} y={FLOOR - 120 - Math.sin(life * Math.PI) * 150} op={Math.sin(life * Math.PI)} />;
      })}
      <Tiny x={1400} y={FLOOR + 22} text="BOUGHT" at={24.0} />
    </AbsoluteFill>
  );
};

// 6. money goes to who they want to be (TODAY -> dashed future self)
const Become: React.FC = () => {
  const s = useSec();
  const words = [['RICHER', 30.58], ['FITTER', 31.31], ['RESPECTED', 31.95], ['TAKEN SERIOUSLY', 32.99]] as const;
  const solid = ramp(s, 30.4, 33.8);
  return (
    <AbsoluteFill>
      <Beam x={480} w={380} a={0.9} />
      <P x={480} R={34} pose={s > 27.6 ? 'point' : 'rest'} />
      <Tiny x={480} y={FLOOR + 22} text="TODAY" at={24.8} />
      {/* things: a crossed-out box */}
      <div style={{position: 'absolute', left: 680, top: FLOOR - 100, width: 120, height: 100, border: `4px solid ${s > 27.0 ? '#6A6A6A' : G}`, borderRadius: 6, opacity: pop(s, 25.9)}} />
      {s > 27.0 && <div style={{position: 'absolute', left: 740, top: FLOOR - 50, translate: '-50% -50%', fontFamily: FONT, fontWeight: 900, fontSize: 130, color: '#EDEDED', opacity: pop(s, 27.0)}}>✕</div>}
      <Tiny x={740} y={FLOOR + 22} text="THINGS" at={26.98} dim />
      {/* future self, big and dashed, solidifying */}
      <Beam x={1400} w={640} a={0.4 + solid} />
      <Glow x={1400} y={620} r={340} a={0.08 + 0.25 * solid} />
      <Ghost x={1400} R={88} solid={solid} />
      <Tiny x={1400} y={FLOOR + 22} text="WHO THEY WANT TO BE" at={29.0} />
      {/* bills flowing from today to tomorrow */}
      {s > 27.7 && Array.from({length: 7}, (_, i) => {
        const life = ((s - 27.7) * 0.7 + i / 7) % 1;
        return <Money key={i} x={560 + life * 700} y={560 - Math.sin(life * Math.PI) * 200} rot={life * 40} op={Math.sin(life * Math.PI)} />;
      })}
      {words.map(([t, at], i) => <Pill key={t} x={[1110, 1660, 1090, 1640][i]} y={[290, 290, 450, 450][i]} text={t} at={at} size={24} />)}
    </AbsoluteFill>
  );
};

// 7. a gym sells the summer body; a course sells the new life
const Examples: React.FC = () => {
  const s = useSec();
  const t1 = s > 36.94;
  const v1 = s > 40.22;
  return (
    <AbsoluteFill>
      {/* gym */}
      <Beam x={540} w={460} a={1} />
      <svg style={{position: 'absolute', left: 280, top: FLOOR - 230, overflow: 'visible'}} width={300} height={230}>
        <path d="M10 230 L260 200 M240 200 L270 40 L230 30" fill="none" stroke={t1 ? '#5E5E5E' : G} strokeWidth={6} strokeLinecap="round" />
        <rect x={10} y={205} width={240} height={22} rx={8} fill="none" stroke={t1 ? '#5E5E5E' : G} strokeWidth={5} />
      </svg>
      {t1 && <div style={{position: 'absolute', left: 400, top: FLOOR - 130, translate: '-50% -50%', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#EDEDED', opacity: pop(s, 36.94)}}>✕</div>}
      <div style={{opacity: pop(s, 36.2)}}>
        <Glow x={680} y={700} r={220} a={0.22} />
        <P x={680} R={40} pose="cheer" />
      </div>
      <Tiny x={540} y={FLOOR + 22} text="SUMMER BODY" at={36.3} />
      {/* course */}
      <Beam x={1380} w={460} a={1} />
      <Monitor x={1250} y={FLOOR - 120} w={300} on={v1 ? 0.2 : 1} />
      <div style={{position: 'absolute', left: 1150, top: FLOOR - 120, width: 200, height: 120, borderLeft: `5px solid ${G}`, borderRight: `5px solid ${G}`}} />
      {v1 && <div style={{position: 'absolute', left: 1250, top: FLOOR - 270, translate: '-50% -50%', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#EDEDED', opacity: pop(s, 40.22)}}>✕</div>}
      <div style={{opacity: pop(s, 39.4)}}>
        <svg style={{position: 'absolute', left: 1430, top: FLOOR - 250, overflow: 'visible'}} width={240} height={250}>
          <polygon points="0,110 120,20 240,110" fill="rgba(20,20,20,0.97)" stroke={G} strokeWidth={5} />
          <rect x={25} y={110} width={190} height={140} fill="rgba(20,20,20,0.97)" stroke={G} strokeWidth={5} />
          <rect x={95} y={170} width={50} height={80} fill="none" stroke={G} strokeWidth={4} />
        </svg>
        <P x={1720} R={30} pose="cheer" />
      </div>
      <Tiny x={1500} y={FLOOR + 22} text="NEW LIFE" at={39.6} />
      {Array.from({length: 10}, (_, i) => {
        const life = ((s - 34.6) * 0.3 + rand(i)) % 1;
        return <div key={i} style={{position: 'absolute', left: 100 + rand(i + 7) * 1700, top: 900 - life * 700, width: 5, height: 5, borderRadius: 3, background: '#EDEDED', opacity: Math.sin(life * Math.PI) * 0.6}} />;
      })}
    </AbsoluteFill>
  );
};

// 8. every sale changes: the question in the seller's head flips
const Question: React.FC = () => {
  const s = useSec();
  const needle = interpolate(s, [42.5, 48.4], [-70, 62], {...clamp, easing: Easing.inOut(Easing.cubic)}) + Math.sin(s * 5) * 2;
  return (
    <AbsoluteFill>
      <Beam x={560} w={460} a={1} />
      <Desk x={640} w={520} y={790} />
      <Monitor x={720} y={790} w={300} />
      <P x={470} R={38} pose={s > 46.8 ? 'cheer' : 'rest'} />
      <Pill x={560} y={290} text="WHAT DOES IT DO?" at={44.3} out={46.4} dark size={26} />
      <Pill x={560} y={290} text="WHO DO THEY WANT TO BECOME?" at={46.7} size={28} />
      {/* sales gauge climbing */}
      <svg style={{position: 'absolute', left: 1220, top: 380, overflow: 'visible', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.3))'}} width={460} height={260}>
        <path d="M 30 240 A 200 200 0 0 1 430 240" fill="none" stroke="#3A3A3A" strokeWidth={26} />
        <path d="M 30 240 A 200 200 0 0 1 430 240" fill="none" stroke="#EDEDED" strokeWidth={26} pathLength={1} strokeDasharray={`${(needle + 90) / 180} 1`} />
        <line x1={230} y1={240} x2={230 + Math.sin((needle * Math.PI) / 180) * 170} y2={240 - Math.cos((needle * Math.PI) / 180) * 170} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
        <circle cx={230} cy={240} r={16} fill="#FFFFFF" />
      </svg>
      <Tiny x={1450} y={660} text="SALES" at={42.5} />
    </AbsoluteFill>
  );
};

// 9. the product still has to deliver
const Deliver: React.FC = () => {
  const s = useSec();
  const open = ramp(s, 50.4, 51.0);
  const leave = ramp(s, 53.4, 55.0);
  const trust = 1 - ramp(s, 52.8, 54.4);
  return (
    <AbsoluteFill>
      <Beam x={900} w={460} a={1 - leave * 0.6} />
      <P x={900 + leave * 700} R={36} pose={leave > 0 ? 'rest' : s > 51.2 ? 'shrug' : 'hold'} facing={leave > 0 ? 1 : -1} dim={leave * 0.4} />
      {/* the box opens: empty */}
      <div style={{position: 'absolute', left: 700, top: FLOOR - 110, width: 140, height: 110, border: `5px solid ${G}`, borderRadius: 6, background: 'rgba(20,20,20,0.97)'}} />
      <div style={{position: 'absolute', left: 700, top: FLOOR - 118, width: 140, height: 10, background: G, rotate: `${-open * 70}deg`, transformOrigin: '0 50%'}} />
      <Tiny x={770} y={FLOOR + 22} text="EMPTY PROMISE" at={51.2} />
      <Cloud x={980} y={330} at={51.06} w={280}>
        <span style={{fontSize: 48, opacity: s > 52.5 ? 0.35 : 1}}>NEW YOU</span>
      </Cloud>
      {/* trust bar draining */}
      <div style={{position: 'absolute', left: 1240, top: 470, width: 420, height: 60, border: `5px solid ${G}`, borderRadius: 10}}>
        <div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: 400 * trust, borderRadius: 5, background: '#EDEDED', boxShadow: '0 0 20px rgba(255,255,255,0.5)'}} />
      </div>
      <Tiny x={1450} y={550} text="TRUST" at={52.6} />
      <Pill x={1450} y={400} text="NEVER AGAIN" at={54.1} />
    </AbsoluteFill>
  );
};

// 10. ending: growth curve, closing line in caps
const Ending: React.FC = () => {
  const s = useSec();
  const prog = ramp(s, 55.9, 60.4, 0, 1, Easing.inOut(Easing.quad));
  const pts: [number, number][] = [];
  for (let i = 0; i <= 120 * prog; i++) {
    const u = i / 120;
    const saw = u < 0.55 ? ((u * 9) % 1) * 36 : 0;
    const expo = u > 0.5 ? Math.pow((u - 0.5) / 0.5, 3) * 560 : 0;
    pts.push([280 + u * 1380, 900 - saw - expo]);
  }
  const tip = pts[pts.length - 1] ?? [280, 900];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 270, top: 260, width: 5, height: 645, background: G}} />
      <div style={{position: 'absolute', left: 270, top: 900, width: 1420, height: 5, background: G}} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.5))'}} width={1920} height={1080}>
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#EDEDED" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <Glow x={tip[0]} y={tip[1]} r={150} a={0.35} />
      <P x={tip[0]} y={tip[1] - 4} R={24} pose={prog > 0.6 ? 'cheer' : 'rest'} />
      <Counter x={620} y={300} label="SALES" value={money(interpolate(prog, [0, 0.5, 1], [0, 3880, 1002640]))} size={76} />
      {s > 55.9 && <div style={{position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 80, letterSpacing: 4, color: '#ECECEC', opacity: pop(s, 55.9, 13), filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.5))'}}>SELL WHO THEY BECOME.</div>}
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-soft/${n}.wav`;
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.3, src: SFX('whoosh'), vol: 0.22})),
  {t: 0.35, src: SFX('coins'), vol: 0.3},
  {t: 1.6, src: SFX('riser'), vol: 0.25},
  {t: 2.6, src: SFX('chime'), vol: 0.32},
  {t: 12.43, src: SFX('pop'), vol: 0.3},
  {t: 23.9, src: SFX('coins'), vol: 0.25},
  {t: 27.0, src: SFX('thud'), vol: 0.4},
  {t: 33.0, src: SFX('chime'), vol: 0.22},
  {t: 46.7, src: SFX('pop'), vol: 0.3},
  {t: 54.1, src: SFX('thud'), vol: 0.45},
  {t: 55.9, src: SFX('thud'), vol: 0.55},
];

const World: React.FC = () => (
  <AbsoluteFill>
    <Shot start={0} end={4.22} first zoom={[1, 1]}>
      <Hook />
    </Shot>
    <Shot start={4.22} end={10.6}>
      <Floor />
      <Features />
    </Shot>
    <Shot start={10.6} end={20.8} zoom={[1.0, 1.07]}>
      <Floor />
      <TwoSellers />
    </Shot>
    <Shot start={20.8} end={24.5}>
      <Floor />
      <PriceVsBought />
    </Shot>
    <Shot start={24.5} end={34.6} zoom={[1.0, 1.08]}>
      <Floor />
      <Become />
    </Shot>
    <Shot start={34.6} end={41.0}>
      <Floor />
      <Examples />
    </Shot>
    <Shot start={41.0} end={48.6} zoom={[1.0, 1.06]}>
      <Floor />
      <Question />
    </Shot>
    <Shot start={48.6} end={55.6}>
      <Floor />
      <Deliver />
    </Shot>
    <Shot start={55.6} end={62} last>
      <Ending />
    </Shot>
  </AbsoluteFill>
);

export const WhoTheyBecome: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fade = interpolate(frame, [WTB_FRAMES - 24, WTB_FRAMES], [1, 0], clamp);
  const world = (
    <AbsoluteFill style={{scale: `${1 + bp * 0.01}`}}>
      <World />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: '#040404'}}>
      <Audio src={staticFile('vo9/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-9.wav')} volume={0.42} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px'}} />
        <AbsoluteFill style={{filter: `grayscale(1) blur(0.5px) contrast(1.16) brightness(${0.95 + bp * 0.07})`}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{filter: 'grayscale(1) blur(15px) brightness(1.3)', opacity: 0.47, mixBlendMode: 'screen'}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, rgba(0,0,0,0.78) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
