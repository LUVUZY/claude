import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES} from './CryoFigure';
import {FONT, FPS, clamp, fr, money, pop, ramp, rand, useSec} from './MaybeLater';
import {Cup, FLOOR, Floor, G, Glow, Phone, Spot} from './NextTo';

// Hook rebuilt to calibration quality: dense scenes, things piling up, light sources, camera pull-out reveal.
// Voice: one continuous take (public/vo4). "coffee"@1.36 "thinking"@2.35 "But"@3.0 "review"@5.47 "first"@5.89
export const HOOK_V2_FRAMES = fr(6.6);
const CUT = 2.95;
const T = 0.34;

// cryothum-style zoom/blur crossfade
const Scene: React.FC<{from: number; to: number; children: React.ReactNode; first?: boolean; last?: boolean}> = ({from, to, children, first, last}) => {
  const s = useSec();
  if (s < (first ? -1 : from - T / 2) || s > (last ? 99 : to + T / 2)) return null;
  const pin = first ? 1 : ramp(s, from - T / 2, from + T / 2, 0, 1, Easing.out(Easing.cubic));
  const pout = last ? 0 : ramp(s, to - T / 2, to + T / 2, 0, 1, Easing.in(Easing.cubic));
  const blur = 16 * (1 - pin) + 18 * pout;
  return <AbsoluteFill style={{opacity: Math.min(pin, 1 - pout), scale: `${(1 + 0.14 * (1 - pin)) * (1 + 0.22 * pout)}`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

const Lamp: React.FC<{x: number; on?: number}> = ({x, on = 1}) => (
  <>
    <div style={{position: 'absolute', left: x - 2, top: -20, width: 4, height: 200, background: '#8A8A8A'}} />
    <div style={{position: 'absolute', left: x - 55, top: 175, width: 110, height: 55, borderRadius: '55px 55px 6px 6px', background: '#1A1A1A', border: `4px solid ${G}`}} />
    <div style={{position: 'absolute', left: x - 30, top: 222, width: 60, height: 14, borderRadius: 7, background: `rgba(255,255,255,${0.9 * on})`, boxShadow: `0 0 40px rgba(255,255,255,${0.8 * on})`}} />
    <div style={{position: 'absolute', left: x - 260, top: 230, width: 520, height: 740, background: `linear-gradient(180deg, rgba(255,255,255,${0.07 * on}), rgba(255,255,255,0))`, clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)', filter: 'blur(14px)'}} />
  </>
);

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const Cafe: React.FC = () => {
  const s = useSec();
  const pull = interpolate(s, [0, 2.4], [1.55, 1.0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const paid = s >= 0.95 ? pop(s, 0.95, 9) : 0;
  const slide = ramp(s, 1.15, 1.55, 0, 1, Easing.out(Easing.cubic));
  const day = Math.min(DAYS.length - 1, Math.floor(Math.max(0, s - 1.45) / 0.2));
  const cupsOnPile = Math.max(0, Math.floor((s - 1.5) / 0.065));
  const month = Math.min(186, 6 + cupsOnPile * 6);
  const pile: {x: number; y: number}[] = [];
  for (let r = 0; r < 5; r++) for (let k = 0; k < 6 - r; k++) pile.push({x: 160 + r * 33 + k * 66, y: 840 - r * 74});
  return (
    <AbsoluteFill style={{scale: `${pull}`, transformOrigin: '59% 60%'}}>
      {/* window */}
      <div style={{position: 'absolute', left: 120, top: 110, width: 300, height: 260, border: `5px solid #9A9A9A`}}>
        <div style={{position: 'absolute', left: 145, top: 0, width: 5, height: '100%', background: '#9A9A9A'}} />
        <div style={{position: 'absolute', left: 0, top: 125, width: '100%', height: 5, background: '#9A9A9A'}} />
      </div>
      {/* menu board */}
      <div style={{position: 'absolute', left: 720, top: 90, width: 520, height: 260, borderRadius: 12, border: `5px solid ${G}`, background: 'rgba(20,20,20,0.95)', boxShadow: '0 0 40px rgba(255,255,255,0.12)', fontFamily: FONT, fontWeight: 800, color: '#DADADA', padding: '26px 40px', boxSizing: 'border-box'}}>
        {[['ESPRESSO', '$4'], ['LATTE', '$6'], ['MOCHA', '$7']].map(([n, p], i) => (
          <div key={n} style={{display: 'flex', justifyContent: 'space-between', fontSize: 40, letterSpacing: 3, marginBottom: 18, color: i === 1 ? '#FFFFFF' : '#9A9A9A'}}>
            <span>{n}</span>
            <span>{p}</span>
          </div>
        ))}
      </div>
      <Lamp x={600} />
      <Lamp x={1150} />
      <Lamp x={1620} />
      {/* counter */}
      <div style={{position: 'absolute', left: 980, top: 690, width: 900, height: FLOOR - 690, border: `5px solid ${G}`, borderBottom: 'none', borderRadius: '8px 8px 0 0', background: 'rgba(14,14,14,0.97)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, height: 4, background: '#5A5A5A'}} />
      </div>
      {/* barista */}
      <CryoFigure x={1640} y={850} R={50} front={POSES.point.front} back={POSES.rest.back} facing={-1} dim={0.3} ring={false} />
      {/* espresso machine + steam */}
      <div style={{position: 'absolute', left: 1360, top: 470, width: 200, height: 220, borderRadius: 14, border: `5px solid ${G}`, background: 'rgba(22,22,22,0.97)'}}>
        <div style={{position: 'absolute', left: 25, top: 25, width: 150, height: 46, borderRadius: 8, background: '#3A3A3A'}} />
        <div style={{position: 'absolute', left: 80, top: 100, width: 40, height: 34, background: G}} />
      </div>
      {[0, 1, 2, 3].map((i) => {
        const life = (s * 0.9 + i / 4) % 1;
        return <div key={i} style={{position: 'absolute', left: 1440 + Math.sin(life * 6 + i) * 14, top: 450 - life * 160, width: 30 + life * 30, height: 30 + life * 30, borderRadius: '50%', background: 'rgba(230,230,230,0.25)', opacity: 1 - life, filter: 'blur(6px)'}} />;
      })}
      {/* payment terminal */}
      <div style={{position: 'absolute', left: 1080, top: 590, width: 120, height: 100, borderRadius: 12, border: `5px solid ${G}`, background: paid ? `rgba(255,255,255,${0.15 + 0.6 * paid})` : 'rgba(20,20,20,0.95)', boxShadow: paid ? `0 0 ${70 * paid}px rgba(255,255,255,0.7)` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: paid > 0.5 ? '#151515' : '#E6E6E6'}}>{paid > 0.5 ? '✓' : '$6'}</div>
      {/* the coffee slides over */}
      <div style={{position: 'absolute', left: interpolate(slide, [0, 1], [1420, 1010]), top: 0}}>{s > 1.15 && s < 1.7 && <Cup x={0} y={690} s={1.1} steam />}</div>
      {/* customer */}
      <Spot x={850} />
      <CryoFigure x={850} y={FLOOR} R={82} front={s < 1.6 ? {...POSES.point.front, angle: 84, len: 2.6} : POSES.hold.front} back={POSES.rest.back}>
        {s >= 1.6 && <rect x={-28} y={-6} width={56} height={66} rx={7} fill="#2A2A2A" stroke="#EDEDED" strokeWidth={6} />}
      </CryoFigure>
      {/* cups piling up on a side table: every day, without thinking */}
      <div style={{position: 'absolute', left: 120, top: 840, width: 460, height: 12, border: `4px solid ${G}`, borderRadius: 3}} />
      {pile.slice(0, cupsOnPile).map((c, i) => (
        <div key={i} style={{translate: `0 ${(1 - pop(s, 1.5 + i * 0.065, 12)) * -80}px`}}>
          <Cup x={c.x} y={c.y} s={0.95} />
        </div>
      ))}
      <Floor />
      {/* day + month counter */}
      {s > 1.4 && (
        <div style={{position: 'absolute', left: 110, top: 400, width: 330, textAlign: 'center', fontFamily: FONT, color: '#E6E6E6'}}>
          <div style={{fontWeight: 900, fontSize: 64, letterSpacing: 6}}>{DAYS[day]}</div>
          <div style={{fontWeight: 700, fontSize: 22, letterSpacing: 6, color: '#9A9A9A', marginTop: 10}}>THIS MONTH</div>
          <div style={{fontWeight: 900, fontSize: 70, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.4))'}}>{money(month)}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const Bedroom: React.FC = () => {
  const s = useSec();
  const push = interpolate(s, [CUT, 6.6], [1.0, 1.08], clamp);
  const minutes = ramp(s, 3.6, 6.4, 0, 47 * 60 + 12, Easing.in(Easing.quad));
  const mm = Math.floor(minutes / 60);
  const ss = Math.floor(minutes % 60);
  const hover = Math.sin(s * 5) * 18 + 30;
  const flown = Math.max(0, Math.floor((s - 4.3) / (s > 5.4 ? 0.07 : 0.13)));
  const tower: {x: number; y: number}[] = [];
  for (let i = 0; i < 40; i++) tower.push({x: 1560 + (i % 2) * 150 + (rand(i) - 0.5) * 20, y: 900 - Math.floor(i / 2) * 44});
  return (
    <AbsoluteFill style={{scale: `${push}`, transformOrigin: '35% 60%'}}>
      {/* night window */}
      <div style={{position: 'absolute', left: 90, top: 90, width: 320, height: 280, border: `5px solid #8A8A8A`, background: 'rgba(30,30,30,0.6)'}}>
        <div style={{position: 'absolute', left: 157, top: 0, width: 5, height: '100%', background: '#8A8A8A'}} />
        <div style={{position: 'absolute', left: 0, top: 137, width: '100%', height: 5, background: '#8A8A8A'}} />
        <div style={{position: 'absolute', left: 220, top: 40, width: 46, height: 46, borderRadius: 23, boxShadow: '-12px 8px 0 0 #E8E8E8'}} />
        {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 30 + rand(i) * 260, top: 20 + rand(i + 9) * 230, width: 4, height: 4, borderRadius: 2, background: '#DDD', opacity: 0.5 + 0.5 * Math.sin(s * 3 + i)}} />)}
      </div>
      {/* wall clock spinning */}
      <div style={{position: 'absolute', left: 1380, top: 90, width: 150, height: 150, borderRadius: 75, border: `5px solid ${G}`}}>
        <div style={{position: 'absolute', left: 73, top: 20, width: 5, height: 56, background: G, transformOrigin: '50% 100%', rotate: `${s * 720}deg`}} />
        <div style={{position: 'absolute', left: 73, top: 38, width: 5, height: 38, background: G, transformOrigin: '50% 100%', rotate: `${s * 60}deg`}} />
      </div>
      {/* bed */}
      <div style={{position: 'absolute', left: 200, top: 760, width: 640, height: FLOOR - 760, border: `5px solid ${G}`, borderRadius: '18px 18px 0 0', background: 'rgba(16,16,16,0.97)'}} />
      <div style={{position: 'absolute', left: 200, top: 640, width: 34, height: 330, border: `5px solid ${G}`, borderRadius: 10, background: 'rgba(16,16,16,0.97)'}} />
      {/* phone glow is the only light */}
      <Glow x={700} y={470} r={420} a={0.22 + 0.04 * Math.sin(s * 9)} />
      <CryoFigure x={520} y={790} R={80} front={POSES.hold.front} back={POSES.rest.back} tilt={-4} ring={false} />
      <Phone x={690} y={420} h={210} rot={8}>
        <div style={{position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.25)'}} />
      </Phone>
      {/* the app, floating big */}
      <div style={{position: 'absolute', left: 900, top: 230, width: 460, height: 380, borderRadius: 30, border: `5px solid ${G}`, background: 'rgba(22,22,22,0.97)', boxShadow: '0 0 60px rgba(255,255,255,0.18)', fontFamily: FONT, color: '#E8E8E8', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 40, top: 40, width: 130, height: 130, borderRadius: 30, background: '#CFCFCF'}} />
        <div style={{position: 'absolute', left: 200, top: 52, fontWeight: 900, fontSize: 40}}>APP</div>
        <div style={{position: 'absolute', left: 200, top: 104, fontWeight: 700, fontSize: 26, color: '#9A9A9A'}}>★★★★☆</div>
        <div style={{position: 'absolute', left: 40, top: 196, fontWeight: 900, fontSize: 74}}>$1.99</div>
        <div style={{position: 'absolute', right: 40, top: 292, width: 150, height: 64, borderRadius: 32, background: '#E8E8E8', color: '#151515', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 36, boxShadow: `0 0 ${20 + 20 * Math.sin(s * 6)}px rgba(255,255,255,0.5)`}}>GET</div>
        {/* thumb hovering, never pressing */}
        <div style={{position: 'absolute', right: 70, top: 330 + hover, width: 90, height: 150, borderRadius: 45, background: '#CFCFCF', opacity: s > 3.4 ? 1 : 0}} />
      </div>
      {/* reviews fly out of the phone and stack into a tower */}
      {tower.slice(0, flown).map((t, i) => {
        const t0 = 4.3 + i * (i * 0.13 > 1.1 ? 0.07 : 0.13);
        const p = ramp(s, t0, t0 + 0.4, 0, 1, Easing.out(Easing.cubic));
        const x = interpolate(p, [0, 1], [700, t.x]);
        const y = interpolate(p, [0, 1], [420, t.y]) - Math.sin(p * Math.PI) * 160;
        return (
          <div key={i} style={{position: 'absolute', left: x - 70, top: y - 20, width: 140, height: 40, borderRadius: 8, border: `3px solid ${G}`, background: 'rgba(24,24,24,0.97)', rotate: `${(rand(i + 2) - 0.5) * 10 * p}deg`, fontSize: 18, color: '#DADADA', display: 'flex', alignItems: 'center', paddingLeft: 10, letterSpacing: 2}}>
            {'★★★★★'.slice(0, 1 + Math.floor(rand(i) * 5))}
          </div>
        );
      })}
      <Floor />
      {/* time spent */}
      {s > 3.5 && (
        <div style={{position: 'absolute', left: 860, top: 650, width: 560, textAlign: 'center', fontFamily: FONT, color: '#E6E6E6', opacity: pop(s, 3.5)}}>
          <div style={{fontWeight: 700, fontSize: 22, letterSpacing: 6, color: '#9A9A9A'}}>READING REVIEWS</div>
          <div style={{fontWeight: 900, fontSize: 96, filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.4))'}}>{mm}:{String(ss).padStart(2, '0')}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-real/${n}.mp3`;
const CUES: Cue[] = [
  {t: 0.95, src: SFX('confirmation-002'), vol: 0.55},
  {t: 1.15, src: SFX('drop-002'), vol: 0.4},
  ...Array.from({length: 7}, (_, i) => ({t: 1.45 + i * 0.2, src: SFX('tick-001'), vol: 0.45})),
  ...Array.from({length: 10}, (_, i) => ({t: 1.5 + i * 0.13, src: SFX('drop-002'), vol: 0.18})),
  {t: CUT - 0.15, src: 'sfx/whoosh.wav', vol: 0.5},
  ...Array.from({length: 18}, (_, i) => ({t: 4.3 + i * 0.12, src: SFX('notification-pop'), vol: 0.14})),
];

const World: React.FC = () => (
  <AbsoluteFill>
    <Scene from={0} to={CUT} first>
      <Cafe />
    </Scene>
    <Scene from={CUT} to={99} last>
      <Bedroom />
    </Scene>
  </AbsoluteFill>
);

export const HookV2: React.FC = () => (
  <AbsoluteFill style={{background: '#050505'}}>
    <Audio src={staticFile('vo4/voiceover.wav')} />
    <Audio src={staticFile('music/song-bed-4.wav')} volume={0.42} />
    {CUES.map((c, i) => (
      <Sequence key={i} from={fr(c.t)} layout="none">
        <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
      </Sequence>
    ))}
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px'}} />
    <AbsoluteFill style={{filter: 'blur(0.5px) contrast(1.18) brightness(0.96)'}}>
      <World />
    </AbsoluteFill>
    <AbsoluteFill style={{filter: 'blur(16px) brightness(1.3)', opacity: 0.45, mixBlendMode: 'screen'}}>
      <World />
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 45%, rgba(0,0,0,0.78) 100%)'}} />
  </AbsoluteFill>
);
