import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { BoxDimensions, BoxType } from '../../utils/geometry';
import type { PanelTheme } from '../../hooks/usePanelThemes';

interface Props {
  dims: BoxDimensions;
  themes: Record<string, PanelTheme>;
  boxType?: BoxType;
}

// boxGeometry face order: [ +x, -x, +y, -y, +z, -z ]
const REVERSE_TUCK_FACES = ['right-side', 'left-side', 'tuck-flap-front', 'bottom-tuck-front', 'front', 'back'];
const WRAP_CARD_FACES    = ['wc-wing-right', 'wc-wing-left', 'wc-top-flap', 'wc-bottom-flap', 'wc-front', 'wc-back'];

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

function BoxScene({ dims, themes, boxType }: Required<Props>) {
  const groupRef = useRef<THREE.Group>(null);

  const MM: Record<string, number> = { mm: 1, cm: 10, inch: 25.4, px: 0.2646 };
  const toMm = (v: number) => v * (MM[dims.unit] ?? 1);
  const scale = 0.015;

  const w = toMm(dims.length) * scale;
  const isWrap = boxType === 'wrap-card';
  // Reverse tuck: full box. Wrap card: thin folded pouch (back+front faces, thin depth).
  const h = toMm(dims.height) * scale;
  const d = isWrap ? Math.max(w * 0.08, 0.03) : toMm(dims.width) * scale;

  const faceIds = isWrap ? WRAP_CARD_FACES : REVERSE_TUCK_FACES;

  const bodyMats = useMemo(() => faceIds.map(id => {
    const theme = themes[id];
    if (theme?.imageUrl) {
      const tex = new THREE.TextureLoader().load(theme.imageUrl);
      return new THREE.MeshStandardMaterial({ map: tex });
    }
    const tex = makeKraftTexture(theme?.color ?? '#a8d5dc');
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0 });
  }), [themes, faceIds]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={groupRef}>
      <mesh material={bodyMats}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
    </group>
  );
}

export default function Box3DViewer({ dims, themes, boxType = 'reverse-tuck' }: Props) {
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
        <BoxScene dims={dims} themes={themes} boxType={boxType} />
        <OrbitControls enablePan={false} minDistance={1} maxDistance={12} />
      </Canvas>
    </div>
  );
}
