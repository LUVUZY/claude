import React, {useLayoutEffect} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {brand, toolkits} from './brand';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N_BUYERS = 6;
const RING = 3.4;
const FOCUS = 1; // which buyer the camera flies into

// Timeline (30fps, 480 frames):
//   0-140   buyers walk past / face away, product is dull
// 140-260   product gets fixed: lifts, spins, lights up
// 260-380   camera flies into one buyer's head: we see their mind
// 380-480   buyers turn to the product, wide shot + CTA
const camKeys = {
  f: [0, 140, 260, 300, 360, 400, 480],
  x: [7.5, 5.5, 4.2, 0.0, 0.0, 6.0, 8.0],
  y: [4.5, 3.2, 2.6, 2.4, 2.35, 5.0, 6.0],
  z: [7.5, 6.5, 4.6, 0.0, 0.0, 6.0, 4.0],
};

const buyerPos = (i: number) => {
  const a = (i / N_BUYERS) * Math.PI * 2 + 0.4;
  return {x: Math.cos(a) * RING, z: Math.sin(a) * RING, a};
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const focus = buyerPos(FOCUS);
  useLayoutEffect(() => {
    const e = {...clamp, easing: Easing.inOut(Easing.cubic)};
    let x = interpolate(frame, camKeys.f, camKeys.x, e);
    let y = interpolate(frame, camKeys.f, camKeys.y, e);
    let z = interpolate(frame, camKeys.f, camKeys.z, e);
    // during the "inside the mind" part, sit just outside the focused buyer's head
    // hard cuts in and out of the mind shot so the camera never clips through a buyer
    const inMind = interpolate(frame, [272, 273, 379, 380], [0, 1, 1, 0], clamp);
    const out = new THREE.Vector3(focus.x * 0.1, 2.6, focus.z * 0.1);
    x = THREE.MathUtils.lerp(x, out.x, inMind);
    y = THREE.MathUtils.lerp(y, out.y, inMind);
    z = THREE.MathUtils.lerp(z, out.z, inMind);
    camera.position.set(x, y, z);
    const look = new THREE.Vector3(0, 1.5, 0).lerp(new THREE.Vector3(focus.x, 1.9, focus.z), inMind);
    camera.lookAt(look);
  }, [frame, camera, focus.x, focus.z]);
  return null;
};

const Buyer: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {x, z, a} = buyerPos(i);
  // facing away from the centre, then turning to face the product
  const turn = spring({frame: frame - 380 - i * 4, fps, config: {damping: 14}});
  const facing = -a - Math.PI / 2; // faces centre (eyes sit on local +z)
  const away = facing + Math.PI;
  const rotY = THREE.MathUtils.lerp(away, facing, turn) + Math.sin((frame + i * 20) / 18) * 0.08 * (1 - turn);
  const bob = Math.abs(Math.sin((frame + i * 11) / 7)) * 0.06 * (1 - turn);
  const isFocus = i === FOCUS;
  const headOpacity = isFocus ? interpolate(frame, [273, 290, 370, 379], [1, 0.25, 0.25, 1], clamp) : 1;
  const mind = isFocus ? interpolate(frame, [285, 310], [0, 1], clamp) : 0;
  const doubtToSure = interpolate(frame, [330, 380], [0, 1], clamp);
  const doubt = new THREE.Color(brand.coral).lerp(new THREE.Color(brand.mint), doubtToSure);
  const body = i % 2 === 0 ? brand.cream : '#C9C2D6';
  return (
    <group position={[x, bob, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.9, 8, 16]} />
        <meshStandardMaterial color={body} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={body} roughness={0.5} transparent opacity={headOpacity} />
      </mesh>
      {/* eyes show which way they face */}
      {[-0.14, 0.14].map((ex) => (
        <mesh key={ex} position={[ex, 2.1, 0.38]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={brand.ink} transparent opacity={headOpacity} />
        </mesh>
      ))}
      {/* doubt bubble above the head */}
      <mesh position={[0, 2.85 + Math.sin((frame + i * 9) / 8) * 0.06, 0]} visible={!(isFocus && frame > 270 && frame < 385)}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={doubt} emissive={doubt} emissiveIntensity={0.8} />
      </mesh>
      {/* the mind: a glowing core with orbiting thoughts */}
      {isFocus && mind > 0 && (
        <group position={[0, 2.05, 0]} scale={mind}>
          <mesh>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshStandardMaterial color={brand.amber} emissive={brand.amber} emissiveIntensity={1.6} />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => {
            const t = frame / 14 + (k / 5) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(t) * 0.3, Math.sin(t * 1.3) * 0.12, Math.sin(t) * 0.3]}>
                <sphereGeometry args={[0.045, 12, 12]} />
                <meshStandardMaterial color={brand.cream} emissive={brand.cream} emissiveIntensity={1} />
              </mesh>
            );
          })}
          <pointLight color={brand.amber} intensity={3} distance={2} />
        </group>
      )}
    </group>
  );
};

const Product: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fix = spring({frame: frame - 150, fps, config: {damping: 16}});
  const lift = interpolate(frame, [150, 190, 240, 270], [0, 0.7, 0.7, 0.25], {...clamp, easing: Easing.inOut(Easing.quad)});
  const spin = interpolate(frame, [150, 250], [0, Math.PI * 2], {...clamp, easing: Easing.inOut(Easing.cubic)}) + frame / 90;
  const boxColor = new THREE.Color('#8A8A96').lerp(new THREE.Color(brand.cream), fix);
  const band = new THREE.Color('#5C5F70').lerp(new THREE.Color(brand.amber), fix);
  return (
    <group>
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.6, 48]} />
        <meshStandardMaterial color={brand.inkSoft} roughness={0.4} />
      </mesh>
      <group position={[0, 1.15 + lift, 0]} rotation={[0, spin, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color={boxColor} roughness={0.45} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.14, 0.24, 1.14]} />
          <meshStandardMaterial color={band} emissive={band} emissiveIntensity={fix * 0.7} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.24, 1.14, 1.14]} />
          <meshStandardMaterial color={band} emissive={band} emissiveIntensity={fix * 0.7} />
        </mesh>
      </group>
      <pointLight position={[0, 2.2, 0]} color={brand.amber} intensity={fix * 6} distance={6} />
      {/* glow ring on the floor once fixed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.2, 1.2 + 0.25 * fix, 64]} />
        <meshBasicMaterial color={brand.amber} transparent opacity={0.7 * fix} />
      </mesh>
    </group>
  );
};

const Scene: React.FC = () => (
  <>
    <color attach="background" args={[brand.ink]} />
    <fog attach="fog" args={[brand.ink, 10, 22]} />
    <ambientLight intensity={0.55} />
    <hemisphereLight args={['#ffffff', brand.ink, 0.6]} />
    <directionalLight position={[5, 9, 4]} intensity={1.6} castShadow />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[9, 64]} />
      <meshStandardMaterial color="#1E2240" roughness={0.9} />
    </mesh>
    <CameraRig />
    <Product />
    {Array.from({length: N_BUYERS}, (_, i) => (
      <Buyer key={i} i={i} />
    ))}
  </>
);

// ---------- 2D captions on top ----------
const Caption: React.FC<{from: number; to: number; kicker?: string; title: string; sub?: string; top?: number}> = ({
  from,
  to,
  kicker,
  title,
  sub,
  top = 200,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from - 2 || frame > to + 2) return null;
  const p = spring({frame: frame - from, fps, config: {damping: 14}});
  const out = interpolate(frame, [to - 10, to], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 80,
        right: 80,
        textAlign: 'center',
        opacity: Math.min(p, out),
        transform: `translateY(${(1 - p) * 50}px)`,
      }}
    >
      {kicker && <div style={{fontFamily: brand.sans, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: brand.amber, marginBottom: 18}}>{kicker}</div>}
      <div style={{fontFamily: brand.serif, fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: brand.cream, textShadow: '0 6px 30px rgba(0,0,0,0.5)'}}>
        {title}
      </div>
      {sub && <div style={{fontFamily: brand.sans, fontWeight: 600, fontSize: 48, color: brand.cream, opacity: 0.85, marginTop: 22}}>{sub}</div>}
    </div>
  );
};

export const BuyersMind3D: React.FC = () => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const arrow = Math.sin(frame / 4) * 10;
  return (
    <AbsoluteFill style={{backgroundColor: brand.ink}}>
      <ThreeCanvas width={width} height={height} shadows camera={{fov: 50, position: [7.5, 4.5, 7.5]}}>
        <Scene />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,23,43,0.85) 0%, rgba(20,23,43,0) 28%, rgba(20,23,43,0) 68%, rgba(20,23,43,0.85) 100%)'}} />
      <Caption from={6} to={135} title="They walked right past it." sub="Your product was there. The sale wasn't." />
      <Caption from={150} to={262} kicker={toolkits.fix.title.toUpperCase()} title="Fix what stops the sale." />
      <Caption from={275} to={378} kicker={toolkits.mind.title.toUpperCase()} title="See what they're thinking." />
      <Caption from={392} to={480} title="Now they're looking." top={170} />
      <Caption from={410} to={480} title="The Buyers Mind" sub="" top={1500} />
      {frame > 425 && (
        <div
          style={{
            position: 'absolute',
            bottom: 200,
            width: '100%',
            textAlign: 'center',
            fontFamily: brand.sans,
            fontWeight: 800,
            fontSize: 54,
            color: brand.amber,
            opacity: interpolate(frame, [425, 440], [0, 1], clamp),
          }}
        >
          2 toolkits · Link in bio <span style={{display: 'inline-block', transform: `translateX(${arrow}px)`}}>→</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
