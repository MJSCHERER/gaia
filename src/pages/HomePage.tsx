import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import LoadingScreen from '@/components/LoadingScreen';

type Star = {
  left: string;
  top: string;
  opacity: number;
  duration: number;
  delay: number;
};

function generateStars(count: number): Star[] {
  return Array.from({ length: count }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.8 + 0.2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));
}

// Lazy load 3D components
const ImageRing3D = lazy(() => import('@/components/3d/ImageRing3D'));
const InteractiveBubbles = lazy(() => import('@/components/InteractiveBubbles'));

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 🚀 SEO HEAD */}
      <Helmet>
        <title>Gaiamundi - Wo Kunst auf den Kosmos trifft</title>
        <meta
          name="description"
          content="Entdecke einzigartige Kunstwerke visionärer Künstler auf Gaiamundi. Tauche ein in die Welt digitaler Kunst und Inspiration."
        />
        <meta property="og:title" content="Gaiamundi - Wo Kunst auf den Kosmos trifft" />
        <meta
          property="og:description"
          content="Entdecke einzigartige Kunstwerke visionärer Künstler auf Gaiamundi."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gaiamundi.com" />
        <meta property="og:image" content="https://www.gaiamundi.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gaiamundi - Wo Kunst auf den Kosmos trifft" />
        <meta
          name="twitter:description"
          content="Entdecke einzigartige Kunstwerke visionärer Künstler auf Gaiamundi."
        />
        <meta name="twitter:image" content="https://www.gaiamundi.com/twitter-card.jpg" />
        <link rel="canonical" href="https://www.gaiamundi.com" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-violet-950 via-purple-900 to-indigo-950">
          <StarField />

          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.35) 0%, transparent 55%)',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 w-full flex items-center justify-center py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className="
              relative
              w-full
              max-w-[1200px]
              h-[520px]
              sm:h-[650px]
              lg:h-[760px]
              mx-auto
              flex
              items-center
              justify-center
            "
          >
            <Suspense fallback={<LoadingScreen />}>
              <ImageRing3D />
            </Suspense>
          </motion.div>
        </div>

        <Suspense fallback={null}>
          <InteractiveBubbles />
        </Suspense>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

// Star Field
function StarField() {
  const [stars] = useState<Star[]>(() => generateStars(100));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
            opacity: star.opacity,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
