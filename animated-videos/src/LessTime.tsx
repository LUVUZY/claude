import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Backdrop, Bubble, C, Camera, Caption, Cross, Crowd, Dust, FONT, GLOW, Ground, Icon, Pawn, Pill, Ring, Spot, Stat, Trend, clamp, fade, fadeOut, fr, pop, useSec} from './LineKit';

// V2 style (premium line). Script: public/vo8/script.txt. Sources: Shu & Gneezy (gift-certificate expiry),
// Worchel, Lee & Adewole 1975 (cookie jar scarcity).
export const LESS_TIME_FRAMES = fr(55.5);

// a jar with n cookies (outline art)
const Jar: React.FC<{x: number; y: number; n: number; s: number; at: number; fill: number; dim?: boolean}> = ({x, y, n, s, at, fill, dim}) => {
  const p = fade(s, at, 0.4);
  const spots: [number, number][] = [[-50, -40], [10, -42], [62, -38], [-30, -95], [36, -92], [-62, -148], [4, -150], [60, -146], [-26, -200], [34, -198]];
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p * (dim ? 0.45 : 1), translate: `0 ${(1 - p) * 14}px`, scale: '1.45', transformOrigin: '0 0', filter: dim ? undefined : GLOW}}>
      <svg width={1} height={1} style={{overflow: 'visible'}}>
        <path d="M -95 -250 H 95 M -80 -250 V -270 H 80 V -250 M -95 -250 C -125 -230 -125 -210 -120 -190 V -14 Q -120 0 -106 0 H 106 Q 120 0 120 -14 V -190 C 125 -210 125 -230 95 -250" fill="none" stroke={dim ? C.dim : C.line} strokeWidth={4.5} strokeLinejoin="round" />
        {spots.slice(0, n).map(([cx, cy], i) => (
          <g key={i} opacity={fade(s, fill + i * 0.06, 0.15)} transform={`translate(0 ${-260 * (1 - interpolate(s, [fill + i * 0.06, fill + i * 0.06 + 0.45], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) * (1 - t)}))})`}>
            <circle cx={cx} cy={cy} r={24} fill="none" stroke={dim ? C.dim : C.line} strokeWidth={3.5} />
            <circle cx={cx - 7} cy={cy - 5} r={3} fill={dim ? C.dim : C.line} />
            <circle cx={cx + 8} cy={cy + 6} r={3} fill={dim ? C.dim : C.line} />
          </g>
        ))}
      </svg>
    </div>
  );
};

// fake countdown that resets itself (the thing buyers learn to ignore)
const FakeTimer: React.FC<{x: number; y: number; s: number; at: number}> = ({x, y, s, at}) => {
  const left = 9 - ((Math.max(0, s - at) * 3) % 9);
  const sec = Math.floor(left);
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', opacity: fade(s, at), padding: '26px 54px', borderRadius: 22, border: `4.5px solid ${C.line}`, fontFamily: FONT, fontWeight: 800, fontSize: 120, color: '#F4F4F4', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', filter: GLOW}}>
      00:0{sec}
    </div>
  );
};

const World: React.FC = () => {
  const s = useSec();
  // hook: time drains while money climbs
  const timeLeft = interpolate(s, [0.1, 3.3], [100, 12], clamp);
  return (
    <>
      <Dust x0={-1200} x1={7600} y0={-700} y1={4600} n={260} />
      {/* A — hook (0,0) */}
      <Pill x={0} y={-370} text="LESS TIME" size={34} look={s > 2.9 ? 'ghost' : 'outline'} s={s} at={0.1} />
      <Pill x={0} y={-290} text="MORE MONEY" size={34} look="solid" s={s} at={2.9} />
      <Ring x={-430} y={20} r={150} pct={0} v={timeLeft} label="TIME LEFT" s={s} at={0} />
      <Trend x={-120} y={250} pts={[[0, 0], [140, -10], [260, -40], [380, -60], [480, -130], [580, -230], [700, -420]]} s={s} at={0.5} d={2.6} rider={80} />
      <Ground y={252} x0={-900} x1={900} s={s} at={0} />

      {/* B — most sellers (2000,0) */}
      <Spot x={1640} y={250} op={fade(s, 3.9, 0.6)} />
      <Pawn x={1640} y={250} h={300} look="hero" tie op={fade(s, 3.86)} bob={Math.sin(s * 2.4) * 4} />
      <Caption x={1640} y={280} text="THE SELLER" s={s} at={4.1} />
      <Icon name="calendar" x={2280} y={-60} size={230} s={s} at={4.97} />
      <Pill x={2280} y={-250} text="LONG DEADLINE" size={26} s={s} at={5.2} />
      <Pill x={2280} y={130} text="GENEROUS" size={30} look="solid" s={s} at={5.89} />
      <Bubble x={1900} y={-230} text="TAKE YOUR TIME" size={44} s={s} at={6.66} />
      <Caption x={2280} y={200} text="MORE TIME = MORE SALES?" s={s} at={7.9} size={26} />

      {/* C — the experiment (2000,1300) */}
      <Pill x={2000} y={870} text="RESEARCHERS: SHU & GNEEZY" size={28} s={s} at={9.5} />
      <Pawn x={1780} y={1150} h={220} look="hero" op={fade(s, 10.3) * fadeOut(s, 13.3)} />
      {s < 13.5 && <Caption x={1780} y={1175} text="SUZANNE SHU" s={s} at={10.4} />}
      <Pawn x={2220} y={1150} h={220} look="hero" op={fade(s, 11.36) * fadeOut(s, 13.3)} />
      {s < 13.5 && <Caption x={2220} y={1175} text="AYELET GNEEZY" s={s} at={11.5} />}
      {s < 13.5 && <Icon name="search" x={2000} y={960} size={110} s={s} at={12.2} />}
      <Icon name="gift" x={2000} y={1180} size={250} s={s} at={13.6} label="GIFT CERTIFICATE" />
      <Crowd x={1240} y={1680} n={4} gap={110} h={130} s={s} at={14.8} ghost={false} walk={-500} />
      <Pill x={1405} y={1460} text="2 MONTHS" size={30} s={s} at={15.28} />
      <Crowd x={2430} y={1680} n={4} gap={110} h={130} s={s} at={16.6} ghost={false} walk={500} />
      <Pill x={2595} y={1460} text="3 WEEKS" size={30} look="solid" s={s} at={17.66} />
      <Ground y={1682} x0={900} x1={3100} s={s} at={14.8} />

      {/* D — the result, under each group (2000,2150) */}
      <Ring x={1405} y={2080} r={150} pct={6} s={s} at={19.5} d={1.6} label="USED IT" dim={s > 21.2} />
      <Ring x={2595} y={2080} r={150} pct={31} s={s} at={21.2} d={2.2} label="USED IT" />
      <Stat x={2000} y={2470} value="5×" caption="LESS TIME · MORE ACTION" size={120} s={s} at={23.66} />

      {/* E — someday vs now (4300,1300) */}
      <Ground y={1450} x0={3500} x1={7000} s={s} at={25.3} />
      <Pawn x={3700 + interpolate(s, [25.6, 30.0], [0, 260], clamp)} y={1450} h={240} look="hero" op={fade(s, 25.4)} bob={s > 25.6 && s < 30 ? Math.abs(Math.sin(s * 5)) * 8 : 0} />
      <Pill x={6100} y={1180} text="SOMEDAY" size={34} look={s > 29.4 ? 'ghost' : 'outline'} s={s} at={27.6} />
      <Icon name="calendar" x={6100} y={1340} size={150} s={s} at={27.6} dim={s > 29.4} />
      <Cross x={6100} y={1260} size={260} s={s} at={29.34} />
      <Icon name="hourglass" x={4150} y={1340} size={160} s={s} at={30.3} />
      <Pill x={4150} y={1130} text="MAYBE" size={34} look="ghost" s={s} at={31.5} out={32.1} />
      <Pill x={4150} y={1130} text="NOW" size={42} look="solid" s={s} at={32.1} />

      {/* F — cookie jars (4300,2700) */}
      <Pill x={4300} y={1960} text="1975 STUDY" size={28} s={s} at={34.8} />
      <Jar x={3880} y={2950} n={2} s={s} at={35.7} fill={37.4} />
      <Jar x={4720} y={2950} n={10} s={s} at={35.9} fill={40.2} dim={s > 41.3} />
      <Caption x={3880} y={2985} text="NEARLY EMPTY" s={s} at={37.8} />
      <Caption x={4720} y={2985} text="FULL" s={s} at={40.8} />
      <Icon name="star" x={3880} y={2440} size={120} s={s} at={38.5} />
      <Crowd x={4080} y={2140} n={5} gap={110} h={110} s={s} at={36.0} walk={-700} />
      <Pill x={4300} y={2620} text="SAME COOKIES" size={28} look="solid" s={s} at={39.6} />
      <div style={{position: 'absolute', left: 4300, top: 2830, translate: '-50% -50%', fontFamily: FONT, fontWeight: 800, fontSize: 90, color: '#EDEDED', opacity: fade(s, 39.9)}}>=</div>

      {/* G — fake countdown (6600,2700) */}
      <FakeTimer x={6600} y={2560} s={s} at={42.4} />
      <Pill x={6600} y={2380} text="FAKE COUNTDOWN" size={28} s={s} at={42.7} />
      <Cross x={6600} y={2560} size={300} s={s} at={43.5} />
      {Array.from({length: 6}, (_, i) => {
        const leave = interpolate(s, [44.9 + i * 0.08, 45.6 + i * 0.08], [0, 1], clamp);
        const come = interpolate(s, [42.6 + i * 0.1, 43.6 + i * 0.1], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
        return <Pawn key={i} x={6260 + i * 136 + (1 - come) * (i < 3 ? -500 : 500) + leave * (i < 3 ? -260 : 260)} y={2960} h={120} look="line" op={fade(s, 42.6 + i * 0.1) * (1 - leave * 0.75)} />;
      })}
      <Ground y={2962} x0={5700} x1={7500} s={s} at={42.5} />
      <Pill x={6600} y={3060} text="THE DEADLINE HAS TO BE REAL" size={30} look="solid" s={s} at={45.9} />

      {/* H — closing (6600,4100) */}
      <Spot x={6600} y={4300} op={fade(s, 47.8, 0.6)} />
      <Pawn x={6600} y={4300} h={280} look="hero" op={fade(s, 47.7)} bob={Math.sin(s * 2) * 2} />
      <Pill x={6600} y={3870} text="FOREVER" size={40} look={s > 49.8 ? 'ghost' : 'outline'} s={s} at={48.9} />
      <Cross x={6600} y={3870} size={200} s={s} at={49.84} />
      <div style={{position: 'absolute', left: 6600, top: 3700, translate: '-50% -50%', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 92, letterSpacing: '0.06em', color: '#F6F6F6', opacity: pop(s, 50.3), scale: `${0.92 + 0.08 * pop(s, 50.3)}`, filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.45))'}}>
        FOREVER IS A POLITE NO.
      </div>
      <Ground y={4302} x0={5800} x1={7400} s={s} at={47.6} />
      <Trend x={5900} y={4300} pts={[[0, 0], [300, -6], [600, -4], [900, -40], [1100, -120], [1300, -300]]} s={s} at={50.6} d={3.6} dim />
    </>
  );
};

const CAM = [
  {t: 0, x: 0, y: -40, z: 1.0},
  {t: 3.5, x: 0, y: -40, z: 1.1},
  {t: 4.2, x: 1700, y: 0, z: 1.12}, // the seller
  {t: 5.6, x: 1760, y: 0, z: 1.16},
  {t: 6.3, x: 2150, y: -80, z: 1.08}, // calendar + bubble
  {t: 7.7, x: 2170, y: -80, z: 1.12},
  {t: 8.3, x: 1980, y: -30, z: 0.98}, // pull back: the whole belief
  {t: 9.1, x: 1980, y: -30, z: 1.0},
  {t: 9.8, x: 1880, y: 1060, z: 1.18}, // researcher 1
  {t: 11.0, x: 1900, y: 1060, z: 1.2},
  {t: 11.6, x: 2120, y: 1060, z: 1.18}, // researcher 2
  {t: 13.0, x: 2120, y: 1080, z: 1.2},
  {t: 13.6, x: 2000, y: 1150, z: 1.1}, // gift certificate
  {t: 14.5, x: 2000, y: 1160, z: 1.14},
  {t: 15.2, x: 2000, y: 1300, z: 0.82}, // pull back: two groups
  {t: 18.7, x: 2000, y: 1330, z: 0.88},
  {t: 19.6, x: 1600, y: 1980, z: 1.08}, // 6%
  {t: 20.6, x: 1620, y: 1990, z: 1.12},
  {t: 21.3, x: 2400, y: 1980, z: 1.08}, // 31%
  {t: 22.9, x: 2420, y: 1990, z: 1.12},
  {t: 23.6, x: 2000, y: 2120, z: 0.9}, // 5x
  {t: 25.2, x: 2000, y: 2130, z: 0.96},
  {t: 26.0, x: 4100, y: 1260, z: 0.95},
  {t: 27.2, x: 4250, y: 1260, z: 0.98},
  {t: 28.4, x: 5200, y: 1260, z: 0.72},
  {t: 30.2, x: 5100, y: 1260, z: 0.75},
  {t: 31.0, x: 4100, y: 1250, z: 1.0},
  {t: 32.5, x: 4100, y: 1250, z: 1.08},
  {t: 33.2, x: 4300, y: 2520, z: 0.85}, // study: raters + two empty jars
  {t: 36.9, x: 4300, y: 2540, z: 0.9},
  {t: 37.6, x: 3950, y: 2650, z: 1.12}, // nearly empty jar
  {t: 39.2, x: 3980, y: 2650, z: 1.16},
  {t: 39.9, x: 4300, y: 2600, z: 0.92}, // same cookies, full jar
  {t: 41.8, x: 4300, y: 2610, z: 0.96},
  {t: 42.5, x: 6600, y: 2620, z: 1.05}, // fake timer
  {t: 44.4, x: 6600, y: 2640, z: 1.1},
  {t: 45.2, x: 6600, y: 2800, z: 0.86}, // buyers leave
  {t: 47.3, x: 6600, y: 2820, z: 0.9},
  {t: 48.0, x: 6600, y: 4060, z: 1.0},
  {t: 55.5, x: 6600, y: 4000, z: 1.14},
];

// sound: whoosh under each camera glide + a few soft accents (reference: ~2 accents/min, dull, short)
type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-soft/${n}.wav`;
const MOVES = [4.2, 9.8, 15.2, 19.6, 26.0, 28.4, 31.0, 33.2, 42.5, 48.0];
const CUES: Cue[] = [
  ...MOVES.map((t) => ({t: t - 0.55, src: SFX('whoosh'), vol: 0.2})),
  {t: 2.9, src: SFX('chime'), vol: 0.3},
  {t: 13.6, src: SFX('pop'), vol: 0.3},
  {t: 23.66, src: SFX('thud'), vol: 0.45},
  {t: 29.34, src: SFX('tick'), vol: 0.3},
  {t: 32.1, src: SFX('pop'), vol: 0.3},
  {t: 43.5, src: SFX('thud'), vol: 0.4},
  {t: 50.3, src: SFX('thud'), vol: 0.55},
];

export const LessTime: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const s = useSec();
  const end = fadeOut(s, 54.6, 0.9);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('vo8/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-8.wav')} volume={0.5} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: end}}>
        <Backdrop />
        <Camera keys={CAM}>
          <World />
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
