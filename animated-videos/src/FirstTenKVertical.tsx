import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Backdrop, C, Camera, Caption, Cross, Dust, FONT, GLOW, Ground, Icon, Pawn, Pill, Stat, WordBox, clamp, fade, fadeOut, fr, pop, useSec} from './LineKit';
import {CUES, Chart, FIRST_10K_FRAMES, ReviewCard, Seesaw, Tick, money} from './FirstTenK';

// "First 10K", re-laid out for a 1080x1920 phone screen (TikTok / Reels).
// Scenes are stacked top-to-bottom; the camera glides DOWN between them. Usable area per scene is about
// x ±470 and y −670…+520 around the camera centre, with Camera cy 0.38 / fit 0.92: that keeps everything between
// ~7% and ~65% of the screen height, clear of the app header and of the caption/title text at the bottom.
export const FIRST_10K_V_FRAMES = FIRST_10K_FRAMES;

const W = 900; // chart width

const hookProg = (t: number) => {
  // crawl at a steady speed to the $10K mark, then accelerate smoothly (same speed at the join, so no stall)
  if (t <= 0.2) return 0;
  if (t <= 2.4) return ((t - 0.2) / 2.2) * 0.55;
  const u = Math.min(t, 3.7) - 2.4;
  const v0 = 0.55 / 2.2;
  return Math.min(1, 0.55 + v0 * u + ((0.45 - v0 * 1.3) / 1.3 ** 3) * u ** 3);
};

const World: React.FC = () => {
  const s = useSec();
  const hp = hookProg(s);
  const hookMoney = hp < 0.55 ? (hp / 0.55) * 10000 : 10000 + 90000 * ((hp - 0.55) / 0.45);
  const fp = interpolate(s, [38.2, 43.9], [0.3, 1], clamp);
  const fMoney = fp < 0.55 ? (fp / 0.55) * 10000 : 10000 + 90000 * ((fp - 0.55) / 0.45);

  return (
    <>
      <Dust x0={-700} x1={700} y0={-1200} y1={15800} n={260} />

      {/* A — hook (0,0): the slow flat stretch, then the rocket. Vertical suits the climb. */}
      <Ground y={400} x0={-600} x1={600} s={s} at={0} />
      <Chart ox={-450} oy={400} w={W} h={950} prog={hp} t={s} />
      <Tick x={-450 + 0.55 * W} y0={400} y1={-560} label="$10K" s={s} at={0.5} />
      <Pill x={-230} y={280} text="THE FIRST $10K" size={30} look={s > 2.6 ? 'ghost' : 'outline'} s={s} at={0.5} />
      <Pill x={-200} y={-560} text="THE NEXT $100K" size={36} look="solid" s={s} at={2.7} />
      <Stat x={30} y={-230} value={money(hookMoney)} caption="EARNED" size={108} s={s} at={0} align="right" />

      {/* B — most people quit (0,2400) */}
      <Seesaw x={0} y={1980} s={s} at={6.6} tilt={interpolate(s, [6.9, 7.5], [0, 14], clamp)} />
      <Caption x={0} y={2150} text="HUGE WORK · TINY MONEY" s={s} at={8.2} size={28} />
      <Ground y={2780} x0={-600} x1={600} s={s} at={3.9} />
      <Tick x={400} y0={2780} y1={2440} label="$10K" s={s} at={4.0} />
      {Array.from({length: 6}, (_, i) => {
        const quits = i !== 5;
        const stop = quits ? 4.9 + i * 0.4 : 99;
        const walked = Math.min(Math.max(0, Math.min(s, stop) - 4.0), 4.6) * 70;
        const x = -470 + i * 105 + walked;
        const ghost = quits && s > stop;
        return <Pawn key={i} x={x} y={2780} h={130} look={ghost ? 'ghost' : 'line'} op={fade(s, 4.0 + i * 0.05) * (ghost ? 0.5 : 1)} bob={!ghost ? Math.abs(Math.sin(s * 8 + i)) * 6 : 0} />;
      })}
      <Pill x={-60} y={2520} text="MOST PEOPLE QUIT HERE" size={34} s={s} at={5.0} />

      {/* C — starting from zero (0,4800) */}
      <Icon name="briefcase" x={-300} y={4330} size={170} s={s} at={10.9} label="SKILLS" />
      <Cross x={-300} y={4330} size={200} s={s} at={11.6} />
      <Icon name="cart" x={0} y={4330} size={170} s={s} at={12.6} label="CUSTOMERS" />
      <Cross x={0} y={4330} size={200} s={s} at={13.1} />
      <Icon name="star" x={300} y={4330} size={170} s={s} at={13.6} label="PROOF" />
      <Cross x={300} y={4330} size={200} s={s} at={14.0} />
      <Stat x={0} y={4600} value="$0" size={150} s={s} at={10.55} />
      <Ground y={5120} x0={-600} x1={600} s={s} at={8.9} />
      <Pawn x={0} y={5120} h={300} look="hero" op={fade(s, 8.95)} bob={s > 14.4 ? Math.abs(Math.sin(s * 9)) * 9 : Math.sin(s * 2.4) * 3} />
      <Pill x={0} y={5200} text="EVERY SALE IS A FIGHT" size={38} look="solid" s={s} at={14.7} />

      {/* D — buyers trust other buyers (0,7300) */}
      <Pill x={0} y={6560} text="BUYERS TRUST OTHER BUYERS" size={36} look="solid" s={s} at={17.3} out={19.4} />
      <Pill x={0} y={6500} text="SPIEGEL RESEARCH CENTER" size={34} s={s} at={19.6} />
      <Caption x={0} y={6555} text="NORTHWESTERN UNIVERSITY" s={s} at={19.9} size={26} />
      <div style={{opacity: fadeOut(s, 21.7)}}>
        <Ground y={7150} x0={-600} x1={600} s={s} at={17.3} />
        {Array.from({length: 6}, (_, i) => {
          const p = interpolate(s, [17.4 + i * 0.12, 18.4 + i * 0.12], [0, 1], {...clamp, easing: (t: number) => 1 - (1 - t) ** 3});
          return <Pawn key={i} x={-350 + i * 140 + (1 - p) * 700} y={7150} h={170} look={i < 3 ? 'line' : 'hero'} op={fade(s, 17.4 + i * 0.12)} bob={p > 0 && p < 1 ? Math.abs(Math.sin(s * 9 + i)) * 7 : Math.abs(Math.sin(s * 2.6 + i)) * 3} />;
        })}
        <Icon name="eye" x={-210} y={6860} size={110} s={s} at={18.2} />
        <Icon name="chat" x={70} y={6850} size={110} s={s} at={18.8} />
        <Icon name="chat" x={350} y={6850} size={110} s={s} at={19.0} />
      </div>
      <ReviewCard x={-215} y={7180} stars={0} title="NO REVIEWS" s={s} at={22.1} starAt={99} dim={s > 26.6} />
      <ReviewCard x={215} y={7180} stars={5} title="5 REVIEWS" s={s} at={22.5} starAt={22.9} />
      <Stat x={0} y={6810} value={`+${Math.round(interpolate(s, [23.8, 25.2], [0, 270], clamp))}%`} caption="MORE LIKELY TO BE BOUGHT" size={150} s={s} at={23.8} />
      <Pill x={-215} y={7470} text="NOBODY VOUCHES" size={30} look="ghost" s={s} at={28.5} />

      {/* E — every sale leaves something (0,9800) */}
      <Pill x={0} y={9150} text="EVERY SALE LEAVES" size={36} s={s} at={30.4} />
      <Caption x={0} y={9210} text="SOMETHING BEHIND" s={s} at={30.7} size={30} />
      <Pawn x={0} y={10000} h={280} look="hero" op={fade(s, 30.3)} bob={Math.sin(s * 2.4) * 3} />
      {([
        ['chat', 'A REVIEW', -300, 9500, 32.5],
        ['network', 'A REFERRAL', 300, 9500, 33.55],
        ['briefcase', 'A SKILL', -320, 10020, 34.6],
        ['coin', 'MONEY WORKING', 320, 10020, 35.6],
      ] as const).map(([name, label, x, y, at]) => (
        <React.Fragment key={label}>
          <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <line x1={0} y1={9820} x2={x * fade(s, at, 0.4) * 0.7} y2={9820 + (y - 9820) * fade(s, at, 0.4) * 0.7} stroke="#8A8A8A" strokeWidth={3} strokeDasharray="10 10" />
          </svg>
          <div style={{position: 'absolute', left: x, top: y, translate: `0 ${Math.sin(s * 1.6 + x) * 8}px`}}>
            <Icon name={name} x={0} y={0} size={160} s={s} at={at} label={label} />
          </div>
        </React.Fragment>
      ))}

      {/* F — the line bends (0,12300) + G people who stop at 9,000 */}
      <Ground y={12650} x0={-600} x1={600} s={s} at={37.8} />
      <Chart ox={-450} oy={12650} w={W} h={880} prog={fp} t={s} />
      <Tick x={-450 + 0.55 * W} y0={12650} y1={11780} label="$10K" s={s} at={38.2} />
      <Stat x={100} y={11800} value={money(fMoney)} caption="EARNED" size={115} s={s} at={38.0} align="right" />
      <Pill x={170} y={11640} text="EACH SALE EASIER" size={34} look="solid" s={s} at={39.3} />
      <Pawn x={-450 + 0.5 * W} y={12635} h={140} look="ghost" op={fade(s, 46.4)} />
      <Pill x={-450 + 0.5 * W - 60} y={12330} text="STOPPED AT $9,000" size={30} look="ghost" s={s} at={47.2} />
      <Caption x={-450 + 0.5 * W - 60} y={12385} text="NEVER SAW THE BEND" s={s} at={48.4} dim size={26} />

      {/* H — the machine (0,14700) */}
      <Pill x={0} y={14250} text="NEVER ABOUT THE MONEY" size={30} look="ghost" s={s} at={51.3} out={52.9} />
      <div style={{position: 'absolute', left: 0, top: 14260, translate: '-50% -50%', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 118, lineHeight: 1.05, letterSpacing: '0.03em', color: '#F6F6F6', opacity: pop(s, 53.1), scale: `${0.92 + 0.08 * pop(s, 53.1)}`, filter: 'drop-shadow(0 0 26px rgba(255,255,255,0.45))'}}>
        BUILD THE
        <br />
        MACHINE.
      </div>
      <WordBox x={0} y={14680} w={820} h={280} text="" s={s} at={50.1} />
      {([['chat', -285], ['network', -95], ['briefcase', 95], ['coin', 285]] as const).map(([name, x], i) => (
        <Icon key={name} name={name} x={x} y={14680} size={130} s={s} at={50.4 + i * 0.12} />
      ))}
      <Caption x={0} y={14850} text="THE MACHINE" s={s} at={53.6} size={28} />
      {s > 54.0 && Array.from({length: 7}, (_, i) => {
        const life = ((s - 54.0) * 0.8 + i / 7) % 1;
        return <div key={i} style={{position: 'absolute', left: -200 + i * 66, top: 14880 + life * 130, width: 50, height: 50, borderRadius: 25, border: `4px solid ${C.line}`, opacity: Math.sin(life * Math.PI), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, color: '#EDEDED', filter: GLOW}}>$</div>;
      })}
    </>
  );
};

// same beats as the horizontal cut, so the whooshes in CUES still land on the moves
const CAM = [
  {t: 0, x: -120, y: 150, z: 1.3}, // the slow flat stretch
  {t: 2.2, x: -110, y: 140, z: 1.33},
  {t: 2.9, x: 0, y: -60, z: 1.0}, // pull back: the rocket
  {t: 4.1, x: 20, y: -100, z: 1.06},
  {t: 4.4, x: 0, y: 2650, z: 1.12}, // crowd walking, quitting
  {t: 6.2, x: 0, y: 2650, z: 1.16},
  {t: 6.9, x: 0, y: 2300, z: 0.98}, // seesaw + crowd
  {t: 8.5, x: 0, y: 2300, z: 1.02},
  {t: 9.2, x: 0, y: 4850, z: 1.15}, // you, at zero
  {t: 10.5, x: 0, y: 4800, z: 1.1},
  {t: 11.1, x: 0, y: 4700, z: 1.0}, // no skills / customers / proof
  {t: 14.2, x: 0, y: 4700, z: 1.04},
  {t: 14.9, x: 0, y: 4760, z: 0.98},
  {t: 16.0, x: 0, y: 4760, z: 1.0},
  {t: 16.8, x: 0, y: 6950, z: 1.06}, // trust
  {t: 21.4, x: 0, y: 6950, z: 1.1},
  {t: 22.2, x: 0, y: 7120, z: 1.0}, // cards
  {t: 23.4, x: 0, y: 7120, z: 1.02},
  {t: 24.0, x: 0, y: 7050, z: 1.04}, // +270% above the cards
  {t: 27.4, x: 0, y: 7060, z: 1.08},
  {t: 28.1, x: -60, y: 7150, z: 1.04}, // nobody vouches (the +270% stays in shot)
  {t: 29.8, x: -60, y: 7150, z: 1.08},
  {t: 30.5, x: 0, y: 9620, z: 1.0}, // what each sale leaves
  {t: 37.4, x: 0, y: 9640, z: 1.06},
  {t: 38.1, x: 0, y: 12170, z: 0.98}, // the bend
  {t: 43.8, x: 0, y: 12170, z: 1.0},
  {t: 44.6, x: -40, y: 12450, z: 1.3}, // people who stop at 9,000
  {t: 49.3, x: -40, y: 12450, z: 1.36},
  {t: 50.0, x: 0, y: 14560, z: 1.0},
  {t: 58, x: 0, y: 14560, z: 1.06},
];

export const FirstTenKVertical: React.FC<{music?: 'song' | 'none'; grid?: boolean}> = ({music = 'song', grid = true}) => {
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
        <Backdrop dots={false} />
        <Camera keys={CAM} cy={0.38} fit={0.92} grid={grid}>
          <World />
        </Camera>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
