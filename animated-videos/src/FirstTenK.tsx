import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Backdrop, C, Camera, Caption, Cross, Dust, FONT, GLOW, Ground, Icon, Pawn, Pill, Stat, WordBox, clamp, fade, fadeOut, fr, pop, useSec} from './LineKit';

// V2 style (premium line). Script: public/vo12/script.txt.
// Source: Spiegel Research Center, Northwestern University (2017), "How Online Reviews Influence Sales":
// purchase likelihood for a product with five reviews is 270% greater than for a product with no reviews.
export const FIRST_10K_FRAMES = fr(58);

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/** A slow flat stretch then a steep bend. prog 0..1; first 55% of the path is the struggle. */
const curve = (ox: number, oy: number, w: number, h: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 140; i++) {
    const u = i / 140;
    const saw = u < 0.55 ? Math.sin(u * 60) * 6 : 0;
    const y = u < 0.55 ? u * 40 : 22 + Math.pow((u - 0.55) / 0.45, 2.6) * h;
    pts.push([ox + u * w, oy - y + saw]);
  }
  return pts;
};
const Chart: React.FC<{ox: number; oy: number; w: number; h: number; prog: number; rider?: boolean; dimFlat?: boolean}> = ({ox, oy, w, h, prog, rider = true}) => {
  const pts = curve(ox, oy, w, h);
  const n = Math.max(1, Math.round(prog * 140));
  const shown = pts.slice(0, n + 1);
  const tip = shown[shown.length - 1];
  return (
    <>
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: GLOW}}>
        <polyline points={shown.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.line} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {rider && prog > 0.005 && <Pawn x={tip[0]} y={tip[1] - 4} h={90} look="hero" />}
    </>
  );
};
const Tick: React.FC<{x: number; y0: number; y1: number; label: string; s: number; at: number; dim?: boolean}> = ({x, y0, y1, label, s, at, dim}) => (
  <>
    <div style={{position: 'absolute', left: x - 1, top: y1, width: 2, height: (y0 - y1) * fade(s, at, 0.5), backgroundImage: `linear-gradient(180deg, ${dim ? '#444' : '#9A9A9A'} 60%, transparent 60%)`, backgroundSize: '2px 14px'}} />
    <Caption x={x} y={y0 + 18} text={label} s={s} at={at} dim={dim} size={22} />
  </>
);

const ReviewCard: React.FC<{x: number; y: number; stars: number; title: string; s: number; at: number; starAt: number; dim?: boolean}> = ({x, y, stars, title, s, at, starAt, dim}) => {
  const p = pop(s, at);
  return (
    <div style={{position: 'absolute', left: x - 190, top: y - 220, width: 380, height: 440, borderRadius: 22, border: `4.5px solid ${dim ? '#3E3E3E' : C.line}`, background: '#050505', opacity: Math.min(1, p * 1.4), scale: `${0.9 + 0.1 * p}`, filter: dim ? undefined : GLOW}}>
      <svg viewBox="0 0 100 100" width={150} height={150} style={{position: 'absolute', left: 115, top: 50, overflow: 'visible'}}>
        <path d="M14 30 L50 14 L86 30 V72 L50 88 L14 72 Z M14 30 L50 46 L86 30 M50 46 V88" fill="none" stroke={dim ? '#5E5E5E' : C.line} strokeWidth={3.4} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', gap: 10}}>
        {Array.from({length: 5}, (_, i) => {
          const on = i < stars && s > starAt + i * 0.12;
          return (
            <svg key={i} viewBox="0 0 100 100" width={48} height={48} style={{scale: `${on ? 0.9 + 0.1 * pop(s, starAt + i * 0.12) : 1}`}}>
              <path d="M50 8 L62 38 L94 38 L68 58 L78 90 L50 71 L22 90 L32 58 L6 38 L38 38 Z" fill={on ? '#F4F4F4' : 'none'} stroke={dim ? '#4A4A4A' : '#BDBDBD'} strokeWidth={5} strokeLinejoin="round" />
            </svg>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: '0.26em', color: dim ? '#555' : '#CFCFCF'}}>{title}</div>
    </div>
  );
};

const Seesaw: React.FC<{x: number; y: number; s: number; at: number; tilt: number}> = ({x, y, s, at, tilt}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: fade(s, at)}}>
    <svg width={1} height={1} style={{position: 'absolute', overflow: 'visible', filter: GLOW}}>
      <path d="M -60 120 L 0 0 L 60 120 Z" fill="none" stroke={C.line} strokeWidth={4.5} strokeLinejoin="round" />
    </svg>
    <div style={{position: 'absolute', left: -420, top: -6, width: 840, height: 8, background: C.line, borderRadius: 4, rotate: `${-tilt}deg`, transformOrigin: '50% 50%', boxShadow: '0 0 14px rgba(255,255,255,0.4)'}}>
      {/* heavy WORK block on the left */}
      <div style={{position: 'absolute', left: 30, bottom: 8, width: 230, height: 190 * fade(s, at + 0.3, 0.4), borderRadius: 10, background: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: '0.1em', color: '#0A0A0A', overflow: 'hidden'}}>WORK</div>
      {/* tiny MONEY coin on the right */}
      <div style={{position: 'absolute', right: 60, bottom: 8, width: 52, height: 52, borderRadius: 26, border: `4px solid ${C.line}`, opacity: fade(s, at + 1.1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, color: '#EDEDED'}}>$</div>
    </div>
  </div>
);

const World: React.FC = () => {
  const s = useSec();
  // hook chart: crawl through the first 10k, then rocket
  const hp = s < 2.4 ? interpolate(s, [0.2, 2.4], [0, 0.55], clamp) : interpolate(s, [2.4, 3.7], [0.55, 1], {...clamp, easing: (t: number) => t * t});
  const hookMoney = hp < 0.55 ? (hp / 0.55) * 10000 : 10000 + 90000 * ((hp - 0.55) / 0.45);
  // later chart: the bend
  const fp = interpolate(s, [38.2, 43.9], [0.3, 1], clamp);
  const fMoney = fp < 0.55 ? (fp / 0.55) * 10000 : 10000 + 90000 * ((fp - 0.55) / 0.45);

  return (
    <>
      <Dust x0={-1400} x1={8800} y0={-900} y1={5200} n={300} />

      {/* A — hook (0,0) */}
      <Ground y={320} x0={-1100} x1={1100} s={s} at={0} />
      <Chart ox={-820} oy={320} w={1500} h={720} prog={hp} />
      <Tick x={-820 + 0.55 * 1500} y0={320} y1={-460} label="$10K" s={s} at={0.5} />
      <Pill x={-460} y={170} text="THE FIRST $10K" size={24} look={s > 2.6 ? 'ghost' : 'outline'} s={s} at={0.5} />
      <Pill x={420} y={-460} text="THE NEXT $100K" size={28} look="solid" s={s} at={2.7} />
      <Stat x={-380} y={-300} value={money(hookMoney)} caption="EARNED" size={110} s={s} at={0} />

      {/* B — most people quit (2400,0) */}
      <Ground y={320} x0={1300} x1={3600} s={s} at={3.9} />
      <Tick x={3350} y0={320} y1={-40} label="$10K" s={s} at={4.0} />
      {Array.from({length: 8}, (_, i) => {
        // back of the line quits first, so nobody walks through anyone
        const quits = i !== 7;
        const stop = quits ? 4.9 + i * 0.32 : 99;
        const walked = Math.min(Math.max(0, Math.min(s, stop) - 4.0), 4.6) * 150;
        const x = 1450 + i * 125 + walked;
        const ghost = quits && s > stop;
        return <Pawn key={i} x={x} y={320} h={120} look={ghost ? 'ghost' : 'line'} op={fade(s, 4.0 + i * 0.05) * (ghost ? 0.5 : 1)} bob={!ghost ? Math.abs(Math.sin(s * 8 + i)) * 6 : 0} />;
      })}
      <Pill x={2200} y={60} text="MOST PEOPLE QUIT HERE" size={28} s={s} at={5.0} />
      <Seesaw x={2400} y={-560} s={s} at={6.6} tilt={interpolate(s, [6.9, 7.5], [0, 14], clamp)} />
      <Caption x={2400} y={-400} text="HUGE WORK · TINY MONEY" s={s} at={8.2} />

      {/* C — starting from zero (2400,1500) */}
      <Ground y={1760} x0={1500} x1={3300} s={s} at={8.9} />
      <Pawn x={1900} y={1760} h={260} look="hero" op={fade(s, 8.95)} bob={s > 14.4 ? Math.abs(Math.sin(s * 9)) * 9 : Math.sin(s * 2.4) * 3} />
      <Stat x={1900} y={1330} value="$0" size={110} s={s} at={10.55} />
      <Icon name="briefcase" x={2400} y={1350} size={140} s={s} at={10.9} label="SKILLS" />
      <Cross x={2400} y={1350} size={170} s={s} at={11.6} />
      <Icon name="cart" x={2700} y={1350} size={140} s={s} at={12.6} label="CUSTOMERS" />
      <Cross x={2700} y={1350} size={170} s={s} at={13.1} />
      <Icon name="star" x={3000} y={1350} size={140} s={s} at={13.6} label="PROOF" />
      <Cross x={3000} y={1350} size={170} s={s} at={14.0} />
      <Pill x={2450} y={1660} text="EVERY SALE IS A FIGHT" size={30} look="solid" s={s} at={14.7} />

      {/* D — buyers trust other buyers (4900,1500) */}
      <Pill x={4900} y={1020} text="BUYERS TRUST OTHER BUYERS" size={30} look="solid" s={s} at={17.3} out={19.4} />
      <Pill x={4900} y={1020} text="SPIEGEL RESEARCH CENTER · NORTHWESTERN" size={26} s={s} at={19.6} />
      <div style={{opacity: fadeOut(s, 21.7)}}>
        <Ground y={1560} x0={4200} x1={5600} s={s} at={17.3} />
        {Array.from({length: 6}, (_, i) => {
          const p = interpolate(s, [17.4 + i * 0.12, 18.4 + i * 0.12], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
          return <Pawn key={i} x={4560 + i * 140 + (1 - p) * 900} y={1560} h={150} look={i < 3 ? 'line' : 'hero'} op={fade(s, 17.4 + i * 0.12)} bob={p > 0 && p < 1 ? Math.abs(Math.sin(s * 9 + i)) * 7 : Math.abs(Math.sin(s * 2.6 + i)) * 3} />;
        })}
        <Icon name="chat" x={4980} y={1300} size={100} s={s} at={18.8} />
        <Icon name="chat" x={5260} y={1300} size={100} s={s} at={19.0} />
        <Icon name="eye" x={4700} y={1310} size={100} s={s} at={18.2} />
      </div>
      <ReviewCard x={4560} y={1500} stars={0} title="NO REVIEWS" s={s} at={22.1} starAt={99} dim={s > 26.6} />
      <ReviewCard x={5240} y={1500} stars={5} title="5 REVIEWS" s={s} at={22.5} starAt={22.9} />
      <div style={{opacity: fadeOut(s, 27.7)}}>
        <Stat x={5240} y={1880} value={`+${Math.round(interpolate(s, [23.8, 25.2], [0, 270], clamp))}%`} caption="MORE LIKELY TO BE BOUGHT" size={90} s={s} at={23.8} />
      </div>
      <Pill x={4560} y={1840} text="NOBODY VOUCHES FOR YOU" size={24} look="ghost" s={s} at={28.5} />

      {/* E — every sale leaves something (4900,3100) */}
      <Pill x={4900} y={2620} text="EVERY SALE LEAVES SOMETHING BEHIND" size={28} s={s} at={30.4} />
      <Pawn x={4900} y={3260} h={230} look="hero" op={fade(s, 30.3)} bob={Math.sin(s * 2.4) * 3} />
      {([
        ['chat', 'A REVIEW', 4460, 2900, 32.5],
        ['network', 'A REFERRAL', 5340, 2900, 33.55],
        ['briefcase', 'A SKILL', 4400, 3320, 34.6],
        ['coin', 'MONEY WORKING', 5400, 3320, 35.6],
      ] as const).map(([name, label, x, y, at]) => (
        <React.Fragment key={label}>
          <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <line x1={4900} y1={3140} x2={4900 + (x - 4900) * fade(s, at, 0.4) * 0.72} y2={3140 + (y - 3140) * fade(s, at, 0.4) * 0.72} stroke="#8A8A8A" strokeWidth={3} strokeDasharray="10 10" />
          </svg>
          <Icon name={name} x={x} y={y} size={130} s={s} at={at} label={label} />
        </React.Fragment>
      ))}

      {/* F — the line bends (7400,3100) */}
      <Ground y={3420} x0={6400} x1={8400} s={s} at={37.8} />
      <Chart ox={6600} oy={3420} w={1600} h={760} prog={fp} />
      <Tick x={6600 + 0.55 * 1600} y0={3420} y1={2560} label="$10K" s={s} at={38.2} />
      <Stat x={6950} y={2700} value={money(fMoney)} caption="EARNED" size={90} s={s} at={38.0} />
      <Pill x={7800} y={2550} text="EACH SALE EASIER" size={28} look="solid" s={s} at={39.3} />
      {/* G — people who stop at 9,000 */}
      <Pawn x={6600 + 0.5 * 1600} y={3400} h={120} look="ghost" op={fade(s, 46.4)} />
      <Pill x={6600 + 0.5 * 1600} y={3170} text="STOPPED AT $9,000" size={24} look="ghost" s={s} at={47.2} />
      <Caption x={6600 + 0.5 * 1600} y={3460} text="NEVER SAW THE BEND" s={s} at={48.4} dim />

      {/* H — the machine (7400,4700) */}
      <WordBox x={7400} y={4700} w={720} h={300} text="" s={s} at={50.1} />
      {([['chat', 7130], ['network', 7310], ['briefcase', 7490], ['coin', 7670]] as const).map(([name, x], i) => (
        <Icon key={name} name={name} x={x} y={4700} size={110} s={s} at={50.4 + i * 0.12} />
      ))}
      <Caption x={7400} y={4875} text="THE MACHINE" s={s} at={53.6} />
      {s > 54.0 && Array.from({length: 6}, (_, i) => {
        const life = ((s - 54.0) * 0.9 + i / 6) % 1;
        return <div key={i} style={{position: 'absolute', left: 7820 + life * 360, top: 4700 - 24 + Math.sin(life * Math.PI) * -60 + life * 140, width: 48, height: 48, borderRadius: 24, border: `4px solid ${C.line}`, opacity: Math.sin(life * Math.PI), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: '#EDEDED', filter: GLOW}}>$</div>;
      })}
      <div style={{position: 'absolute', left: 7400, top: 4380, translate: '-50% -50%', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 84, letterSpacing: '0.05em', color: '#F6F6F6', opacity: pop(s, 53.1), scale: `${0.92 + 0.08 * pop(s, 53.1)}`, filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.45))'}}>
        BUILD THE MACHINE.
      </div>
      <Pill x={7400} y={4300} text="NEVER ABOUT THE MONEY" size={24} look="ghost" s={s} at={51.3} out={52.9} />
    </>
  );
};

const CAM = [
  {t: 0, x: -400, y: 60, z: 1.2}, // the slow flat stretch
  {t: 2.2, x: -380, y: 60, z: 1.24},
  {t: 2.9, x: 0, y: -60, z: 0.92}, // pull back: the rocket
  {t: 3.7, x: 0, y: -60, z: 0.94},
  {t: 4.4, x: 2300, y: 160, z: 0.95}, // crowd walking, quitting
  {t: 6.2, x: 2300, y: 160, z: 0.98},
  {t: 6.9, x: 2400, y: -480, z: 1.05}, // seesaw
  {t: 8.5, x: 2400, y: -470, z: 1.09},
  {t: 9.2, x: 2000, y: 1500, z: 1.2}, // you, at zero
  {t: 10.5, x: 2000, y: 1500, z: 1.24},
  {t: 11.1, x: 2450, y: 1480, z: 1.02}, // no skills / customers / proof
  {t: 14.2, x: 2480, y: 1480, z: 1.06},
  {t: 14.9, x: 2400, y: 1560, z: 0.96},
  {t: 16.0, x: 2400, y: 1560, z: 0.98},
  {t: 16.8, x: 4900, y: 1320, z: 1.02}, // trust: buyers watch buyers
  {t: 21.4, x: 4900, y: 1340, z: 1.06},
  {t: 22.2, x: 4900, y: 1520, z: 0.92}, // cards
  {t: 23.4, x: 4930, y: 1520, z: 0.95},
  {t: 24.0, x: 5180, y: 1640, z: 1.1}, // +270%
  {t: 27.4, x: 5200, y: 1640, z: 1.14},
  {t: 28.1, x: 4600, y: 1600, z: 1.15}, // nobody vouches
  {t: 29.8, x: 4620, y: 1600, z: 1.19},
  {t: 30.5, x: 4900, y: 3020, z: 1.05}, // what each sale leaves
  {t: 37.4, x: 4900, y: 3040, z: 1.12},
  {t: 38.1, x: 7400, y: 3020, z: 0.95}, // the bend
  {t: 43.8, x: 7400, y: 3020, z: 0.98},
  {t: 44.6, x: 7350, y: 3260, z: 1.3}, // people who stop at 9,000
  {t: 49.3, x: 7370, y: 3260, z: 1.36},
  {t: 50.0, x: 7400, y: 4600, z: 1.0},
  {t: 58, x: 7450, y: 4580, z: 1.1},
];

type Cue = {t: number; src: string; vol?: number};
const SFX = (n: string) => `sfx-soft/${n}.wav`;
const MOVES = [2.9, 4.4, 6.9, 9.2, 11.1, 16.8, 22.2, 24.0, 28.1, 30.5, 38.1, 44.6, 50.0];
const CUES: Cue[] = [
  ...MOVES.map((t) => ({t: t - 0.55, src: SFX('whoosh'), vol: 0.2})),
  {t: 2.4, src: SFX('riser'), vol: 0.26},
  {t: 3.7, src: SFX('chime'), vol: 0.3},
  {t: 7.0, src: SFX('thud'), vol: 0.35},
  {t: 14.7, src: SFX('thud'), vol: 0.38},
  {t: 22.9, src: SFX('pop'), vol: 0.28},
  {t: 25.2, src: SFX('tick'), vol: 0.3},
  {t: 43.6, src: SFX('coins'), vol: 0.28},
  {t: 53.1, src: SFX('thud'), vol: 0.55},
];

export const FirstTenK: React.FC<{music?: 'song' | 'none'}> = ({music = 'song'}) => {
  const s = useSec();
  const end = fadeOut(s, 57.1, 0.9);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('vo12/voiceover.wav')} />
      {music === 'song' && <Audio src={staticFile('music/song-bed-12.wav')} volume={0.5} />}
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
