import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

// Artist data
const artists = [
  {
    id: 'mel',
    name: 'Mel',
    color: '#8B5CF6',
    images: [
      { id: 1, title: 'Cosmic Dreams', color: '#A78BFA' },
      { id: 2, title: 'Nature\'s Whisper', color: '#C4B5FD' },
      { id: 3, title: 'Ethereal Light', color: '#DDD6FE' },
      { id: 4, title: 'Mystic Forest', color: '#EDE9FE' },
      { id: 5, title: 'Starlight', color: '#F5F3FF' },
      { id: 6, title: 'Moon Garden', color: '#A78BFA' },
      { id: 7, title: 'Dreamscape', color: '#C4B5FD' },
      { id: 8, title: 'Celestial', color: '#DDD6FE' },
      { id: 9, title: 'Aurora', color: '#EDE9FE' },
      { id: 10, title: 'Twilight', color: '#F5F3FF' },
    ],
  },
  {
    id: 'lena',
    name: 'Lena',
    color: '#EC4899',
    images: [
      { id: 11, title: 'Portrait I', color: '#F9A8D4' },
      { id: 12, title: 'Expression', color: '#FBCFE8' },
      { id: 13, title: 'Identity', color: '#FCE7F3' },
      { id: 14, title: 'Emotion', color: '#FDF2F8' },
      { id: 15, title: 'Soul', color: '#F9A8D4' },
      { id: 16, title: 'Vision', color: '#FBCFE8' },
      { id: 17, title: 'Dream', color: '#FCE7F3' },
      { id: 18, title: 'Reality', color: '#FDF2F8' },
      { id: 19, title: 'Memory', color: '#F9A8D4' },
      { id: 20, title: 'Future', color: '#FBCFE8' },
    ],
  },
];

// Image Card Component
function ImageCard({
  image,
  position,
  rotation,
  scale,
  onClick,
  isExpanded,
}: {
  image: any;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  onClick: () => void;
  isExpanded: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(
          meshRef.current.scale.x,
          hovered || isExpanded ? scale * 1.1 : scale,
          0.1
        )
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1.5, 1.5]} />
      <meshStandardMaterial
        color={image.color}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
      />
      <Html
        transform
        occlude
        position={[0, 0, 0.01]}
        style={{
          width: '150px',
          height: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div className="text-center p-2">
          <div className="text-white/80 text-xs font-medium line-clamp-2">
            {image.title}
          </div>
        </div>
      </Html>
    </mesh>
  );
}

// Artist Ring Component
function ArtistRing({
  artist,
  isSelected,
  onSelect,
}: {
  artist: typeof artists[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const imagePositions = useMemo(() => {
    const positions: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [];

    if (!expanded) {
      // Collapsed state - images form a ring
      const radius = 3;
      const count = artist.images.length;
      artist.images.forEach((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        positions.push({
          position: [
            Math.cos(angle) * radius,
            Math.sin(angle) * 0.5,
            Math.sin(angle) * radius,
          ],
          rotation: [0, -angle + Math.PI / 2, 0],
        });
      });
    } else {
      // Expanded state - images fan out
      const count = artist.images.length;
      const radius = 5;
      artist.images.forEach((_, i) => {
        const angle = ((i - count / 2) / count) * Math.PI * 0.8;
        const r = radius + Math.abs(i - count / 2) * 0.3;
        positions.push({
          position: [
            Math.sin(angle) * r,
            (i - count / 2) * 0.3,
            Math.cos(angle) * r - 2,
          ],
          rotation: [0, angle, 0],
        });
      });
    }

    return positions;
  }, [expanded, artist.images.length]);

  useFrame(() => {
    if (groupRef.current && !isSelected) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const handleClick = () => {
    if (!isSelected) {
      onSelect();
      setExpanded(true);
    }
  };

  const handleImageClick = (imageId: number) => {
    navigate(`/artwork/${imageId}`);
  };

  return (
    <group ref={groupRef}>
      {/* Artist Label */}
      <Html position={[0, 2.5, 0]} center>
        <button
          onClick={handleClick}
          className={`px-6 py-3 rounded-full font-bold text-white transition-all ${
            isSelected
              ? 'bg-violet-600 scale-110'
              : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
          }`}
        >
          {artist.name}
        </button>
      </Html>

      {/* Images */}
      {artist.images.map((image, i) => (
        <ImageCard
          key={image.id}
          image={image}
          position={imagePositions[i]?.position || [0, 0, 0]}
          rotation={imagePositions[i]?.rotation || [0, 0, 0]}
          scale={expanded ? 1.2 : 0.8}
          onClick={() => handleImageClick(image.id)}
          isExpanded={expanded}
        />
      ))}

      {/* Center glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={artist.color}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Scene Component
function Scene() {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10);
  }, [camera]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />

      {/* Artist Rings */}
      {artists.map((artist, index) => (
        <group
          key={artist.id}
          position={[
            index === 0 ? -2 : 2,
            0,
            selectedArtist === artist.id ? 2 : 0,
          ]}
        >
          <ArtistRing
            artist={artist}
            isSelected={selectedArtist === artist.id}
            onSelect={() => setSelectedArtist(artist.id)}
          />
        </group>
      ))}

      {/* Particles */}
      <Particles />
    </>
  );
}

// Particles Component
function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main Component
export default function ImageRing3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
