import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';

// Lazy load 3D components (heavy)
const ImageRing3D = lazy(() => import('@/components/3d/ImageRing3D'));
const InteractiveBubbles = lazy(() => import('@/components/InteractiveBubbles'));

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950 via-purple-900 to-indigo-950">
          {/* Stars */}
          <StarField />
          {/* Milky Way effect */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6"
              >
                <Sparkles className="w-4 h-4" />
                <span>Discover Extraordinary Art</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t('home.title')}
              </h1>

              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                {t('home.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-violet-900 hover:bg-white/90"
                >
                  <Link to="/gallery">
                    {t('home.exploreGallery')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Link to="/about">{t('home.meetArtists')}</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right side - 3D Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-[400px] sm:h-[500px] lg:h-[600px]"
            >
              <Suspense fallback={<LoadingScreen />}>
                <ImageRing3D />
              </Suspense>
            </motion.div>
          </div>
        </div>

        {/* Interactive Bubbles */}
        <Suspense fallback={null}>
          <InteractiveBubbles />
        </Suspense>

        {/* Scroll indicator */}
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

      {/* Featured Artists Section */}
      <FeaturedArtistsSection />

      {/* Featured Artworks Section */}
      <FeaturedArtworksSection />
    </div>
  );
}

// Star Field Component
function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Featured Artists Section
function FeaturedArtistsSection() {
  const { t } = useTranslation();

  const artists = [
    {
      name: 'Mel',
      slug: 'mel',
      image: '/images/artists/mel.jpg',
      specialty: 'Nature & Fantasy',
      description: 'Capturing the ethereal beauty of the natural world through a dreamlike lens.',
    },
    {
      name: 'Lena',
      slug: 'lena',
      image: '/images/artists/lena.jpg',
      specialty: 'Portrait & Illustration',
      description: 'Exploring human emotion and identity through bold, expressive portraits.',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('home.meetArtists')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the visionary artists behind our collection
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Link
                to={`/artist/${artist.slug}`}
                className="group block relative overflow-hidden rounded-2xl bg-muted"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl font-bold text-violet-300">
                    {artist.name[0]}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
                  <p className="text-white/70 text-sm mb-2">{artist.specialty}</p>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {artist.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Artworks Section
function FeaturedArtworksSection() {
  const { t } = useTranslation();

  const artworks = [
    { id: 1, title: 'Cosmic Dreams', artist: 'Mel', price: 450 },
    { id: 2, title: 'Ethereal Portrait', artist: 'Lena', price: 380 },
    { id: 3, title: 'Nature\'s Whisper', artist: 'Mel', price: 520 },
    { id: 4, title: 'Urban Fantasy', artist: 'Lena', price: 420 },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Featured Artworks
            </h2>
            <p className="text-muted-foreground">
              Handpicked pieces from our collection
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/gallery">
              {t('common.viewAll')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Link
                to={`/artwork/${artwork.id}`}
                className="group block"
              >
                <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-violet-300 text-4xl font-bold group-hover:scale-110 transition-transform duration-500">
                    {artwork.title[0]}
                  </div>
                </div>
                <h3 className="font-semibold group-hover:text-violet-600 transition-colors">
                  {artwork.title}
                </h3>
                <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                <p className="text-violet-600 font-medium mt-1">
                  €{artwork.price}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
