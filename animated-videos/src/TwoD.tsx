import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, toolkits} from './brand';

// ---------- small animation helpers ----------
const usePop = (delay: number, damping = 12) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass: 0.6}});
};

const FadeUp: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay, children, style}) => {
  const p = usePop(delay, 14);
  return (
    <div style={{opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 60}px)`, ...style}}>{children}</div>
  );
};

const SceneFade: React.FC<{dur: number; bg: string; children: React.ReactNode}> = ({dur, bg, children}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const inn = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: bg}}>
      <AbsoluteFill style={{opacity: Math.min(out, inn)}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const H: React.FC<{size: number; color: string; children: React.ReactNode; serif?: boolean; style?: React.CSSProperties}> = ({
  size,
  color,
  children,
  serif = true,
  style,
}) => (
  <div
    style={{
      fontFamily: serif ? brand.serif : brand.sans,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.05,
      color,
      letterSpacing: serif ? -1 : 0,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- icons ----------
const ProductBox: React.FC<{size: number; tint?: string; glow?: number}> = ({size, tint = brand.amber, glow = 0}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
    {glow > 0 && <circle cx={100} cy={110} r={95} fill={brand.amber} opacity={0.25 * glow} />}
    <polygon points="100,30 175,65 100,100 25,65" fill={brand.cream} stroke={brand.ink} strokeWidth={6} strokeLinejoin="round" />
    <polygon points="25,65 100,100 100,180 25,145" fill="#E8DCC6" stroke={brand.ink} strokeWidth={6} strokeLinejoin="round" />
    <polygon points="175,65 100,100 100,180 175,145" fill="#D9C9AC" stroke={brand.ink} strokeWidth={6} strokeLinejoin="round" />
    <polygon points="62,48 137,83 137,123 62,88" fill={tint} opacity={0.9} />
  </svg>
);

const Cursor: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M6 3 L6 33 L14 25 L20 37 L25 35 L19 23 L30 23 Z" fill="white" stroke={brand.ink} strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);

const HEAD_PATH =
  'M60 200 C60 115 115 55 185 55 C255 55 305 105 305 175 L328 228 L305 238 L305 275 C305 298 290 310 266 310 L240 310 L240 370 L100 370 L100 302 C74 282 60 246 60 200 Z';

const Head: React.FC<{size: number; fill: string; stroke: string; children?: React.ReactNode}> = ({size, fill, stroke, children}) => (
  <svg width={size} height={size * 1.1} viewBox="40 40 310 340" style={{overflow: 'visible'}}>
    <path d={HEAD_PATH} fill={fill} stroke={stroke} strokeWidth={8} strokeLinejoin="round" />
    {children}
  </svg>
);

const Wrench: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M70 12 a20 20 0 0 0 -22 27 L14 73 a8 8 0 0 0 12 12 L60 51 a20 20 0 0 0 27 -22 l-12 12 -12 -4 -4 -12 z"
      fill={color}
      stroke={brand.ink}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </svg>
);

// ---------- scenes ----------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // cursor drifts toward the product, hovers, then leaves without clicking
  const cx = interpolate(frame, [0, 35, 60, 95], [900, 600, 600, 1150], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const cy = interpolate(frame, [0, 35, 60, 95], [1650, 1230, 1230, 1500], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const shake = frame > 62 && frame < 78 ? Math.sin(frame * 2.2) * 10 : 0;
  const dim = interpolate(frame, [62, 85], [1, 0.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneFade dur={110} bg={brand.cream}>
      <AbsoluteFill style={{padding: '220px 90px', gap: 18}}>
        <FadeUp delay={4}>
          <H size={120} color={brand.ink}>You built it.</H>
        </FadeUp>
        <FadeUp delay={26}>
          <H size={120} color={brand.ink}>They saw it.</H>
        </FadeUp>
        <FadeUp delay={58} style={{transform: `translateX(${shake}px)`}}>
          <H size={120} color={brand.coral}>Nobody bought it.</H>
        </FadeUp>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 340, top: 1020, opacity: dim}}>
        <ProductBox size={400} tint={brand.muted} />
      </div>
      <div style={{position: 'absolute', left: cx, top: cy}}>
        <Cursor size={110} />
      </div>
    </SceneFade>
  );
};

const Card: React.FC<{delay: number; from: 'left' | 'right'; icon: React.ReactNode; num: string; text: string}> = ({
  delay,
  from,
  icon,
  num,
  text,
}) => {
  const p = usePop(delay, 13);
  const x = (1 - p) * (from === 'left' ? -1100 : 1100);
  return (
    <div
      style={{
        transform: `translateX(${x}px)`,
        background: 'white',
        borderRadius: 40,
        border: `5px solid ${brand.ink}`,
        boxShadow: `14px 14px 0 ${brand.ink}`,
        padding: '44px 50px',
        display: 'flex',
        alignItems: 'center',
        gap: 40,
      }}
    >
      <div style={{width: 170, display: 'flex', justifyContent: 'center'}}>{icon}</div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: brand.sans, fontWeight: 800, fontSize: 38, color: brand.coral, marginBottom: 10}}>{num}</div>
        <H size={62} color={brand.ink} serif={false} style={{fontWeight: 600, lineHeight: 1.15}}>
          {text}
        </H>
      </div>
    </div>
  );
};

const TwoReasons: React.FC = () => {
  const frame = useCurrentFrame();
  const q = 0.85 + Math.sin(frame / 5) * 0.08;
  return (
    <SceneFade dur={130} bg={brand.cream}>
      <AbsoluteFill style={{padding: '260px 80px', gap: 70}}>
        <FadeUp delay={2}>
          <H size={100} color={brand.ink}>
            A sale dies for
            <br />
            one of two reasons:
          </H>
        </FadeUp>
        <Card delay={18} from="left" num="REASON 1" text="Something in your product is off" icon={<Wrench size={150} color={brand.amber} />} />
        <Card
          delay={48}
          from="right"
          num="REASON 2"
          text="You can't see what your buyer is thinking"
          icon={
            <Head size={150} fill={brand.cream} stroke={brand.ink}>
              <text x={180} y={235} textAnchor="middle" fontSize={150} fontWeight={800} fontFamily={brand.sans} fill={brand.coral} transform={`translate(180 190) scale(${q}) translate(-180 -190)`}>
                ?
              </text>
            </Head>
          }
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

const Check: React.FC<{delay: number; text: string}> = ({delay, text}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <FadeUp delay={delay - 4} style={{display: 'flex', alignItems: 'center', gap: 34}}>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <rect x={5} y={5} width={80} height={80} rx={20} fill="none" stroke={brand.mint} strokeWidth={7} />
        <path d="M24 46 L39 61 L67 30" fill="none" stroke={brand.mint} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
      <div style={{fontFamily: brand.sans, fontWeight: 600, fontSize: 54, color: brand.cream}}>{text}</div>
    </FadeUp>
  );
};

const FixToolkit: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [70, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tilt = Math.sin(frame / 12) * 3;
  return (
    <SceneFade dur={130} bg={brand.ink}>
      <AbsoluteFill style={{padding: '210px 90px', gap: 26}}>
        <FadeUp delay={2}>
          <div style={{fontFamily: brand.sans, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: brand.amber}}>TOOLKIT 01</div>
        </FadeUp>
        <FadeUp delay={8}>
          <H size={118} color={brand.cream}>
            Fix Your
            <br />
            Product
          </H>
        </FadeUp>
        <div style={{height: 40}} />
        {toolkits.fix.points.map((t, i) => (
          <Check key={t} delay={30 + i * 18} text={t} />
        ))}
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 560, top: 1290, transform: `rotate(${tilt}deg)`}}>
        <ProductBox size={420} tint={glow > 0.5 ? brand.amber : brand.muted} glow={glow} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 1430,
          transform: `rotate(${interpolate(frame, [20, 40, 60, 80], [0, -35, 0, -35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}deg)`,
          transformOrigin: '20% 80%',
          opacity: interpolate(frame, [10, 20, 95, 110], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        <Wrench size={260} color={brand.amber} />
      </div>
    </SceneFade>
  );
};

const Bubble: React.FC<{delay: number; x: number; y: number; text: string; color: string}> = ({delay, x, y, text, color}) => {
  const p = usePop(delay, 10);
  const frame = useCurrentFrame();
  const bob = Math.sin((frame + delay * 3) / 10) * 8;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        transform: `scale(${p})`,
        transformOrigin: 'left bottom',
        background: color,
        color: brand.ink,
        borderRadius: 60,
        padding: '26px 44px',
        fontFamily: brand.sans,
        fontWeight: 800,
        fontSize: 50,
        border: `5px solid ${brand.ink}`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

const MindToolkit: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 6) * 0.08;
  const reveal = interpolate(frame, [15, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const colors = [brand.amber, brand.mint, brand.cream];
  return (
    <SceneFade dur={120} bg={brand.ink}>
      <AbsoluteFill style={{padding: '210px 90px', gap: 26}}>
        <FadeUp delay={2}>
          <div style={{fontFamily: brand.sans, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: brand.amber}}>TOOLKIT 02</div>
        </FadeUp>
        <FadeUp delay={8}>
          <H size={110} color={brand.cream}>
            Inside the
            <br />
            Buyers Mind
          </H>
        </FadeUp>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 40, top: 860}}>
        <Head size={560} fill={brand.inkSoft} stroke={brand.cream}>
          <circle cx={185} cy={170} r={70 * reveal * pulse} fill={brand.amber} opacity={0.25} />
          <circle cx={185} cy={170} r={42 * reveal * pulse} fill={brand.amber} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + frame / 25;
            return <circle key={i} cx={185 + Math.cos(a) * 95 * reveal} cy={170 + Math.sin(a) * 65 * reveal} r={10} fill={brand.cream} opacity={reveal} />;
          })}
        </Head>
      </div>
      {toolkits.mind.points.map((t, i) => (
        <Bubble key={t} delay={40 + i * 20} x={470 + (i % 2) * 40} y={840 + i * 190} text={t} color={colors[i]} />
      ))}
    </SceneFade>
  );
};

const Pill: React.FC<{delay: number; text: string; bg: string}> = ({delay, text, bg}) => {
  const p = usePop(delay, 11);
  return (
    <div
      style={{
        transform: `scale(${p})`,
        background: bg,
        border: `5px solid ${brand.ink}`,
        borderRadius: 30,
        padding: '30px 40px',
        fontFamily: brand.sans,
        fontWeight: 800,
        fontSize: 48,
        color: brand.ink,
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const arrow = Math.sin(frame / 4) * 12;
  return (
    <SceneFade dur={110} bg={brand.cream}>
      <AbsoluteFill style={{padding: '300px 90px', gap: 40, alignItems: 'center', textAlign: 'center'}}>
        <FadeUp delay={2}>
          <H size={84} color={brand.ink} style={{fontWeight: 600}}>
            Fix the product.
            <br />
            Read the buyer.
          </H>
        </FadeUp>
        <div style={{height: 30}} />
        <FadeUp delay={16}>
          <H size={136} color={brand.ink}>
            The Buyers
            <br />
            <span style={{color: brand.amber}}>Mind</span>
          </H>
        </FadeUp>
        <div style={{height: 30}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 30, width: '100%'}}>
          <Pill delay={34} text={toolkits.fix.title} bg={brand.amber} />
          <Pill delay={44} text={toolkits.mind.title} bg={brand.mint} />
        </div>
        <FadeUp delay={60} style={{marginTop: 50}}>
          <div style={{fontFamily: brand.sans, fontWeight: 800, fontSize: 58, color: brand.ink}}>
            Link in bio <span style={{display: 'inline-block', transform: `translateX(${arrow}px)`}}>→</span>
          </div>
        </FadeUp>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const BuyersMind2D: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: brand.cream}}>
    <Sequence durationInFrames={110}>
      <Hook />
    </Sequence>
    <Sequence from={110} durationInFrames={130}>
      <TwoReasons />
    </Sequence>
    <Sequence from={240} durationInFrames={130}>
      <FixToolkit />
    </Sequence>
    <Sequence from={370} durationInFrames={120}>
      <MindToolkit />
    </Sequence>
    <Sequence from={490} durationInFrames={110}>
      <CTA />
    </Sequence>
  </AbsoluteFill>
);
