import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import type { BoxDimensions } from '../../utils/geometry';
import type { PanelTheme } from '../../hooks/usePanelThemes';

interface Props {
  dims: BoxDimensions;
  themes: Record<string, PanelTheme>;
}

type AnimPhase = 'idle' | 'opening' | 'spinning' | 'closing';

const FACE_PANEL_MAP = ['right-side', 'left-side', 'tuck-flap-front', 'bottom-tuck-front', 'front', 'back'];

function makeKraftTexture(color: string): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 5000; i++) {
    const gx = Math.random() * size;
    const gy = Math.random() * size;
    const alpha = Math.random() * 0.12;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(gx, gy, 1 + Math.random(), 1 + Math.random());
  }
  for (let i = 0; i < 25; i++) {
    const fy = Math.random() * size;
    ctx.strokeStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.04})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, fy);
    ctx.lineTo(size, fy + (Math.random() * 4 - 2));
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

function useMaterial(panelId: string, themes: Record<string, PanelTheme>) {
  return useMemo(() => {
    const theme = themes[panelId];
    if (theme?.imageUrl) {
      const tex = new THREE.TextureLoader().load(theme.imageUrl);
      return new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide });
    }
    const tex = makeKraftTexture(theme?.color ?? '#a8d5dc');
    return new THREE.MeshStandardMaterial({
      map: tex,
      side: THREE.DoubleSide,
      roughness: 0.88,
      metalness: 0,
    });
  }, [themes, panelId]);
}

function BoxScene({ dims, themes, phase }: Props & { phase: AnimPhase }) {
  const groupRef = useRef<THREE.Group>(null);

  const MM: Record<string, number> = { mm: 1, cm: 10, inch: 25.4, px: 0.2646 };
  const toMm = (v: number) => v * (MM[dims.unit] ?? 1);
  const scale = 0.015;
  const w = toMm(dims.length) * scale;
  const h = toMm(dims.height) * scale;
  const d = toMm(dims.width) * scale;
  const flapH = Math.min(toMm(dims.tuckFlapSize) * scale, h * 0.28);

  const { topAngle, botAngle } = useSpring({
    topAngle: (phase === 'opening' || phase === 'spinning') ? -2.0 : 0,
    botAngle: (phase === 'opening' || phase === 'spinning') ? 2.0 : 0,
    config: { tension: 80, friction: 18 },
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = phase === 'spinning' ? 2.2 : 0.35;
    groupRef.current.rotation.y += delta * speed;
  });

  const bodyMats = useMemo(() => FACE_PANEL_MAP.map(id => {
    const theme = themes[id];
    if (theme?.imageUrl) {
      const tex = new THREE.TextureLoader().load(theme.imageUrl);
      return new THREE.MeshStandardMaterial({ map: tex });
    }
    const tex = makeKraftTexture(theme?.color ?? '#a8d5dc');
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0 });
  }), [themes]);

  const topFlapMat = useMaterial('tuck-flap-front', themes);
  const botFlapMat = useMaterial('bottom-tuck-front', themes);

  const showFlaps = phase !== 'idle';

  return (
    <group ref={groupRef}>
      <mesh material={bodyMats}>
        <boxGeometry args={[w, h, d]} />
      </mesh>

      {/* Top flap — hinges at y = h/2 */}
      <group position={[0, h / 2 + 0.001, 0]}>
        <animated.group rotation-x={topAngle}>
          <mesh material={topFlapMat} position={[0, flapH / 2, 0]} visible={showFlaps}>
            <planeGeometry args={[w * 0.96, flapH]} />
          </mesh>
        </animated.group>
      </group>

      {/* Bottom flap — hinges at y = -h/2 */}
      <group position={[0, -h / 2 - 0.001, 0]}>
        <animated.group rotation-x={botAngle}>
          <mesh material={botFlapMat} position={[0, -flapH / 2, 0]} visible={showFlaps}>
            <planeGeometry args={[w * 0.96, flapH]} />
          </mesh>
        </animated.group>
      </group>
    </group>
  );
}

export default function Box3DViewer({ dims, themes }: Props) {
  const [phase, setPhase] = useState<AnimPhase>('idle');

  function animate() {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => setPhase('spinning'), 1500);
    setTimeout(() => setPhase('closing'), 3500);
    setTimeout(() => setPhase('idle'), 5000);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [2, 1.4, 2.8], fov: 38 }}
        style={{ background: '#ffffff', borderRadius: 8 }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <directionalLight position={[-5, 2, -5]} intensity={0.4} />
        <Environment preset="warehouse" />
        <BoxScene dims={dims} themes={themes} phase={phase} />
        <OrbitControls enablePan={false} minDistance={1} maxDistance={12} />
      </Canvas>

      <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={animate}
          disabled={phase !== 'idle'}
          style={{
            background: phase !== 'idle'
              ? '#ccc'
              : 'linear-gradient(135deg, #FF6B6B, #FFC947)',
            border: 'none',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(255,107,107,0.4)',
          }}
        >
          {phase === 'idle' ? 'Animate' : 'Animating…'}
        </Button>
      </div>
    </div>
  );
}
