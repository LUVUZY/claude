import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES} from './CryoFigure';
import {FONT, FPS, clamp, fr, pop, ramp, rand, useSec} from './MaybeLater';
import {G} from './NextTo';
import grid from './song-grid-6.json';

// "Talk To Three Buyers" — scene-for-scene mirror of cryothum's "Surround yourself with two millionaires" video:
// small figures in a big dark space, spotlights, tiny uppercase labels, white speech pills, one clean metaphor per line.
export const THIRD_FRAMES = fr(58);
const BEAT = grid.beat;
const DROP = grid.drop;
const STRIP = grid.strip;
const FLOOR = 900;
const CUTS = [4.16, 7.84, 12.96, 17.36, 21.44, 26.94, 32.66, 36.8, 41.76, 45.68, 50.0];

const beatPulse = (sec: number) => (sec < DROP || sec > STRIP ? 0 : Math.exp(-((sec - DROP) % BEAT) / 0.1));

// ---------- kit (cryothum's minimal vocabulary) ----------
const Floor: React.FC<{y?: number}> = ({y = FLOOR}) => (
  <div style={{position: 'absolute', left: -2000, right: -2000, top: y, height: 2, backgroundImage: 'linear-gradient(90deg, rgba(200,200,200,0.45) 55%, transparent 55%)', backgroundSize: '22px 2px'}} />
);
const Beam: React.FC<{x: number; w?: number; a?: number; y?: number}> = ({x, w = 300, a = 1, y = FLOOR}) => (
  <>
    <div style={{position: 'absolute', left: x - w / 2, top: -20, width: w, height: y + 30, background: `linear-gradient(180deg, rgba(255,255,255,${0.02 * a}), rgba(255,255,255,${0.14 * a}))`, clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)', filter: 'blur(14px)'}} />
    <div style={{position: 'absolute', left: x - w * 0.7, top: y - 40, width: w * 1.4, height: 80, borderRadius: '50%', background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${0.22 * a}), transparent 70%)`}} />
  </>
);
const Tiny: React.FC<{x: number; y: number; text: string; at?: number; size?: number; dim?: boolean; w?: number}> = ({x, y, text, at = -9, size = 18, dim, w = 500}) => {
  const s = useSec();
  if (s < at) return null;
  return <div style={{position: 'absolute', left: x - w / 2, width: w, top: y, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: size * 0.28, color: dim ? '#6A6A6A' : '#C8C8C8', opacity: pop(s, at, 14)}}>{text}</div>;
};
const Pill: React.FC<{x: number; y: number; text: string; at: number; out?: number; dark?: boolean}> = ({x, y, text, at, out = 999, dark}) => {
  const s = useSec();
  if (s < at || s > out + 0.3) return null;
  const p = pop(s, at, 11) * (1 - ramp(s, out, out + 0.3));
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: `${0.6 + 0.4 * p}`, opacity: p, padding: '8px 18px', borderRadius: 18, background: dark ? 'rgba(14,14,14,0.96)' : '#ECECEC', border: dark ? `3px solid ${G}` : undefined, color: dark ? '#E6E6E6' : '#141414', fontFamily: FONT, fontWeight: 900, fontSize: 20, letterSpacing: 1.5, whiteSpace: 'nowrap', boxShadow: '0 0 24px rgba(255,255,255,0.35)'}}>
      {text}
    </div>
  );
};
const Dots: React.FC<{x1: number; y1: number; x2: number; y2: number; p?: number; n?: number}> = ({x1, y1, x2, y2, p = 1, n = 10}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const u = i / (n - 1);
      if (u > p) return null;
      return <div key={i} style={{position: 'absolute', left: x1 + (x2 - x1) * u - 3, top: y1 + (y2 - y1) * u - 3, width: 6, height: 6, borderRadius: 3, background: '#DADADA', opacity: 0.8}} />;
    })}
  </>
);
const Ring: React.FC<{x: number; y?: number; w: number}> = ({x, y = FLOOR, w}) => <div style={{position: 'absolute', left: x - w / 2, top: y - w * 0.09, width: w, height: w * 0.18, borderRadius: '50%', border: '2px dashed rgba(220,220,220,0.4)'}} />;
const Person: React.FC<{x: number; y?: number; R?: number; dim?: number; pose?: 'rest' | 'cheer' | 'point' | 'shrug' | 'hold'; facing?: 1 | -1; glow?: boolean}> = ({x, y = FLOOR, R = 26, dim = 0, pose = 'rest', facing = 1}) => {
  const p = POSES[pose] as {front: any; back: any};
  return <CryoFigure x={x} y={y} R={R} front={p.front} back={p.back} dim={dim} facing={facing} ring={false} />;
};
const Count: React.FC<{x: number; y: number; label: string; value: string; size?: number; at?: number}> = ({x, y, label, value, size = 64, at = -9}) => {
  const s = useSec();
  if (s < at) return null;
  return (
    <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', fontFamily: FONT, opacity: pop(s, at, 14)}}>
      <div style={{fontWeight: 900, fontSize: size, color: '#EDEDED', lineHeight: 1.05, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.4))'}}>{value}</div>
      <div style={{fontWeight: 800, fontSize: 15, letterSpacing: 5, color: '#9E9E9E', marginTop: 4}}>{label}</div>
    </div>
  );
};

// ---------- shots: zoom/blur crossfade + slow drift ----------
const T = 0.34;
const Shot: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean; last?: boolean}> = ({start, end, children, zoom = [1, 1.04], origin = '50% 60%', first, last}) => {
  const s = useSec();
  if (s < (first ? -1 : start - T / 2) || s > (last ? 999 : end + T / 2)) return null;
  const pin = first ? 1 : ramp(s, start - T / 2, start + T / 2, 0, 1, Easing.out(Easing.cubic));
  const pout = last ? 0 : ramp(s, end - T / 2, end + T / 2, 0, 1, Easing.in(Easing.cubic));
  const drift = interpolate(s, [start, end], zoom, {...clamp, easing: Easing.inOut(Easing.sin)});
  const blur = 16 * (1 - pin) + 18 * pout;
  return (
    <AbsoluteFill style={{scale: `${drift * (1 + 0.14 * (1 - pin)) * (1 + 0.22 * pout)}`, transformOrigin: origin, opacity: Math.min(pin, 1 - pout), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- scenes ----------
// 1. you + three real buyers > ten courses (mirrors: you + two millionaires -> the third)
const Hook: React.FC = () => {
  const s = useSec();
  const buyers = [
    {x: 560, t: 0.57},
    {x: 1360, t: 0.84},
    {x: 260, t: 1.12},
  ];
  const n = buyers.filter((b) => s >= b.t).length;
  const know = ramp(s, 1.2, 3.4, 0.12, 1, Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <Beam x={960} w={360} a={1.3} />
      <Ring x={960} w={420} />
      <Person x={960} R={34} pose={s > 3.2 ? 'cheer' : 'rest'} />
      <Count x={960} y={130} label="BUYERS YOU TALKED TO" value={String(n)} size={70} at={0.5} />
      {buyers.map((b) =>
        s >= b.t ? (
          <React.Fragment key={b.x}>
            <Beam x={b.x} w={300} a={pop(s, b.t, 12)} />
            <Ring x={b.x} w={300} />
            <div style={{opacity: pop(s, b.t, 12)}}>
              <Person x={b.x} R={28} />
            </div>
            <Tiny x={b.x} y={FLOOR + 30} text="REAL BUYER" at={b.t} size={14} />
            <Dots x1={b.x + (b.x < 960 ? 60 : -60)} y1={FLOOR - 120 - (b.x === 260 ? 40 : 0)} x2={960 + (b.x < 960 ? -60 : 60)} y2={FLOOR - 120} p={ramp(s, b.t + 0.2, b.t + 0.7)} n={b.x === 260 ? 16 : 10} />
          </React.Fragment>
        ) : null,
      )}
      {s >= 1.12 && <Pill x={960} y={330} text="“I almost didn't buy because…”" at={1.12} dark />}
      {/* what you know vs ten courses */}
      <div style={{position: 'absolute', left: 1700, top: 330, width: 40, height: 500, border: `3px solid ${G}`, borderRadius: 6}}>
        <div style={{position: 'absolute', left: 4, right: 4, bottom: 4, height: `${know * 97}%`, borderRadius: 3, background: '#E6E6E6', boxShadow: '0 0 20px rgba(255,255,255,0.5)'}} />
      </div>
      <div style={{position: 'absolute', left: 1660, top: 450, width: 120, height: 0, borderTop: '3px dashed #9A9A9A'}} />
      <Tiny x={1720} y={400} text="10 COURSES" at={2.52} size={15} w={200} />
      <Tiny x={1720} y={850} text="WHAT YOU KNOW" size={14} w={300} />
    </AbsoluteFill>
  );
};

// 2. iceberg: what you build sits on top of a huge hidden mass of guesses
const Iceberg: React.FC = () => {
  const s = useSec();
  const reveal = ramp(s, 5.6, 6.6, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
        <path d="M0 400 Q 240 385 480 400 T 960 400 T 1440 400 T 1920 400" stroke="#BDBDBD" strokeWidth={3} fill="none" />
        <path d="M900 400 L960 330 L1020 400 Z" fill="#DADADA" />
        <path d={`M770 400 Q 700 ${400 + 500 * reveal} 960 ${400 + 560 * reveal} Q 1220 ${400 + 500 * reveal} 1150 400`} stroke="#BDBDBD" strokeWidth={3} strokeDasharray="12 10" fill="rgba(255,255,255,0.03)" opacity={reveal} />
      </svg>
      <Person x={960} y={332} R={12} />
      <Tiny x={1180} y={300} text="WHAT YOU BUILD" at={4.4} size={16} w={300} />
      <Tiny x={960} y={620} text="YOUR GUESSES" at={5.9} size={26} />
      <Tiny x={960} y={660} text="WHAT ACTUALLY SHAPES IT" at={6.3} size={14} dim />
    </AbsoluteFill>
  );
};

// 3. everyone around you is another seller (mirrors "everyone around you" + their advice pills)
const Sellers: React.FC = () => {
  const s = useSec();
  const xs = [560, 760, 960, 1160, 1360];
  const pills = [
    {x: 560, t: 9.18, text: 'ADD FEATURES'},
    {x: 760, t: 9.65, text: 'CUT THE PRICE'},
    {x: 1160, t: 10.3, text: 'RUN MORE ADS'},
    {x: 1360, t: 10.87, text: 'POST EVERY DAY'},
  ];
  return (
    <AbsoluteFill>
      <Beam x={960} w={260} a={0.9} />
      {xs.map((x) => (
        <Person key={x} x={x} R={x === 960 ? 30 : 28} dim={x === 960 ? 0 : 0.25} />
      ))}
      <Tiny x={960} y={FLOOR + 30} text="EVERYONE AROUND YOU" at={8.0} size={15} />
      {pills.map((p, i) => (
        <React.Fragment key={p.text}>
          <Pill x={p.x} y={620 - (i % 2) * 50} text={p.text} at={p.t} />
          {s > 11.3 && <Dots x1={p.x} y1={650 - (i % 2) * 50} x2={960} y2={700} p={ramp(s, 11.3 + i * 0.08, 11.8 + i * 0.08)} n={8} />}
        </React.Fragment>
      ))}
      {/* you start believing it too */}
      <Pill x={960} y={560} text="ADD FEATURES?" at={11.9} dark />
    </AbsoluteFill>
  );
};

// 4. sit down with people who actually buy (mirrors their table of people who already achieved it)
const Table: React.FC = () => {
  const s = useSec();
  const icons = [
    {x: 820, t: 15.6, glyph: '⌛', label: 'NO TIME'},
    {x: 960, t: 15.9, glyph: '$', label: 'TIGHT BUDGET'},
    {x: 1100, t: 16.2, glyph: '?', label: 'NOT SURE'},
  ];
  return (
    <AbsoluteFill>
      <Beam x={960} w={700} a={0.9} />
      {[760, 900, 1040, 1180].map((x, i) => (
        <Person key={x} x={x} y={772} R={24} dim={i === 0 ? 0 : 0.1} />
      ))}
      <div style={{position: 'absolute', left: 680, top: 770, width: 560, height: 110, border: `3px solid ${G}`, borderRadius: '6px 6px 0 0', background: 'rgba(12,12,12,0.97)'}} />
      {[800, 960, 1120].map((x) => <div key={x} style={{position: 'absolute', left: x - 12, top: 742, width: 24, height: 28, border: `3px solid ${G}`, borderRadius: '0 0 6px 6px'}} />)}
      <Pill x={1040} y={640} text="•••" at={14.5} out={15.4} dark />
      {icons.map((ic) =>
        s >= ic.t ? (
          <React.Fragment key={ic.label}>
            <div style={{position: 'absolute', left: ic.x - 34, top: 470, width: 68, height: 68, borderRadius: 34, border: `3px solid ${G}`, background: 'rgba(14,14,14,0.96)', opacity: pop(s, ic.t), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 32, color: '#EDEDED', boxShadow: '0 0 24px rgba(255,255,255,0.3)'}}>{ic.glyph}</div>
            <Tiny x={ic.x} y={550} text={ic.label} at={ic.t} size={13} w={200} />
          </React.Fragment>
        ) : null,
      )}
      <Tiny x={960} y={420} text="WHAT REAL BUYERS TELL YOU" at={15.4} size={15} />
      <Tiny x={960} y={FLOOR + 20} text="PEOPLE WHO ACTUALLY BUY" at={13.4} size={15} />
    </AbsoluteFill>
  );
};

// 5. confusing tower -> obvious staircase (mirrors IMPOSSIBLE -> ACHIEVABLE)
const Stairs: React.FC = () => {
  const s = useSec();
  const morph = ramp(s, 19.5, 20.6, 0, 1, Easing.inOut(Easing.cubic));
  const steps = 8;
  return (
    <AbsoluteFill>
      <Beam x={620} w={260} />
      <Person x={620} R={28} pose={morph > 0.9 ? 'point' : 'rest'} />
      {Array.from({length: steps}, (_, i) => {
        // each column starts as part of a flat-topped tower and settles into a step
        const h = interpolate(morph, [0, 1], [560, 70 * (i + 1)]);
        return <div key={i} style={{position: 'absolute', left: 900 + i * 52, top: FLOOR - h, width: 52, height: h, borderTop: `3px solid ${G}`, borderLeft: i === 0 ? `3px solid ${G}` : undefined, borderRight: i === steps - 1 ? `3px solid ${G}` : undefined, background: 'rgba(14,14,14,0.96)'}} />;
      })}
      <div style={{position: 'absolute', left: 900 + steps * 52 - 6, top: FLOOR - interpolate(morph, [0, 1], [560, 70 * steps]) - 70, width: 4, height: 70, background: G}} />
      <div style={{position: 'absolute', left: 900 + steps * 52 - 2, top: FLOOR - interpolate(morph, [0, 1], [560, 70 * steps]) - 70, width: 34, height: 22, background: '#EDEDED'}} />
      <Tiny x={1110} y={FLOOR - 300} text={morph < 0.5 ? 'CONFUSING' : ''} size={22} />
      {morph > 0.6 && <Tiny x={1110} y={FLOOR - 640} text="OBVIOUS ✓" at={20.3} size={26} />}
    </AbsoluteFill>
  );
};

// 6. how buyers decide (mirrors their HOW THEY THINK flowchart + lightbulb)
const Flow: React.FC = () => {
  const s = useSec();
  const nodes = [
    {y: 300, text: 'REAL PROBLEM?', t: 24.2},
    {y: 400, text: 'TRUST YOU?', t: 24.6},
    {y: 500, text: 'WORTH IT?', t: 25.0},
    {y: 600, text: 'BUY', t: 25.4, end: true},
  ];
  const bulb = s >= 25.8 ? pop(s, 25.8, 9) : 0;
  return (
    <AbsoluteFill>
      <Beam x={560} w={260} />
      <Beam x={1360} w={260} a={0.8} />
      <Person x={560} R={28} />
      <Person x={1360} R={28} facing={-1} dim={0.1} />
      <Tiny x={1360} y={FLOOR + 24} text="BUYER" size={14} />
      <Tiny x={960} y={240} text="HOW THEY DECIDE" at={24.0} size={16} />
      <Dots x1={1330} y1={FLOOR - 140} x2={1060} y2={330} p={ramp(s, 23.8, 24.4)} n={14} />
      {nodes.map((n, i) =>
        s >= n.t ? (
          <React.Fragment key={n.text}>
            <div style={{position: 'absolute', left: 960 - 95, top: n.y - 22, width: 190, height: 44, borderRadius: n.end ? 22 : 6, border: `3px solid ${G}`, background: n.end ? '#EDEDED' : 'rgba(14,14,14,0.96)', rotate: n.end ? '0deg' : undefined, color: n.end ? '#141414' : '#E6E6E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 17, letterSpacing: 2, opacity: pop(s, n.t)}}>{n.text}</div>
            {i < nodes.length - 1 && <div style={{position: 'absolute', left: 958, top: n.y + 22, width: 3, height: 56, background: G, opacity: pop(s, n.t + 0.15)}} />}
            {!n.end && <Tiny x={1150} y={n.y - 10} text="NO → LEAVES" at={n.t + 0.1} size={12} dim w={200} />}
          </React.Fragment>
        ) : null,
      )}
      {bulb > 0 && (
        <div style={{position: 'absolute', left: 560 - 30, top: FLOOR - 340, width: 60, height: 60, borderRadius: 30, background: '#F4F4F4', opacity: bulb, scale: `${bulb}`, boxShadow: '0 0 60px rgba(255,255,255,0.9)'}} />
      )}
    </AbsoluteFill>
  );
};

// 7. radar of objections, then the cage of assumptions dissolves (mirrors WHAT YOU NOTICE radar + YOU CAN'T cage)
const Radar: React.FC = () => {
  const s = useSec();
  const blips = [
    {a: 0.3, r: 0.6, t: 27.45, text: 'TOO EXPENSIVE?'},
    {a: 1.4, r: 0.45, t: 27.8, text: 'WILL IT WORK?'},
    {a: 2.4, r: 0.75, t: 28.2, text: 'NOT FOR ME'},
    {a: 3.6, r: 0.5, t: 28.5, text: 'TOO HARD'},
    {a: 4.6, r: 0.7, t: 28.8, text: 'LATER'},
    {a: 5.5, r: 0.35, t: 29.1, text: 'WHO ARE YOU?'},
  ];
  const cage = s >= 29.8 ? pop(s, 29.8, 12) : 0;
  const free = ramp(s, 31.3, 32.2);
  const spotted = blips.filter((b) => s >= b.t).length;
  const R = 230;
  return (
    <AbsoluteFill>
      <div style={{opacity: 1 - ramp(s, 29.6, 30.0)}}>
        <Beam x={460} w={240} />
        <Person x={460} R={28} pose="point" />
        <Dots x1={540} y1={FLOOR - 120} x2={820} y2={560} p={1} n={10} />
        <svg style={{position: 'absolute', left: 960 - R, top: 470 - R, overflow: 'visible'}} width={R * 2} height={R * 2}>
          <circle cx={R} cy={R} r={R} fill="none" stroke={G} strokeWidth={4} />
          <circle cx={R} cy={R} r={R * 0.66} fill="none" stroke="rgba(200,200,200,0.35)" strokeWidth={2} />
          <circle cx={R} cy={R} r={R * 0.33} fill="none" stroke="rgba(200,200,200,0.35)" strokeWidth={2} />
          <path d={`M${R} ${R} L${R + Math.cos(s * 2.6) * R} ${R + Math.sin(s * 2.6) * R} A ${R} ${R} 0 0 0 ${R + Math.cos(s * 2.6 - 0.6) * R} ${R + Math.sin(s * 2.6 - 0.6) * R} Z`} fill="rgba(230,230,230,0.25)" />
        </svg>
        {blips.map((b) =>
          s >= b.t ? (
            <React.Fragment key={b.text}>
              <div style={{position: 'absolute', left: 960 + Math.cos(b.a) * R * b.r - 6, top: 470 + Math.sin(b.a) * R * b.r - 6, width: 12, height: 12, borderRadius: 6, background: '#F2F2F2', boxShadow: '0 0 14px white', opacity: pop(s, b.t)}} />
              <Tiny x={960 + Math.cos(b.a) * R * b.r} y={470 + Math.sin(b.a) * R * b.r + 10} text={b.text} at={b.t} size={11} w={200} />
            </React.Fragment>
          ) : null,
        )}
        <Tiny x={960} y={200} text="WHAT YOU NOTICE" size={16} />
        <Count x={1340} y={380} label="OBJECTIONS SPOTTED" value={String(spotted)} size={60} />
      </div>
      {/* the cage of untested assumptions */}
      {cage > 0 && (
        <div style={{opacity: cage}}>
          <Beam x={960} w={260} a={1.2} />
          <Person x={960} R={30} pose={free > 0.8 ? 'cheer' : 'rest'} />
          {Array.from({length: 9}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: 840 + i * 30, top: 600, width: 4, height: FLOOR - 600, background: G, opacity: 1 - free, translate: `0 ${free * (i % 2 ? -40 : 40)}px`}} />
          ))}
          <div style={{position: 'absolute', left: 830, top: 590, width: 260, height: 10, background: G, opacity: 1 - free}} />
          <Pill x={960} y={560} text="“MY BUYERS WANT…”" at={30.0} out={31.3} dark />
          <Pill x={960} y={560} text="QUESTIONS" at={31.4} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// 8. what feels obvious is a bell curve set by who you talk to (mirrors their dot distribution)
const Bell: React.FC = () => {
  const s = useSec();
  const shift = ramp(s, 35.4, 36.6, 0, 1, Easing.inOut(Easing.cubic));
  const cols = 15;
  return (
    <AbsoluteFill>
      <Beam x={360} w={220} />
      <Person x={360} R={26} />
      {Array.from({length: cols}, (_, c) => {
        const h = Math.round(9 * Math.exp(-((c - 7) ** 2) / 10));
        return Array.from({length: h}, (_, r) => {
          const t0 = 33.0 + c * 0.04 + r * 0.03;
          if (s < t0) return null;
          return <div key={`${c}-${r}`} style={{position: 'absolute', left: 620 + c * 42 + shift * 380, top: FLOOR - 30 - r * 34, width: 18, height: 18, borderRadius: 9, background: '#E4E4E4', opacity: pop(s, t0), boxShadow: '0 0 10px rgba(255,255,255,0.35)'}} />;
        });
      })}
      <div style={{position: 'absolute', left: 600, top: FLOOR - 8, width: 1100, height: 2, background: '#7A7A7A'}} />
      <Pill x={914 + shift * 380} y={FLOOR - 370} text={shift < 0.5 ? 'WHAT SELLERS THINK' : 'WHAT BUYERS THINK'} at={34.2} />
      <Tiny x={914 + shift * 380} y={FLOOR - 430} text="WHAT FEELS OBVIOUS" at={34.0} size={14} w={300} />
      {shift > 0.5 && <Tiny x={914 + shift * 380} y={FLOOR + 20} text="THE PEOPLE YOU TALK TO" at={35.8} size={14} w={340} />}
    </AbsoluteFill>
  );
};

// 9-10. the buyer in a spreadsheet, two islands drifting together (mirrors the phone + two islands)
const Island: React.FC<{x: number; y: number; label: string; children?: React.ReactNode}> = ({x, y, label, children}) => (
  <>
    <svg style={{position: 'absolute', left: x - 120, top: y, overflow: 'visible', filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.25))'}} width={240} height={150}>
      <path d="M0 0 L240 0 L130 140 Q120 150 110 140 Z" fill="rgba(14,14,14,0.96)" stroke={G} strokeWidth={3} />
      <line x1={40} y1={30} x2={200} y2={30} stroke="rgba(200,200,200,0.3)" strokeWidth={2} strokeDasharray="8 8" />
    </svg>
    {children}
    <Tiny x={x} y={y + 160} text={label} size={13} w={240} />
  </>
);
const Distance: React.FC = () => {
  const s = useSec();
  const phase2 = s > 41.76;
  const close = phase2 ? ramp(s, 42.0, 45.3, 0, 1, Easing.inOut(Easing.cubic)) : 0;
  const km = Math.round(interpolate(close, [0, 1], [1000, 3]));
  const lx = interpolate(close, [0, 1], [520, 840]);
  const rx = interpolate(close, [0, 1], [1400, 1080]);
  const sheet = !phase2 && s < 39.4;
  return (
    <AbsoluteFill>
      {sheet ? (
        <>
          <div style={{position: 'absolute', left: 660, top: 220, width: 600, height: 520, borderRadius: 14, border: `4px solid ${G}`, background: 'rgba(14,14,14,0.96)', boxShadow: '0 0 40px rgba(255,255,255,0.15)', padding: 26, boxSizing: 'border-box', fontFamily: FONT}}>
            <div style={{fontSize: 16, letterSpacing: 5, color: '#9A9A9A', fontWeight: 800}}>CUSTOMERS.XLSX</div>
            {Array.from({length: 9}, (_, r) => (
              <div key={r} style={{display: 'flex', gap: 10, marginTop: 14, opacity: s > 36.9 + r * 0.08 ? 1 : 0}}>
                <div style={{width: 120, height: 22, background: r === 4 ? '#EDEDED' : '#5A5A5A', borderRadius: 3}} />
                <div style={{width: 180, height: 22, background: '#3E3E3E', borderRadius: 3}} />
                <div style={{width: 160, height: 22, background: '#3E3E3E', borderRadius: 3}} />
              </div>
            ))}
          </div>
          <Pill x={960} y={430} text="BUYER #1043" at={37.3} />
        </>
      ) : (
        <>
          <Island x={lx} y={560} label="YOU">
            <Person x={lx} y={560} R={22} />
          </Island>
          <Island x={rx} y={phase2 ? 560 : 470} label="YOUR BUYER">
            <Person x={rx} y={phase2 ? 560 : 470} R={22} facing={-1} />
          </Island>
          <Dots x1={lx + 130} y1={640} x2={rx - 130} y2={phase2 ? 640 : 560} p={1} n={Math.max(2, Math.round(16 * (1 - close)))} />
          <Count x={960} y={760} label="DISTANCE" value={`${km.toLocaleString('en-US')} KM`} size={44} />
          {!phase2 && <Tiny x={960} y={400} text="A DIFFERENT WORLD" at={39.6} size={15} />}
          {phase2 && <Pill x={960} y={440} text="•••" at={42.4} out={44.0} dark />}
        </>
      )}
    </AbsoluteFill>
  );
};

// 11. who you listen to steers what you build (mirrors their compass between two crowds)
const Compass: React.FC = () => {
  const s = useSec();
  const swing = ramp(s, 46.6, 47.8, 0, 1, Easing.inOut(Easing.back(1.6)));
  const angle = interpolate(swing, [0, 1], [205, 360]) + Math.sin(s * 3) * 4 * (1 - swing);
  return (
    <AbsoluteFill>
      <svg style={{position: 'absolute', left: 960 - 180, top: 300 - 180, overflow: 'visible', filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.3))'}} width={360} height={360}>
        <circle cx={180} cy={180} r={176} fill="none" stroke={G} strokeWidth={5} />
        <circle cx={180} cy={180} r={150} fill="none" stroke="rgba(200,200,200,0.3)" strokeWidth={2} />
        <g transform={`rotate(${angle} 180 180)`}>
          <polygon points="180,166 330,180 180,194" fill="#EDEDED" />
          <polygon points="180,170 50,180 180,190" fill="#7A7A7A" />
        </g>
        <circle cx={180} cy={180} r={10} fill="#EDEDED" />
      </svg>
      {[420, 500, 580].map((x) => <Person key={x} x={x} R={24} dim={0.3 + swing * 0.4} />)}
      <Tiny x={500} y={FLOOR + 24} text="OTHER SELLERS" size={13} dim={swing > 0.5} w={300} />
      {[1340, 1420, 1500].map((x) => <Person key={x} x={x} R={24} dim={0.5 - swing * 0.5} />)}
      {swing > 0.5 && <Beam x={1420} w={380} a={swing} />}
      <Tiny x={1420} y={FLOOR + 24} text="YOUR BUYERS" size={13} w={300} />
      {s > 49.0 && (
        <>
          <div style={{position: 'absolute', left: 1406, top: 660, fontSize: 30, color: '#F2F2F2', opacity: pop(s, 49.0), filter: 'drop-shadow(0 0 12px white)'}}>★</div>
          <Tiny x={1420} y={705} text="WHAT YOU BUILD" at={49.0} size={13} w={300} />
        </>
      )}
    </AbsoluteFill>
  );
};

// 12. what flows into who you build for; today projects tomorrow (mirrors WHO YOU ARE + TODAY -> TOMORROW)
const Ending: React.FC = () => {
  const s = useSec();
  const parts = [
    {x: 520, text: 'PROBLEMS'},
    {x: 700, text: 'WORDS'},
    {x: 1220, text: 'OBJECTIONS'},
    {x: 1400, text: 'DESIRES'},
  ];
  const fill = ramp(s, 51.0, 52.6);
  const phase2 = s > 52.9;
  const beam = ramp(s, 53.3, 54.4);
  const grow = ramp(s, 53.9, 55.2, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill>
      {!phase2 ? (
        <>
          {parts.map((p, i) => (
            <React.Fragment key={p.text}>
              <Person x={p.x} R={24} />
              <Tiny x={p.x} y={FLOOR + 22} text={p.text} size={12} w={200} />
              {s > 50.4 + i * 0.2 && (() => {
                const life = ramp(s, 50.4 + i * 0.2, 51.6 + i * 0.2);
                return <div style={{position: 'absolute', left: p.x + (960 - p.x) * life - 6, top: FLOOR - 140 - Math.sin(life * Math.PI) * 120 - 6, width: 12, height: 12, borderRadius: 6, background: '#FFFFFF', boxShadow: '0 0 16px white', opacity: 1 - life * 0.3}} />;
              })()}
            </React.Fragment>
          ))}
          <svg style={{position: 'absolute', left: 960 - 75, top: FLOOR - 300, overflow: 'visible'}} width={150} height={300}>
            <circle cx={75} cy={45} r={38} fill={`rgba(235,235,235,${fill})`} stroke="#BDBDBD" strokeWidth={3} strokeDasharray={fill > 0.9 ? undefined : '8 7'} />
            <path d="M5 300 L5 160 Q5 95 75 95 Q145 95 145 160 L145 300 Z" fill={`rgba(235,235,235,${fill})`} stroke="#BDBDBD" strokeWidth={3} strokeDasharray={fill > 0.9 ? undefined : '8 7'} />
          </svg>
          {fill > 0.8 && <Tiny x={960} y={FLOOR + 22} text="THIS SALE" at={52.0} size={14} />}
        </>
      ) : (
        <>
          <Person x={560} R={22} />
          <Tiny x={560} y={FLOOR + 22} text="TODAY" size={12} />
          <div style={{position: 'absolute', left: 590, top: 300, width: 900, height: FLOOR - 300, background: `linear-gradient(90deg, rgba(255,255,255,${0.18 * beam}), rgba(255,255,255,${0.05 * beam}))`, clipPath: 'polygon(0 78%, 100% 0, 100% 100%, 0 92%)', filter: 'blur(4px)'}} />
          <svg style={{position: 'absolute', left: 1240 - 150, top: FLOOR - 600, overflow: 'visible', filter: `drop-shadow(0 0 ${40 * grow}px rgba(255,255,255,${0.7 * grow}))`}} width={300} height={600}>
            <circle cx={150} cy={95} r={78} fill={`rgba(240,240,240,${grow})`} stroke="#BDBDBD" strokeWidth={4} strokeDasharray={grow > 0.95 ? undefined : '12 10'} />
            <path d="M10 600 L10 330 Q10 195 150 195 Q290 195 290 330 L290 600 Z" fill={`rgba(240,240,240,${grow})`} stroke="#BDBDBD" strokeWidth={4} strokeDasharray={grow > 0.95 ? undefined : '12 10'} />
          </svg>
          <Tiny x={1240} y={FLOOR + 22} text="EVERY PRODUCT YOU'LL MAKE" size={13} w={400} />
          {grow > 0.6 && <Count x={1240} y={170} label="SALES" value="$1,000,000" size={56} at={54.4} />}
        </>
      )}
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.2, src: 'sfx/whoosh.wav', vol: 0.4})),
  {t: 0.57, src: SFX('select-002'), vol: 0.45},
  {t: 0.84, src: SFX('select-002'), vol: 0.45},
  {t: 1.12, src: SFX('notification-pop'), vol: 0.4},
  {t: 3.2, src: SFX('success-chime'), vol: 0.45},
  {t: 5.9, src: SFX('impact-generic-light-002'), vol: 0.4},
  ...[9.18, 9.65, 10.3, 10.87].map((t) => ({t, src: SFX('notification-pop'), vol: 0.35})),
  {t: 11.9, src: SFX('error-002'), vol: 0.35},
  ...[15.6, 15.9, 16.2].map((t) => ({t, src: SFX('select-002'), vol: 0.4})),
  {t: 20.3, src: SFX('confirmation-002'), vol: 0.45},
  ...[24.2, 24.6, 25.0, 25.4].map((t) => ({t, src: SFX('tick-001'), vol: 0.5})),
  {t: 25.8, src: SFX('success-chime'), vol: 0.4},
  ...[27.45, 27.8, 28.2, 28.5, 28.8, 29.1].map((t) => ({t, src: SFX('select-002'), vol: 0.35})),
  {t: 31.3, src: SFX('impact-generic-light-002'), vol: 0.5},
  {t: 35.4, src: 'sfx/whoosh.wav', vol: 0.3},
  ...Array.from({length: 8}, (_, i) => ({t: 42.0 + i * 0.4, src: SFX('tick-001'), vol: 0.3})),
  {t: 46.6, src: SFX('switch-002'), vol: 0.45},
  {t: 49.0, src: SFX('success-chime'), vol: 0.4},
  {t: 52.3, src: SFX('confirmation-002'), vol: 0.4},
  {t: 54.4, src: SFX('success-chime'), vol: 0.5},
];

const World: React.FC = () => (
  <AbsoluteFill>
    <Shot start={0} end={4.16} first zoom={[1.08, 1.0]}>
      <Floor />
      <Hook />
    </Shot>
    <Shot start={4.16} end={7.84} zoom={[1.0, 1.06]}>
      <Iceberg />
    </Shot>
    <Shot start={7.84} end={12.96}>
      <Floor />
      <Sellers />
    </Shot>
    <Shot start={12.96} end={17.36} zoom={[1.06, 1.0]}>
      <Floor />
      <Table />
    </Shot>
    <Shot start={17.36} end={21.44}>
      <Floor />
      <Stairs />
    </Shot>
    <Shot start={21.44} end={26.94}>
      <Floor />
      <Flow />
    </Shot>
    <Shot start={26.94} end={32.66}>
      <Floor />
      <Radar />
    </Shot>
    <Shot start={32.66} end={36.8}>
      <Floor />
      <Bell />
    </Shot>
    <Shot start={36.8} end={45.68} zoom={[1.0, 1.05]}>
      <Distance />
    </Shot>
    <Shot start={45.68} end={50.0}>
      <Floor />
      <Compass />
    </Shot>
    <Shot start={50.0} end={58} last zoom={[1.0, 1.06]}>
      <Floor />
      <Ending />
    </Shot>
  </AbsoluteFill>
);

export const ThirdBuyer: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fade = interpolate(frame, [THIRD_FRAMES - 30, THIRD_FRAMES], [1, 0], clamp);
  const world = (
    <AbsoluteFill style={{scale: `${1 + bp * 0.008}`}}>
      <World />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: '#030303'}}>
      <Audio src={staticFile('vo6/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-6.wav')} volume={0.4} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{filter: `blur(0.5px) contrast(1.15) brightness(${0.95 + bp * 0.06})`}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{filter: 'blur(14px) brightness(1.3)', opacity: 0.5, mixBlendMode: 'screen'}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, rgba(0,0,0,0.8) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
