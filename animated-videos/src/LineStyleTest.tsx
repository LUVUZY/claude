import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Bubble, Camera, Caption, Cross, Crowd, Ground, Icon, Pawn, Pill, Spot, Trend, WordBox, fade, useSec} from './LineKit';

// Style test for the premium line kit: one continuous world, camera glides between four ideas.
export const LINE_TEST_FRAMES = 15 * 30;

const World: React.FC = () => {
  const s = useSec();
  return (
    <>
      {/* A: what sellers think (world 0,0) */}
      <Ground y={260} s={s} at={0} x0={-1400} x1={3600} />
      <Spot x={-120} y={260} op={fade(s, 0.1, 0.6)} />
      <Pill x={0} y={-330} text="WHAT MOST SELLERS FIX" size={34} s={s} at={0.2} />
      <Pawn x={-120} y={260} h={330} look="hero" op={fade(s, 0)} bob={Math.sin(s * 2) * 2} />
      <WordBox x={190} y={-20} w={380} h={170} text="THE PRICE" size={60} solid s={s} at={0.6} />
      <Crowd x={-760} y={260} n={3} gap={150} h={150} s={s} at={0.9} />
      <Crowd x={480} y={260} n={3} gap={150} h={150} s={s} at={1.0} />
      <Cross x={190} y={-20} size={170} s={s} at={2.3} />

      {/* B: what buyers actually ask (world 2000,0) */}
      <Pawn x={1560} y={260} h={300} look="hero" op={fade(s, 2.9)} />
      <Caption x={1560} y={290} text="THE BUYER" s={s} at={3.1} />
      <Bubble x={2160} y={-170} text="IS IT CHEAPER?" size={50} s={s} at={3.4} dim={s > 4.4} />
      <Cross x={2120} y={-170} size={120} s={s} at={4.3} />
      <Bubble x={2200} y={40} text="WILL THIS WORK FOR ME?" size={56} s={s} at={4.7} />

      {/* C: zoom out reveals the three things buyers weigh (world 2000, 900) */}
      <Pill x={2000} y={560} text="WHAT THEY WEIGH" size={30} s={s} at={6.9} />
      <Icon name="tag" x={1550} y={860} size={210} s={s} at={7.2} dim={s > 8.6} label="PRICE" />
      <Icon name="shield" x={2000} y={860} size={210} s={s} at={7.5} label="RISK" />
      <Icon name="eye" x={2450} y={860} size={210} s={s} at={7.8} label="PROOF" />

      {/* D: the payoff, a line that bends up (world 2000, 1900) */}
      <Trend x={1300} y={2150} pts={[[0, 0], [260, -20], [420, -10], [600, -90], [760, -150], [980, -330], [1300, -560]]} s={s} at={10.6} d={2.2} rider={90} />
      <Pill x={2000} y={1470} text="SAME PRODUCT. NEW PITCH." size={40} look="solid" s={s} at={10.6} />
      <Caption x={2000} y={2215} text="SELL THE OUTCOME, NOT THE DISCOUNT" s={s} at={12.6} />
    </>
  );
};

export const LineStyleTest: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Camera
      keys={[
        {t: 0, x: 0, y: -30, z: 1.0},
        {t: 2.8, x: 0, y: -30, z: 1.06},
        {t: 3.6, x: 1900, y: -40, z: 1.0},
        {t: 6.4, x: 1900, y: -40, z: 1.05},
        {t: 7.3, x: 2000, y: 760, z: 0.92},
        {t: 10.0, x: 2000, y: 780, z: 0.97},
        {t: 10.9, x: 2000, y: 1850, z: 1.0},
        {t: 15, x: 2000, y: 1850, z: 1.05},
      ]}
    >
      <World />
    </Camera>
  </AbsoluteFill>
);
