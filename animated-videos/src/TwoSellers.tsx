import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Figure, Pose, poses, walkPose} from './Figure';

loadFont({family: 'Roboto Mono', url: staticFile('fonts/RobotoMono.woff2'), weight: '100 900'});
const MONO = '"Roboto Mono", monospace';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------- timeline (30fps, 26s) ----------------
export const TWO_SELLERS_FRAMES = 780;
const T = {
  week2: 66,
  week4: 150,
  ask: 270,
  week8: 400,
  week12: 500,
  moral1: 660,
  moral2: 714,
  end: 780,
};
const captions = [
  {from: 0, label: 'DAY 1', line: 'SAME PRODUCT. SAME PRICE.'},
  {from: T.week2, label: 'WEEK 2', line: 'NOBODY BUYS.'},
  {from: T.week4, label: 'WEEK 4', line: 'ONE KEPT ADDING FEATURES.'},
  {from: T.ask, label: 'WEEK 4', line: 'THE OTHER ASKED ONE QUESTION.'},
  {from: T.week8, label: 'WEEK 8', line: 'HE FIXED ONE THING.'},
  {from: T.week12, label: 'WEEK 12', line: 'THEY STARTED BUYING.'},
  {from: T.moral1, label: '', line: "BUYERS DON'T WANT MORE."},
  {from: T.moral2, label: '', line: 'THEY WANT LESS DOUBT.'},
];

// layout
const FLOOR = 1300;
const A = 300; // desk centre of seller A (adds features)
const B = 800; // desk centre of seller B (asks the question)
const DESK_TOP = 1190;
const FEATURE_DROPS = [165, 187, 209, 231, 253];
const BUYER_STREAM = [505, 527, 549, 571, 593, 615];
const COIN_AT = 62; // frames after a stream buyer enters, when they reach B
const B_REVENUE_W12 = 148920; // B's revenue when week 12 ends
const B_REVENUE_END = 163480; // it keeps climbing through the closing lines
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

// ---------------- sound cues ----------------
type Cue = {f: number; src: string; vol?: number};
const buildCues = (): Cue[] => {
  const c: Cue[] = [{f: 0, src: 'hum.wav', vol: 0.9}];
  for (const cap of captions) {
    if (cap.from > 0) c.push({f: cap.from - 4, src: 'whoosh.wav', vol: 0.5});
    for (let k = 0; k < cap.line.length; k += 2) c.push({f: cap.from + 3 + k, src: 'type.wav', vol: 1});
  }
  // week 2: two buyers walk past
  for (let f = T.week2 + 4; f < T.week4 - 4; f += 9) c.push({f, src: 'step.wav', vol: 0.5});
  c.push({f: 92, src: 'pop.wav', vol: 0.5}, {f: 124, src: 'pop.wav', vol: 0.5});
  // week 4: feature blocks land on A's box
  FEATURE_DROPS.forEach((f, i) => c.push({f: f + 9, src: `thunk${i}.wav`, vol: 0.9}));
  c.push({f: 262, src: 'creak.wav', vol: 0.5});
  // the question
  for (let f = T.ask + 2; f < T.ask + 40; f += 9) c.push({f, src: 'step.wav', vol: 0.5});
  c.push({f: 314, src: 'pop.wav', vol: 0.6}, {f: 346, src: 'pop.wav', vol: 0.6});
  for (let f = 376; f < 400; f += 9) c.push({f, src: 'step.wav', vol: 0.4});
  // the fix
  c.push({f: 424, src: 'shimmer.wav', vol: 0.8}, {f: 446, src: 'ding4.wav', vol: 0.7});
  // week 12: buyers pour in, rising dings at B
  BUYER_STREAM.forEach((s, i) => {
    c.push({f: s + COIN_AT, src: `ding${Math.min(9, i + 2)}.wav`, vol: 0.75});
    for (let f = s; f < s + 90; f += 10) c.push({f, src: 'step.wav', vol: 0.18});
  });
  // moral: impact, A's tower creaks, single falling tone, loop ping
  c.push({f: T.moral1, src: 'boom.wav', vol: 1}, {f: 676, src: 'creak.wav', vol: 0.5}, {f: 724, src: 'fall.wav', vol: 0.6});
  c.push({f: 762, src: 'ping.wav', vol: 0.7});
  return c;
};
const CUES = buildCues();

// ---------------- pieces ----------------
const Caption: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = [...captions].reverse().find((c) => frame >= c.from)!;
  const local = frame - cap.from;
  const chars = Math.floor(Math.max(0, local - 3));
  const fadeIn = interpolate(local, [0, 5], [0, 1], clamp);
  const isMoral = cap.label === '';
  return (
    <div style={{position: 'absolute', top: isMoral ? 250 : 170, width: '100%', textAlign: 'center', fontFamily: MONO, opacity: fadeIn}}>
      {cap.label && <div style={{fontSize: 76, fontWeight: 700, letterSpacing: 8, color: '#E8E8EA'}}>{cap.label}</div>}
      {/* the moral stacks: line 1 stays while line 2 types under it */}
      {isMoral && frame >= T.moral2 && (
        <div style={{fontSize: 54, fontWeight: 700, letterSpacing: 3, color: '#8E8E96', marginBottom: 18}}>{captions[6].line}</div>
      )}
      <div
        style={{
          fontSize: isMoral ? 54 : 38,
          fontWeight: isMoral ? 700 : 500,
          letterSpacing: 3,
          color: isMoral && frame >= T.moral2 ? '#F3C25B' : '#CFCFD4',
          marginTop: 14,
          minHeight: 50,
        }}
      >
        {cap.line.slice(0, chars)}
        <span style={{opacity: chars < cap.line.length && Math.floor(frame / 4) % 2 === 0 ? 1 : 0}}>▌</span>
      </div>
    </div>
  );
};

const Lamp: React.FC<{x: number; warm: number; on: number}> = ({x, warm, on}) => {
  const cool = [190, 205, 255];
  const gold = [255, 196, 110];
  const c = cool.map((v, i) => Math.round(v + (gold[i] - v) * warm)).join(',');
  return (
    <>
      <div style={{position: 'absolute', left: x - 1, top: 0, width: 2, height: 860, background: '#24252c'}} />
      <svg style={{position: 'absolute', left: x - 50, top: 850}} width={100} height={50}>
        <polygon points="25,0 75,0 100,45 0,45" fill="#2A2B33" />
        <ellipse cx={50} cy={45} rx={40} ry={5} fill={`rgba(${c},${0.9 * on})`} />
      </svg>
      {/* light cone + pool */}
      <div
        style={{
          position: 'absolute',
          left: x - 330,
          top: 895,
          width: 660,
          height: 480,
          background: `radial-gradient(ellipse 50% 85% at 50% 0%, rgba(${c},${(0.16 + 0.14 * warm) * on}) 0%, rgba(${c},0) 70%)`,
          clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - 380,
          top: FLOOR - 120,
          width: 760,
          height: 240,
          background: `radial-gradient(ellipse at 50% 50%, rgba(${c},${(0.22 + 0.2 * warm) * on}) 0%, rgba(${c},0) 65%)`,
        }}
      />
    </>
  );
};

const Desk: React.FC<{x: number}> = ({x}) => (
  <svg style={{position: 'absolute', left: x - 130, top: DESK_TOP}} width={260} height={FLOOR - DESK_TOP + 4}>
    <rect x={0} y={0} width={260} height={14} rx={3} fill="#5A4636" />
    <rect x={14} y={14} width={12} height={FLOOR - DESK_TOP - 12} fill="#3B2E24" />
    <rect x={234} y={14} width={12} height={FLOOR - DESK_TOP - 12} fill="#3B2E24" />
  </svg>
);

const Chair: React.FC<{x: number}> = ({x}) => (
  <svg style={{position: 'absolute', left: x - 60, top: 1120}} width={110} height={FLOOR - 1120 + 4}>
    <rect x={0} y={0} width={12} height={120} rx={4} fill="#2E3040" />
    <rect x={0} y={108} width={100} height={14} rx={4} fill="#2E3040" />
    <rect x={6} y={120} width={8} height={FLOOR - 1240} fill="#22232E" />
    <rect x={86} y={120} width={8} height={FLOOR - 1240} fill="#22232E" />
  </svg>
);

// the product: a box with a red "?" sticker (buyer doubt). B swaps it for a gold check.
const Product: React.FC<{x: number; fixed: number; glow: number}> = ({x, fixed, glow}) => (
  <svg style={{position: 'absolute', left: x - 75, top: DESK_TOP - 110, overflow: 'visible'}} width={150} height={110}>
    {glow > 0 && (
      <ellipse cx={75} cy={60} rx={110} ry={90} fill="rgba(255,196,110,0.25)" opacity={glow} style={{filter: 'blur(18px)'}} />
    )}
    <rect x={15} y={10} width={120} height={100} rx={6} fill={glow > 0.5 ? '#EDE3D2' : '#BFC0C8'} />
    <rect x={15} y={10} width={120} height={22} rx={6} fill={glow > 0.5 ? '#F3C25B' : '#9C9DA8'} />
    <g transform={`translate(75 70) scale(${1 - fixed})`}>
      <circle r={22} fill="#D9534F" />
      <text y={11} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill="white">
        ?
      </text>
    </g>
    <g transform={`translate(75 70) scale(${fixed})`}>
      <circle r={22} fill="#F3C25B" />
      <path d="M-10 0 L-3 8 L11 -8" stroke="#2A2010" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

// grey feature blocks that pile up on A's product
const FeatureTower: React.FC<{wobble: number}> = ({wobble}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const blocks = [
    {w: 130, h: 46, dx: -6, rot: -3, label: '+ FEATURE'},
    {w: 100, h: 52, dx: 14, rot: 4, label: '+ OPTION'},
    {w: 140, h: 40, dx: -10, rot: -5, label: '+ BONUS'},
    {w: 90, h: 58, dx: 8, rot: 6, label: '+ ADD-ON'},
    {w: 120, h: 44, dx: -4, rot: -2, label: '+ MORE'},
  ];
  let y = DESK_TOP - 110;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${A}px ${DESK_TOP - 110}px`, transform: `rotate(${wobble}deg)`}}>
      {blocks.map((b, i) => {
        y -= b.h - 4;
        const p = spring({frame: frame - FEATURE_DROPS[i], fps, config: {damping: 9, mass: 0.5}});
        if (frame < FEATURE_DROPS[i]) return null;
        const top = interpolate(p, [0, 1], [-200, y]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: A - b.w / 2 + b.dx,
              top,
              width: b.w,
              height: b.h,
              background: ['#7D7F8C', '#6A6C79', '#8B8D99', '#5E606D', '#757785'][i],
              borderRadius: 6,
              transform: `rotate(${b.rot}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 17,
              color: '#E4E4EA',
              letterSpacing: 1,
            }}
          >
            {b.label}
          </div>
        );
      })}
    </div>
  );
};

const Bubble: React.FC<{x: number; y: number; text: string; from: number; to: number; kind: 'say' | 'think'; tailLeft?: boolean}> = ({
  x,
  y,
  text,
  from,
  to,
  kind,
  tailLeft,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame > to) return null;
  const p = spring({frame: frame - from, fps, config: {damping: 11, mass: 0.5}});
  const out = interpolate(frame, [to - 6, to], [1, 0], clamp);
  const think = kind === 'think';
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${p})`, transformOrigin: '50% 100%', opacity: out}}>
      <div
        style={{
          background: think ? '#1C1D24' : '#EDEDF0',
          color: think ? '#F0F0F3' : '#15161C',
          border: think ? '3px solid #D9534F' : 'none',
          borderRadius: 26,
          padding: '20px 28px',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
      {think ? (
        <>
          <div style={{position: 'absolute', left: tailLeft ? '30%' : '62%', bottom: -22, width: 16, height: 16, borderRadius: 8, background: '#D9534F'}} />
          <div style={{position: 'absolute', left: tailLeft ? '26%' : '66%', bottom: -40, width: 9, height: 9, borderRadius: 5, background: '#D9534F'}} />
        </>
      ) : (
        <div
          style={{
            position: 'absolute',
            left: tailLeft ? '22%' : '70%',
            bottom: -16,
            width: 0,
            height: 0,
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '18px solid #EDEDF0',
          }}
        />
      )}
    </div>
  );
};

// a buyer that walks between x keyframes; walks when moving, stands when still
const Buyer: React.FC<{f: number[]; x: number[]; shade?: string; still?: 1 | -1}> = ({f, x, shade = '#D7D7DC', still}) => {
  const frame = useCurrentFrame();
  if (frame < f[0] || frame > f[f.length - 1]) return null;
  const pos = interpolate(frame, f, x, clamp);
  const v = pos - interpolate(frame - 1, f, x, clamp);
  const moving = Math.abs(v) > 0.3;
  // when standing still, face `still` if given, otherwise the way they were last walking
  const lastV = pos - interpolate(frame - 8, f, x, clamp);
  const facing: 1 | -1 = moving ? (v > 0 ? 1 : -1) : still ?? (lastV < 0 ? -1 : 1);
  const pose: Pose = moving ? walkPose(pos / 34) : poses.stand;
  return <Figure x={pos} y={FLOOR - 134} pose={pose} facing={facing} scale={1.05} color={shade} />;
};

const Counter: React.FC<{x: number; value: string; hot: boolean; bump: number}> = ({x, value, hot, bump}) => (
  <div style={{position: 'absolute', left: x - 200, width: 400, top: 1395, textAlign: 'center', fontFamily: MONO}}>
    <div style={{fontSize: 26, letterSpacing: 6, color: '#6E6F7A', fontWeight: 700}}>REVENUE</div>
    <div
      style={{
        fontSize: 62,
        fontWeight: 700,
        color: hot ? '#F3C25B' : '#9A9BA6',
        transform: `scale(${1 + bump * 0.18})`,
        textShadow: hot ? '0 0 30px rgba(243,194,91,0.45)' : 'none',
      }}
    >
      {value}
    </div>
  </div>
);

const Coin: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const l = frame - start;
  if (l < 0 || l > 22) return null;
  const y = interpolate(l, [0, 22], [FLOOR - 220, 1440], {easing: Easing.in(Easing.quad)});
  const op = interpolate(l, [0, 3, 18, 22], [0, 1, 1, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: B - 18,
        top: y,
        width: 36,
        height: 36,
        borderRadius: 18,
        background: 'radial-gradient(circle at 35% 35%, #FFE9A8, #E2A93A)',
        boxShadow: '0 0 20px rgba(243,194,91,0.8)',
        opacity: op,
      }}
    />
  );
};

// ---------------- main composition ----------------
export const TwoSellers: React.FC = () => {
  const frame = useCurrentFrame();

  // seller B fixes the product
  const fixed = interpolate(frame, [424, 444], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const warm = interpolate(frame, [430, 480], [0, 1], clamp);
  // A's lamp flickers and dies during the moral
  const flicker = frame > 668 && frame < 700 ? (Math.sin(frame * 3.1) > 0.2 ? 1 : 0.35) : 1;
  const aOn = interpolate(frame, [700, 730], [1, 0.25], clamp) * flicker;
  const wobble = frame > 250 ? Math.sin(frame / 7) * interpolate(frame, [250, 270, 660, 700], [0, 1.5, 1.5, 3.5], clamp) : 0;

  // sales counters
  const coinsLanded = BUYER_STREAM.filter((s) => frame >= s + COIN_AT + 18).length;
  const lastCoin = Math.max(...BUYER_STREAM.map((s) => (frame >= s + COIN_AT + 18 ? s + COIN_AT + 18 : -999)));
  const firstCoin = BUYER_STREAM[0] + COIN_AT + 18;
  const bRevenue =
    frame < firstCoin
      ? 0
      : interpolate(frame, [firstCoin, BUYER_STREAM[5] + COIN_AT + 30, T.end], [49, B_REVENUE_W12, B_REVENUE_END], {
          ...clamp,
          easing: Easing.inOut(Easing.quad),
        }) + (frame % 3) * 7; // jitter so the digits keep ticking like a live counter
  const bump = coinsLanded > 0 ? interpolate(frame - lastCoin, [0, 8], [1, 0], clamp) : 0;

  // seller poses
  const tinker = (phase: number) => ({...poses.sitWork, armFront: [55 + Math.sin(phase) * 12, 55] as [number, number]});
  const aPose: Pose =
    frame >= T.moral1 ? poses.sitSlump : frame >= T.week4 && frame < T.ask ? {...poses.sitWork, armFront: [110 + Math.sin(frame / 3) * 18, 30]} : tinker(frame / 9);
  const bPose: Pose =
    frame >= 300 && frame < 372 ? poses.sitAsk : frame >= 418 && frame < 440 ? {...poses.sitWork, armFront: [100, 10]} : tinker(frame / 9 + 2);

  // global fade for a seamless loop (fades from and to the same dark frame)
  const loopFade = Math.min(interpolate(frame, [0, 8], [0, 1], clamp), interpolate(frame, [T.end - 10, T.end], [1, 0], clamp));

  return (
    <AbsoluteFill style={{backgroundColor: '#07080C'}}>
      {CUES.map((c, i) => (
        <Sequence key={i} from={c.f} layout="none">
          <Audio src={staticFile(`sfx/${c.src}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      <AbsoluteFill style={{opacity: loopFade}}>
        {/* room */}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 60% at 50% 62%, #151722 0%, #07080C 70%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR, bottom: 0, background: 'linear-gradient(180deg, #121420 0%, #07080C 60%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR, height: 2, background: 'linear-gradient(90deg, transparent, #2B2E3D 20%, #2B2E3D 80%, transparent)'}} />

        <AbsoluteFill style={{transform: 'scale(1.22)', transformOrigin: '540px 1230px'}}>
        <Lamp x={A} warm={0} on={aOn} />
        <Lamp x={B} warm={warm} on={1} />

        {/* station A */}
        <Chair x={A - 160} />
        <Figure x={A - 150} y={1222} pose={aPose} facing={1} color={frame >= T.moral1 ? '#A9AAB3' : '#E6E6EA'} />
        <Desk x={A} />
        <Product x={A} fixed={0} glow={0} />
        <FeatureTower wobble={wobble} />

        {/* station B */}
        <Chair x={B - 160} />
        <Figure x={B - 150} y={1222} pose={bPose} facing={1} color="#E6E6EA" />
        <Desk x={B} />
        <Product x={B} fixed={fixed} glow={warm} />

        <Counter x={A} value="$0" hot={false} bump={0} />
        <Counter x={B} value={money(bRevenue)} hot={bRevenue > 0} bump={bump} />

        {/* week 2: two buyers drift past both sellers */}
        <Buyer f={[T.week2, 86, 100, 116, 130, T.week4]} x={[-80, A + 120, A + 120, B + 120, B + 120, 1180]} still={-1} />
        <Bubble x={A + 120} y={1020} text="?" from={92} to={108} kind="think" />
        <Bubble x={B + 120} y={1020} text="?" from={124} to={142} kind="think" />

        {/* the question */}
        <Buyer f={[T.ask, T.ask + 40, 376, 400]} x={[1180, B + 135, B + 135, 1180]} shade="#CFCFD6" />
        <Bubble x={B - 110} y={1010} text="WHY DIDN'T YOU BUY?" from={314} to={372} kind="say" tailLeft />
        <Bubble x={B - 100} y={905} text="NOT SURE IT'S FOR ME." from={346} to={378} kind="think" />

        {/* week 12: buyers walk past A's tower and buy from B */}
        {BUYER_STREAM.map((s, i) => (
          <React.Fragment key={s}>
            <Buyer f={[s, s + 50, s + COIN_AT, s + COIN_AT + 12, s + 100]} x={[-80, B - 10, B + 150, B + 150, 1180]} still={-1} shade={i % 2 ? '#CFCFD6' : '#DCDCE1'} />
            <Coin start={s + COIN_AT} />
          </React.Fragment>
        ))}
        </AbsoluteFill>

        <Caption />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
