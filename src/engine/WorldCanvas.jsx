import { Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { registry } from './sceneRegistry';
import CameraRig from './CameraRig';
import { useActiveScene } from './activeScene';
import { COLORS, SCENE_SPACING } from '../config/siteConfig';
import { scrollState } from '../state/scrollState';

function Fog({ active }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => { scene.fog = new THREE.Fog(COLORS.peach, 20, 90); return () => { scene.fog = null; }; }, [scene]);
  useFrame((_, dt) => {
    if (!scene.fog) return;
    const f = registry[active].fog || { near: 20, far: 90 };
    scene.fog.near = THREE.MathUtils.damp(scene.fog.near, f.near, 3, dt);
    scene.fog.far = THREE.MathUtils.damp(scene.fog.far, f.far, 3, dt);
  });
  return null;
}

// ONE fixed full-screen canvas. Only the active scene and its neighbours are mounted.
export default function WorldCanvas() {
  const active = useActiveScene();
  const low = scrollState.quality === 'low';
  const [dpr, setDpr] = useState(low ? 1 : 1.5);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const f = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);

  return (
    <div className="world">
      <Canvas
        dpr={dpr}
        frameloop={hidden ? 'never' : 'always'}
        camera={{ fov: 55, near: 0.1, far: 300, position: [0, 3, 17] }}
        gl={{ antialias: !low, powerPreference: 'high-performance' }}
        onCreated={() => { window.__dnmnReady = true; }}
      >
        <color attach="background" args={[COLORS.peach]} />
        <Fog active={active} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} />
        <PerformanceMonitor onDecline={() => { scrollState.quality = 'low'; setDpr(1); }} />
        <CameraRig />
        {registry.filter((s) => Math.abs(s.index - active) <= 1).map((s) => (
          <group key={s.id} position={[0, 0, -s.index * SCENE_SPACING]}>
            <Suspense fallback={null}><s.Scene /></Suspense>
          </group>
        ))}
      </Canvas>
    </div>
  );
}
