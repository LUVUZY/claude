import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CryoFigure, POSES, typing} from './CryoFigure';

// Calibration only (not for posting): rebuild cryothum's opening shot to measure how close we can get.
const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const G = '#D8D8D8';
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Monitor: React.FC<{s: number}> = ({s}) => {
  const play = ((s * 0.22) % 1) * 560;
  const rows = [
    [[0, 70], [130, 105], [270, 140], [470, 70]],
    [[60, 110], [210, 150], [380, 90]],
    [[30, 120], [190, 100], [330, 70], [450, 120]],
  ];
  return (
    <div style={{position: 'absolute', left: 655, top: 340, width: 640, height: 418, borderRadius: 18, border: `6px solid ${G}`, background: 'rgba(10,10,10,0.9)', boxShadow: '0 0 60px rgba(255,255,255,0.18), inset 0 0 40px rgba(255,255,255,0.06)'}}>
      <div style={{position: 'absolute', left: 135, top: 38, width: 360, height: 150, background: '#3A3A3A', borderRadius: 4}} />
      <div style={{position: 'absolute', left: 285, top: 82, width: 62, height: 62, borderRadius: 31, background: '#F0F0F0'}} />
      <div style={{position: 'absolute', left: 308, top: 98, width: 0, height: 0, borderTop: '15px solid transparent', borderBottom: '15px solid transparent', borderLeft: '22px solid #2a2a2a'}} />
      {rows.map((r, ri) =>
        r.map(([x0, w], k) => (
          <div key={`${ri}-${k}`} style={{position: 'absolute', left: 35 + x0, top: 236 + ri * 52, width: w, height: 26, background: (ri + k) % 3 === 0 ? '#9E9E9E' : '#E6E6E6', borderRadius: 2}} />
        )),
      )}
      <div style={{position: 'absolute', left: 30 + play, top: 214, width: 4, height: 180, background: '#F2F2F2'}} />
      <div style={{position: 'absolute', left: 22 + play, top: 206, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '14px solid #F2F2F2'}} />
      {/* stand */}
      <div style={{position: 'absolute', left: 280, top: 418, width: 80, height: 26, background: '#BDBDBD'}} />
    </div>
  );
};

const PYRAMID: {x: number; y: number; row: number}[] = [];
for (let row = 0; row < 9; row++) for (let k = 0; k < 11 - row; k++) PYRAMID.push({x: 1420 + row * 55 + k * 108, y: 1048 - row * 62, row});

const Bill: React.FC<{x: number; y: number; rot?: number; op?: number}> = ({x, y, rot = 0, op = 1}) => (
  <div style={{position: 'absolute', left: x - 50, top: y - 30, width: 100, height: 60, borderRadius: 5, background: '#E2E2E2', border: '3px solid #8E8E8E', rotate: `${rot}deg`, opacity: op, display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 26, color: '#5A5A5A', boxShadow: '0 0 16px rgba(255,255,255,0.25)'}}>
    <span>$</span>
    <span>$</span>
  </div>
);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const zoom = interpolate(s, [0, 4.3], [1.0, 0.7], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const win = s > 3.3 ? interpolate(s, [3.3, 3.6], [0, 1], clamp) : 0;
  const worth = Math.round(interpolate(s, [0, 4.3], [0, 1], clamp) ** 2.6 * 1009400 + 18142);
  const typingAngle = typing(s, 3);
  const cups = Math.floor(interpolate(s, [0.9, 3.0], [0, 6], clamp));
  return (
    <AbsoluteFill style={{background: '#121212'}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px'}} />
      <AbsoluteFill style={{scale: `${zoom}`, transformOrigin: '18% 100%'}}>
        {/* soft room light */}
        <div style={{position: 'absolute', left: 300, top: 0, width: 1400, height: 1080, background: 'radial-gradient(ellipse 50% 60% at 50% 55%, rgba(255,255,255,0.08), transparent 70%)'}} />
        {/* window */}
        <div style={{position: 'absolute', left: -20, top: 30, width: 320, height: 310, border: `7px solid #BDBDBD`, borderLeft: 'none'}}>
          <div style={{position: 'absolute', left: 150, top: 0, width: 7, height: '100%', background: '#BDBDBD'}} />
          <div style={{position: 'absolute', left: 0, top: 150, width: '100%', height: 7, background: '#BDBDBD'}} />
          <div style={{position: 'absolute', left: 215, top: 55, width: 34, height: 34, borderRadius: 17, boxShadow: '-9px 5px 0 0 #E8E8E8', opacity: 0.9}} />
        </div>
        <Monitor s={s} />
        {/* desk */}
        <div style={{position: 'absolute', left: 590, top: 806, width: 810, height: 16, border: `5px solid ${G}`, borderRadius: 3}} />
        <div style={{position: 'absolute', left: 612, top: 822, width: 5, height: 300, background: G}} />
        <div style={{position: 'absolute', left: 1345, top: 822, width: 5, height: 300, background: G}} />
        {/* coffee cups stacking: time passing */}
        {Array.from({length: cups}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: 1312, top: 806 - (i + 1) * 54, width: 52, height: 54, clipPath: 'polygon(0 0, 100% 0, 88% 100%, 12% 100%)', background: '#DADADA', border: '3px solid #F2F2F2', opacity: 0.95}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 10, height: 6, background: '#9C9C9C'}} />
          </div>
        ))}
        {/* money sliding in along the floor, then piling up */}
        {PYRAMID.map((b, i) => {
          const t0 = 1.3 + i * 0.028;
          if (s < t0) return null;
          const p = interpolate(s, [t0, t0 + 0.35], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return <Bill key={i} x={b.row === 0 ? interpolate(p, [0, 1], [3300, b.x]) : b.x} y={b.row === 0 ? b.y : interpolate(p, [0, 1], [b.y - 700, b.y])} op={Math.min(1, p * 2)} />;
        })}
        {s > 1.8 &&
          Array.from({length: 11}, (_, i) => {
            const life = ((s - 1.8) * 0.75 + rand(i)) % 1;
            return <Bill key={`f${i}`} x={1400 + rand(i + 9) * 1000} y={-650 + life * 1500} rot={life * 400 * (i % 2 ? 1 : -1)} op={1 - life * 0.4} />;
          })}
        {/* the figure: big, close to camera, cut off by the bottom of the frame */}
        <CryoFigure x={455} y={1085} R={84} front={win > 0.5 ? POSES.cheer.front : POSES.type(typingAngle).front} back={win > 0.5 ? POSES.cheer.back : null} tilt={win > 0.5 ? 0 : 5} headBob={Math.sin(s * 9) * 2} breath={0.5 + 0.5 * Math.sin(s * 3)} ring={false} />
        {/* the payoff: arms up, a glowing check on the screen */}
        {win > 0 && (
          <div style={{position: 'absolute', left: 975 - 70, top: 470, width: 140, height: 140, borderRadius: 70, background: '#F2F2F2', opacity: win, scale: `${0.5 + 0.5 * win}`, boxShadow: '0 0 90px rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={80} height={80} viewBox="0 0 80 80"><path d="M18 42 L34 58 L62 24" stroke="#1a1a1a" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        )}
        {/* floor */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1075, height: 3, backgroundImage: 'linear-gradient(90deg, rgba(220,220,220,0.5) 55%, transparent 55%)', backgroundSize: '26px 3px'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// bloom: the same scene blurred and screened on top, plus a touch of softness and a vignette
export const CryoCalibration: React.FC = () => (
  <AbsoluteFill style={{background: '#121212'}}>
    <AbsoluteFill style={{filter: 'blur(0.7px)'}}>
      <Scene />
    </AbsoluteFill>
    <AbsoluteFill style={{filter: 'blur(16px) brightness(1.3)', opacity: 0.5, mixBlendMode: 'screen'}}>
      <Scene />
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.6) 100%)'}} />
    <Counter />
  </AbsoluteFill>
);

const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const s = frame / FPS;
  const worth = Math.round(interpolate(s, [0, 4.3], [0, 1], clamp) ** 2.6 * 1009400 + 18142);
  const x = interpolate(s, [0, 4.3], [975, 640], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const sc = interpolate(s, [0, 4.3], [1, 0.75], clamp);
  return (
        <div style={{position: 'absolute', left: x - 415, width: 830, top: 20, scale: `${sc}`, transformOrigin: '50% 0', textAlign: 'center', fontFamily: 'Inter, sans-serif', color: '#E6E6E6'}}>
          <div style={{fontWeight: 700, fontSize: 30, letterSpacing: 8, color: '#BDBDBD'}}>NET WORTH</div>
          <div style={{fontWeight: 900, fontSize: 136, lineHeight: 1.05, filter: 'drop-shadow(0 0 22px rgba(255,255,255,0.35))'}}>${worth.toLocaleString('en-US')}</div>
        </div>
  );
};
