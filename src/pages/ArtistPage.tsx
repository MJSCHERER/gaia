import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Instagram,
  Facebook,
  Twitter,
  Globe,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ArtistSocial = {
  instagram: string;
  twitter: string;
  facebook: string;
};

type Artist = {
  name: string;
  bio: string;
  specialty: string;
  location: string;
  website: string;
  social: ArtistSocial;
  artworks: number;
  exhibitions: number;
  publications: number;
};

type ArtworkPreview = {
  id: number;
  title: string;
  price: number;
};

type Exhibition = {
  year: string;
  title: string;
  venue: string;
};

// Mock artist data
const mockArtists: Record<string, Artist> = {
  mel: {
    name: 'Mel',
    bio: 'Mel is a visionary artist whose work explores the ethereal boundaries between the natural world and the cosmic realm.',
    specialty: 'Nature & Fantasy',
    location: 'Berlin, Germany',
    website: 'https://mel.art',
    social: {
      instagram: '@mel.art',
      twitter: '@mel_art',
      facebook: 'melart',
    },
    artworks: 24,
    exhibitions: 8,
    publications: 5,
  },
  lena: {
    name: 'Lena',
    bio: 'Lena is an expressive portrait artist who delves deep into human emotion and identity.',
    specialty: 'Portrait & Illustration',
    location: 'Munich, Germany',
    website: 'https://lena.art',
    social: {
      instagram: '@lena.art',
      twitter: '@lena_art',
      facebook: 'lenaart',
    },
    artworks: 18,
    exhibitions: 6,
    publications: 3,
  },
};

const mockArtworks: ArtworkPreview[] = [
  { id: 1, title: 'Cosmic Dreams', price: 450 },
  { id: 3, title: 'Nature\'s Whisper', price: 520 },
  { id: 5, title: 'Morning Light', price: 350 },
  { id: 7, title: 'Forest Magic', price: 550 },
];

const exhibitions: Exhibition[] = [
  { year: '2023', title: 'Cosmic Visions', venue: 'Berlin Art Gallery' },
  { year: '2022', title: 'Nature\'s Dreams', venue: 'Munich Contemporary' },
  { year: '2021', title: 'Ethereal Light', venue: 'Hamburg Art Space' },
];

export default function ArtistPage() {
  const { slug } = useParams<{ slug: string }>();

  const artist = mockArtists[slug || ''];

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Artist not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-5xl font-bold text-violet-400">
                {artist.name[0]}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
                <p className="text-violet-600 font-medium mb-2">
                  {artist.specialty}
                </p>
                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-4 h-4" />
                  {artist.location}
                </p>
                <div className="flex gap-4 mt-4 justify-center md:justify-start">
                  <a
                    href={`https://instagram.com/${artist.social.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-violet-600"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://twitter.com/${artist.social.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-violet-600"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://facebook.com/${artist.social.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-violet-600"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-violet-600"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{artist.artworks}</p>
              <p className="text-sm text-muted-foreground">Artworks</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{artist.exhibitions}</p>
              <p className="text-sm text-muted-foreground">Exhibitions</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{artist.publications}</p>
              <p className="text-sm text-muted-foreground">Publications</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="artworks">
            <TabsList>
              <TabsTrigger value="artworks">Artworks</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks" className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/artwork/${artwork.id}`}
                      className="group block bg-muted rounded-xl overflow-hidden"
                    >
                      <div className="aspect-square bg-gradient-to-br from-violet-200 to-purple-200 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/50 group-hover:scale-110 transition-transform">
                          {artwork.title[0]}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold group-hover:text-violet-600 transition-colors">
                          {artwork.title}
                        </h3>
                        <p className="text-violet-600 font-medium">
                          €{artwork.price}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="bg-muted rounded-xl p-6">
                <h3 className="font-semibold mb-4">Biography</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {artist.bio}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="exhibitions" className="mt-6">
              <div className="space-y-4">
                {exhibitions.map((exhibition, index) => (
                  <div
                    key={index}
                    className="bg-muted rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{exhibition.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {exhibition.venue} • {exhibition.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
