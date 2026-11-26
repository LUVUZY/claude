import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Backdrop, Bars, Bubble, C, Camera, Caption, Cross, Crowd, Dust, FONT, GLOW, Ground, Icon, Pawn, Pill, Spot, Stat, Trend, clamp, fade, fadeOut, fr, pop, useSec} from './LineKit';

// V2 style (premium line). Script: public/vo11/script.txt.
// Sources: Chetty et al. 2022, Nature, "Social capital I" (21B Facebook friendships, 72M people; economic connectedness
// is the strongest predictor of upward mobility; ~20% higher adult income for low-income kids at high-SES levels of
// connectedness). Christakis & Fowler 2007, NEJM (Framingham: a friend becoming obese raised one's own chance by 57%).
export const TWO_MIL_FRAMES = fr(60);

/** Friend network: circles joined by lines. Node lights at its `lit` time; lines draw in at `at`. */
type Node = {x: number; y: number; lit?: number; rich?: boolean};
const Network: React.FC<{nodes: Node[]; edges: [number, number][]; s: number; at: number; you?: number}> = ({nodes: base, edges, s, at, you = -1}) => {
  const nodes = base.map((n, i) => (i === you ? n : {...n, x: n.x + Math.sin(s * 0.9 + i * 1.3) * 14, y: n.y + Math.cos(s * 0.7 + i * 2.1) * 10}));
  return (
  <>
    <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {edges.map(([a, b], i) => {
        const p = interpolate(s, [at + i * 0.03, at + i * 0.03 + 0.5], [0, 1], clamp);
        const A = nodes[a];
        const B = nodes[b];
        const hot = (A.lit ?? 999) < s && (B.lit ?? 999) < s;
        return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * p} y2={A.y + (B.y - A.y) * p} stroke={hot ? '#DADADA' : '#3C3C3C'} strokeWidth={hot ? 3.5 : 2.5} />;
      })}
    </svg>
    {nodes.map((n, i) => {
      const on = n.lit !== undefined && s > n.lit ? pop(s, n.lit) : 0;
      const r = i === you ? 34 : 22;
      return (
        <div key={i} style={{position: 'absolute', left: n.x - r, top: n.y - r, width: r * 2, height: r * 2, borderRadius: r, opacity: fade(s, at + i * 0.03, 0.3), border: `4px solid ${on > 0.1 ? '#FFFFFF' : '#5E5E5E'}`, background: `rgba(244,244,244,${on})`, boxShadow: on > 0.1 ? `0 0 ${24 * on}px rgba(255,255,255,0.7)` : undefined, scale: `${1 + 0.25 * on * (1 - Math.min(1, (s - (n.lit ?? 0)) / 0.6))}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: r * 0.9, color: '#0A0A0A'}}>
          {n.rich && on > 0.5 ? '$' : ''}
        </div>
      );
    })}
  </>
  );
};

// network layouts (local coords added to an origin)
const ring = (cx: number, cy: number, n: number, r: number, a0 = 0) => Array.from({length: n}, (_, i) => ({x: cx + Math.cos(a0 + (i / n) * Math.PI * 2) * r, y: cy + Math.sin(a0 + (i / n) * Math.PI * 2) * r * 0.62}));

const World: React.FC = () => {
  const s = useSec();
  const become = interpolate(s, [2.49, 3.0], [0, 1], clamp);

  // D: friends with money (predictor)
  const dNodes: Node[] = [{x: 2200, y: 3000}, ...ring(2200, 3000, 8, 430, -0.3).map((p, i) => ({...p, lit: i % 3 === 0 ? 21.5 + i * 0.05 : undefined, rich: true}))];
  const dEdges: [number, number][] = [...dNodes.slice(1).map((_, i) => [0, i + 1] as [number, number]), [1, 2], [3, 4], [5, 6], [7, 8]];

  // F: habits spreading (Framingham)
  const fRing1 = ring(4700, 1550, 6, 300, 0.4);
  const fRing2 = ring(4700, 1550, 10, 620, 0.1);
  const fNodes: Node[] = [
    {x: 4700, y: 1550, lit: 35.7}, // you
    ...fRing1.map((p, i) => ({...p, lit: i === 2 ? 34.9 : 32.4 + i * 0.25})),
    ...fRing2.map((p, i) => ({...p, lit: 32.0 + (i % 5) * 0.2})),
  ];
  const fEdges: [number, number][] = [...fRing1.map((_, i) => [0, i + 1] as [number, number]), ...fRing2.map((_, i) => [1 + (i % 6), 7 + i] as [number, number]), [1, 2], [3, 4], [5, 6]];

  return (
    <>
      <Dust x0={-1400} x1={8600} y0={-800} y1={5000} n={300} />

      {/* A — hook (0,0): two millionaires, you become the third */}
      <Ground y={300} x0={-1300} x1={1300} s={s} at={0} />
      <Spot x={0} y={300} op={fade(s, 2.4, 0.5)} w={380} />
      <Pawn x={-420} y={300} h={260} look="hero" tie op={fade(s, 0.6)} />
      <Pawn x={420} y={300} h={260} look="hero" tie op={fade(s, 0.9)} />
      <Pill x={-420} y={-50} text="$1,000,000" size={30} look="solid" s={s} at={1.06} />
      <Pill x={420} y={-50} text="$1,000,000" size={30} look="solid" s={s} at={1.3} />
      <Pawn x={0} y={300} h={260} look="ghost" op={fade(s, 0) * (1 - become)} />
      <Pawn x={0} y={300} h={260} look="hero" op={become} bob={become > 0 && become < 1 ? 10 * Math.sin(become * Math.PI) : 0} />
      <Pill x={0} y={-50} text="THE THIRD" size={30} look={s > 2.98 ? 'solid' : 'outline'} s={s} at={2.0} />
      <Caption x={0} y={330} text="YOU" s={s} at={0.3} />

      {/* B — what people think (2200,0) */}
      <Ground y={300} x0={700} x1={3700} s={s} at={3.4} />
      <Pawn x={2200} y={300} h={260} look="hero" op={fade(s, 3.44)} bob={Math.sin(s * 2.4) * 4} />
      <Icon name="briefcase" x={1820} y={-200} size={150} s={s} at={5.3} label="INCOME" />
      <Icon name="star" x={2200} y={-300} size={150} s={s} at={6.0} label="TALENT" />
      <Icon name="coin" x={2580} y={-200} size={150} s={s} at={6.75} label="LUCK" />
      {[-1250, -1050, -850, -650, -450, 450, 650, 850, 1050, 1250].map((dx, i) => (
        <Pawn key={i} x={2200 + dx} y={300} h={150 + (i % 3) * 20} look="line" op={fade(s, 7.5 + Math.abs(dx) * 0.0004, 0.3)} />
      ))}
      <Pill x={2200} y={470} text="THE PEOPLE AROUND YOU" size={30} look="solid" s={s} at={8.6} />

      {/* C — Chetty's study (2200,1500) */}
      <Pill x={2200} y={1080} text="2022 STUDY · NATURE" size={28} s={s} at={10.3} />
      <Pawn x={1780} y={1650} h={240} look="hero" op={fade(s, 11.8)} />
      <Caption x={1780} y={1675} text="RAJ CHETTY · ECONOMIST" s={s} at={12.5} />
      <Stat x={2420} y={1380} value={Math.round(interpolate(s, [13.7, 15.1], [0, 21], clamp)) + ' BILLION'} caption="FACEBOOK FRIENDSHIPS" size={90} s={s} at={13.6} />
      <Stat x={2420} y={1700} value={Math.round(interpolate(s, [16.1, 17.0], [0, 72], clamp)) + ' MILLION'} caption="PEOPLE" size={70} s={s} at={16.1} />

      {/* D — the strongest predictor (2200,3000) */}
      <Pill x={2200} y={2560} text="#1 PREDICTOR OF CLIMBING OUT OF POVERTY" size={26} s={s} at={18.1} />
      <Network nodes={dNodes} edges={dEdges} s={s} at={18.3} you={0} />
      <Pill x={2200} y={3420} text="FRIENDS WITH MONEY" size={34} look="solid" s={s} at={21.6} />

      {/* E — +20% (4700,3000) */}
      <Pill x={4700} y={2560} text="IF POOR KIDS HAD AS MANY RICH FRIENDS" size={26} s={s} at={23.8} />
      <Bars x={4430} y={3300} max={130} h={460} w={170} gap={200} s={s} at={24.4} items={[
        {label: 'NOW', value: 100, text: () => ''},
        {label: 'MORE RICH FRIENDS', value: 120, text: (v) => `+${Math.max(0, Math.round(v - 100))}%`},
      ]} />
      <Caption x={4700} y={3390} text="INCOME AS ADULTS · ESTIMATE" s={s} at={28.6} />
      <Ground y={3300} x0={3800} x1={5700} s={s} at={23.9} />
      <Pawn x={5230} y={3300} h={150} look="hero" op={fade(s, 24.3)} />
      <Crowd x={5360} y={3300} n={3} gap={95} h={120} s={s} at={25.3} walk={500} idle={3} ghost={false} />
      <Pill x={5330} y={3120} text="RICH FRIENDS" size={20} s={s} at={26.0} />

      {/* F — habits spread (4700,1550) */}
      <Pill x={4700} y={1000} text="HABITS SPREAD" size={34} look="solid" s={s} at={31.1} out={33.0} />
      <Pill x={4700} y={1000} text="FRAMINGHAM HEART STUDY" size={30} s={s} at={33.2} />
      <Network nodes={fNodes} edges={fEdges} s={s} at={30.6} you={0} />
      <Caption x={4700} y={1600} text="YOU" s={s} at={35.8} />
      <Stat x={4700} y={2120} value="+57%" caption="YOUR OWN CHANCES" size={110} s={s} at={37.9} />

      {/* G — you copy what you see (7100,1550) */}
      <Pill x={7100} y={1060} text="MONEY WORKS THE SAME WAY" size={30} look="solid" s={s} at={39.1} />
      <Ground y={1820} x0={6100} x1={8100} s={s} at={39.3} />
      <Pawn x={7100} y={1820} h={240} look="hero" op={fade(s, 40.3) * fadeOut(s, 42.0)} />
      <div style={{opacity: fadeOut(s, 42.0)}}>
        <Icon name="eye" x={7100} y={1460} size={110} s={s} at={40.7} />
        <Caption x={7100} y={1850} text="YOU COPY WHAT YOU SEE" s={s} at={40.6} />
      </div>
      <Crowd x={6440} y={1820} n={3} gap={150} h={170} s={s} at={42.3} ghost={false} walk={-500} idle={4} />
      <Bubble x={6590} y={1450} text="WHAT SHOULD I BUY?" size={34} s={s} at={43.3} dim={s > 45.1} />
      <Icon name="cart" x={6590} y={1250} size={110} s={s} at={43.9} dim={s > 45.1} />
      <Pill x={6590} y={1910} text="SPEND" size={30} look="ghost" s={s} at={44.7} />
      <Crowd x={7470} y={1820} n={3} gap={150} h={170} s={s} at={45.2} ghost={false} walk={500} idle={4} />
      <Bubble x={7620} y={1450} text="WHAT WILL PEOPLE PAY FOR?" size={34} s={s} at={46.3} />
      <Icon name="chart" x={7620} y={1250} size={110} s={s} at={47.4} />
      <Pill x={7620} y={1910} text="SELL" size={34} look="solid" s={s} at={48.6} />

      {/* H — you still do the work (7100,3000) */}
      <Ground y={3260} x0={6200} x1={8000} s={s} at={49.3} />
      <Pawn x={6500 + interpolate(s, [49.5, 52.5], [0, 300], clamp)} y={3260} h={220} look="hero" op={fade(s, 49.4)} bob={s > 49.5 && s < 52.5 ? Math.abs(Math.sin(s * 5)) * 8 : 0} />
      <Icon name="coin" x={7350} y={2870} size={120} s={s} at={49.9} />
      <Cross x={7350} y={2870} size={170} s={s} at={50.5} />
      <Caption x={7350} y={2960} text="NO HANDOUTS" s={s} at={50.7} />
      <Icon name="briefcase" x={6950} y={3150} size={110} s={s} at={51.8} />
      <Trend x={7150} y={3240} pts={[[0, 0], [120, -10], [240, -30], [360, -90], [480, -200], [560, -330]]} s={s} at={52.1} d={1.5} />
      <Pill x={7100} y={2680} text="YOU STILL DO THE WORK" size={30} look="solid" s={s} at={52.2} />

      {/* I — closing (7100,4400) */}
      <Ground y={4650} x0={6100} x1={8100} s={s} at={53.5} />
      <Spot x={7100} y={4650} op={fade(s, 55.2, 0.6)} w={340} />
      <Pawn x={6680} y={4650} h={230} look="hero" tie op={fade(s, 53.6)} bob={Math.abs(Math.sin(s * 2.2)) * 5} />
      <Pawn x={7520} y={4650} h={230} look="hero" tie op={fade(s, 53.8)} bob={Math.abs(Math.sin(s * 2.2 + 1.5)) * 5} />
      <Pawn x={7100} y={4650} h={230} look="hero" op={fade(s, 54.0)} bob={Math.sin(s * 2.4) * 4} />
      <Icon name="eye" x={7100} y={4250} size={130} s={s} at={56.3} />
      <div style={{position: 'absolute', left: 7100, top: 4040, translate: '-50% -50%', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 76, letterSpacing: '0.05em', color: '#F6F6F6', opacity: pop(s, 55.0), scale: `${0.92 + 0.08 * pop(s, 55.0)}`, filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.45))'}}>
        YOU BECOME WHO YOU SIT WITH.
      </div>
    </>
  );
};

const CAM = [
  {t: 0, x: 0, y: 120, z: 1.45}, // you, alone
  {t: 0.6, x: 0, y: 120, z: 1.45},
  {t: 1.3, x: 0, y: 60, z: 1.0}, // reveal the two millionaires
  {t: 3.0, x: 0, y: 60, z: 1.06},
  {t: 3.7, x: 2200, y: 40, z: 1.1},
  {t: 5.0, x: 2200, y: 20, z: 1.12},
  {t: 5.6, x: 2200, y: -80, z: 1.05}, // income / talent / luck
  {t: 7.2, x: 2200, y: -80, z: 1.08},
  {t: 8.0, x: 2200, y: 60, z: 0.62}, // pull back: the people around you
  {t: 9.8, x: 2200, y: 60, z: 0.66},
  {t: 10.5, x: 2100, y: 1400, z: 1.1},
  {t: 12.8, x: 1950, y: 1450, z: 1.16}, // chetty
  {t: 13.5, x: 2350, y: 1420, z: 1.12}, // 21 billion
  {t: 15.8, x: 2370, y: 1440, z: 1.16},
  {t: 16.4, x: 2300, y: 1560, z: 1.05}, // 72 million
  {t: 17.6, x: 2300, y: 1560, z: 1.08},
  {t: 18.3, x: 2200, y: 2960, z: 0.9}, // network
  {t: 21.0, x: 2200, y: 2980, z: 0.95},
  {t: 21.6, x: 2200, y: 3020, z: 1.05}, // friends with money
  {t: 22.8, x: 2200, y: 3020, z: 1.08},
  {t: 23.6, x: 4700, y: 2900, z: 0.98}, // estimate
  {t: 29.6, x: 4700, y: 2940, z: 1.06},
  {t: 30.4, x: 4700, y: 1520, z: 0.82}, // network spreads
  {t: 34.4, x: 4700, y: 1520, z: 0.86},
  {t: 35.2, x: 4700, y: 1560, z: 1.25}, // a friend -> you
  {t: 37.2, x: 4700, y: 1600, z: 1.28},
  {t: 37.9, x: 4700, y: 1800, z: 0.95}, // +57%
  {t: 38.7, x: 4700, y: 1800, z: 0.98},
  {t: 39.3, x: 7100, y: 1500, z: 0.92}, // money the same way
  {t: 42.0, x: 7100, y: 1520, z: 0.95},
  {t: 42.8, x: 6620, y: 1560, z: 1.15}, // spend group
  {t: 44.9, x: 6640, y: 1560, z: 1.18},
  {t: 45.6, x: 7600, y: 1560, z: 1.15}, // sell group
  {t: 48.2, x: 7620, y: 1560, z: 1.18},
  {t: 48.8, x: 7100, y: 1560, z: 0.92}, // both
  {t: 49.2, x: 7100, y: 1560, z: 0.93},
  {t: 49.8, x: 7050, y: 3000, z: 1.05},
  {t: 53.0, x: 7070, y: 3000, z: 1.1},
  {t: 53.7, x: 7100, y: 4380, z: 1.0},
  {t: 60, x: 7100, y: 4360, z: 1.1},
];

type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-soft/${n}.wav`;
const MOVES = [1.3, 3.7, 8.0, 10.5, 18.3, 23.6, 30.4, 35.2, 39.3, 42.8, 45.6, 49.8, 53.7];
const CUES: Cue[] = [
  ...MOVES.map((t) => ({t: t - 0.55, src: SFX('whoosh'), vol: 0.2})),
  {t: 2.98, src: SFX('chime'), vol: 0.32},
  {t: 15.1, src: SFX('tick'), vol: 0.3},
  {t: 21.6, src: SFX('pop'), vol: 0.32},
  {t: 28.4, src: SFX('thud'), vol: 0.42},
  {t: 38.0, src: SFX('thud'), vol: 0.42},
  {t: 48.6, src: SFX('coins'), vol: 0.28},
  {t: 55.0, src: SFX('thud'), vol: 0.55},
];

export const TwoMillionaires: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const s = useSec();
  const end = fadeOut(s, 59.1, 0.9);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('vo11/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-11.wav')} volume={0.5} />}
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
