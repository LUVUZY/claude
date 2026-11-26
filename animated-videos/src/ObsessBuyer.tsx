import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES} from './CryoFigure';
import {FONT, FPS, clamp, fr, money, pop, ramp, rand, useSec} from './MaybeLater';
import {Card, Cup, FLOOR, Floor, G, Glow, Monitor, Spot, Desk} from './NextTo';
import grid from './song-grid-5.json';

// "Obsess Over The Buyer" — a scene-for-scene mirror of cryothum's "obsessed with something other than money" video,
// retold for The Buyers Mind. Voice: Inworld "Jane", one continuous take (public/vo5).
export const OBSESS_FRAMES = fr(68.5);
const BEAT = grid.beat;
const DROP = grid.drop; // 3.7
const STRIP = grid.strip; // 57.94
const CUTS = [3.7, 8.46, 13.82, 23.54, 36.3, 45.5, 53.12, 58.5];

const beatPulse = (sec: number) => {
  if (sec < DROP || sec > STRIP) return 0;
  const since = (sec - DROP) % BEAT;
  return Math.exp(-since / 0.1);
};

// ---------- shared bits ----------
const TopCounter: React.FC<{label: string; value: string; x?: number; y?: number; size?: number; at?: number; dim?: boolean}> = ({label, value, x = 960, y = 40, size = 120, at = -9, dim}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 14);
  return (
    <div style={{position: 'absolute', left: x - 450, width: 900, top: y, textAlign: 'center', fontFamily: FONT, opacity: p}}>
      <div style={{fontWeight: 700, fontSize: 26, letterSpacing: 8, color: '#A0A0A0'}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: size, lineHeight: 1.05, color: dim ? '#6A6A6A' : '#E8E8E8', filter: dim ? undefined : 'drop-shadow(0 0 20px rgba(255,255,255,0.35))'}}>{value}</div>
    </div>
  );
};
const Window: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 300}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.9, border: '6px solid #A8A8A8'}}>
    <div style={{position: 'absolute', left: w / 2 - 3, top: 0, width: 6, height: '100%', background: '#A8A8A8'}} />
    <div style={{position: 'absolute', left: 0, top: w * 0.45 - 3, width: '100%', height: 6, background: '#A8A8A8'}} />
    <div style={{position: 'absolute', left: w * 0.68, top: w * 0.15, width: 34, height: 34, borderRadius: 17, boxShadow: '-9px 6px 0 0 #E6E6E6'}} />
  </div>
);
const Money: React.FC<{x: number; y: number; rot?: number; op?: number}> = ({x, y, rot = 0, op = 1}) => (
  <div style={{position: 'absolute', left: x - 48, top: y - 29, width: 96, height: 58, borderRadius: 5, background: '#DCDCDC', border: '3px solid #8A8A8A', rotate: `${rot}deg`, opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontFamily: FONT, fontWeight: 900, fontSize: 25, color: '#555', boxShadow: '0 0 14px rgba(255,255,255,0.2)'}}>
    <span>$</span>
    <span>$</span>
  </div>
);
const Box: React.FC<{x: number; y: number; s?: number; op?: number; rot?: number; x2?: boolean}> = ({x, y, s = 1, op = 1, rot = 0, x2}) => (
  <div style={{position: 'absolute', left: x - 50 * s, top: y - 70 * s, width: 100 * s, height: 70 * s, borderRadius: 8, border: `4px solid ${G}`, background: 'rgba(24,24,24,0.97)', opacity: op, rotate: `${rot}deg`}}>
    <div style={{height: 18 * s, borderBottom: `4px solid ${G}`}} />
    {x2 && <div style={{position: 'absolute', right: -14, top: -14, width: 30, height: 30, borderRadius: 15, background: '#151515', border: `3px solid ${G}`, color: G, fontSize: 18, fontWeight: 900, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</div>}
  </div>
);

// ---------- shots: zoom/blur crossfade + slow drift ----------
const T = 0.34;
const Shot: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean; last?: boolean}> = ({start, end, children, zoom, origin = '50% 70%', first, last}) => {
  const s = useSec();
  if (s < (first ? -1 : start - T / 2) || s > (last ? 999 : end + T / 2)) return null;
  const pin = first ? 1 : ramp(s, start - T / 2, start + T / 2, 0, 1, Easing.out(Easing.cubic));
  const pout = last ? 0 : ramp(s, end - T / 2, end + T / 2, 0, 1, Easing.in(Easing.cubic));
  const drift = zoom ? interpolate(s, [start, end], zoom, {...clamp, easing: Easing.inOut(Easing.sin)}) : 1;
  const blur = 16 * (1 - pin) + 18 * pout;
  return (
    <AbsoluteFill style={{scale: `${drift * (1 + 0.14 * (1 - pin)) * (1 + 0.22 * pout)}`, transformOrigin: origin, opacity: Math.min(pin, 1 - pout), filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- 1. hook: sales climbing, money piling up, pull out, arms up (mirrors their opening) ----------
const PYR: {x: number; y: number; row: number}[] = [];
for (let row = 0; row < 9; row++) for (let k = 0; k < 11 - row; k++) PYR.push({x: 1420 + row * 55 + k * 108, y: 1048 - row * 62, row});
const Hook: React.FC = () => {
  const s = useSec();
  const zoom = interpolate(s, [0, 3.7], [1.0, 0.7], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const win = s > 2.9 ? interpolate(s, [2.9, 3.2], [0, 1], clamp) : 0;
  const cups = Math.floor(interpolate(s, [0.6, 2.6], [0, 6], clamp));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{scale: `${zoom}`, transformOrigin: '18% 100%'}}>
        <Glow x={960} y={560} r={700} a={0.08} />
        <Window x={-20} y={30} w={320} />
        <Monitor x={975} y={790} w={640}>
          <div style={{position: 'absolute', inset: 0, padding: '26px 34px', fontFamily: FONT, color: '#E6E6E6'}}>
            <div style={{fontSize: 22, letterSpacing: 5, color: '#9A9A9A', fontWeight: 700}}>NEW ORDERS</div>
            {Array.from({length: 6}, (_, i) => (s > 0.4 + i * 0.35 ? <div key={i} style={{marginTop: 12, height: 34, borderRadius: 6, background: i % 2 ? '#8E8E8E' : '#E2E2E2', width: `${60 + rand(i) * 35}%`, opacity: pop(s, 0.4 + i * 0.35)}} /> : null))}
          </div>
          {win > 0 && <div style={{position: 'absolute', left: '50%', top: '45%', translate: '-50% -50%', width: 140, height: 140, borderRadius: 70, background: '#F2F2F2', opacity: win, scale: `${0.5 + 0.5 * win}`, boxShadow: '0 0 90px rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: '#1a1a1a', fontWeight: 900}}>✓</div>}
        </Monitor>
        <Desk x={995} w={810} y={806} />
        {Array.from({length: cups}, (_, i) => <Cup key={i} x={1340} y={806 - i * 56} s={0.8} />)}
        {PYR.map((b, i) => {
          const t0 = 1.0 + i * 0.024;
          if (s < t0) return null;
          const p = interpolate(s, [t0, t0 + 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return <Money key={i} x={b.row === 0 ? interpolate(p, [0, 1], [3300, b.x]) : b.x} y={b.row === 0 ? b.y : interpolate(p, [0, 1], [b.y - 700, b.y])} op={Math.min(1, p * 2)} />;
        })}
        {s > 1.4 && Array.from({length: 11}, (_, i) => {
          const life = ((s - 1.4) * 0.75 + rand(i)) % 1;
          return <Money key={`f${i}`} x={1400 + rand(i + 9) * 1000} y={-650 + life * 1500} rot={life * 400 * (i % 2 ? 1 : -1)} op={1 - life * 0.4} />;
        })}
        <CryoFigure x={455} y={1085} R={84} front={win > 0.5 ? POSES.cheer.front : POSES.type(Math.sin(s * 18) * 3).front} back={win > 0.5 ? POSES.cheer.back : null} tilt={win > 0.5 ? 0 : 5} headBob={Math.sin(s * 9) * 2} />
        <div style={{position: 'absolute', left: -2000, right: -2000, top: 1075, height: 3, backgroundImage: 'linear-gradient(90deg, rgba(220,220,220,0.5) 55%, transparent 55%)', backgroundSize: '26px 3px'}} />
      </AbsoluteFill>
      <TopCounter label="SALES" value={money(interpolate(s, [0, 3.6], [0, 1], clamp) ** 2.6 * 1004083 + 18142)} x={interpolate(s, [0, 3.7], [975, 640], {...clamp, easing: Easing.inOut(Easing.cubic)})} size={136} />
    </AbsoluteFill>
  );
};

// ---------- 2. the first months sell nothing (mirrors their EARNINGS chart) ----------
const Chart: React.FC = () => {
  const s = useSec();
  const bars = [6.21, 6.56, 7.11];
  return (
    <AbsoluteFill>
      <Spot x={330} />
      <CryoFigure x={330} y={FLOOR} R={78} front={s > 7.6 ? POSES.shrug.front : POSES.rest.front} back={s > 7.6 ? POSES.shrug.back : POSES.rest.back} />
      <div style={{position: 'absolute', left: 640, top: 170, width: 5, height: 640, background: G}} />
      <div style={{position: 'absolute', left: 640, top: 810, width: 1060, height: 5, background: G}} />
      <div style={{position: 'absolute', left: 650, top: 130, fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: 6, color: '#C8C8C8'}}>SALES</div>
      {bars.map((t, i) => {
        if (s < t) return null;
        const p = pop(s, t, 12);
        const x = 820 + i * 300;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 75, top: 790, width: 150, height: 14, borderRadius: 3, background: '#E6E6E6', opacity: p}} />
            <div style={{position: 'absolute', left: x - 100, width: 200, top: 680, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 66, color: '#E8E8E8', opacity: p, translate: `0 ${(1 - p) * 30}px`, filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.35))'}}>$0</div>
            <div style={{position: 'absolute', left: x - 100, width: 200, top: 840, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: '#BDBDBD', opacity: p}}>MONTH {i + 1}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 3. two sellers, days ticking, $0 screens (mirrors their two desks + DAYS) ----------
const ZeroScreen: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#E6E6E6'}}>
    <div style={{fontSize: 18, letterSpacing: 5, color: '#9A9A9A', fontWeight: 700}}>SALES</div>
    <div style={{fontSize: 64, fontWeight: 900}}>$0.00</div>
  </div>
);
const Seller: React.FC<{x: number; R?: number; screen?: React.ReactNode; dim?: number}> = ({x, R = 62, screen, dim = 0}) => {
  const s = useSec();
  return (
    <>
      <Spot x={x - 110} a={1 - dim * 0.7} />
      <Desk x={x + 70} w={480} />
      <Monitor x={x + 130} y={790} w={320} on={1 - dim}>{screen}</Monitor>
      <CryoFigure x={x - 130} y={FLOOR} R={R} front={POSES.type(Math.sin(s * 18 + x) * 3).front} back={null} tilt={5} dim={dim} />
    </>
  );
};
const TwoSellers: React.FC = () => {
  const s = useSec();
  const days = Math.round(ramp(s, 8.6, 13.3, 1, 600, Easing.in(Easing.quad)));
  return (
    <AbsoluteFill>
      <TopCounter label="DAYS" value={String(days)} size={100} />
      <Seller x={460} screen={<ZeroScreen />} />
      <Seller x={1380} screen={<ZeroScreen />} />
      {/* what each one is obsessed with */}
      {s > 11.6 && [460, 1380].map((x, i) => (
        <div key={x} style={{position: 'absolute', left: x - 170, top: 330, width: 80, height: 80, borderRadius: 40, border: `5px solid ${G}`, background: 'rgba(20,20,20,0.95)', opacity: pop(s, 11.6 + i * 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, color: '#E6E6E6', boxShadow: '0 0 30px rgba(255,255,255,0.3)'}}>{i === 0 ? '▣' : '◉'}</div>
      ))}
    </AbsoluteFill>
  );
};

// ---------- 4. obsessed with the product: features pile up, motivation drains (mirrors their battery) ----------
const Product: React.FC = () => {
  const s = useSec();
  const features = [16.4, 17.4, 18.4, 19.3, 19.9, 20.7, 21.0];
  const battery = 1 - ramp(s, 20.6, 23.0);
  const slump = ramp(s, 22.8, 23.4);
  return (
    <AbsoluteFill>
      <TopCounter label="SALES" value="$0.00" size={90} dim />
      <Spot x={560} a={1 - slump * 0.6} />
      <Desk x={1000} w={700} />
      <Monitor x={1040} y={790} w={520}>
        <div style={{position: 'absolute', inset: 0, padding: '22px 30px', fontFamily: FONT, color: '#E6E6E6'}}>
          <div style={{fontSize: 20, letterSpacing: 5, color: '#9A9A9A', fontWeight: 700}}>PRODUCT V{1 + features.filter((t) => s > t).length}</div>
          {features.map((t, i) => (s > t ? <div key={i} style={{marginTop: 6, fontSize: 22, fontWeight: 800, opacity: pop(s, t)}}>+ NEW FEATURE</div> : null))}
        </div>
      </Monitor>
      <CryoFigure x={600} y={FLOOR} R={80} front={slump > 0.5 ? POSES.rest.front : POSES.type(Math.sin(s * 22) * 4).front} back={slump > 0.5 ? POSES.rest.back : null} tilt={slump > 0.5 ? 14 : 5} dim={slump * 0.6} />
      {/* weeks with no sale */}
      {[16.4, 17.08, 17.82].map((t, i) => (s > t ? <div key={i} style={{position: 'absolute', left: 1460 + i * 100, top: 170, width: 76, height: 76, borderRadius: 38, border: `4px solid ${G}`, color: G, fontFamily: FONT, fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pop(s, t)}}>✕</div> : null))}
      {/* motivation battery */}
      {s > 20.4 && (
        <div style={{position: 'absolute', left: 300, top: 220, opacity: pop(s, 20.4), fontFamily: FONT}}>
          <div style={{fontWeight: 700, fontSize: 22, letterSpacing: 6, color: '#A0A0A0', marginBottom: 10}}>MOTIVATION</div>
          <div style={{width: 200, height: 86, border: `6px solid ${G}`, borderRadius: 12, padding: 8, boxSizing: 'border-box', display: 'flex', gap: 8}}>
            {[0, 1, 2, 3].map((k) => <div key={k} style={{flex: 1, borderRadius: 4, background: k / 4 < battery ? '#E6E6E6' : '#2A2A2A'}} />)}
          </div>
          <div style={{position: 'absolute', left: 204, top: 66, width: 14, height: 34, borderRadius: 3, background: G}} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 5. obsessed with the buyer: a board filling with what buyers say (mirrors their card grid + DAYS) ----------
const Buyer: React.FC = () => {
  const s = useSec();
  const days = Math.round(ramp(s, 24.0, 35.9, 2, 365, Easing.inOut(Easing.quad)));
  const kinds = ['★★★★', 'NOT FOR ME', '?', '★★', 'TOO HARD', '★★★★★', 'WHY $99?', '!'];
  const cards: {x: number; y: number; t: number}[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) cards.push({x: 860 + c * 165, y: 250 + r * 120, t: 26.9 + (r * 6 + c) * 0.32});
  const better = ramp(s, 32.4, 35.9);
  return (
    <AbsoluteFill>
      <TopCounter label="DAYS" value={String(days)} x={300} y={60} size={90} />
      <div style={{position: 'absolute', left: 760, top: 170, width: 1020, height: 540, borderRadius: 14, border: `5px solid ${G}`, background: 'rgba(18,18,18,0.95)', boxShadow: '0 0 50px rgba(255,255,255,0.12)'}} />
      {cards.map((c, i) => {
        if (s < c.t) return null;
        const p = pop(s, c.t, 11);
        return (
          <div key={i} style={{position: 'absolute', left: c.x - 70, top: c.y - 40, width: 140, height: 80, borderRadius: 12, border: `4px solid ${G}`, background: 'rgba(30,30,30,0.97)', opacity: p, scale: `${0.6 + 0.4 * p}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 18, color: '#E0E0E0', letterSpacing: 1, boxShadow: p > 0.9 && better > 0 ? `0 0 ${24 * better}px rgba(255,255,255,0.35)` : undefined}}>
            {kinds[i % kinds.length]}
          </div>
        );
      })}
      <Spot x={420} a={1 + better * 0.5} />
      <CryoFigure x={420} y={FLOOR} R={80} front={s > 26.3 ? POSES.point.front : POSES.rest.front} back={POSES.rest.back} />
      {/* understanding rising */}
      {s > 32.4 && (
        <div style={{position: 'absolute', left: 860, top: 780, width: 820, fontFamily: FONT, opacity: pop(s, 32.4)}}>
          <div style={{fontWeight: 700, fontSize: 22, letterSpacing: 6, color: '#A0A0A0', marginBottom: 10}}>UNDERSTANDING</div>
          <div style={{height: 26, borderRadius: 13, border: `4px solid ${G}`, padding: 3, boxSizing: 'border-box'}}>
            <div style={{height: '100%', width: `${8 + better * 92}%`, borderRadius: 10, background: '#E6E6E6', boxShadow: '0 0 20px rgba(255,255,255,0.5)'}} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 6. a year later: rebuilt 10x vs understands the buyer; customers find him (mirrors QUIT 10x + offers) ----------
const Later: React.FC = () => {
  const s = useSec();
  const rebuilt = Math.min(10, Math.floor(Math.max(0, s - 37.9) / 0.17));
  const board = s >= 40.4 ? pop(s, 40.4, 12) : 0;
  const sales = ramp(s, 42.9, 45.3, 0, 850171, Easing.in(Easing.quad));
  const boxes: {x: number; y: number}[] = [];
  for (let r = 0; r < 5; r++) for (let k = 0; k < 6 - r; k++) boxes.push({x: 1460 + r * 55 + k * 110, y: FLOOR - r * 74});
  return (
    <AbsoluteFill>
      <TopCounter label="A YEAR LATER" value="12 MONTHS" size={70} />
      {/* left: rebuilt ten times */}
      <Spot x={380} a={0.6} />
      <CryoFigure x={380} y={FLOOR} R={62} front={POSES.rest.front} back={POSES.rest.back} dim={0.35} />
      {Array.from({length: rebuilt}, (_, i) => {
        const a = Math.PI * (0.95 - (i / 9) * 0.9);
        return <Box key={i} x={380 + Math.cos(a) * 300} y={760 - Math.sin(a) * 300} s={0.8} rot={(rand(i) - 0.5) * 20} x2 />;
      })}
      {rebuilt > 0 && <div style={{position: 'absolute', left: 230, top: 160, width: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, color: '#E6E6E6'}}>
        <div style={{fontSize: 22, letterSpacing: 6, color: '#9A9A9A'}}>REBUILT</div>
        <div style={{fontSize: 76}}>{rebuilt}×</div>
      </div>}
      {/* right: knows the buyer; the board glows and customers arrive */}
      <Glow x={1060} y={430} r={380} a={0.2 * board} />
      <div style={{position: 'absolute', left: 860, top: 230, width: 400, height: 300, borderRadius: 12, border: `5px solid ${G}`, background: 'rgba(22,22,22,0.95)', opacity: board, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, padding: 14, boxSizing: 'border-box'}}>
        {Array.from({length: 20}, (_, i) => <div key={i} style={{borderRadius: 6, background: '#DADADA', opacity: 0.85}} />)}
      </div>
      <Spot x={1060} a={1.4} />
      <CryoFigure x={1060} y={FLOOR} R={70} front={sales > 300000 ? POSES.cheer.front : POSES.rest.front} back={sales > 300000 ? POSES.cheer.back : POSES.rest.back} />
      {s > 42.9 && <TopCounter label="SALES" value={money(sales)} x={1560} y={170} size={84} at={42.9} />}
      {boxes.map((b, i) => (s > 43.0 + i * 0.09 ? <Box key={i} x={b.x} y={interpolate(pop(s, 43.0 + i * 0.09, 12), [0, 1], [b.y - 500, b.y])} s={1} /> : null))}
      {[0, 1, 2, 3].map((i) => {
        const t0 = 42.8 + i * 0.3;
        if (s < t0) return null;
        const x = interpolate(ramp(s, t0, t0 + 0.9, 0, 1, Easing.out(Easing.cubic)), [0, 1], [2150, 1260 + i * 70]);
        return <CryoFigure key={i} x={x} y={FLOOR} R={34} front={POSES.rest.front} back={POSES.rest.back} facing={-1} dim={0.2} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- 7. the two things selling takes (mirrors PRACTICE / DETAILS + HOURS) ----------
const TwoThings: React.FC = () => {
  const s = useSec();
  const hours = Math.round(ramp(s, 47.8, 52.9, 2215, 10746, Easing.inOut(Easing.quad)));
  return (
    <AbsoluteFill>
      <Glow x={1040} y={560} r={520} a={0.14} />
      <Window x={120} y={90} w={220} />
      <Seller x={900} R={84} />
      {[
        {t: 50.0, icon: '⌕', label: 'REAL PROBLEM', x: 760},
        {t: 51.54, icon: '❝', label: 'THEIR WORDS', x: 1080},
      ].map((it) =>
        s >= it.t - 1.6 ? (
          <div key={it.label} style={{position: 'absolute', left: it.x - 90, top: 150, width: 180, textAlign: 'center', fontFamily: FONT, opacity: pop(s, it.t - 1.6)}}>
            <div style={{width: 110, height: 110, margin: '0 auto', borderRadius: 55, border: `5px solid ${G}`, background: s >= it.t ? '#EDEDED' : 'rgba(20,20,20,0.95)', color: s >= it.t ? '#151515' : '#E6E6E6', fontSize: 60, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: s >= it.t ? '0 0 60px rgba(255,255,255,0.7)' : undefined}}>{it.icon}</div>
            <div style={{marginTop: 14, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: '#D0D0D0'}}>{it.label}</div>
          </div>
        ) : null,
      )}
      {s > 47.8 && <TopCounter label="HOURS LISTENING" value={hours.toLocaleString('en-US')} x={1540} y={150} size={96} at={47.8} />}
    </AbsoluteFill>
  );
};

// ---------- 8. the product still has to work (mirrors their stall SOLD scene) ----------
const Refund: React.FC = () => {
  const s = useSec();
  const sold = s >= 55.4 ? pop(s, 55.4, 10) : 0;
  const back = ramp(s, 57.3, 57.9, 0, 1, Easing.in(Easing.quad));
  return (
    <AbsoluteFill>
      <Spot x={620} a={1.2} />
      <svg style={{position: 'absolute', left: 620 - 240, top: FLOOR - 620, overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.25))'}} width={480} height={620} viewBox="0 0 460 600">
        <line x1={34} y1={70} x2={34} y2={600} stroke={G} strokeWidth={6} />
        <line x1={426} y1={70} x2={426} y2={600} stroke={G} strokeWidth={6} />
        <path d="M0 70 L460 70 L460 135 Q431 168 402 135 Q373 168 345 135 Q316 168 287 135 Q259 168 230 135 Q201 168 172 135 Q144 168 115 135 Q86 168 57 135 Q29 168 0 135 Z" fill="rgba(16,16,16,0.97)" stroke={G} strokeWidth={6} />
        <rect x={12} y={390} width={436} height={210} rx={12} fill="rgba(16,16,16,0.97)" stroke={G} strokeWidth={6} />
      </svg>
      <CryoFigure x={620} y={FLOOR - 250} R={50} front={sold > 0.5 && back < 0.5 ? POSES.cheer.front : POSES.rest.front} back={sold > 0.5 && back < 0.5 ? POSES.cheer.back : POSES.rest.back} ring={false} />
      {sold > 0 && <div style={{position: 'absolute', left: 620 - 110, top: 200, width: 220, padding: '14px 0', textAlign: 'center', borderRadius: 16, background: back > 0.5 ? 'rgba(20,20,20,0.95)' : '#EDEDED', border: `5px solid ${G}`, color: back > 0.5 ? '#E6E6E6' : '#151515', fontFamily: FONT, fontWeight: 900, fontSize: 48, letterSpacing: 4, scale: `${0.6 + 0.4 * sold}`, rotate: '-4deg', boxShadow: '0 0 40px rgba(255,255,255,0.4)'}}>{back > 0.5 ? 'REFUND' : 'SOLD'}</div>}
      {/* the box goes out to the buyer ... and comes right back */}
      {s > 55.5 && <Box x={interpolate(ramp(s, 55.5, 56.4, 0, 1, Easing.out(Easing.cubic)), [0, 1], [620, 1350]) - back * 730} y={FLOOR - 120 - Math.sin(back * Math.PI) * 220} s={1.1} rot={back * -360} />}
      <CryoFigure x={1450} y={FLOOR} R={64} front={back > 0.3 ? POSES.point.front : POSES.hold.front} back={POSES.rest.back} facing={-1} />
      <TopCounter label="REFUNDS" value={back > 0.5 ? '1' : '0'} x={1450} y={120} size={90} />
    </AbsoluteFill>
  );
};

// ---------- 9. the ending: flat sawtooth that turns exponential (mirrors their final graph) ----------
const Ending: React.FC = () => {
  const s = useSec();
  const prog = ramp(s, 58.6, 63.8, 0, 1, Easing.inOut(Easing.quad));
  const pts: [number, number][] = [];
  const N = 120;
  for (let i = 0; i <= N * prog; i++) {
    const u = i / N;
    const saw = u < 0.6 ? ((u * 10) % 1) * 40 : 0;
    const expo = u > 0.55 ? Math.pow((u - 0.55) / 0.45, 3) * 620 : 0;
    pts.push([260 + u * 1400, 880 - saw - expo]);
  }
  const tip = pts[pts.length - 1] ?? [260, 880];
  const sales = interpolate(prog, [0, 0.55, 1], [0, 6245, 1004083]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 250, top: 180, width: 5, height: 705, background: G}} />
      <div style={{position: 'absolute', left: 250, top: 880, width: 1460, height: 5, background: G}} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.5))'}} width={1920} height={1080}>
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#EDEDED" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <Glow x={tip[0]} y={tip[1]} r={160} a={0.35} />
      <CryoFigure x={tip[0]} y={tip[1] - 4} R={26} front={prog > 0.6 ? POSES.cheer.front : POSES.rest.front} back={prog > 0.6 ? POSES.cheer.back : POSES.rest.back} ring={false} />
      <TopCounter label="SALES" value={money(sales)} x={560} y={210} size={84} />
      {s > 64.3 && <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 76, letterSpacing: 4, color: '#ECECEC', opacity: pop(s, 64.3, 13), filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.5))'}}>OBSESS OVER THE BUYER.</div>}
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.2, src: 'sfx/whoosh.wav', vol: 0.45})),
  ...Array.from({length: 10}, (_, i) => ({t: 1.0 + i * 0.22, src: SFX('drop-002'), vol: 0.22})),
  {t: 2.9, src: SFX('success-chime'), vol: 0.5},
  {t: 6.21, src: SFX('select-002'), vol: 0.45},
  {t: 6.56, src: SFX('select-002'), vol: 0.45},
  {t: 7.11, src: SFX('select-002'), vol: 0.45},
  ...[16.4, 17.08, 17.82].map((t) => ({t, src: SFX('error-002'), vol: 0.35})),
  ...[19.3, 19.9, 20.7, 21.0].map((t) => ({t, src: SFX('notification-pop'), vol: 0.3})),
  {t: 23.0, src: SFX('impact-generic-light-002'), vol: 0.5},
  ...Array.from({length: 24}, (_, i) => ({t: 26.9 + i * 0.32, src: SFX('notification-pop'), vol: 0.16})),
  ...Array.from({length: 10}, (_, i) => ({t: 37.9 + i * 0.17, src: SFX('tick-001'), vol: 0.45})),
  {t: 40.4, src: SFX('success-chime'), vol: 0.45},
  {t: 43.0, src: SFX('handle-coins'), vol: 0.45},
  {t: 44.2, src: SFX('coin-collect'), vol: 0.4},
  {t: 50.0, src: SFX('confirmation-002'), vol: 0.45},
  {t: 51.54, src: SFX('confirmation-002'), vol: 0.45},
  {t: 55.4, src: SFX('success-chime'), vol: 0.45},
  {t: 57.4, src: SFX('error-002'), vol: 0.5},
  {t: 64.3, src: SFX('impact-generic-light-002'), vol: 0.5},
];

const World: React.FC = () => (
  <AbsoluteFill>
    <Shot start={0} end={3.7} first>
      <Hook />
    </Shot>
    <Shot start={3.7} end={8.46} zoom={[1.06, 1.0]}>
      <Floor />
      <Chart />
    </Shot>
    <Shot start={8.46} end={13.82} zoom={[1.0, 1.05]}>
      <Floor />
      <TwoSellers />
    </Shot>
    <Shot start={13.82} end={23.54} zoom={[1.08, 1.0]} origin="40% 70%">
      <Floor />
      <Product />
    </Shot>
    <Shot start={23.54} end={36.3} zoom={[1.0, 1.06]} origin="60% 50%">
      <Floor />
      <Buyer />
    </Shot>
    <Shot start={36.3} end={45.5} zoom={[1.05, 1.0]}>
      <Floor />
      <Later />
    </Shot>
    <Shot start={45.5} end={53.12} zoom={[1.0, 1.06]}>
      <Floor />
      <TwoThings />
    </Shot>
    <Shot start={53.12} end={58.5} zoom={[1.0, 1.04]}>
      <Floor />
      <Refund />
    </Shot>
    <Shot start={58.5} end={68.5} last zoom={[1.0, 1.05]}>
      <Ending />
    </Shot>
  </AbsoluteFill>
);

export const ObsessBuyer: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fade = interpolate(frame, [OBSESS_FRAMES - 24, OBSESS_FRAMES], [1, 0], clamp);
  const world = (
    <AbsoluteFill style={{scale: `${1 + bp * 0.01}`}}>
      <World />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <Audio src={staticFile('vo5/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-5.wav')} volume={0.42} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fade}}>
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px'}} />
        <AbsoluteFill style={{filter: `blur(0.5px) contrast(1.18) brightness(${0.95 + bp * 0.07})`}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{filter: 'blur(16px) brightness(1.3)', opacity: 0.45, mixBlendMode: 'screen'}}>{world}</AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, rgba(0,0,0,0.78) 100%)'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
