import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Share2,
  Download,
  Ruler,
  Tag,
  User,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore, useAuthStore } from '@/store';
import { toast } from 'sonner';

// Mock artwork data
const mockArtworks: Record<string, any> = {
  '1': {
    id: 1,
    title: 'Cosmic Dreams',
    artist: 'Mel',
    artistSlug: 'mel',
    price: 450,
    category: 'fantasy',
    description:
      'A mesmerizing exploration of the cosmos, blending ethereal colors and dreamlike imagery to transport viewers to otherworldly realms.',
    dimensions: { width: 80, height: 60 },
    isDigital: false,
    inStock: true,
    rating: 4.8,
    reviews: 12,
  },
  '2': {
    id: 2,
    title: 'Ethereal Portrait',
    artist: 'Lena',
    artistSlug: 'lena',
    price: 380,
    category: 'portrait',
    description:
      'A powerful portrait that captures the essence of human emotion through bold strokes and expressive colors.',
    dimensions: { width: 50, height: 70 },
    isDigital: false,
    inStock: true,
    rating: 4.9,
    reviews: 8,
  },
};

export default function ArtworkDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const artwork = mockArtworks[slug || ''];

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Artwork not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: artwork.id.toString(),
      artworkId: artwork.id.toString(),
      title: artwork.title,
      thumbnail: '',
      price: artwork.price,
      currency: 'EUR',
      quantity: 1,
      artistName: artwork.artist,
      artistSlug: artwork.artistSlug,
      isDigital: artwork.isDigital,
    });
    toast.success('Added to cart');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info('Please login to add to wishlist');
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/gallery">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square bg-gradient-to-br from-violet-200 to-purple-200 rounded-2xl flex items-center justify-center">
              <span className="text-8xl font-bold text-white/50">
                {artwork.title[0]}
              </span>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{artwork.title}</h1>
                  <Link
                    to={`/artist/${artwork.artistSlug}`}
                    className="text-violet-600 hover:underline flex items-center gap-2 mt-2"
                  >
                    <User className="w-4 h-4" />
                    {artwork.artist}
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlist}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{artwork.rating}</span>
                  <span className="text-muted-foreground">
                    ({artwork.reviews} reviews)
                  </span>
                </div>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground capitalize">
                  {artwork.category}
                </span>
              </div>

              <p className="text-3xl font-bold text-violet-600 mb-6">
                €{artwork.price}
              </p>

              <p className="text-muted-foreground mb-6">
                {artwork.description}
              </p>

              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  <span>
                    {artwork.dimensions.width} x {artwork.dimensions.height} cm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{artwork.isDigital ? 'Digital' : 'Original'}</span>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('artwork.addToCart')}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>

              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">
                    {t('artwork.description')}
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    {t('artwork.reviews')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-muted-foreground">
                    {artwork.description}
                  </p>
                </TabsContent>
                <TabsContent value="reviews" className="mt-4">
                  <p className="text-muted-foreground">
                    Reviews will be displayed here.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
