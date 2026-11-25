import React from 'react';

// A faceless mannequin figure drawn from joint angles (degrees).
// Limb angles are measured from "straight down"; positive swings forward (toward the way the figure faces).
export type Pose = {
  torso: number; // lean forward from upright
  head: number; // extra tilt of the head
  armFront: [number, number]; // shoulder, elbow
  armBack: [number, number];
  legFront: [number, number]; // hip, knee (knee bends backward = negative)
  legBack: [number, number];
};

const L = {torso: 96, neck: 36, head: 31, upper: 56, fore: 52, thigh: 64, shin: 70};
const rad = (d: number) => (d * Math.PI) / 180;
const down = (len: number, deg: number) => [Math.sin(rad(deg)) * len, Math.cos(rad(deg)) * len];

export const poses: Record<string, Pose> = {
  stand: {torso: 0, head: 0, armFront: [6, 4], armBack: [-6, 4], legFront: [3, 0], legBack: [-3, 0]},
  sitWork: {torso: 8, head: 8, armFront: [55, 55], armBack: [45, 60], legFront: [90, -90], legBack: [86, -88]},
  sitAsk: {torso: 14, head: -6, armFront: [80, -5], armBack: [30, 40], legFront: [90, -90], legBack: [86, -88]},
  sitSlump: {torso: 30, head: 38, armFront: [12, 8], armBack: [6, 6], legFront: [90, -90], legBack: [86, -88]},
};

export const walkPose = (phase: number): Pose => {
  const s = Math.sin(phase);
  return {
    torso: 4,
    head: 0,
    armFront: [-22 * s, 18],
    armBack: [22 * s, 18],
    legFront: [26 * s, -Math.max(0, 40 * Math.sin(phase + 1.6))],
    legBack: [-26 * s, -Math.max(0, 40 * Math.sin(phase + 1.6 + Math.PI))],
  };
};

export const Figure: React.FC<{x: number; y: number; pose: Pose; facing?: 1 | -1; scale?: number; color?: string}> = ({
  x,
  y,
  pose,
  facing = 1,
  scale = 1,
  color = '#E6E6EA',
}) => {
  // hip at (0,0)
  const neck = [Math.sin(rad(pose.torso)) * L.torso, -Math.cos(rad(pose.torso)) * L.torso];
  const headC = [neck[0] + Math.sin(rad(pose.torso + pose.head)) * L.neck, neck[1] - Math.cos(rad(pose.torso + pose.head)) * L.neck];
  const shoulder = [neck[0] - Math.sin(rad(pose.torso)) * 10, neck[1] + Math.cos(rad(pose.torso)) * 10];
  const limb = (origin: number[], a: [number, number], l1: number, l2: number) => {
    const j = down(l1, a[0]);
    const mid = [origin[0] + j[0], origin[1] + j[1]];
    const k = down(l2, a[0] + a[1]);
    return `M${origin[0]} ${origin[1]} L${mid[0]} ${mid[1]} L${mid[0] + k[0]} ${mid[1] + k[1]}`;
  };
  const back = shade(color, 0.72);
  const W = 22;
  return (
    <svg
      style={{position: 'absolute', left: x - 150, top: y - 200, overflow: 'visible', transform: `scale(${facing * scale}, ${scale})`, transformOrigin: '150px 200px'}}
      width={300}
      height={340}
    >
      <g transform="translate(150 200)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={limb([0, 0], pose.legBack, L.thigh, L.shin)} stroke={back} strokeWidth={W + 2} />
        <path d={limb(shoulder, pose.armBack, L.upper, L.fore)} stroke={back} strokeWidth={W - 3} />
        <path d={`M0 0 L${neck[0]} ${neck[1]}`} stroke={color} strokeWidth={W + 14} />
        <path d={limb([0, 0], pose.legFront, L.thigh, L.shin)} stroke={color} strokeWidth={W + 2} />
        <path d={limb(shoulder, pose.armFront, L.upper, L.fore)} stroke={color} strokeWidth={W - 3} />
        <circle cx={headC[0]} cy={headC[1]} r={L.head} fill={color} />
        {/* soft shading on the back of the head */}
        <circle cx={headC[0] - 7} cy={headC[1] + 3} r={L.head - 4} fill="none" stroke={back} strokeOpacity={0.35} strokeWidth={6} strokeDasharray="40 200" />
      </g>
    </svg>
  );
};

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}
