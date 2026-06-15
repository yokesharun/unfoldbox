import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { BoxDimensions } from '../../utils/geometry';
import type { PanelTheme } from '../../hooks/usePanelThemes';

interface Props {
  dims: BoxDimensions;
  themes: Record<string, PanelTheme>;
}

const FACE_PANEL_MAP = ['right-side', 'left-side', 'tuck-flap-front', 'bottom-tuck-front', 'front', 'back'];

function BoxMesh({ dims, themes }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });

  const materials = useMemo(() => {
    return FACE_PANEL_MAP.map(panelId => {
      const theme = themes[panelId];
      if (theme?.imageUrl) {
        const tex = new THREE.TextureLoader().load(theme.imageUrl);
        return new THREE.MeshStandardMaterial({ map: tex });
      }
      return new THREE.MeshStandardMaterial({ color: theme?.color ?? '#a8d5dc' });
    });
  }, [themes]);

  const scale = 0.015;
  const w = dims.length * scale;
  const h = dims.height * scale;
  const d = dims.width * scale;

  return (
    <mesh ref={meshRef} material={materials}>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
}

export default function Box3DViewer({ dims, themes }: Props) {
  return (
    <Canvas camera={{ position: [3, 2, 4], fov: 45 }} style={{ background: '#1a1a2e', borderRadius: 8 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment preset="city" />
      <BoxMesh dims={dims} themes={themes} />
      <OrbitControls enablePan={false} minDistance={1} maxDistance={10} />
    </Canvas>
  );
}
