import React from 'react';

// A figure built to match cryothum's: circle head floating over an arch-shaped body (no legs),
// thick single-bar arms that come straight out of the shoulders, soft grey shading and a soft glow.
// Origin (x, y) is the bottom centre of the body. R = head radius; everything scales from it.
export type Arm = {angle: number; len?: number}; // angle in degrees: 0 = straight down, 90 = pointing forward, 180 = straight up

export const CryoFigure: React.FC<{
  x: number;
  y: number;
  R?: number;
  front?: Arm | null;
  back?: Arm | null;
  facing?: 1 | -1;
  tilt?: number; // whole-body lean in degrees
  headBob?: number; // px
  breath?: number; // 0..1 body squash for breathing
  dim?: number;
  ring?: boolean;
  children?: React.ReactNode; // things held in the front hand, drawn in hand space
}> = ({x, y, R = 80, front = {angle: 12}, back = {angle: -12}, facing = 1, tilt = 0, headBob = 0, breath = 0, dim = 0, ring = true, children}) => {
  const bodyW = R * 3.3;
  const bodyH = R * 3.7 * (1 - breath * 0.015);
  const gap = R * 0.28;
  const T = R * 0.78; // arm thickness
  const shoulderY = -bodyH + R * 0.42;
  const shoulderX = bodyW * 0.3;
  const top = 235 - dim * 130;
  const bottom = 205 - dim * 120;
  const id = `g${Math.round(x)}${Math.round(y)}${Math.round(R)}`;
  const arm = (a: Arm, side: 1 | -1, key: string, isFront: boolean) => {
    const len = (a.len ?? 3.0) * R;
    return (
      <g key={key} transform={`translate(${side * shoulderX * (isFront ? 1 : 0.6)} ${shoulderY}) rotate(${-a.angle})`}>
        <rect x={-T / 2} y={-T / 2} width={T} height={len + T / 2} rx={T / 2} fill={`url(#arm-${id})`} />
        {isFront && children && <g transform={`translate(0 ${len})`}>{children}</g>}
      </g>
    );
  };
  return (
    <svg style={{position: 'absolute', left: x - R * 6, top: y - R * 12, overflow: 'visible', filter: dim > 0.5 ? undefined : 'drop-shadow(0 0 26px rgba(255,255,255,0.22))'}} width={R * 12} height={R * 12}>
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgb(${top},${top},${top})`} />
          <stop offset="1" stopColor={`rgb(${bottom},${bottom},${bottom})`} />
        </linearGradient>
        <linearGradient id={`arm-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgb(${top},${top},${top})`} />
          <stop offset="1" stopColor={`rgb(${top - 8},${top - 8},${top - 8})`} />
        </linearGradient>
      </defs>
      <g transform={`translate(${R * 6} ${R * 12}) scale(${facing} 1) rotate(${tilt})`}>
        {ring && <ellipse cx={0} cy={0} rx={bodyW * 0.85} ry={R * 0.32} fill="none" stroke="rgba(220,220,220,0.35)" strokeWidth={3} strokeDasharray="10 9" />}
        {back && arm(back, -1, 'back', false)}
        <path
          d={`M${-bodyW / 2} 0 L${-bodyW / 2} ${-bodyH + bodyW * 0.42} Q${-bodyW / 2} ${-bodyH} 0 ${-bodyH} Q${bodyW / 2} ${-bodyH} ${bodyW / 2} ${-bodyH + bodyW * 0.42} L${bodyW / 2} 0 Z`}
          fill={`url(#body-${id})`}
        />
        <circle cx={0} cy={-bodyH - gap - R + headBob} r={R} fill={`rgb(${top + 6},${top + 6},${top + 6})`} />
        {front && arm(front, 1, 'front', true)}
      </g>
    </svg>
  );
};
