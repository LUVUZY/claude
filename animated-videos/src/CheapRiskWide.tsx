import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Blob, FONT, FPS, W, DIM, clamp, fr, glow, money, pop, ramp, rand, useSec} from './MaybeLater';
import grid from './song-grid-2.json';

// "Cheap Feels Risky" — wide (16:9) remake, closer to cryothum:
// 1) horizontal stage  2) spectacle / accumulation  3) light sources inside the scene
// 4) big expressive characters  5) almost no on-screen text  6) concrete metaphors.
// Same voiceover (public/vo2), same beat-placed timing and song bed as the vertical version.

export const WIDE_FRAMES = fr(55);
const WIDTH = 1920;
const FLOOR = 905;
const BEAT = grid.beat;
const DROP = grid.drop;
const STRIP = grid.strip;

const beatPulse = (sec: number) => {
  if (sec < DROP || sec > STRIP) return 0;
  const since = (sec - DROP) % BEAT;
  const half = (sec - DROP) % (BEAT / 2);
  return Math.max(Math.exp(-since / 0.1), 0.35 * Math.exp(-half / 0.07));
};

// ---------- stage ----------
const Stage: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill style={{backgroundColor: '#070708'}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1.5px, transparent 1.7px)', backgroundSize: '44px 44px'}} />
      {Array.from({length: 60}, (_, i) => {
        const x = (rand(i) * WIDTH + Math.sin(s * 0.3 + i) * 20 + WIDTH) % WIDTH;
        const y = (((rand(i + 50) * 1080 - s * (10 + rand(i + 99) * 18)) % 1080) + 1080) % 1080;
        const r = 1.2 + rand(i + 7) * 2.2;
        const a = 0.07 + 0.16 * (0.5 + 0.5 * Math.sin(s * (0.8 + rand(i + 3)) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: `rgba(255,255,255,${a})`}} />;
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: FLOOR,
          height: 3,
          backgroundImage: 'linear-gradient(90deg, rgba(237,237,237,0.4) 55%, transparent 55%)',
          backgroundSize: '26px 3px',
        }}
      />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none'}} />;

// a light source inside the scene: lights up everything around it
const Light: React.FC<{x: number; y: number; r?: number; a?: number}> = ({x, y, r = 420, a = 0.22}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, rgba(255,255,255,${a}) 0%, rgba(255,255,255,${a * 0.35}) 35%, transparent 70%)`}} />
);

const Beam: React.FC<{x: number; w?: number; a?: number}> = ({x, w = 700, a = 1}) => (
  <>
    <div style={{position: 'absolute', left: x - w / 2, top: 0, width: w, height: FLOOR + 30, background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,${0.05 * a}) 100%)`, clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', filter: 'blur(24px)'}} />
    <div style={{position: 'absolute', left: x - w * 0.7, top: FLOOR - 110, width: w * 1.4, height: 220, background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${0.11 * a}) 0%, transparent 70%)`}} />
  </>
);

// ---------- shots with motion-blurred whips ----------
const WHIP = 0.26;
const ShotInner: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string}> = ({start, end, children, zoom, origin = '50% 60%'}) => {
  const s = useSec();
  const enter = ramp(s, start - WHIP, start + WHIP, 1, 0, Easing.out(Easing.cubic));
  const exit = ramp(s, end - WHIP, end + WHIP, 0, 1, Easing.in(Easing.cubic));
  const z = zoom ? interpolate(s, [start, end], zoom, clamp) : 1;
  return <AbsoluteFill style={{translate: `${(enter - exit) * 2100}px 0`, scale: `${z}`, transformOrigin: origin}}>{children}</AbsoluteFill>;
};
const Shot: React.FC<{start: number; end: number; children: React.ReactNode; zoom?: [number, number]; origin?: string; first?: boolean; last?: boolean}> = ({start, end, children, zoom, origin, first, last}) => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  if (frame < (first ? 0 : fr(start - WHIP)) || frame >= (last ? WIDE_FRAMES : fr(end + WHIP))) return null;
  const inner = (
    <ShotInner start={first ? -10 : start} end={last ? 999 : end} zoom={zoom} origin={origin}>
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

// ---------- props ----------
const Counter: React.FC<{x: number; y: number; label: string; value: string; size?: number; at?: number}> = ({x, y, label, value, size = 110, at = -9}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 14);
  return (
    <div style={{position: 'absolute', left: x - 500, width: 1000, top: y, textAlign: 'center', opacity: p, fontFamily: FONT}}>
      <div style={{fontWeight: 800, fontSize: 26, letterSpacing: 7, color: '#BDBDC2'}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: size, color: W, lineHeight: 1.05, filter: glow(0.55, 30)}}>{value}</div>
    </div>
  );
};

const Tag: React.FC<{x: number; y: number; text: string; scale?: number; dim?: number; string?: number; swing?: number}> = ({x, y, text, scale = 1, dim = 0, string = 120, swing = 0}) => {
  const s = useSec();
  const c = dim > 0.5 ? DIM : W;
  return (
    <div style={{position: 'absolute', left: x, top: y, scale: `${scale}`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', left: -2, top: -string, width: 4, height: string, background: c}} />
      <div style={{position: 'absolute', rotate: `${Math.sin(s * 2.1 + x) * 3 + swing}deg`, transformOrigin: '0 0'}}>
        <div
          style={{
            position: 'absolute',
            left: -150,
            top: 0,
            width: 300,
            height: 160,
            borderRadius: 24,
            border: `6px solid ${c}`,
            background: 'rgba(7,7,8,0.96)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 92,
            color: c,
            filter: dim > 0.5 ? undefined : glow(0.5, 26),
          }}
        >
          <div style={{position: 'absolute', left: 132, top: 12, width: 30, height: 30, borderRadius: 15, border: `5px solid ${c}`}} />
          <span style={{marginTop: 22}}>{text}</span>
        </div>
      </div>
    </div>
  );
};

const Laptop: React.FC<{x: number; y: number; scale?: number; on?: number; children?: React.ReactNode}> = ({x, y, scale = 1, on = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, scale: `${scale}`, transformOrigin: '50% 100%'}}>
    <div style={{position: 'absolute', left: -170, top: -230, width: 340, height: 210, borderRadius: 14, border: `6px solid ${W}`, background: `rgba(255,255,255,${0.05 + 0.1 * on})`, boxShadow: `0 0 ${60 * on}px rgba(255,255,255,${0.45 * on})`, overflow: 'hidden'}}>
      {children ?? (
        <>
          <div style={{position: 'absolute', left: 120, top: 50, width: 90, height: 90, borderRadius: 45, border: `6px solid ${W}`, opacity: 0.9}} />
          <div style={{position: 'absolute', left: 157, top: 78, width: 0, height: 0, borderTop: '17px solid transparent', borderBottom: '17px solid transparent', borderLeft: `28px solid ${W}`}} />
          <div style={{position: 'absolute', left: 30, top: 165, width: 270, height: 12, borderRadius: 6, background: 'rgba(237,237,237,0.6)'}} />
        </>
      )}
    </div>
    <div style={{position: 'absolute', left: -210, top: -18, width: 420, height: 18, borderRadius: 9, background: W}} />
  </div>
);

const Desk: React.FC<{x: number; w?: number; y?: number}> = ({x, w = 520, y = 690}) => (
  <svg style={{position: 'absolute', left: x - w / 2, top: y, overflow: 'visible', filter: glow(0.25, 14)}} width={w} height={FLOOR - y}>
    <line x1={0} y1={0} x2={w} y2={0} stroke={W} strokeWidth={7} strokeLinecap="round" />
    <line x1={30} y1={0} x2={30} y2={FLOOR - y} stroke={W} strokeWidth={5} />
    <line x1={w - 30} y1={0} x2={w - 30} y2={FLOOR - y} stroke={W} strokeWidth={5} />
  </svg>
);

const Stall: React.FC<{x: number; scale?: number; dim?: number}> = ({x, scale = 1, dim = 0}) => {
  const c = dim > 0.5 ? DIM : W;
  return (
    <svg style={{position: 'absolute', left: x - 230 * scale, top: FLOOR - 600 * scale, overflow: 'visible', filter: dim > 0.5 ? undefined : glow(0.28, 18)}} width={460 * scale} height={600 * scale} viewBox="0 0 460 600">
      <line x1={34} y1={70} x2={34} y2={600} stroke={c} strokeWidth={6} />
      <line x1={426} y1={70} x2={426} y2={600} stroke={c} strokeWidth={6} />
      <path d="M0 70 L460 70 L460 135 Q431 168 402 135 Q373 168 345 135 Q316 168 287 135 Q259 168 230 135 Q201 168 172 135 Q144 168 115 135 Q86 168 57 135 Q29 168 0 135 Z" fill="rgba(7,7,8,0.96)" stroke={c} strokeWidth={6} />
      <rect x={12} y={390} width={436} height={210} rx={12} fill="rgba(7,7,8,0.96)" stroke={c} strokeWidth={6} />
    </svg>
  );
};

const Box: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number; op?: number; lit?: number}> = ({x, y, w = 86, h = 66, rot = 0, op = 1, lit = 0}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, borderRadius: 8, border: `4px solid ${W}`, background: lit ? `rgba(255,255,255,${0.2 + 0.6 * lit})` : 'rgba(7,7,8,0.95)', rotate: `${rot}deg`, opacity: op, boxShadow: lit ? `0 0 ${40 * lit}px rgba(255,255,255,${0.5 * lit})` : undefined}}>
    <div style={{height: h * 0.28, borderBottom: `4px solid ${W}`}} />
  </div>
);

const Bill: React.FC<{x: number; y: number; rot?: number; op?: number}> = ({x, y, rot = 0, op = 1}) => (
  <div style={{position: 'absolute', left: x - 44, top: y - 26, width: 88, height: 52, borderRadius: 6, background: '#E6E6E6', border: '3px solid #9A9A9A', rotate: `${rot}deg`, opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, fontWeight: 900, fontSize: 22, color: '#555'}}>
    <span>$</span>
    <span>$</span>
  </div>
);

const WineGlass: React.FC<{x: number; y: number; fill?: number; id: string; scale?: number}> = ({x, y, fill = 0.55, id, scale = 1}) => (
  <svg style={{position: 'absolute', left: x - 90 * scale, top: y - 330 * scale, overflow: 'visible', filter: glow(0.35, 18)}} width={180 * scale} height={330 * scale} viewBox="0 0 180 330">
    <defs>
      <clipPath id={`bowl-${id}`}>
        <path d="M20 10 Q20 170 90 180 Q160 170 160 10 Z" />
      </clipPath>
    </defs>
    <rect x={0} y={10 + (1 - fill) * 170} width={180} height={200} fill="rgba(237,237,237,0.85)" clipPath={`url(#bowl-${id})`} />
    <path d="M20 10 Q20 170 90 180 Q160 170 160 10 Z" fill="none" stroke={W} strokeWidth={6} />
    <line x1={90} y1={180} x2={90} y2={300} stroke={W} strokeWidth={6} />
    <ellipse cx={90} cy={310} rx={60} ry={12} fill="none" stroke={W} strokeWidth={6} />
  </svg>
);

const Stars: React.FC<{x: number; y: number; lit: number; at: number}> = ({x, y, lit, at}) => {
  const s = useSec();
  return (
    <div style={{position: 'absolute', left: x - 200, width: 400, top: y, textAlign: 'center', fontSize: 64, letterSpacing: 6}}>
      {Array.from({length: 5}, (_, i) => {
        const on = i < lit && s >= at + i * 0.12;
        return (
          <span key={i} style={{color: on ? W : '#3A3A3E', filter: on ? glow(0.7, 16) : undefined, display: 'inline-block', scale: on ? `${0.7 + 0.3 * pop(s, at + i * 0.12, 9)}` : '1'}}>
            ★
          </span>
        );
      })}
    </div>
  );
};

const Sparkles: React.FC<{x: number; y: number; at: number; n?: number; r?: number}> = ({x, y, at, n = 14, r = 160}) => {
  const s = useSec();
  if (s < at) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = rand(i + 11) * Math.PI * 2;
        const life = ((s - at) * 0.9 + rand(i)) % 1;
        const d = r * (0.3 + life * 0.9);
        return <div key={i} style={{position: 'absolute', left: x + Math.cos(a) * d, top: y + Math.sin(a) * d * 0.7, width: 8, height: 8, borderRadius: 4, background: W, opacity: (1 - life) * 0.9, boxShadow: '0 0 12px white'}} />;
      })}
    </>
  );
};

const Bubble: React.FC<{x: number; y: number; at: number; text: string}> = ({x, y, at, text}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 11);
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -100%', scale: `${p}`, transformOrigin: '50% 100%'}}>
      <div style={{padding: '22px 36px', borderRadius: 40, border: `5px solid ${W}`, background: 'rgba(7,7,8,0.96)', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: W, whiteSpace: 'nowrap', filter: glow(0.45, 20)}}>{text}</div>
      <div style={{position: 'absolute', left: '50%', bottom: -22, width: 26, height: 26, background: 'rgba(7,7,8,0.96)', borderRight: `5px solid ${W}`, borderBottom: `5px solid ${W}`, rotate: '45deg', translate: '-50% 0'}} />
    </div>
  );
};

// ---------- scenes ----------
// A. hook: price drops, unsold stock piles up
const PYRAMID: {x: number; y: number}[] = [];
for (let row = 0; row < 8; row++) for (let k = 0; k < 8 - row; k++) PYRAMID.push({x: 1080 + row * 46 + k * 92, y: FLOOR - row * 70});
const Hook: React.FC = () => {
  const s = useSec();
  const price = Math.round(ramp(s, 0.3, 1.7, 99, 19, Easing.inOut(Easing.cubic)));
  return (
    <AbsoluteFill>
      <Light x={500} y={560} r={520} a={0.2} />
      <Counter x={500} y={90} label="PRICE" value={`$${price}`} size={150} />
      <Desk x={520} />
      <Laptop x={520} y={690}>
        <div style={{padding: 22, fontFamily: FONT, fontWeight: 900, color: W}}>
          <div style={{fontSize: 22, letterSpacing: 4, opacity: 0.7}}>NEW ORDERS</div>
          <div style={{fontSize: 96, marginTop: 6}}>0</div>
        </div>
      </Laptop>
      <Blob x={190} y={FLOOR} scale={1.3} arms={s > 1.9 ? 'up' : 'point'} squash={s > 1.9 && s < 2.1 ? 1 : 0} />
      {PYRAMID.map((b, i) => {
        const t0 = 0.15 + i * 0.075;
        if (s < t0) return null;
        const p = pop(s, t0, 13);
        return <Box key={i} x={b.x} y={interpolate(p, [0, 1], [b.y - 600, b.y])} rot={(rand(i) - 0.5) * 6} op={Math.min(1, p * 2)} />;
      })}
    </AbsoluteFill>
  );
};

// B. buyers can't judge quality, so they read the price
const Signal: React.FC = () => {
  const s = useSec();
  const dim = ramp(s, 5.3, 5.8);
  const tag = s >= 6.72 ? pop(s, 6.72, 9) : 0;
  return (
    <AbsoluteFill>
      <Light x={1250} y={560} r={600} a={0.12 * (1 - dim) + 0.3 * tag} />
      <Blob x={430} y={FLOOR} scale={1.35} />
      {[1050, 1450].map((x, i) => (
        <React.Fragment key={x}>
          <div style={{position: 'absolute', left: x - 120, top: 640, width: 240, height: FLOOR - 640, border: `5px solid ${dim > 0.5 ? DIM : W}`, borderBottom: 'none', borderRadius: '14px 14px 0 0'}} />
          <Box x={x} y={640} w={190} h={150} lit={(1 - dim) * 0.25} />
          {s >= 3.95 + i * 0.15 && (
            <div style={{position: 'absolute', left: x - 60, top: 300, width: 120, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 140, color: dim > 0.5 ? DIM : W, opacity: pop(s, 3.95 + i * 0.15), filter: dim > 0.5 ? undefined : glow(0.5, 20)}}>?</div>
          )}
        </React.Fragment>
      ))}
      {tag > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: tag, translate: `0 ${(1 - tag) * -300}px`}}>
          <Tag x={1250} y={250} text="$$$" scale={1.25} string={250} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// C. the wine experiment
const Wine: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      <Light x={1100} y={600} r={560} a={0.16} />
      <Desk x={1100} w={760} y={760} />
      <WineGlass id="a" x={900} y={760} />
      <WineGlass id="b" x={1300} y={760} />
      <Tag x={900} y={150} text="$10" scale={0.75} string={150} />
      <Tag x={1300} y={150} text="$90" scale={0.75} string={150} />
      <Blob x={380} y={FLOOR} scale={1.3} arms={s > 10.3 ? 'point' : 'none'} />
      <Stars x={900} y={300} lit={2} at={12.93} />
      <Stars x={1300} y={300} lit={5} at={13.3} />
      <Sparkles x={1300} y={600} at={13.6} />
    </AbsoluteFill>
  );
};

// D. same wine, different price, different experience
const SameWine: React.FC = () => {
  const s = useSec();
  const tilt = ramp(s, 14.4, 14.8, 0, 1) * (1 - ramp(s, 15.9, 16.2));
  const bx = interpolate(s, [14.4, 15.0, 15.2, 15.8], [900, 900, 1300, 1300], clamp);
  const pouring = s > 14.7 && s < 15.95 && !(s > 15.0 && s < 15.2);
  const fillA = ramp(s, 14.7, 15.0, 0, 0.55);
  const fillB = ramp(s, 15.2, 15.8, 0, 0.55);
  const happy = s >= 16.87 ? pop(s, 16.87, 10) : 0;
  return (
    <AbsoluteFill>
      <Light x={1100} y={620} r={560} a={0.14} />
      <Desk x={1100} w={760} y={760} />
      <WineGlass id="c" x={900} y={760} fill={fillA} />
      <WineGlass id="d" x={1300} y={760} fill={fillB} />
      {/* one bottle pours both glasses: it really is the same wine */}
      <div style={{position: 'absolute', left: bx - 50, top: 150, width: 100, height: 260, rotate: `${tilt * 115}deg`, transformOrigin: '50% 80%', filter: glow(0.4, 16)}}>
        <div style={{position: 'absolute', left: 30, top: 0, width: 40, height: 80, borderRadius: '10px 10px 0 0', border: `5px solid ${W}`, borderBottom: 'none'}} />
        <div style={{position: 'absolute', left: 0, top: 75, width: 100, height: 185, borderRadius: '30px 30px 14px 14px', border: `5px solid ${W}`, background: 'rgba(7,7,8,0.96)'}} />
      </div>
      {pouring && <div style={{position: 'absolute', left: bx - 4, top: 360, width: 8, height: 240, borderRadius: 4, background: 'rgba(237,237,237,0.85)'}} />}
      {s >= 15.72 && (
        <>
          <div style={{opacity: pop(s, 15.72)}}>
            <Tag x={900} y={90} text="$10" scale={0.6} string={90} />
          </div>
          <div style={{opacity: pop(s, 15.85)}}>
            <Tag x={1300} y={90} text="$90" scale={0.6} string={90} />
          </div>
        </>
      )}
      <Blob x={1650} y={FLOOR} scale={1.25} arms={happy > 0.5 ? 'up' : 'none'} />
      {happy > 0 && <Light x={1650} y={500} r={260} a={0.35 * happy} />}
      <Sparkles x={1300} y={620} at={16.87} n={18} r={200} />
    </AbsoluteFill>
  );
};

// E. two sellers, same course
const TwoSellers: React.FC = () => {
  const s = useSec();
  return (
    <AbsoluteFill>
      <Beam x={560} />
      <Beam x={1360} />
      {[560, 1360].map((x) => (
        <React.Fragment key={x}>
          <Stall x={x} />
          <Blob x={x} y={FLOOR - 240} scale={0.85} />
          <Laptop x={x} y={FLOOR - 210} scale={0.55} />
          <Tag x={x} y={140} text="$99" scale={0.7} string={140} />
        </React.Fragment>
      ))}
      {s >= 20.22 && <div style={{position: 'absolute', left: 900, top: 470, width: 120, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 160, color: W, opacity: pop(s, 20.22), filter: glow(0.6, 26)}}>=</div>}
    </AbsoluteFill>
  );
};

// F. seller 1 panics and slashes the price
const Panic: React.FC = () => {
  const s = useSec();
  const price = Math.round(ramp(s, 24.3, 25.3, 99, 19, Easing.in(Easing.quad)));
  const shake = s > 22.2 && s < 23.6 ? Math.sin(s * 70) * 12 : 0;
  const landed = s >= 25.3 ? pop(s, 25.3, 8) : 0;
  return (
    <AbsoluteFill>
      <Beam x={960} w={900} a={1.3} />
      <Light x={960} y={250} r={380} a={0.15 + 0.25 * landed} />
      <div style={{position: 'absolute', inset: 0, translate: `${shake}px 0`}}>
        <Stall x={960} scale={1.15} />
        <Blob x={960} y={FLOOR - 275} scale={1} arms={s > 22.2 ? 'up' : 'none'} />
        <Laptop x={960} y={FLOOR - 240} scale={0.62} />
      </div>
      {/* sweat */}
      {s > 22.3 &&
        Array.from({length: 8}, (_, i) => {
          const life = ((s - 22.3) * 1.4 + rand(i)) % 1;
          const side = i % 2 ? 1 : -1;
          return <div key={i} style={{position: 'absolute', left: 960 + side * (70 + life * 160), top: 330 + life * life * 260 - Math.sin(life * Math.PI) * 120, width: 14, height: 20, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: W, opacity: 1 - life}} />;
        })}
      <Tag x={960} y={90} text={`$${price}`} scale={0.85 + 0.1 * landed} string={90} swing={landed > 0 ? Math.sin(s * 25) * 10 * (1 - ramp(s, 25.3, 26)) : 0} />
    </AbsoluteFill>
  );
};

// G. it looks like a question
const Question: React.FC = () => {
  const s = useSec();
  const arrive = ramp(s, 26.2, 27.2, 0, 1, Easing.out(Easing.cubic));
  const back = ramp(s, 29.8, 30.9, 0, 1, Easing.inOut(Easing.cubic));
  const q = s >= 28.36 ? pop(s, 28.36, 8) : 0;
  return (
    <AbsoluteFill>
      <Beam x={560} />
      <Stall x={560} />
      <Blob x={560} y={FLOOR - 240} scale={0.85} />
      <Laptop x={560} y={FLOOR - 210} scale={0.55} />
      <Tag x={560} y={120} text="$19" scale={0.7} string={120} />
      {q > 0 && (
        <>
          <Light x={560} y={420} r={360} a={0.3 * q} />
          <div style={{position: 'absolute', left: 560 - 150, top: 160, width: 300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 420, lineHeight: 1, color: W, scale: `${0.4 + 0.6 * q}`, rotate: `${(1 - q) * -20 + 6}deg`, filter: glow(0.7, 40)}}>?</div>
        </>
      )}
      {[0, 1, 2, 3].map((i) => (
        <Blob key={i} x={interpolate(arrive, [0, 1], [2150 + i * 160, 1080 + i * 190]) + back * 260} y={FLOOR} scale={i === 0 ? 1.2 : 1.05} dim={back * 0.6} />
      ))}
      <Bubble x={1150 + back * 260} y={330} at={29.7} text="WHAT'S WRONG WITH IT?" />
    </AbsoluteFill>
  );
};

// H. seller 2 keeps the price and shows why
const Holo: React.FC<{y: number; at: number; text: string; icon: string}> = ({y, at, text, icon}) => {
  const s = useSec();
  if (s < at) return null;
  const p = pop(s, at, 12);
  return (
    <div style={{position: 'absolute', left: 1180, top: y, width: 620, height: 150, borderRadius: 22, border: `5px solid ${W}`, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 30, paddingLeft: 36, opacity: p, translate: `${(1 - p) * -200}px 0`, scale: `${0.8 + 0.2 * p}`, filter: glow(0.5, 26), fontFamily: FONT, fontWeight: 900, color: W}}>
      <div style={{fontSize: 70, width: 80, textAlign: 'center'}}>{icon}</div>
      <div style={{fontSize: 46, letterSpacing: 2}}>{text}</div>
    </div>
  );
};
const ShowWhy: React.FC = () => {
  const s = useSec();
  const beams = [35.32, 36.25, 37.21].filter((t) => s >= t).length;
  return (
    <AbsoluteFill>
      <Light x={620} y={560} r={600} a={0.22} />
      <Stall x={620} scale={1.1} />
      <Blob x={620} y={FLOOR - 265} scale={0.95} arms={s > 33.4 && s < 35.2 ? 'point' : 'none'} />
      <Laptop x={620} y={FLOOR - 230} scale={0.62} on={1.4} />
      <Tag x={620} y={110} text="$99" scale={0.75} string={110} />
      {/* light beams from the laptop to each panel */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
        {[325, 525, 725].slice(0, beams).map((y) => (
          <line key={y} x1={700} y1={700} x2={1180} y2={y} stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="10 10" />
        ))}
      </svg>
      <Holo y={250} at={35.32} text="WHAT YOU GET" icon="☰" />
      <Holo y={450} at={36.25} text="WHO IT'S FOR" icon="◉" />
      <Holo y={650} at={37.21} text="WHAT CHANGES" icon="↗" />
    </AbsoluteFill>
  );
};

// I. the price becomes proof — buyers pour in, money piles up
const BILLS: {x: number; y: number}[] = [];
for (let row = 0; row < 6; row++) for (let k = 0; k < 7 - row; k++) BILLS.push({x: 880 + row * 47 + k * 94, y: FLOOR - 26 - row * 52});
const Proof: React.FC = () => {
  const s = useSec();
  const rev = ramp(s, 39.4, 41.5, 0, 61380, Easing.out(Easing.quad)) + (Math.floor(s * 30) % 3) * 7;
  const proof = s >= 40.5 ? pop(s, 40.5, 9) : 0;
  return (
    <AbsoluteFill>
      <Light x={420} y={560} r={520} a={0.2} />
      <Light x={1180} y={760} r={420} a={0.18} />
      <Stall x={420} />
      <Blob x={420} y={FLOOR - 240} scale={0.85} arms={proof > 0.5 ? 'up' : 'none'} />
      <Laptop x={420} y={FLOOR - 210} scale={0.55} on={1.3} />
      <Tag x={420} y={120} text="$99" scale={0.7} string={120} />
      {proof > 0 && (
        <div style={{position: 'absolute', left: 420 - 140, top: 330, width: 280, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, letterSpacing: 4, color: '#070708', background: W, borderRadius: 14, scale: `${interpolate(proof, [0, 1], [2, 1])}`, rotate: '-6deg', opacity: Math.min(1, proof * 2), boxShadow: '0 0 40px rgba(255,255,255,0.6)'}}>
          PROOF
        </div>
      )}
      <Counter x={1560} y={90} label="REVENUE" value={money(rev)} size={110} at={39.2} />
      {BILLS.map((b, i) => {
        const t0 = 39.2 + i * 0.06;
        if (s < t0) return null;
        const p = pop(s, t0, 12);
        return <Bill key={i} x={b.x} y={interpolate(p, [0, 1], [b.y - 450, b.y])} rot={(rand(i + 4) - 0.5) * 8} op={Math.min(1, p * 2)} />;
      })}
      {/* bills still raining in */}
      {s > 39.6 &&
        Array.from({length: 10}, (_, i) => {
          const life = ((s - 39.6) * 0.8 + rand(i + 30)) % 1;
          return <Bill key={`f${i}`} x={830 + rand(i + 60) * 330} y={-60 + life * 760} rot={life * 360 * (i % 2 ? 1 : -1)} op={1 - life * 0.6} />;
        })}
      {Array.from({length: 4}, (_, i) => {
        const t0 = 38.7 + i * 0.25;
        if (s < t0) return null;
        const x = interpolate(ramp(s, t0, t0 + 0.9, 0, 1, Easing.out(Easing.cubic)), [0, 1], [2150, 1530 + i * 120]);
        return <Blob key={`b${i}`} x={x} y={FLOOR} scale={0.72} dim={i % 2 ? 0.15 : 0} />;
      })}
    </AbsoluteFill>
  );
};

// J. caveat: a high price with nothing behind it
const Empty: React.FC = () => {
  const s = useSec();
  const open = ramp(s, 43.3, 43.8, 0, 1, Easing.out(Easing.back(1.5)));
  const glowBox = 1 - ramp(s, 43.5, 44.2);
  const angry = s >= 45.3 ? pop(s, 45.3, 9) : 0;
  const leave = ramp(s, 45.9, 46.7, 0, 1, Easing.in(Easing.quad));
  return (
    <AbsoluteFill>
      <Light x={960} y={620} r={520} a={0.08 + 0.25 * glowBox} />
      <Tag x={960} y={110} text="$999" scale={0.85} string={110} />
      <div style={{position: 'absolute', left: 960 - 140, top: 760, width: 280, height: FLOOR - 760, border: `5px solid ${W}`, borderBottom: 'none', borderRadius: '14px 14px 0 0'}} />
      {/* the box */}
      <div style={{position: 'absolute', left: 960 - 170, top: 520, width: 340, height: 240, border: `6px solid ${W}`, borderRadius: 12, background: `rgba(255,255,255,${0.04 + 0.3 * glowBox})`, boxShadow: `0 0 ${80 * glowBox}px rgba(255,255,255,${0.5 * glowBox})`}} />
      <div style={{position: 'absolute', left: 960 - 185, top: 490, width: 370, height: 44, border: `6px solid ${W}`, borderRadius: 10, background: '#070708', transformOrigin: '0% 100%', rotate: `${-open * 110}deg`, translate: `0 ${-open * 30}px`}} />
      {/* puff of dust: there is nothing inside */}
      {s > 43.4 &&
        Array.from({length: 12}, (_, i) => {
          const life = Math.min(1, (s - 43.4) / 1.2);
          const a = (i / 12) * Math.PI - Math.PI;
          return <div key={i} style={{position: 'absolute', left: 960 + Math.cos(a) * 160 * life, top: 520 + Math.sin(a) * 120 * life, width: 26, height: 26, borderRadius: 13, background: 'rgba(237,237,237,0.35)', opacity: 1 - life, filter: 'blur(3px)'}} />;
        })}
      {[260, 470, 1450, 1660].map((x, i) => {
        const dir = x < 960 ? -1 : 1;
        return (
          <React.Fragment key={x}>
            <Blob x={x + dir * leave * 500} y={FLOOR} scale={i % 3 === 0 ? 1.1 : 0.95} arms={angry > 0.5 ? 'up' : 'none'} dim={leave * 0.5} />
            {angry > 0 && <div style={{position: 'absolute', left: x + dir * leave * 500 - 24, top: FLOOR - 470, fontFamily: FONT, fontWeight: 900, fontSize: 110, color: W, opacity: angry * (1 - leave), scale: `${angry}`, filter: glow(0.6, 20)}}>!</div>}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// K. the line to remember (beat strips out) — the only real text in the video
const Remember: React.FC = () => {
  const s = useSec();
  const line = (t: number, text: string, size: number, dim: boolean) => {
    const p = s >= t ? pop(s, t, 13) : 0;
    return <div style={{fontSize: size, color: dim ? '#8E8E94' : W, opacity: p, translate: `0 ${(1 - p) * 40}px`, filter: dim ? undefined : glow(0.5, 30)}}>{text}</div>;
  };
  return (
    <AbsoluteFill>
      <Beam x={960} w={800} a={0.5 + ramp(s, 51, 52)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontWeight: 900, lineHeight: 1.12, letterSpacing: 2}}>
        {line(49.33, "CHEAP DOESN'T FEEL LIKE A DEAL.", 74, true)}
        <div style={{height: 26}} />
        {line(51.0, 'IT FEELS LIKE A RISK.', 128, false)}
      </div>
      <Tag x={960} y={600} text="$19" scale={0.7} string={150} dim={ramp(s, 51.0, 51.6)} />
    </AbsoluteFill>
  );
};

// ---------- sound ----------
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUTS = [3.092, 8.427, 14.652, 18.208, 21.765, 26.211, 31.546, 38.66, 41.328, 46.663];
const CUES: Cue[] = [
  ...CUTS.map((t) => ({t: t - 0.22, src: 'sfx/whoosh.wav', vol: 0.5})),
  ...Array.from({length: 10}, (_, i) => ({t: 0.32 + i * 0.14, src: SFX('tick-001'), vol: 0.5})),
  ...Array.from({length: 12}, (_, i) => ({t: 0.3 + i * 0.23, src: SFX('drop-002'), vol: 0.3})),
  {t: 1.95, src: SFX('impact-wood-heavy-001'), vol: 0.6},
  {t: 3.95, src: SFX('notification-pop'), vol: 0.4},
  {t: 4.1, src: SFX('notification-pop'), vol: 0.4},
  {t: 6.72, src: SFX('impact-wood-heavy-001'), vol: 0.8},
  {t: 12.93, src: SFX('switch-002'), vol: 0.45},
  {t: 13.3, src: SFX('success-chime'), vol: 0.45},
  {t: 14.7, src: SFX('drop-002'), vol: 0.4},
  {t: 15.72, src: SFX('select-002'), vol: 0.45},
  {t: 16.87, src: SFX('success-chime'), vol: 0.5},
  {t: 20.22, src: SFX('select-002'), vol: 0.5},
  {t: 22.23, src: SFX('error-002'), vol: 0.5},
  ...Array.from({length: 8}, (_, i) => ({t: 24.32 + i * 0.12, src: SFX('tick-001'), vol: 0.6})),
  {t: 25.3, src: SFX('impact-wood-heavy-001'), vol: 0.8},
  {t: 28.36, src: SFX('impact-generic-light-002'), vol: 0.7},
  {t: 29.7, src: SFX('notification-pop'), vol: 0.5},
  {t: 35.32, src: SFX('confirmation-002'), vol: 0.45},
  {t: 36.25, src: SFX('confirmation-002'), vol: 0.45},
  {t: 37.21, src: SFX('confirmation-002'), vol: 0.45},
  {t: 39.3, src: SFX('handle-coins'), vol: 0.5},
  {t: 39.9, src: SFX('coin-collect'), vol: 0.45},
  {t: 40.5, src: SFX('impact-wood-heavy-001'), vol: 0.7},
  {t: 40.55, src: SFX('success-chime'), vol: 0.5},
  {t: 41.0, src: SFX('handle-coins'), vol: 0.45},
  {t: 43.3, src: SFX('close-002'), vol: 0.6},
  {t: 45.3, src: SFX('error-002'), vol: 0.55},
  {t: 51.0, src: SFX('impact-wood-heavy-001'), vol: 0.6},
];

export const CheapRiskWide: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const frame = useCurrentFrame();
  const bp = beatPulse(frame / FPS);
  const fadeOut = interpolate(frame, [WIDE_FRAMES - 24, WIDE_FRAMES], [1, 0], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: '#070708'}}>
      <Audio src={staticFile('vo2/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-2.wav')} volume={0.42} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: fadeOut}}>
        <Stage />
        <AbsoluteFill style={{scale: `${1 + bp * 0.012}`, filter: `brightness(${1 + bp * 0.09})`}}>
          <Shot start={0} end={3.092} first zoom={[1, 1.05]}>
            <Hook />
          </Shot>
          <Shot start={3.092} end={8.427} zoom={[1, 1.05]}>
            <Signal />
          </Shot>
          <Shot start={8.427} end={14.652} zoom={[1, 1.06]}>
            <Wine />
          </Shot>
          <Shot start={14.652} end={18.208} zoom={[1, 1.05]}>
            <SameWine />
          </Shot>
          <Shot start={18.208} end={21.765} zoom={[1, 1.04]}>
            <TwoSellers />
          </Shot>
          <Shot start={21.765} end={26.211} zoom={[1, 1.1]} origin="50% 40%">
            <Panic />
          </Shot>
          <Shot start={26.211} end={31.546} zoom={[1, 1.05]}>
            <Question />
          </Shot>
          <Shot start={31.546} end={38.66} zoom={[1, 1.05]}>
            <ShowWhy />
          </Shot>
          <Shot start={38.66} end={41.328} zoom={[1, 1.06]}>
            <Proof />
          </Shot>
          <Shot start={41.328} end={46.663} zoom={[1, 1.05]}>
            <Empty />
          </Shot>
          <Shot start={46.663} end={55} last zoom={[1, 1.06]}>
            <Remember />
          </Shot>
        </AbsoluteFill>
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
