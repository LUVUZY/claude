import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Backdrop, Bars, Bubble, C, Camera, Caption, Cross, DotField, Dust, FONT, GLOW, Ground, Icon, Pawn, Pill, Spot, clamp, fade, fadeOut, fr, pop, useSec} from './LineKit';

// V2 style, built VERTICAL (1080x1920) for TikTok / Reels. Script: public/vo13/script.txt.
// Source: Levine & Rubinstein (2017), "Smart and Illicit: Who Becomes an Entrepreneur and Do They Earn More?",
// Quarterly Journal of Economics (NLSY79): the incorporated self-employed were more likely to have engaged in
// illicit/rule-breaking activities as youths, also scored higher on learning aptitude, and earn more than
// comparable salaried workers.
export const CANDY_FRAMES = fr(54.5);

// Scene times below were written against a first voice take; WARP maps them onto the final take (with the hook
// word for word). Pairs are (layout time, voice time) on matching words.
const WARP: [number, number][] = [[0, 0], [3.16, 3.49], [4.04, 4.2], [9.05, 9.28], [13.94, 14.36], [16.32, 16.75], [20.8, 20.92], [23.52, 23.76], [27.43, 27.97], [30.3, 31.19], [33.22, 34.11], [34.79, 35.89], [37.28, 38.24], [39.16, 40.28], [42.62, 43.56], [45.15, 46.24], [46.0, 47.08], [48.37, 49.72], [53, 54.5]];
const lerpPairs = (t: number, from: 0 | 1) => {
  const to = 1 - from;
  for (let i = 1; i < WARP.length; i++) {
    const a = WARP[i - 1];
    const b = WARP[i];
    if (t <= b[from] || i === WARP.length - 1) return a[to] + ((t - a[from]) * (b[to] - a[to])) / (b[from] - a[from]);
  }
  return t;
};
const toVoice = (t: number) => lerpPairs(t, 0);
const toLayout = (t: number) => lerpPairs(t, 1);

const CandyBox: React.FC<{x: number; y: number; s: number; at: number; size?: number}> = ({x, y, s, at, size = 110}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size * 0.7, width: size, height: size * 0.7, opacity: fade(s, at), filter: GLOW}}>
    <svg width={size} height={size * 0.7} viewBox="0 0 100 70" style={{overflow: 'visible'}}>
      {[[22, 14], [42, 8], [62, 12], [80, 16], [32, 2]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy + 10} r={9} fill="none" stroke={C.line} strokeWidth={3.5} />
      ))}
      <path d="M 4 22 H 96 L 90 68 H 10 Z" fill="#050505" stroke={C.line} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 30 40 H 70" stroke={C.line} strokeWidth={3} />
    </svg>
  </div>
);
const Coin: React.FC<{x: number; y: number; op?: number; size?: number}> = ({x, y, op = 1, size = 46}) => (
  <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size, border: `4px solid ${C.line}`, opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: size * 0.5, color: '#EDEDED', filter: GLOW}}>$</div>
);

const World: React.FC = () => {
  const s = toLayout(useSec());
  // A: each kid rides a bar of their money
  const rise = interpolate(s, [1.7, 3.9], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
  const candyBar = 640 * rise;
  const snitchBar = 80 * rise;

  return (
    <>
      <Dust x0={-700} x1={700} y0={-1200} y1={18000} n={280} />

      {/* A — hook (0,0): payoff first */}
      <Ground y={420} x0={-600} x1={600} s={s} at={0} />
      <div style={{position: 'absolute', left: -300, top: 420 - candyBar, width: 200, height: candyBar, borderRadius: '10px 10px 0 0', background: 'linear-gradient(180deg, #FFFFFF, #BDBDBD)', filter: 'drop-shadow(0 0 22px rgba(255,255,255,0.35))'}} />
      <div style={{position: 'absolute', left: 100, top: 420 - snitchBar, width: 200, height: snitchBar, borderRadius: '8px 8px 0 0', background: '#5A5A5A'}} />
      <Pawn x={-200} y={420 - candyBar} h={210} look="hero" op={fade(s, 0.1)} bob={rise > 0 && rise < 1 ? 0 : Math.abs(Math.sin(s * 5)) * 6} />
      <CandyBox x={-60} y={420 - candyBar - 20} s={s} at={0.5} />
      <Pawn x={200} y={420 - snitchBar} h={210} look="line" op={fade(s, 0.4)} />
      <Bubble x={250} y={420 - snitchBar - 300} text="I'M TELLING!" size={34} s={s} at={3.0} />
      {s > 2.0 && Array.from({length: 6}, (_, i) => {
        const life = ((s - 2.0) * 0.9 + i / 6) % 1;
        return <Coin key={i} x={-330 + (i % 3) * 130 + Math.sin(i * 2) * 20} y={420 - candyBar - 120 - life * 260} op={Math.sin(life * Math.PI)} size={40} />;
      })}
      <Caption x={-200} y={445} text="SOLD CANDY" s={s} at={0.6} size={28} />
      <Caption x={200} y={445} text="SNITCHED" s={s} at={3.1} size={28} />
      <Pill x={200} y={-330} text="MUCH RICHER" size={36} look="solid" s={s} at={1.9} />

      {/* B — what most people think (0,2400) */}
      <Pill x={0} y={1930} text="RULE FOLLOWERS WIN?" size={38} s={s} at={4.6} />
      <Icon name="star" x={-300} y={2230} size={150} s={s} at={6.35} label="GOOD GRADES" />
      <Icon name="shield" x={0} y={2230} size={150} s={s} at={7.3} label="NO TROUBLE" />
      <Icon name="building" x={300} y={2230} size={150} s={s} at={8.15} label="SAFE JOB" />
      <Ground y={2780} x0={-600} x1={600} s={s} at={4.0} />
      {Array.from({length: 6}, (_, i) => (
        <Pawn key={i} x={-400 + i * 160} y={2780} h={170} look="line" op={fade(s, 4.3 + i * 0.08)} bob={Math.abs(Math.sin(s * 2 + i)) * 3} />
      ))}

      {/* C — the study (0,4800) */}
      <Pill x={0} y={4200} text="ECONOMISTS" size={30} s={s} at={9.0} />
      <Pawn x={-190} y={4500} h={220} look="hero" op={fade(s, 9.6)} />
      <Caption x={-190} y={4525} text="ROSS LEVINE" s={s} at={9.7} size={24} />
      <Pawn x={190} y={4500} h={220} look="hero" op={fade(s, 10.4)} />
      <Caption x={190} y={4525} text="YONA RUBINSTEIN" s={s} at={10.5} size={24} />
      <DotField x={-330} y={4660} cols={12} rows={5} gap={60} s={s} at={11.7} />
      <Caption x={0} y={4960} text="THOUSANDS OF AMERICANS" s={s} at={12.2} size={26} />
      <Pill x={-230} y={5130} text="TEENS" size={30} s={s} at={13.3} />
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <line x1={-110} y1={5130} x2={-110 + 200 * fade(s, 13.5, 0.5)} y2={5130} stroke={C.line} strokeWidth={4} />
        <path d="M 75 5112 L 98 5130 L 75 5148" fill="none" stroke={C.line} strokeWidth={4} opacity={fade(s, 13.9)} />
      </svg>
      <Pill x={240} y={5130} text="ADULTS" size={30} look="solid" s={s} at={13.9} />

      {/* D — the finding (0,7300) */}
      <Icon name="building" x={0} y={6760} size={200} s={s} at={15.6} />
      <Pill x={0} y={6560} text="RUN THEIR OWN BUSINESS" size={32} look="solid" s={s} at={16.1} />
      <div style={{opacity: fadeOut(s, 20.6)}}>
        <Ground y={7260} x0={-600} x1={600} s={s} at={14.6} />
        {Array.from({length: 6}, (_, i) => {
          const breaker = i % 2 === 0;
          const go = breaker ? interpolate(s, [19.7 + i * 0.05, 20.5 + i * 0.05], [0, 1], clamp) : 0;
          return <Pawn key={i} x={-400 + i * 160} y={7260 - go * 200} h={170} look={breaker && s > 19.2 ? 'hero' : 'line'} op={fade(s, 14.8 + i * 0.07) * (1 - go)} />;
        })}
        <Caption x={0} y={7290} text="BROKE RULES AS TEENAGERS" s={s} at={19.3} size={26} />
      </div>
      <Bars x={-250} y={7660} max={110} h={380} w={170} gap={160} s={s} at={21.0} items={[
        {label: 'OWN BUSINESS', value: 100, text: () => ''},
        {label: 'REGULAR JOBS', value: 62, text: () => ''},
      ]} />
      <Pill x={-165} y={7180} text="EARNED MORE" size={28} look="solid" s={s} at={21.5} />

      {/* E — what the candy kid learned (0,9800) */}
      <Pill x={0} y={9150} text="WHAT SCHOOL NEVER TESTED" size={32} s={s} at={24.4} />
      <Icon name="eye" x={-260} y={9420} size={140} s={s} at={27.4} label="WHAT PEOPLE WANT" />
      <Icon name="tag" x={260} y={9420} size={140} s={s} at={29.1} label="SET A PRICE" />
      <Icon name="lock" x={-260} y={9730} size={140} s={s} at={30.2} label="TOOK THE RISK" />
      <Icon name="chart" x={260} y={9730} size={140} s={s} at={33.1} label="SALES LESSON" />
      <Ground y={10150} x0={-600} x1={600} s={s} at={23.5} />
      <Pawn x={-200} y={10150} h={220} look="hero" op={fade(s, 23.6)} bob={Math.abs(Math.sin(s * 3)) * 4} />
      <CandyBox x={-70} y={10130} s={s} at={24.7} size={100} />
      {Array.from({length: 3}, (_, i) => {
        const p = interpolate(s, [28.0 + i * 0.3, 29.0 + i * 0.3], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
        return <Pawn key={i} x={110 + i * 120 + (1 - p) * 600} y={10150} h={150} look="line" op={fade(s, 28.0 + i * 0.3)} bob={p > 0 && p < 1 ? Math.abs(Math.sin(s * 9 + i)) * 6 : 0} />;
      })}
      {s > 29.6 && s < 34.6 && Array.from({length: 3}, (_, i) => {
        const life = ((s - 29.6) * 0.8 + i / 3) % 1;
        return <Coin key={i} x={110 + i * 120 - life * (310 + i * 120)} y={10000 - Math.sin(life * Math.PI) * 140} op={Math.sin(life * Math.PI)} size={40} />;
      })}

      {/* F — what the snitch learned (0,12300) */}
      <Ground y={12500} x0={-600} x1={600} s={s} at={34.1} />
      <Pawn x={-60} y={12500} h={260} look="line" op={fade(s, 34.3)} />
      <Bubble x={170} y={12120} text="I'M TELLING!" size={36} s={s} at={34.7} />
      <Icon name="star" x={-60} y={11870} size={170} s={s} at={37.2} />
      <Pill x={-60} y={11700} text="+1 GOLD STAR" size={30} look="solid" s={s} at={37.3} />
      <Caption x={-60} y={12530} text="LEARNED: FOLLOW THE RULES" s={s} at={37.9} size={26} />

      {/* G — smart + rule breaker (0,14700) */}
      {(() => {
        const both = pop(s, 42.6);
                return (
          <>
            <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: GLOW}}>
              <defs>
                <clipPath id="candyVenn">
                  <circle cx={-150} cy={14560} r={250} />
                </clipPath>
              </defs>
              <circle cx={150} cy={14560} r={250} fill={`rgba(255,255,255,${0.85 * both})`} clipPath="url(#candyVenn)" />
              <circle cx={-150} cy={14560} r={250} fill="none" stroke={C.line} strokeWidth={4.5} opacity={fade(s, 41.0)} />
              <circle cx={150} cy={14560} r={250} fill="none" stroke={C.line} strokeWidth={4.5} opacity={fade(s, 42.4)} />
            </svg>
            <Caption x={-250} y={14370} text="BROKE RULES" s={s} at={41.1} size={24} />
            <Caption x={250} y={14370} text="SMART" s={s} at={42.6} size={24} />
            <div style={{position: 'absolute', left: 0, top: 14560, translate: '-50% -50%', fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '0.1em', color: '#0A0A0A', opacity: both}}>WIN</div>
            <Pill x={-260} y={14920} text="ALONE: DETENTION" size={28} look="ghost" s={s} at={43.6} />
            <Cross x={-260} y={14560} size={160} s={s} at={44.6} />
                      </>
        );
      })()}
      <Pill x={0} y={14180} text="THE WINNERS WERE BOTH" size={32} s={s} at={39.8} />

      {/* H — closing (0,17100) */}
      <div style={{position: 'absolute', left: 0, top: 16560, translate: '-50% -50%', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 124, lineHeight: 1.05, letterSpacing: '0.03em', color: '#F6F6F6', opacity: pop(s, 49.15), scale: `${0.92 + 0.08 * pop(s, 49.15)}`, filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.45))'}}>
        YOU WERE
        <br />
        EARLY.
      </div>
      <Pill x={0} y={16830} text="THE PROBLEM" size={32} look="ghost" s={s} at={47.6} />
      <Cross x={0} y={16830} size={150} s={s} at={48.3} />
      <Spot x={-60} y={17380} op={fade(s, 46.2, 0.6)} w={320} />
      <Ground y={17380} x0={-600} x1={600} s={s} at={45.9} />
      <Pawn x={-60} y={17380} h={260} look="hero" op={fade(s, 46.0)} bob={Math.abs(Math.sin(s * 2.4)) * 5} />
      <CandyBox x={90} y={17360} s={s} at={46.6} size={110} />
    </>
  );
};

const CAM_LAYOUT = [
  {t: 0, x: -150, y: 200, z: 1.3}, // candy kid, close
  {t: 1.6, x: -140, y: 190, z: 1.34},
  {t: 2.3, x: 0, y: -60, z: 1.0}, // pull back: the bars rise
  {t: 3.9, x: 0, y: -70, z: 1.04},
  {t: 4.5, x: 0, y: 2480, z: 1.0}, // rule followers
  {t: 5.8, x: -40, y: 2400, z: 1.06},
  {t: 6.5, x: -170, y: 2300, z: 1.16}, // good grades
  {t: 7.0, x: -150, y: 2300, z: 1.18},
  {t: 7.6, x: 0, y: 2300, z: 1.16}, // no trouble
  {t: 7.9, x: 0, y: 2300, z: 1.17},
  {t: 8.4, x: 170, y: 2300, z: 1.16}, // safe job
  {t: 8.7, x: 170, y: 2310, z: 1.17},
  {t: 9.3, x: 0, y: 4560, z: 1.15}, // the economists
  {t: 11.4, x: 0, y: 4580, z: 1.18},
  {t: 12.0, x: 0, y: 4820, z: 1.0}, // thousands, teens -> adults
  {t: 13.2, x: 0, y: 4760, z: 1.06},
  {t: 13.8, x: 0, y: 5000, z: 1.14}, // teens -> adults
  {t: 14.5, x: 0, y: 5010, z: 1.16},
  {t: 15.1, x: 0, y: 6900, z: 1.1}, // own business
  {t: 17.6, x: 0, y: 6950, z: 1.14},
  {t: 18.3, x: 0, y: 7120, z: 1.04}, // the teens who broke rules
  {t: 20.5, x: 0, y: 7130, z: 1.08},
  {t: 21.2, x: 0, y: 7380, z: 1.04}, // earned more
  {t: 23.2, x: 0, y: 7390, z: 1.08},
  {t: 23.9, x: -120, y: 9980, z: 1.2}, // candy kid + box
  {t: 26.6, x: -110, y: 9960, z: 1.24},
  {t: 27.3, x: -150, y: 9650, z: 1.06}, // what people want
  {t: 28.3, x: -140, y: 9660, z: 1.08},
  {t: 28.9, x: 140, y: 9700, z: 1.1}, // price + buyers
  {t: 29.9, x: 140, y: 9710, z: 1.12},
  {t: 30.5, x: -140, y: 9700, z: 1.12}, // took the risk
  {t: 32.4, x: -130, y: 9700, z: 1.14},
  {t: 33.0, x: 140, y: 9720, z: 1.12}, // sales lesson
  {t: 33.9, x: 0, y: 9760, z: 1.0},
  {t: 34.6, x: 60, y: 12230, z: 1.18}, // the snitch
  {t: 36.6, x: 70, y: 12220, z: 1.22},
  {t: 37.2, x: -40, y: 12060, z: 1.1}, // gold star
  {t: 38.9, x: -30, y: 12150, z: 1.06},
  {t: 39.6, x: 0, y: 14380, z: 1.15}, // the winners were both
  {t: 40.6, x: 0, y: 14400, z: 1.15},
  {t: 41.2, x: -120, y: 14560, z: 1.1}, // broke rules
  {t: 42.3, x: -110, y: 14560, z: 1.12},
  {t: 42.8, x: 0, y: 14580, z: 1.08}, // + smart = win
  {t: 43.5, x: 0, y: 14590, z: 1.1},
  {t: 44.0, x: -150, y: 14700, z: 1.05}, // detention
  {t: 45.7, x: -140, y: 14700, z: 1.08},
  {t: 46.4, x: 0, y: 17180, z: 1.15}, // the candy kid again
  {t: 47.4, x: 0, y: 17150, z: 1.17},
  {t: 48.0, x: 0, y: 16930, z: 1.04}, // never the problem -> you were early
  {t: 53, x: 0, y: 16950, z: 1.1},
];

type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-soft/${n}.wav`;
const MOVES = [2.3, 4.5, 9.3, 12.0, 15.1, 21.2, 23.9, 28.9, 34.6, 39.6, 46.4];
const CUES_LAYOUT: Cue[] = [
  ...MOVES.map((t) => ({t: t - 0.55, src: SFX('whoosh'), vol: 0.2})),
  {t: 1.9, src: SFX('coins'), vol: 0.3},
  {t: 3.0, src: SFX('pop'), vol: 0.3},
  {t: 21.0, src: SFX('thud'), vol: 0.4},
  {t: 29.6, src: SFX('coins'), vol: 0.25},
  {t: 37.3, src: SFX('chime'), vol: 0.22},
  {t: 42.6, src: SFX('pop'), vol: 0.3},
  {t: 48.9, src: SFX('thud'), vol: 0.55},
];

const CAM = CAM_LAYOUT.map((k) => ({...k, t: toVoice(k.t)}));
const CUES = CUES_LAYOUT.map((c) => ({...c, t: toVoice(c.t)}));

export const CandyKid: React.FC<{music?: 'song' | 'none'; grid?: boolean}> = ({music = 'song', grid = true}) => {
  const s = useSec();
  const end = fadeOut(s, 53.6, 0.9);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('vo13/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-13.wav')} volume={0.5} />}
      {CUES.map((c, i) => (
        <Sequence key={i} from={fr(c.t)} layout="none">
          <Audio src={staticFile(c.src)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: end}}>
        <Backdrop dots={false} />
        <Camera keys={CAM} cy={0.38} fit={0.92} grid={grid}>
          <World />
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
