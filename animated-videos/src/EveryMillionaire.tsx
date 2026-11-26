import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES, typing} from './CryoFigure';
import {FONT, FPS, clamp, fr, money, pop, ramp, rand, useSec} from './MaybeLater';
import {Desk, G, Glow, Monitor} from './NextTo';
import grid from './song-grid-7.json';

// "Every Millionaire" — hook: "Every millionaire is just someone who figured out what people will pay for."
// Built to the buyers-mind-reels house style (payoff-first opening, one metaphor per sentence, growth-curve ending).
export const EM_FRAMES = fr(52.5);
const BEAT = grid.beat;
const DROP = grid.drop;
const STRIP = grid.strip;
const FLOOR = 905;
const CUTS = [3.44, 6.96, 14.16, 16.4, 19.04, 25.44, 31.2, 38.0, 41.36, 45.68];
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
// 1. payoff first: buyers queue at his stall, money piles up, camera pulls out, arms up
const PYR: {x: number; y: number}[] = [];
for (let r = 0; r < 8; r++) for (let k = 0; k < 9 - r; k++) PYR.push({x: 1340 + r * 50 + k * 100, y: FLOOR - 27 - r * 56});
const Hook: React.FC = () => {
  const s = useSec();
  const zoom = interpolate(s, [0, 3.44], [1.35, 0.92], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const cheer = s > 2.7;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{scale: `${zoom}`, transformOrigin: '30% 85%'}}>
        <Beam x={480} w={560} a={1.3} />
        <Stall x={480} />
        <P x={480} y={FLOOR - 205} R={42} pose={cheer ? 'shrug' : 'hold'} />
        <div style={{position: 'absolute', left: 480 - 80, top: 360, width: 160, padding: '10px 0', borderRadius: 14, border: `5px solid ${G}`, background: s > 2.83 ? '#EDEDED' : 'rgba(16,16,16,0.97)', color: s > 2.83 ? '#141414' : '#E6E6E6', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, boxShadow: s > 2.83 ? '0 0 50px rgba(255,255,255,0.7)' : undefined}}>$49</div>
        {/* the queue that keeps coming */}
        {Array.from({length: 7}, (_, i) => {
          const t0 = i * 0.32;
          if (s < t0) return null;
          const p = ramp(s, t0, t0 + 1.0, 0, 1, Easing.out(Easing.cubic));
          const x = interpolate(p, [0, 1], [2200, 760 + i * 66]);
          const walking = p > 0 && p < 1;
          return <P key={i} x={x} y={FLOOR - (walking ? Math.abs(Math.sin(s * 10 + i)) * 6 : 0)} R={24} facing={-1} dim={0.12 + i * 0.05} />;
        })}
        {/* coins flying to the stall, money piling up */}
        {Array.from({length: 10}, (_, i) => {
          const life = ((s - 0.2) * 1.3 + i / 10) % 1;
          if (s < 0.2) return null;
          return <Coin key={i} x={780 + (i % 5) * 78 - life * 300} y={FLOOR - 120 - Math.sin(life * Math.PI) * 160} op={Math.sin(life * Math.PI)} />;
        })}
        {PYR.map((b, i) => {
          const t0 = 0.3 + i * 0.045;
          if (s < t0) return null;
          const p = pop(s, t0, 12);
          return <Money key={i} x={b.x} y={interpolate(p, [0, 1], [b.y - 500, b.y])} op={Math.min(1, p * 2)} rot={(rand(i) - 0.5) * 6} />;
        })}
        <Floor />
      </AbsoluteFill>
      <Counter x={960} y={40} label="HIS MONEY" value={money(interpolate(s, [0, 3.3], [0, 1], clamp) ** 2.4 * 988000 + 12400)} size={130} />
    </AbsoluteFill>
  );
};

// 2. most people think: luck, or started rich
const Luck: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      {[560, 960, 1360].map((x, i) => (
        <React.Fragment key={x}>
          <Beam x={x} w={300} a={i === 1 ? 1 : 0.6} />
          <P x={x} R={34} dim={i === 1 ? 0 : 0.25} />
        </React.Fragment>
      ))}
      <Cloud x={600} y={470} at={4.35} w={200}>
        <span style={{fontSize: 70}}>⚄</span>
      </Cloud>
      <Tiny x={600} y={570} text="GOT LUCKY" at={5.2} />
      <Cloud x={1320} y={470} at={5.64} w={200}>
        <span style={{fontSize: 60}}>💰</span>
      </Cloud>
      <Tiny x={1320} y={570} text="STARTED RICH" at={6.2} />
      <Cloud x={960} y={430} at={3.7} w={160}>
        ?
      </Cloud>
      {/* lottery tickets drifting down on the lucky side */}
      {s > 5.2 && Array.from({length: 6}, (_, i) => {
        const life = ((s - 5.2) * 0.8 + rand(i)) % 1;
        return <div key={i} style={{position: 'absolute', left: 420 + rand(i + 3) * 340, top: 120 + life * 700, width: 60, height: 32, borderRadius: 4, border: `3px solid ${G}`, rotate: `${life * 300}deg`, opacity: Math.sin(life * Math.PI)}} />;
      })}
    </AbsoluteFill>
  );
};

// 3. one person noticed what others wanted, and charged for it
const WANTS = ['⏰', '🏠', '✈', '♥', '★', '⚡', '☕', '♫', '✓'];
const Notice: React.FC = () => {
  const s = useSec();
  const xs = Array.from({length: 9}, (_, i) => 420 + i * 135);
  const hero = 4;
  const lit = s >= 10.64 ? pop(s, 10.64, 12) : 0;
  const stall = s >= 13.1 ? pop(s, 13.1, 11) : 0;
  return (
    <AbsoluteFill>
      <Beam x={xs[hero]} w={360} a={0.4 + lit} />
      {xs.map((x, i) => (
        <React.Fragment key={x}>
          <P x={x} R={i === hero ? 34 : 28} dim={i === hero ? 0.4 - lit * 0.4 : 0.35} />
          {i !== hero && s >= 7.2 + i * 0.18 && (
            <div style={{position: 'absolute', left: x - 30, top: 560 - (i % 2) * 50, width: 60, height: 60, borderRadius: 30, border: '3px dashed rgba(220,220,220,0.7)', background: 'rgba(16,16,16,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#EDEDED', opacity: pop(s, 7.2 + i * 0.18)}}>{WANTS[i]}</div>
          )}
          {/* he notices: dotted lines from every want to him */}
          {i !== hero && s > 11.3 && Array.from({length: 7}, (_, k) => {
            const u = k / 6;
            if (u > ramp(s, 11.3 + i * 0.05, 11.9 + i * 0.05)) return null;
            return <div key={k} style={{position: 'absolute', left: x + (xs[hero] - x) * u - 3, top: 590 - (i % 2) * 50 + (500 - (590 - (i % 2) * 50)) * u - 3, width: 6, height: 6, borderRadius: 3, background: '#DADADA'}} />;
          })}
        </React.Fragment>
      ))}
      {stall > 0 && (
        <div style={{opacity: stall}}>
          <div style={{position: 'absolute', left: xs[hero] - 110, top: FLOOR - 120, width: 220, height: 120, border: `4px solid ${G}`, borderRadius: 8, background: 'rgba(16,16,16,0.97)'}} />
          <Pill x={xs[hero]} y={FLOOR - 160} text="$49" at={13.1} />
        </div>
      )}
      {s > 13.4 && Array.from({length: 8}, (_, i) => {
        const life = ((s - 13.4) * 1.4 + i / 8) % 1;
        const from = xs[i < hero ? i : i + 1];
        return <Coin key={i} x={from + (xs[hero] - from) * life} y={600 - Math.sin(life * Math.PI) * 140} op={Math.sin(life * Math.PI)} />;
      })}
      <Tiny x={xs[hero]} y={FLOOR + 22} text="NOTICED" at={11.27} />
    </AbsoluteFill>
  );
};

// 4. two people, same skills
const SameSkills: React.FC = () => {
  const s = useSec();
  const fill = ramp(s, 15.3, 16.1, 0, 0.7);
  return (
    <AbsoluteFill>
      {[640, 1280].map((x) => (
        <React.Fragment key={x}>
          <Beam x={x} w={360} />
          <P x={x} R={56} />
          <div style={{position: 'absolute', left: x - 120, top: 330, width: 240, height: 26, borderRadius: 13, border: `3px solid ${G}`, padding: 3, boxSizing: 'border-box'}}>
            <div style={{height: '100%', width: `${fill * 100}%`, borderRadius: 10, background: '#E6E6E6', boxShadow: '0 0 16px rgba(255,255,255,0.5)'}} />
          </div>
          <Tiny x={x} y={290} text="SKILLS" size={15} />
        </React.Fragment>
      ))}
      {s > 15.6 && <div style={{position: 'absolute', left: 900, top: 520, width: 120, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#E6E6E6', opacity: pop(s, 15.6), filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.5))'}}>=</div>}
    </AbsoluteFill>
  );
};

// 5. one builds what he thinks is cool
const Builder: React.FC = () => {
  const s = useSec();
  const days = Math.round(ramp(s, 16.5, 18.9, 1, 365, Easing.in(Easing.quad)));
  const grow = ramp(s, 17.2, 18.9, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill>
      <Counter x={1500} y={80} label="DAYS" value={String(days)} size={90} />
      <Beam x={600} w={460} />
      <P x={520} R={64} pose="point" tilt={Math.sin(s * 14) * 4} />
      <Glow x={980} y={720} r={260} a={0.18 * grow} />
      <Box x={980} y={FLOOR} w={160 + grow * 200} h={110 + grow * 160} lit={grow * 0.5} />
      {Array.from({length: 8}, (_, i) => {
        const life = ((s - 17) * 1.2 + rand(i)) % 1;
        if (s < 17) return null;
        return <div key={i} style={{position: 'absolute', left: 980 + Math.cos(i) * (140 + life * 120), top: 650 - life * 200 + Math.sin(i) * 40, fontSize: 22, color: '#F0F0F0', opacity: 1 - life}}>✦</div>;
      })}
      <Cloud x={980} y={360} at={18.1} w={220}>
        <span style={{fontSize: 40, letterSpacing: 3}}>COOL</span>
      </Cloud>
      <Tiny x={980} y={FLOOR + 22} text="WHAT HE THINKS IS COOL" at={17.7} />
    </AbsoluteFill>
  );
};

// 6. the other listens: reviews, questions, watching what people buy
const Listener: React.FC = () => {
  const s = useSec();
  const cards = Math.max(0, Math.floor((s - 21.0) / 0.12));
  return (
    <AbsoluteFill>
      <Beam x={420} w={420} />
      <P x={420} R={62} pose="hold" />
      <div style={{position: 'absolute', left: 470, top: 520, width: 60, height: 110, borderRadius: 10, border: `4px solid ${G}`, background: 'rgba(255,255,255,0.25)', boxShadow: '0 0 40px rgba(255,255,255,0.4)'}} />
      {/* reviews stacking */}
      {Array.from({length: Math.min(cards, 14)}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 700 + (i % 2) * 160, top: 820 - Math.floor(i / 2) * 50, width: 150, height: 42, borderRadius: 8, border: `3px solid ${G}`, background: 'rgba(24,24,24,0.97)', color: '#DADADA', fontSize: 18, letterSpacing: 2, display: 'flex', alignItems: 'center', paddingLeft: 10, boxSizing: 'border-box', opacity: pop(s, 21.0 + i * 0.12)}}>{'★★★★★'.slice(0, 1 + Math.floor(rand(i) * 5))}</div>
      ))}
      <Tiny x={780} y={FLOOR + 22} text="REVIEWS" at={21.45} />
      <Pill x={1180} y={300} text="WHY DID YOU BUY?" at={22.08} />
      <Pill x={1480} y={380} text="WHAT ALMOST STOPPED YOU?" at={22.49} dark />
      {/* watching people actually buy */}
      {s >= 23.4 && (
        <>
          <Beam x={1520} w={420} a={pop(s, 23.4)} />
          {[1380, 1480, 1580, 1680].map((x, i) => <P key={x} x={x} R={24} pose={i % 2 ? 'hold' : 'rest'} />)}
          {Array.from({length: 4}, (_, i) => {
            const life = ((s - 23.6) * 1.2 + i / 4) % 1;
            return <Coin key={i} x={1380 + i * 100} y={700 - life * 220} op={Math.sin(life * Math.PI)} />;
          })}
          <Tiny x={1530} y={FLOOR + 22} text="WHAT PEOPLE BUY" at={24.0} />
        </>
      )}
    </AbsoluteFill>
  );
};

// 7. twelve months later: product nobody asked for vs a waiting list
const Later: React.FC = () => {
  const s = useSec();
  const list = Math.round(ramp(s, 30.2, 31.1, 0, 1284, Easing.out(Easing.quad)));
  return (
    <AbsoluteFill>
      <Counter x={960} y={50} label="12 MONTHS LATER" value="" size={20} />
      {/* left: dusty product, nobody */}
      <Beam x={480} w={380} a={0.5} />
      <P x={340} R={40} dim={0.4} pose="shrug" />
      <Box x={580} y={FLOOR} w={260} h={200} op={0.7} />
      <svg style={{position: 'absolute', left: 450, top: 700, overflow: 'visible'}} width={260} height={100}>
        <path d="M0 0 Q 40 40 0 80 M0 0 Q 60 10 90 0 M0 0 L70 60" stroke="rgba(200,200,200,0.4)" strokeWidth={2} fill="none" />
      </svg>
      <Counter x={480} y={240} label="ORDERS" value="0" size={80} dim />
      {s > 28.0 && <div style={{position: 'absolute', left: 460 + ((s - 28) * 140) % 500, top: FLOOR - 40, width: 44, height: 44, borderRadius: 22, border: '3px dashed rgba(200,200,200,0.5)', rotate: `${s * 300}deg`}} />}
      {/* right: a waiting list */}
      <Beam x={1360} w={420} a={1.2} />
      <P x={1180} R={44} pose={s > 30.4 ? 'cheer' : 'rest'} />
      {Array.from({length: 12}, (_, i) => {
        const t0 = 29.2 + i * 0.08;
        if (s < t0) return null;
        const x = interpolate(ramp(s, t0, t0 + 0.6, 0, 1, Easing.out(Easing.cubic)), [0, 1], [2100, 1300 + i * 52]);
        return <P key={i} x={x} R={20} facing={-1} />;
      })}
      <Counter x={1440} y={240} label="WAITING LIST" value={list.toLocaleString('en-US')} size={80} at={30.2} />
    </AbsoluteFill>
  );
};

// 8. not the smartest person in the room: the one who understands the room
const Room: React.FC = () => {
  const s = useSec();
  const smart = s >= 33.35 ? pop(s, 33.35) : 0;
  const under = s >= 35.6 ? pop(s, 35.6) : 0;
  const xs = [620, 760, 900, 1040, 1180, 1320];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 460, top: 300, width: 1000, height: FLOOR - 300, border: `4px solid ${G}`, borderBottom: 'none', borderRadius: '10px 10px 0 0'}} />
      <Tiny x={960} y={260} text="THE ROOM" size={15} />
      {xs.map((x, i) => (
        <React.Fragment key={x}>
          {(i === 1 || i === 4) && <Beam x={x} w={260} a={i === 1 ? smart * (1 - under * 0.7) : under * 1.3} />}
          <P x={x} R={30} dim={i === 1 ? under * 0.5 : i === 4 ? 0 : 0.3} pose={i === 4 && under > 0.5 ? 'cheer' : 'rest'} />
        </React.Fragment>
      ))}
      {/* graduation cap on the smartest */}
      {smart > 0 && <div style={{position: 'absolute', left: 760 - 40, top: FLOOR - 192, width: 80, height: 16, background: '#E6E6E6', rotate: '-6deg', opacity: smart}} />}
      <Pill x={760} y={480} text="SMARTEST" at={33.35} dark />
      <Pill x={1180} y={480} text="UNDERSTANDS PEOPLE" at={36.1} />
      {s > 36.0 && Array.from({length: 12}, (_, i) => {
        const life = ((s - 36) * 1.3 + i / 12) % 1;
        const from = xs[[0, 2, 3, 5][i % 4]];
        return <Coin key={i} x={from + (1180 - from) * life} y={680 - Math.sin(life * Math.PI) * 150} op={Math.sin(life * Math.PI)} />;
      })}
    </AbsoluteFill>
  );
};

// 9. not overnight: days and nights cycling while the bar fills slowly
const Overnight: React.FC = () => {
  const s = useSec();
  const night = (Math.sin(s * 5) + 1) / 2;
  const bar = ramp(s, 38.2, 41.2, 0.05, 0.35);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 1360, top: 140, width: 120, height: 120, borderRadius: 60, background: '#EDEDED', boxShadow: night > 0.5 ? '-26px 14px 0 0 #050505 inset' : '0 0 60px rgba(255,255,255,0.7)'}} />
      <Beam x={760} w={420} a={0.7 + 0.5 * (1 - night)} />
      <Desk x={900} w={460} y={790} />
      <Monitor x={960} y={790} w={300} />
      <CryoFigure x={640} y={FLOOR} R={60} front={POSES.type(typing(s, 9)).front} back={null} tilt={5} ring={false} />
      <div style={{position: 'absolute', left: 1220, top: 380, width: 400, height: 30, borderRadius: 15, border: `3px solid ${G}`, padding: 4, boxSizing: 'border-box'}}>
        <div style={{height: '100%', width: `${bar * 100}%`, borderRadius: 11, background: '#E6E6E6'}} />
      </div>
      <Tiny x={1420} y={330} text="RICH" size={15} />
      <Pill x={1420} y={490} text="OVERNIGHT ✕" at={40.8} dark />
    </AbsoluteFill>
  );
};

// 10. the one skill every rich person has, and school never teaches
const School: React.FC = () => {
  const s = useSec();
  const school = s >= 44.1;
  return (
    <AbsoluteFill>
      {!school ? (
        <>
          {[600, 800, 1000, 1200, 1400].map((x, i) => (
            <React.Fragment key={x}>
              <Beam x={x} w={240} a={0.8} />
              <P x={x} R={30} />
              {s >= 42.4 + i * 0.12 && <div style={{position: 'absolute', left: x - 26, top: FLOOR - 30 * 6.4 - 80, width: 52, height: 52, borderRadius: 26, background: '#EDEDED', color: '#141414', fontFamily: FONT, fontWeight: 900, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(255,255,255,0.6)', opacity: pop(s, 42.4 + i * 0.12)}}>♥</div>}
            </React.Fragment>
          ))}
          <Tiny x={1000} y={FLOOR + 22} text="EVERY RICH PERSON" at={42.9} />
          <Tiny x={1000} y={460} text="UNDERSTANDS PEOPLE" at={43.2} />
        </>
      ) : (
        <>
          <svg style={{position: 'absolute', left: 560, top: 300, overflow: 'visible', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.25))'}} width={800} height={FLOOR - 300}>
            <polygon points="0,170 400,20 800,170" fill="rgba(16,16,16,0.97)" stroke={G} strokeWidth={5} />
            <rect x={40} y={170} width={720} height={FLOOR - 470} fill="rgba(16,16,16,0.97)" stroke={G} strokeWidth={5} />
            <circle cx={400} cy={110} r={30} fill="none" stroke={G} strokeWidth={4} />
          </svg>
          <div style={{position: 'absolute', left: 730, top: 520, width: 460, padding: 24, borderRadius: 10, border: `4px solid ${G}`, background: 'rgba(30,30,30,0.97)', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: '#DADADA', letterSpacing: 2}}>
            {[['MATH', '✓'], ['HISTORY', '✓'], ['WHY PEOPLE BUY', '✕']].map(([t, m], i) => (
              <div key={t} style={{display: 'flex', justifyContent: 'space-between', marginTop: i ? 12 : 0, opacity: s > 44.3 + i * 0.25 ? 1 : 0, color: m === '✕' ? '#FFFFFF' : '#9A9A9A'}}>
                <span>{t}</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
          <Tiny x={960} y={FLOOR + 22} text="SCHOOL" />
        </>
      )}
    </AbsoluteFill>
  );
};

// 11. ending: flat line turns exponential, closing line in caps
const Ending: React.FC = () => {
  const s = useSec();
  const prog = ramp(s, 45.8, 50.2, 0, 1, Easing.inOut(Easing.quad));
  const pts: [number, number][] = [];
  for (let i = 0; i <= 120 * prog; i++) {
    const u = i / 120;
    const saw = u < 0.55 ? ((u * 9) % 1) * 36 : 0;
    const expo = u > 0.5 ? Math.pow((u - 0.5) / 0.5, 3) * 600 : 0;
    pts.push([280 + u * 1380, 880 - saw - expo]);
  }
  const tip = pts[pts.length - 1] ?? [280, 880];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 270, top: 200, width: 5, height: 685, background: G}} />
      <div style={{position: 'absolute', left: 270, top: 880, width: 1420, height: 5, background: G}} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.5))'}} width={1920} height={1080}>
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#EDEDED" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <Glow x={tip[0]} y={tip[1]} r={150} a={0.35} />
      <P x={tip[0]} y={tip[1] - 4} R={24} pose={prog > 0.6 ? 'cheer' : 'rest'} />
      <Counter x={600} y={230} label="HIS MONEY" value={money(interpolate(prog, [0, 0.5, 1], [0, 4210, 1004083]))} size={80} />
      {s > 45.9 && <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 80, letterSpacing: 4, color: '#ECECEC', opacity: pop(s, 45.9, 13), filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.5))'}}>LEARN WHY PEOPLE BUY.</div>}
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.2, src: 'sfx/whoosh.wav', vol: 0.4})),
  ...Array.from({length: 8}, (_, i) => ({t: 0.3 + i * 0.35, src: SFX('coin-collect'), vol: 0.22})),
  {t: 2.83, src: SFX('success-chime'), vol: 0.45},
  {t: 4.35, src: SFX('notification-pop'), vol: 0.35},
  {t: 5.64, src: SFX('notification-pop'), vol: 0.35},
  ...Array.from({length: 8}, (_, i) => ({t: 7.2 + i * 0.18, src: SFX('select-002'), vol: 0.2})),
  {t: 10.64, src: SFX('switch-002'), vol: 0.45},
  {t: 13.1, src: SFX('handle-coins'), vol: 0.4},
  {t: 15.6, src: SFX('select-002'), vol: 0.4},
  ...Array.from({length: 6}, (_, i) => ({t: 16.6 + i * 0.35, src: SFX('tick-001'), vol: 0.35})),
  {t: 18.1, src: SFX('notification-pop'), vol: 0.35},
  ...Array.from({length: 10}, (_, i) => ({t: 21.0 + i * 0.12, src: SFX('notification-pop'), vol: 0.12})),
  {t: 22.08, src: SFX('select-002'), vol: 0.4},
  {t: 22.49, src: SFX('select-002'), vol: 0.4},
  {t: 30.2, src: SFX('success-chime'), vol: 0.45},
  {t: 33.35, src: SFX('notification-pop'), vol: 0.35},
  {t: 36.1, src: SFX('handle-coins'), vol: 0.4},
  {t: 40.8, src: SFX('error-002'), vol: 0.4},
  {t: 44.62, src: SFX('error-002'), vol: 0.4},
  {t: 45.9, src: SFX('impact-generic-light-002'), vol: 0.5},
];

const World: React.FC = () => (
  <AbsoluteFill>
    <Shot start={0} end={3.44} first zoom={[1, 1]}>
      <Hook />
    </Shot>
    <Shot start={3.44} end={6.96}>
      <Floor />
      <Luck />
    </Shot>
    <Shot start={6.96} end={14.16} zoom={[1.06, 1.0]}>
      <Floor />
      <Notice />
    </Shot>
    <Shot start={14.16} end={16.4}>
      <Floor />
      <SameSkills />
    </Shot>
    <Shot start={16.4} end={19.04} zoom={[1.0, 1.07]}>
      <Floor />
      <Builder />
    </Shot>
    <Shot start={19.04} end={25.44}>
      <Floor />
      <Listener />
    </Shot>
    <Shot start={25.44} end={31.2}>
      <Floor />
      <Later />
    </Shot>
    <Shot start={31.2} end={38.0}>
      <Floor />
      <Room />
    </Shot>
    <Shot start={38.0} end={41.36} zoom={[1.0, 1.06]}>
      <Floor />
      <Overnight />
    </Shot>
    <Shot start={41.36} end={45.68}>
      <Floor />
      <School />
    </Shot>
    <Shot start={45.68} end={52.5} last>
      <Ending />
    </Shot>
  </AbsoluteFill>
);

export const EveryMillionaire: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fade = interpolate(frame, [EM_FRAMES - 24, EM_FRAMES], [1, 0], clamp);
  const world = (
    <AbsoluteFill style={{scale: `${1 + bp * 0.01}`}}>
      <World />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: '#040404'}}>
      <Audio src={staticFile('vo7/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-7.wav')} volume={0.42} />}
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
