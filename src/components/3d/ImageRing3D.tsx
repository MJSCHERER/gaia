import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

/* =========================
   Types
========================= */

type ArtistImage = {
  id: number;
  title: string;
  color: string;
};

type Artist = {
  id: string;
  name: string;
  color: string;
  images: ArtistImage[];
};

type ImagePosition = {
  position: [number, number, number];
  rotation: [number, number, number];
};

/* =========================
   Data
========================= */

const artists: Artist[] = [
  {
    id: 'mel',
    name: 'Mel',
    color: '#8B5CF6',
    images: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      title: `Artwork ${i + 1}`,
      color: '#A78BFA',
    })),
  },
  {
    id: 'lena',
    name: 'Lena',
    color: '#EC4899',
    images: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 11,
      title: `Artwork ${i + 11}`,
      color: '#F9A8D4',
    })),
  },
];

/* =========================
   Image Card
========================= */

function ImageCard({
  image,
  position,
  rotation,
  scale,
  onClick,
  isExpanded,
}: {
  image: ArtistImage;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  onClick: () => void;
  isExpanded: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;

    const targetScale = hovered || isExpanded ? scale * 1.1 : scale;
    const current = meshRef.current.scale.x;
    const next = THREE.MathUtils.lerp(current, targetScale, 0.1);

    meshRef.current.scale.setScalar(next);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <meshStandardMaterial color={image.color} transparent opacity={0.9} side={THREE.DoubleSide} />

      {/* Label – visual only */}
      <Html
        transform={false}
        occlude={false}
        position={[0, 0, 0.01]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-white/80 text-xs font-medium text-center">{image.title}</div>
      </Html>
    </mesh>
  );
}

/* =========================
   Artist Ring
========================= */

function ArtistRing({
  artist,
  isSelected,
  onSelect,
}: {
  artist: Artist;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const imagePositions = useMemo<ImagePosition[]>(() => {
    const positions: ImagePosition[] = [];
    const count = artist.images.length;

    if (!expanded) {
      const radius = 3;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push({
          position: [Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius],
          rotation: [0, -angle + Math.PI / 2, 0],
        });
      }
    } else {
      const radius = 5;
      for (let i = 0; i < count; i++) {
        const angle = ((i - count / 2) / count) * Math.PI * 0.8;
        const r = radius + Math.abs(i - count / 2) * 0.3;
        positions.push({
          position: [Math.sin(angle) * r, (i - count / 2) * 0.3, Math.cos(angle) * r - 2],
          rotation: [0, angle, 0],
        });
      }
    }

    return positions;
  }, [expanded, artist.images]);

  useFrame(() => {
    if (groupRef.current && !isSelected) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const handleArtistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isSelected) {
      onSelect();
      setExpanded(true);
    }
  };

  return (
    <group ref={groupRef}>
      {/* Artist Button */}
      <Html
        position={[0, 2.5, 0]}
        center
        transform={false}
        occlude={false}
        style={{ pointerEvents: 'auto', zIndex: 50 }}
      >
        <button
          onClick={handleArtistClick}
          className={`px-6 py-3 rounded-full font-bold text-white transition-all ${
            isSelected
              ? 'bg-violet-600 scale-110'
              : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
          }`}
        >
          {artist.name}
        </button>
      </Html>

      {artist.images.map((image, i) => (
        <ImageCard
          key={image.id}
          image={image}
          position={imagePositions[i].position}
          rotation={imagePositions[i].rotation}
          scale={expanded ? 1.2 : 0.8}
          isExpanded={expanded}
          onClick={() => navigate(`/artwork/${image.id}`)}
        />
      ))}

      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={artist.color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* =========================
   Particles (Stable)
========================= */
function createSeededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const rand = createSeededRandom(42);
    const positions = new Float32Array(200 * 3);

    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (rand() - 0.5) * 20;
      positions[i * 3 + 1] = (rand() - 0.5) * 20;
      positions[i * 3 + 2] = (rand() - 0.5) * 20;
    }

    return positions;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* =========================
   Scene
========================= */

function Scene() {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {artists.map((artist, i) => (
        <group
          key={artist.id}
          position={[i === 0 ? -2 : 2, 0, selectedArtist === artist.id ? 2 : 0]}
        >
          <ArtistRing
            artist={artist}
            isSelected={selectedArtist === artist.id}
            onSelect={() => setSelectedArtist(artist.id)}
          />
        </group>
      ))}

      <Particles />
    </>
  );
}

/* =========================
   Export
========================= */

export default function ImageRing3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      eventPrefix="client"
    >
      <Scene />
    </Canvas>
  );
}
