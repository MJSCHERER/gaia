import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { t } = useTranslation();

  // Mock wishlist data
  const wishlistItems = [
    { id: 1, title: 'Cosmic Dreams', artist: 'Mel', price: 450 },
    { id: 2, title: 'Nature\'s Whisper', artist: 'Mel', price: 520 },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-8">{t('profile.wishlist')}</h1>

          {wishlistItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-muted rounded-xl overflow-hidden"
                >
                  <div className="aspect-video bg-violet-200" />
                  <div className="p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.artist}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-violet-600 font-medium">
                        €{item.price}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-xl">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Your wishlist is empty
              </p>
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <Link to="/gallery">Explore Gallery</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
