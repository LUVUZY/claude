import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Backdrop, C, Camera, Caption, Cross, Crowd, Dust, FONT, GLOW, Ground, Icon, Pawn, Pill, PriceCard, Ring, Spot, Stat, clamp, fade, fadeOut, fr, pop, useSec} from './LineKit';

// V2 style (premium line). Script: public/vo10/script.txt.
// Source: Dan Ariely's Economist subscription experiment (Predictably Irrational): with the print-only decoy,
// 84% chose print & web; without it, 32%.
export const DECOY_FRAMES = fr(58);

const Bucket: React.FC<{x: number; y: number; h: number; s: number; at: number; hi?: boolean; label: string}> = ({x, y, h, s, at, hi, label}) => {
  const w = h * 0.8;
  const col = hi ? C.line : C.dim;
  return (
    <>
      <svg width={w} height={h} style={{position: 'absolute', left: x - w / 2, top: y - h, overflow: 'visible', opacity: fade(s, at), filter: hi ? GLOW : undefined}}>
        <path d={`M 0 0 H ${w} L ${w * 0.82} ${h} H ${w * 0.18} Z`} fill="none" stroke={col} strokeWidth={4.5} strokeLinejoin="round" />
        {[0.3, 0.5, 0.7].map((u) => (
          <line key={u} x1={w * u} y1={4} x2={w * (0.5 + (u - 0.5) * 0.64)} y2={h - 4} stroke={col} strokeWidth={3} />
        ))}
        {[0.15, 0.38, 0.62, 0.85].map((u, i) => (
          <circle key={u} cx={w * u} cy={-w * 0.06 - (i % 2) * w * 0.06} r={w * 0.11} fill="none" stroke={col} strokeWidth={3.5} />
        ))}
      </svg>
      <Caption x={x} y={y + 22} text={label} s={s} at={at + 0.2} dim={!hi} />
    </>
  );
};

const World: React.FC = () => {
  const s = useSec();
  const pickBundle = interpolate(s, [1.9, 3.6], [0, 1], clamp);
  return (
    <>
      <Dust x0={-1400} x1={8400} y0={-800} y1={4900} n={300} />

      {/* A — hook (0,0): a decoy nobody buys, buyers flood the one you want */}
      <Ground y={330} x0={-1300} x1={1300} s={s} at={0} />
      <Spot x={-100} y={330} op={fade(s, 1.4, 0.6)} w={420} />
      <PriceCard x={-560} y={-40} title="DECOY" price="$125" look="ghost" s={s} at={0.1} w={280} />
      <Pill x={-560} y={-290} text="NOBODY BUYS IT" size={24} look="ghost" s={s} at={0.9} />
      <PriceCard x={-100} y={-40} title="THE BUNDLE" price="$125" note="BEST VALUE" look={s > 1.4 ? 'solid' : 'outline'} s={s} at={0.4} w={300} />
      {Array.from({length: 7}, (_, i) => {
        const t0 = 1.9 + i * 0.17;
        const p = interpolate(s, [t0, t0 + 0.8], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
        return <Pawn key={i} x={1100 - p * (920 - i * 70)} y={330} h={110} look="line" bob={p > 0 && p < 1 ? Math.abs(Math.sin(p * 12)) * 6 : 0} op={fade(s, t0, 0.2)} />;
      })}
      <Ring x={620} y={-80} r={150} pct={0} v={32 + 52 * pickBundle ** 1.3} label="PICK THE BUNDLE" s={s} at={1.7} />

      {/* B — most sellers cut it (2200,0) */}
      <Spot x={1700} y={330} op={fade(s, 4.9, 0.6)} />
      <Pawn x={1700} y={330} h={300} look="hero" tie op={fade(s, 4.88)} bob={Math.sin(s * 2.4) * 4} />
      <Caption x={1700} y={360} text="THE SELLER" s={s} at={5.1} />
      <PriceCard x={2120} y={-20} title="A" price="$59" s={s} at={5.9} w={210} />
      <PriceCard x={2370} y={-20} title="B" price="$125" s={s} at={6.1} w={210} look={s > 9.39 ? 'ghost' : 'outline'} />
      <PriceCard x={2620} y={-20} title="C" price="$125" s={s} at={6.3} w={210} />
      <Pill x={2370} y={-230} text="EARN YOUR SPOT" size={26} s={s} at={6.97} out={8.0} />
      <Pill x={2370} y={-230} text="0 PICKS" size={26} look="ghost" s={s} at={8.12} />
      <Cross x={2370} y={-20} size={220} s={s} at={9.39} />
      <Pill x={2370} y={200} text="CUT IT" size={34} look="solid" s={s} at={9.5} />

      {/* C — the experiment (2200,1500) */}
      <Pill x={2200} y={1000} text="A CLASSIC EXPERIMENT" size={28} s={s} at={10.4} />
      <Pawn x={1900} y={1360} h={240} look="hero" op={fade(s, 11.68)} />
      <Caption x={1900} y={1385} text="DAN ARIELY" s={s} at={11.8} />
      <Icon name="doc" x={2420} y={1240} size={210} s={s} at={13.2} />
      <Caption x={2420} y={1385} text="THE ECONOMIST · SUBSCRIPTIONS" s={s} at={13.9} size={20} />
      <PriceCard x={1720} y={1900} title="WEB ONLY" price="$59" s={s} at={15.0} priceAt={16.3} />
      <PriceCard x={2200} y={1900} title="PRINT ONLY" price="$125" s={s} at={17.5} priceAt={18.68} out={24.71} />
      <PriceCard x={2680} y={1900} title="PRINT & WEB" price="$125" s={s} at={19.9} priceAt={21.45} look={s > 22.7 ? 'solid' : 'outline'} />
      <div style={{opacity: fadeOut(s, 25.3)}}>
        <Stat x={2200} y={2240} value="0%" caption="CHOSE IT" size={70} s={s} at={22.72} />
      </div>

      {/* D — the result (2200,2900) */}
      <Pill x={1820} y={2520} text="WITH THE DECOY" size={26} s={s} at={25.6} />
      <Ring x={1820} y={2900} r={170} pct={84} d={2.2} s={s} at={27.2} label="PRINT & WEB" />
      <Ground y={3250} x0={1300} x1={3100} s={s} at={25.7} />
      <Crowd x={1600} y={3250} n={5} gap={110} h={110} s={s} at={25.9} walk={-700} ghost={false} />
      <Crowd x={2470} y={3250} n={2} gap={110} h={110} s={s} at={29.8} walk={700} ghost={false} />
      <Pill x={2580} y={2520} text="WITHOUT IT" size={26} look="ghost" s={s} at={29.56} />
      <Ring x={2580} y={2900} r={170} pct={32} d={1.2} s={s} at={30.6} label="PRINT & WEB" dim={s < 29.5} />

      {/* E — judge by comparison (4800,1500) */}
      <div style={{opacity: fadeOut(s, 36.3)}}>
        <Ground y={1700} x0={4000} x1={5700} s={s} at={32.0} />
      </div>
      <Pawn x={4300 + interpolate(s, [32.1, 34.0], [-260, 0], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3})} y={1700} h={240} look="hero" op={fade(s, 32.06) * fadeOut(s, 36.6)} bob={Math.abs(Math.sin(s * 3)) * 5} />
      <div style={{position: 'absolute', left: 4620, top: 1450, rotate: `${Math.sin(s * 2.2) * 9}deg`, transformOrigin: '0 -60px'}}>
        <Icon name="tag" x={0} y={0} size={170} s={s} at={33.4} />
      </div>
      <div style={{position: 'absolute', left: 4620, top: 1250, scale: `${1 + 0.06 * Math.sin(s * 4)}`}}>
        <Icon name="question" x={0} y={0} size={140} s={s} at={33.8} />
      </div>
      <Pill x={4620} y={1080} text="WHAT SHOULD IT COST?" size={26} s={s} at={34.0} out={35.4} />
      <Pill x={4620} y={1080} text="COMPARED TO WHAT?" size={30} look="solid" s={s} at={35.6} />
      <PriceCard x={4600} y={2200} title="PRINT ONLY" price="$125" look="ghost" s={s} at={36.5} w={280} />
      <div style={{position: 'absolute', left: 4850, top: 2200, translate: '-50% -50%', fontFamily: FONT, fontWeight: 800, fontSize: 80, color: '#CFCFCF', opacity: fade(s, 36.9)}}>vs</div>
      <PriceCard x={5100} y={2200} title="PRINT & WEB" price="$125" look="solid" s={s} at={37.4} w={280} />
      <Icon name="gift" x={5100} y={1920} size={120} s={s} at={39.4} />
      <Pill x={5100} y={2440} text="WEB FOR FREE" size={24} look="solid" s={s} at={39.6} />

      {/* F — the decoy effect, everywhere (4800,3000) */}
      <Pill x={4800} y={2700} text="THE DECOY EFFECT" size={40} look="solid" s={s} at={40.9} />
      <Ground y={3260} x0={4100} x1={5600} s={s} at={42.3} />
      <Bucket x={4350} y={3260} h={110} s={s} at={42.4} label="S" />
      <Bucket x={4560} y={3260} h={190} s={s} at={42.7} label="M" />
      <Bucket x={4790} y={3260} h={210} s={s} at={43.0} hi label="L" />
      <Icon name="phone" x={5130} y={3150} size={110} s={s} at={44.5} dim />
      <Icon name="phone" x={5270} y={3150} size={110} s={s} at={44.6} dim />
      <Icon name="phone" x={5410} y={3150} size={110} s={s} at={44.7} />
      <Caption x={4570} y={3330} text="POPCORN" s={s} at={43.6} />
      <Caption x={5270} y={3330} text="PHONE PLANS" s={s} at={44.8} />

      {/* G — it has to be real (7200,3000) */}
      <PriceCard x={7000} y={2950} title="FAKE OPTION" price="$999" look="outline" s={s} at={45.7} w={300} />
      <Pill x={7000} y={2650} text="MUST BE A REAL OPTION" size={28} look="solid" s={s} at={47.8} />
      <Icon name="eye" x={7480} y={2950} size={170} s={s} at={48.72} label="BUYERS CAN TELL" />
      <Cross x={7000} y={2950} size={330} s={s} at={50.9} />
      <Ground y={3260} x0={6300} x1={7900} s={s} at={45.8} />
      {Array.from({length: 5}, (_, i) => {
        const come = interpolate(s, [46.0 + i * 0.12, 47.0 + i * 0.12], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
        const leave = interpolate(s, [49.3 + i * 0.1, 50.6 + i * 0.1], [0, 1], clamp);
        return <Pawn key={i} x={6700 + i * 150 + (1 - come) * 700 + leave * 900} y={3260} h={110} look="line" op={fade(s, 46.0 + i * 0.12) * (1 - leave)} bob={(come > 0 && come < 1) || (leave > 0 && leave < 1) ? Math.abs(Math.sin(s * 10 + i)) * 6 : 0} />;
      })}

      {/* H — closing (7200,4300) */}
      <Ground y={4560} x0={6300} x1={8100} s={s} at={51.5} />
      <PriceCard x={6950} y={4320} title="YOUR PRICE" price="$125" look="ghost" s={s} at={51.8} w={260} />
      <PriceCard x={7450} y={4320} title="NEXT TO IT" price="$125" look="solid" s={s} at={53.6} w={260} />
      <Crowd x={7700} y={4560} n={4} gap={95} h={100} s={s} at={54.0} walk={800} ghost={false} />
      <div style={{position: 'absolute', left: 7200, top: 3980, translate: '-50% -50%', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 80, letterSpacing: '0.05em', color: '#F6F6F6', opacity: pop(s, 53.3), scale: `${0.92 + 0.08 * pop(s, 53.3)}`, filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.45))'}}>
        THEY BUY THE COMPARISON.
      </div>
      <Pill x={7200} y={3870 - 30} text="NOBODY BUYS YOUR PRICE" size={26} look="ghost" s={s} at={52.1} out={53.1} />
    </>
  );
};

const CAM = [
  {t: 0, x: -80, y: 0, z: 1.0},
  {t: 1.6, x: -60, y: 0, z: 1.05},
  {t: 2.3, x: 120, y: 20, z: 0.9}, // reveal crowd + ring
  {t: 4.5, x: 120, y: 20, z: 0.95},
  {t: 5.2, x: 1820, y: 40, z: 1.15}, // the seller
  {t: 5.8, x: 1860, y: 40, z: 1.18},
  {t: 6.5, x: 2250, y: 0, z: 0.98}, // options
  {t: 8.0, x: 2270, y: 0, z: 1.02},
  {t: 8.6, x: 2370, y: -10, z: 1.25}, // the one nobody picks
  {t: 10.0, x: 2370, y: 0, z: 1.3},
  {t: 10.7, x: 2200, y: 1200, z: 1.1}, // experiment
  {t: 12.8, x: 2160, y: 1200, z: 1.14},
  {t: 13.5, x: 2300, y: 1220, z: 1.2}, // the offer
  {t: 14.6, x: 2320, y: 1230, z: 1.24},
  {t: 15.3, x: 1720, y: 1900, z: 1.25}, // web only
  {t: 17.1, x: 1740, y: 1900, z: 1.28},
  {t: 17.8, x: 2200, y: 1900, z: 1.25}, // print only
  {t: 19.5, x: 2220, y: 1900, z: 1.28},
  {t: 20.2, x: 2680, y: 1900, z: 1.25}, // print & web
  {t: 22.0, x: 2690, y: 1900, z: 1.28},
  {t: 22.8, x: 2200, y: 1980, z: 0.92}, // all three: nobody chose print only
  {t: 25.0, x: 2200, y: 1990, z: 0.96},
  {t: 25.8, x: 1900, y: 2900, z: 1.0}, // with decoy
  {t: 29.0, x: 1920, y: 2910, z: 1.06},
  {t: 29.8, x: 2200, y: 2880, z: 0.9}, // both
  {t: 31.8, x: 2200, y: 2890, z: 0.95},
  {t: 32.5, x: 4450, y: 1450, z: 1.1}, // buyer + tag
  {t: 35.2, x: 4480, y: 1420, z: 1.15},
  {t: 36.6, x: 4800, y: 2080, z: 1.05}, // comparison
  {t: 39.8, x: 4820, y: 2090, z: 1.1},
  {t: 40.5, x: 4800, y: 2840, z: 1.15}, // decoy effect title
  {t: 42.0, x: 4800, y: 2900, z: 1.05},
  {t: 42.9, x: 4600, y: 3020, z: 1.2}, // popcorn
  {t: 44.2, x: 4640, y: 3020, z: 1.2},
  {t: 44.8, x: 5100, y: 3020, z: 1.15}, // phone plans
  {t: 45.4, x: 5120, y: 3020, z: 1.17},
  {t: 46.0, x: 7150, y: 2960, z: 0.98}, // fake option + buyers
  {t: 48.4, x: 7170, y: 2960, z: 1.03},
  {t: 49.0, x: 7300, y: 2980, z: 0.94},
  {t: 51.3, x: 7280, y: 2980, z: 0.99},
  {t: 52.0, x: 7250, y: 4220, z: 0.98}, // closing
  {t: 58, x: 7250, y: 4200, z: 1.08},
];

type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-soft/${n}.wav`;
const MOVES = [5.2, 10.7, 15.3, 17.8, 20.2, 25.8, 32.5, 36.9, 40.5, 46.0, 52.0];
const CUES: Cue[] = [
  ...MOVES.map((t) => ({t: t - 0.55, src: SFX('whoosh'), vol: 0.2})),
  {t: 1.4, src: SFX('chime'), vol: 0.3},
  {t: 9.39, src: SFX('tick'), vol: 0.3},
  {t: 22.72, src: SFX('pop'), vol: 0.3},
  {t: 27.4, src: SFX('thud'), vol: 0.42},
  {t: 39.5, src: SFX('pop'), vol: 0.3},
  {t: 50.9, src: SFX('thud'), vol: 0.4},
  {t: 53.3, src: SFX('thud'), vol: 0.55},
];

export const Decoy: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const s = useSec();
  const end = fadeOut(s, 57.1, 0.9);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('vo10/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-10.wav')} volume={0.5} />}
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
