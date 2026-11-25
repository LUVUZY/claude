import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {
  Backdrop,
  Blob,
  Check,
  DIM,
  FLOOR,
  FONT,
  FPS,
  Floor,
  Label,
  Shot,
  Spotlight,
  Stall,
  W,
  clamp,
  fr,
  glow,
  money,
  pop,
  ramp,
  useSec,
} from './MaybeLater';
import grid from './song-grid-2.json';
import voWords from './vo2-words.json';
import {Captions, buildChunks} from './Captions';

const CAPTIONS = buildChunks(voWords, {}, 53);

// "Cheap Feels Risky": why lowering your price can lose sales.
// Voice: Inworld "Jane". Every phrase was re-placed so speech starts on the beat of
// "meaningful love - instrumental" (Silo, Steven Cranberry). Scene cuts land on full beats.
export const CHEAP_RISK_FRAMES = fr(55);
const BEAT = grid.beat;
const DROP = grid.drop; // 3.092s: beat drops right after the hook line
const STRIP = grid.strip; // 46.663s: beat strips out on "If you remember one thing"

const beatPulse = (sec: number) => {
  if (sec < DROP || sec > STRIP) return 0;
  const since = (sec - DROP) % BEAT;
  const half = (sec - DROP) % (BEAT / 2);
  return Math.max(Math.exp(-since / 0.1), 0.35 * Math.exp(-half / 0.07));
};

// ---------- props ----------
const PriceTag: React.FC<{x: number; y: number; text: string; scale?: number; swing?: number; dim?: number; cracked?: number}> = ({
  x,
  y,
  text,
  scale = 1,
  swing = 0,
  dim = 0,
  cracked = 0,
}) => {
  const s = useSec();
  const rot = Math.sin(s * 2.2) * 3 + swing;
  const c = dim > 0.5 ? DIM : W;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, scale: `${scale}`}}>
      <div style={{position: 'absolute', left: -2, top: -130, width: 4, height: 130, background: c}} />
      <div style={{position: 'absolute', left: 0, top: 0, rotate: `${rot}deg`, transformOrigin: '0 0'}}>
        <div
          style={{
            position: 'absolute',
            left: -170,
            top: 0,
            width: 340,
            height: 190,
            borderRadius: 26,
            border: `6px solid ${c}`,
            background: 'rgba(9,9,10,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 110,
            color: c,
            letterSpacing: 2,
            filter: dim > 0.5 ? undefined : glow(0.5, 28),
          }}
        >
          <div style={{position: 'absolute', left: 150, top: 14, width: 34, height: 34, borderRadius: 17, border: `5px solid ${c}`}} />
          <span style={{marginTop: 26}}>{text}</span>
          {cracked > 0 && (
            <svg style={{position: 'absolute', left: 0, top: 0}} width={340} height={190}>
              <path d="M180 0 L160 60 L195 95 L150 140 L175 190" fill="none" stroke="#09090A" strokeWidth={12 * cracked} />
              <path d="M180 0 L160 60 L195 95 L150 140 L175 190" fill="none" stroke={c} strokeWidth={3 * cracked} />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

const WineGlass: React.FC<{x: number; y: number; fill?: number}> = ({x, y, fill = 0.55}) => (
  <svg style={{position: 'absolute', left: x - 90, top: y - 330, overflow: 'visible', filter: glow(0.35, 18)}} width={180} height={330}>
    <defs>
      <clipPath id={`bowl-${x}`}>
        <path d="M20 10 Q20 170 90 180 Q160 170 160 10 Z" />
      </clipPath>
    </defs>
    <rect x={0} y={10 + (1 - fill) * 170} width={180} height={200} fill="rgba(237,237,237,0.85)" clipPath={`url(#bowl-${x})`} />
    <path d="M20 10 Q20 170 90 180 Q160 170 160 10 Z" fill="none" stroke={W} strokeWidth={6} />
    <line x1={90} y1={180} x2={90} y2={300} stroke={W} strokeWidth={6} />
    <ellipse cx={90} cy={310} rx={60} ry={12} fill="none" stroke={W} strokeWidth={6} />
  </svg>
);

const Course: React.FC<{x: number; y: number; scale?: number; dim?: number; glowAmt?: number}> = ({x, y, scale = 1, dim = 0, glowAmt = 0.3}) => {
  const c = dim > 0.5 ? DIM : W;
  return (
    <svg style={{position: 'absolute', left: x - 120 * scale, top: y - 150 * scale, overflow: 'visible', filter: dim > 0.5 ? undefined : glow(glowAmt, 20)}} width={240 * scale} height={150 * scale} viewBox="0 0 240 150">
      <rect x={20} y={0} width={200} height={130} rx={10} fill="rgba(9,9,10,0.95)" stroke={c} strokeWidth={6} />
      <polygon points="105,40 105,90 145,65" fill={c} />
      <line x1={0} y1={140} x2={240} y2={140} stroke={c} strokeWidth={8} strokeLinecap="round" />
    </svg>
  );
};

const Bars: React.FC<{x: number; at: number; low: number; high: number}> = ({x, at, low, high}) => {
  const s = useSec();
  const p = ramp(s, at, at + 0.7, 0, 1, Easing.out(Easing.back(1.3)));
  return (
    <>
      {[
        {dx: -170, h: low},
        {dx: 170, h: high},
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + b.dx - 60,
            top: FLOOR - b.h * p,
            width: 120,
            height: b.h * p,
            borderRadius: '12px 12px 0 0',
            background: i === 1 ? W : 'transparent',
            border: `5px solid ${W}`,
            borderBottom: 'none',
            filter: glow(i === 1 ? 0.55 : 0.25, 26),
          }}
        />
      ))}
    </>
  );
};

const BigWords: React.FC<{lines: {t: number; text: string; size?: number; dim?: boolean}[]; top: number}> = ({lines, top}) => {
  const s = useSec();
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center'}}>
      {lines.map((l) => {
        const p = s >= l.t ? pop(s, l.t, 13) : 0;
        return (
          <div
            key={l.text}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: l.size ?? 92,
              lineHeight: 1.12,
              letterSpacing: 2,
              color: l.dim ? '#8E8E94' : W,
              opacity: p,
              translate: `0 ${(1 - p) * 40}px`,
              scale: `${0.9 + 0.1 * p}`,
              filter: l.dim ? undefined : glow(0.45, 26),
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

// ---------- scenes ----------
// A. hook: the price drops, buyers walk away
const Hook: React.FC = () => {
  const s = useSec();
  const price = Math.round(ramp(s, 0.3, 1.6, 99, 19, Easing.inOut(Easing.cubic)));
  const leave = ramp(s, 1.9, 3.1, 0, 1, Easing.in(Easing.quad));
  return (
    <AbsoluteFill>
      <Label x={540} y={250} text="YOUR PRICE" size={30} spacing={8} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 190, color: W, filter: glow(0.55, 34)}}>
        {money(price)}
      </div>
      <Label x={540} y={530} text="↓" size={70} at={0.4} />
      <Spotlight x={320} width={760} strength={1.3} />
      <Stall x={320} />
      <Blob x={320} y={FLOOR - 230} scale={0.75} arms={s > 1.6 ? 'up' : 'none'} />
      <PriceTag x={320} y={FLOOR - 560} text={`$${price}`} scale={0.55} />
      {[0, 1, 2].map((i) => (
        <Blob key={i} x={700 + i * 120 + leave * 500} y={FLOOR + 20} scale={0.6} dim={leave * 0.85} />
      ))}
      <Label x={820} y={1580} text="BUYERS" size={22} spacing={5} at={0.3} color={leave > 0.5 ? DIM : W} />
    </AbsoluteFill>
  );
};

// B. buyers can't judge quality, so they read the price
const Signal: React.FC = () => {
  const s = useSec();
  const dimAll = ramp(s, 5.3, 5.8);
  const tag = s >= 6.72 ? pop(s, 6.72, 9) : 0;
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} />
      <Label x={540} y={330} text="QUALITY?" size={64} spacing={6} at={3.95} color={dimAll > 0.5 ? DIM : W} />
      {[300, 780].map((x, i) => (
        <React.Fragment key={x}>
          <div style={{position: 'absolute', left: x - 110, top: 1060, width: 220, height: 190, borderRadius: 18, border: `6px solid ${dimAll > 0.5 ? DIM : W}`, background: 'rgba(9,9,10,0.95)', filter: dimAll > 0.5 ? undefined : glow(0.3, 18)}}>
            <div style={{height: 44, borderBottom: `6px solid ${dimAll > 0.5 ? DIM : W}`}} />
          </div>
          <div style={{position: 'absolute', left: x - 140, top: 1250, width: 280, height: 250, border: `5px solid ${dimAll > 0.5 ? DIM : W}`, borderBottom: 'none', borderRadius: '14px 14px 0 0'}} />
          <Label x={x} y={930} text="?" size={90} at={4.26 + i * 0.15} color={dimAll > 0.5 ? DIM : W} />
        </React.Fragment>
      ))}
      <Blob x={540} y={FLOOR + 140} scale={0.9} />
      {tag > 0 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: tag, scale: `${0.6 + 0.4 * tag}`, transformOrigin: '540px 820px'}}>
          <PriceTag x={540} y={700} text="$$$" scale={1.2} />
        </div>
      )}
      <Label x={540} y={470} text="THE ONE SIGNAL THEY CAN SEE" size={30} spacing={4} at={5.4} />
    </AbsoluteFill>
  );
};

// C. the wine experiment
const Wine: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      <Spotlight x={370} />
      <Spotlight x={710} />
      <Label x={540} y={300} text="FAMOUS EXPERIMENT" size={30} spacing={8} at={8.43} />
      <Label x={540} y={360} text="SAME WINE" size={72} spacing={4} at={11.0} />
      <WineGlass x={370} y={1180} />
      <WineGlass x={710} y={1180} />
      <PriceTag x={370} y={630} text="$10" scale={0.6} />
      <PriceTag x={710} y={630} text="$90" scale={0.6} />
      <Label x={540} y={1530} text="TASTE RATING" size={26} spacing={5} at={12.93} />
      <Bars x={540} at={12.93} low={70} high={215} />
      {s >= 13.62 && (
        <div style={{position: 'absolute', left: 710 - 120, top: 1205, width: 240, textAlign: 'center', fontSize: 54, color: W, opacity: pop(s, 13.62), filter: glow(0.6, 20)}}>
          ★★★★★
        </div>
      )}
    </AbsoluteFill>
  );
};

// D. same wine, different price, different experience
const SameWine: React.FC = () => (
  <AbsoluteFill>
    <Spotlight x={540} width={900} strength={0.8} />
    <BigWords
      top={520}
      lines={[
        {t: 14.56, text: 'SAME WINE.', dim: true},
        {t: 15.72, text: 'DIFFERENT PRICE.', dim: true},
        {t: 16.87, text: 'DIFFERENT EXPERIENCE.', size: 84},
      ]}
    />
    <WineGlass x={380} y={1460} fill={0.6} />
    <WineGlass x={700} y={1460} fill={0.6} />
  </AbsoluteFill>
);

// E. two sellers, same course
const TwoSellers: React.FC = () => (
  <AbsoluteFill>
    <Spotlight x={270} />
    <Spotlight x={810} />
    <Label x={540} y={330} text="SAME COURSE" size={64} spacing={5} at={20.22} />
    <Label x={540} y={420} text="TWO SELLERS" size={30} spacing={8} at={18.9} />
    {[270, 810].map((x) => (
      <React.Fragment key={x}>
        <Stall x={x} />
        <Blob x={x} y={FLOOR - 230} scale={0.75} />
        <Course x={x} y={FLOOR - 200} scale={0.75} />
        <PriceTag x={x} y={760} text="$99" scale={0.55} />
      </React.Fragment>
    ))}
  </AbsoluteFill>
);

// F. seller 1 panics and slashes the price
const Panic: React.FC = () => {
  const s = useSec();
  const price = Math.round(ramp(s, 24.3, 25.3, 99, 19, Easing.in(Easing.quad)));
  const shake = s > 22.2 && s < 23.4 ? Math.sin(s * 70) * 10 : 0;
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} strength={1.2} />
      <Label x={540} y={300} text="SELLER 1" size={30} spacing={8} />
      <Label x={540} y={360} text="PANICS" size={84} spacing={6} at={22.23} />
      <div style={{position: 'absolute', inset: 0, translate: `${shake}px 0`}}>
        <Stall x={540} />
        <Blob x={540} y={FLOOR - 230} scale={0.75} arms={s > 22.2 ? 'up' : 'none'} />
        <Course x={540} y={FLOOR - 200} scale={0.75} />
      </div>
      <PriceTag x={540} y={640} text={`$${price}`} scale={0.95} swing={s > 25.1 && s < 25.8 ? Math.sin(s * 30) * 8 : 0} />
    </AbsoluteFill>
  );
};

// G. it looks like a question
const Question: React.FC = () => {
  const s = useSec();
  const q = s >= 28.36 ? pop(s, 28.36, 9) : 0;
  const back = ramp(s, 29.8, 30.8, 0, 1);
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} />
      <PriceTag x={330} y={560} text="$19" scale={0.75} />
      <BigWords top={330} lines={[{t: 26.08, text: 'A DEAL?', size: 76}]} />
      {q > 0 && (
        <div style={{position: 'absolute', left: 560, top: 470, fontFamily: FONT, fontWeight: 900, fontSize: 420, color: W, opacity: q, scale: `${0.5 + 0.5 * q}`, rotate: '8deg', filter: glow(0.6, 40)}}>?</div>
      )}
      <Blob x={540 + back * 160} y={FLOOR} scale={1.05} />
      {s >= 29.7 && (
        <div style={{position: 'absolute', left: 540 + back * 160 - 420, top: 1000, width: 840, padding: '26px 0', whiteSpace: 'nowrap', borderRadius: 40, border: `5px solid ${W}`, background: 'rgba(9,9,10,0.95)', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: 2, color: W, opacity: pop(s, 29.7), filter: glow(0.4, 20)}}>
          WHAT'S WRONG WITH IT?
        </div>
      )}
    </AbsoluteFill>
  );
};

// H. seller 2 keeps the price and shows why
const ShowWhy: React.FC = () => {
  const s = useSec();
  const cards = [
    {t: 35.32, text: 'WHAT YOU GET'},
    {t: 36.25, text: "WHO IT'S FOR"},
    {t: 37.21, text: 'WHAT CHANGES'},
  ];
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} strength={1.3} />
      <Label x={540} y={300} text="SELLER 2" size={30} spacing={8} />
      <Label x={540} y={360} text="KEEPS THE PRICE" size={64} spacing={4} at={32.28} />
      <PriceTag x={540} y={640} text="$99" scale={0.75} />
      <Stall x={540} />
      <Blob x={540} y={FLOOR - 230} scale={0.75} arms={s > 33.4 && s < 35.2 ? 'point' : 'none'} />
      <Course x={540} y={FLOOR - 200} scale={0.75} glowAmt={0.5} />
      {cards.map((c, i) =>
        s >= c.t ? (
          <div
            key={c.text}
            style={{
              position: 'absolute',
              left: [70, 640, 355][i],
              top: [950, 950, 1560][i],
              width: 370,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: pop(s, c.t),
              translate: `0 ${(1 - pop(s, c.t)) * 30}px`,
              filter: glow(0.4, 16),
            }}
          >
            <Check size={46} />
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 36, letterSpacing: 2, color: W, whiteSpace: 'nowrap'}}>{c.text}</div>
          </div>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

// I. the price becomes proof
const Proof: React.FC = () => {
  const s = useSec();
  const rev = ramp(s, 40.6, 41.6, 0, 61380, Easing.out(Easing.quad)) + (Math.floor(s * 30) % 3) * 7;
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} strength={1.4} />
      <PriceTag x={540} y={470} text="$99" scale={0.85} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 96, letterSpacing: 4}}>
        <span style={{color: s >= 40.32 ? '#5E5E63' : W, textDecoration: s >= 40.32 ? 'line-through' : 'none', opacity: s >= 39.6 ? pop(s, 39.6) : 0}}>COST</span>
      </div>
      {s >= 40.5 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 940, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, letterSpacing: 6, color: W, opacity: pop(s, 40.5), scale: `${0.7 + 0.3 * pop(s, 40.5, 9)}`, filter: glow(0.7, 40)}}>
          PROOF
        </div>
      )}
      {[0, 1, 2, 3].map((i) => (s >= 39.0 + i * 0.25 ? <Blob key={i} x={interpolate(ramp(s, 39 + i * 0.25, 39.9 + i * 0.25, 0, 1, Easing.out(Easing.cubic)), [0, 1], [1250, 290 + i * 170])} y={FLOOR} scale={0.6} /> : null))}
      <Label x={540} y={1512} text="REVENUE" size={22} spacing={5} at={40.6} />
      <Label x={540} y={1544} text={money(s >= 40.6 ? rev : 0)} size={56} at={40.6} />
    </AbsoluteFill>
  );
};

// J. caveat: a high price with nothing behind it
const Empty: React.FC = () => {
  const s = useSec();
  const lid = ramp(s, 43.3, 43.8, 0, 1, Easing.out(Easing.back(1.6)));
  const angry = s >= 45.3 ? pop(s, 45.3, 9) : 0;
  return (
    <AbsoluteFill>
      <Spotlight x={540} width={900} />
      <Label x={540} y={300} text="OF COURSE" size={30} spacing={8} at={41.3} />
      <Label x={540} y={360} text="YOU STILL HAVE TO DELIVER" size={52} spacing={2} at={41.97} />
      <PriceTag x={540} y={640} text="$999" scale={0.7} cracked={angry} />
      {/* the box */}
      <div style={{position: 'absolute', left: 540 - 170, top: 1230, width: 340, height: 270, border: `6px solid ${W}`, borderRadius: 14, background: 'rgba(9,9,10,0.95)', filter: glow(0.3, 18)}} />
      <div style={{position: 'absolute', left: 540 - 185, top: 1200, width: 370, height: 46, border: `6px solid ${W}`, borderRadius: 12, background: 'rgba(9,9,10,1)', transformOrigin: '0% 100%', rotate: `${-lid * 115}deg`, translate: `0 ${-lid * 40}px`}} />
      <Label x={540} y={1540} text="NOTHING INSIDE" size={30} spacing={5} at={43.84} />
      {[170, 910].map((x, i) => (
        <React.Fragment key={x}>
          <Blob x={x} y={FLOOR} scale={0.75} arms={angry > 0.5 ? 'up' : 'none'} />
          {angry > 0 && <div style={{position: 'absolute', left: x - 30, top: FLOOR - 400, fontFamily: FONT, fontWeight: 900, fontSize: 110, color: W, opacity: angry, scale: `${angry}`, filter: glow(0.6, 20)}}>!</div>}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// K. the line to remember (beat strips out)
const Remember: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      <Label x={540} y={330} text="IF YOU REMEMBER ONE THING" size={30} spacing={6} at={46.6} />
      <BigWords
        top={520}
        lines={[
          {t: 49.33, text: "CHEAP DOESN'T", size: 96, dim: true},
          {t: 49.9, text: 'FEEL LIKE A DEAL.', size: 96, dim: true},
          {t: 51.0, text: 'IT FEELS', size: 132},
          {t: 51.5, text: 'LIKE A RISK.', size: 132},
        ]}
      />
      <Spotlight x={540} strength={0.5 + ramp(s, 51, 52)} />
      <PriceTag x={540} y={1240} text="$19" scale={0.55} dim={ramp(s, 51.0, 51.6)} />
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUTS = [3.092, 8.427, 14.652, 18.208, 21.765, 26.211, 31.546, 38.66, 41.328, 46.663];
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.22, src: 'sfx/whoosh.wav', vol: 0.5})),
  ...Array.from({length: 10}, (_, i) => ({t: 0.32 + i * 0.13, src: SFX('tick-001'), vol: 0.55})),
  {t: 1.62, src: SFX('impact-wood-heavy-001'), vol: 0.7},
  {t: 4.26, src: SFX('notification-pop'), vol: 0.4},
  {t: 4.41, src: SFX('notification-pop'), vol: 0.4},
  {t: 6.72, src: SFX('impact-wood-heavy-001'), vol: 0.8},
  {t: 11.0, src: SFX('select-002'), vol: 0.5},
  {t: 12.93, src: SFX('switch-002'), vol: 0.5},
  {t: 13.62, src: SFX('success-chime'), vol: 0.45},
  {t: 14.56, src: SFX('drop-002'), vol: 0.55},
  {t: 15.72, src: SFX('drop-002'), vol: 0.55},
  {t: 16.87, src: SFX('impact-generic-light-002'), vol: 0.7},
  {t: 20.22, src: SFX('select-002'), vol: 0.5},
  {t: 22.23, src: SFX('error-002'), vol: 0.5},
  ...Array.from({length: 8}, (_, i) => ({t: 24.32 + i * 0.12, src: SFX('tick-001'), vol: 0.6})),
  {t: 25.3, src: SFX('impact-wood-heavy-001'), vol: 0.8},
  {t: 28.36, src: SFX('impact-generic-light-002'), vol: 0.7},
  {t: 29.7, src: SFX('notification-pop'), vol: 0.5},
  {t: 35.32, src: SFX('confirmation-002'), vol: 0.45},
  {t: 36.25, src: SFX('confirmation-002'), vol: 0.45},
  {t: 37.21, src: SFX('confirmation-002'), vol: 0.45},
  {t: 40.32, src: SFX('switch-002'), vol: 0.5},
  {t: 40.5, src: SFX('success-chime'), vol: 0.6},
  {t: 40.7, src: SFX('handle-coins'), vol: 0.5},
  {t: 43.3, src: SFX('close-002'), vol: 0.6},
  {t: 45.3, src: SFX('error-002'), vol: 0.55},
  {t: 45.35, src: SFX('impact-generic-light-002'), vol: 0.6},
  {t: 51.0, src: SFX('impact-wood-heavy-001'), vol: 0.6},
];

export const CheapRisk: React.FC<{music?: 'song' | 'none'; captions?: boolean}> = ({music = 'song', captions = false}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const bp = beatPulse(s);
  const fadeOut = interpolate(frame, [CHEAP_RISK_FRAMES - 24, CHEAP_RISK_FRAMES], [1, 0], clamp);
  const T = CHEAP_RISK_FRAMES;
  return (
    <AbsoluteFill style={{backgroundColor: '#09090A'}}>
      <Audio src={staticFile('vo2/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-2.wav')} volume={0.42} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Backdrop />
        <AbsoluteFill style={{scale: `${1 + bp * 0.014}`, filter: `brightness(${1 + bp * 0.09})`}}>
          <Floor />
          <Shot start={0} end={3.092} first total={T} zoom={[1, 1.05]}>
            <Hook />
          </Shot>
          <Shot start={3.092} end={8.427} total={T} zoom={[1, 1.05]}>
            <Signal />
          </Shot>
          <Shot start={8.427} end={14.652} total={T} zoom={[1, 1.06]}>
            <Wine />
          </Shot>
          <Shot start={14.652} end={18.208} total={T} zoom={[1, 1.04]}>
            <SameWine />
          </Shot>
          <Shot start={18.208} end={21.765} total={T} zoom={[1, 1.04]}>
            <TwoSellers />
          </Shot>
          <Shot start={21.765} end={26.211} total={T} zoom={[1, 1.08]}>
            <Panic />
          </Shot>
          <Shot start={26.211} end={31.546} total={T} zoom={[1, 1.06]}>
            <Question />
          </Shot>
          <Shot start={31.546} end={38.66} total={T} zoom={[1, 1.05]}>
            <ShowWhy />
          </Shot>
          <Shot start={38.66} end={41.328} total={T} zoom={[1, 1.06]}>
            <Proof />
          </Shot>
          <Shot start={41.328} end={46.663} total={T} zoom={[1, 1.05]}>
            <Empty />
          </Shot>
          <Shot start={46.663} end={55} last total={T} zoom={[1, 1.06]}>
            <Remember />
          </Shot>
        </AbsoluteFill>
        {captions && <Captions chunks={CAPTIONS} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
