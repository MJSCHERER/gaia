import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useAuthStore } from '@/store';
import { toast } from 'sonner';

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart, getItemsByArtist } =
    useCartStore();

  const groupedItems = getItemsByArtist();
  const total = getTotalPrice();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please login to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('cart.empty')}</h1>
          <p className="text-muted-foreground mb-6">Discover beautiful artworks in our gallery</p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link to="/gallery">{t('cart.continueShopping')}</Link>
          </Button>
        </div>
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
          <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedItems).map(([artistName, artistItems]) => (
                <div key={artistName} className="bg-muted rounded-xl p-6">
                  <h3 className="font-semibold mb-4">
                    {t('cart.perArtist', { artist: artistName })}
                  </h3>
                  <div className="space-y-4">
                    {artistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 items-center bg-background rounded-lg p-4"
                      >
                        <div
                          className={`w-20 h-20 rounded-lg ${item.thumbnail || 'bg-violet-200'} flex-shrink-0`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">€{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={clearCart} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-muted rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold mb-4">{t('checkout.orderSummary')}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.tax')}</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t('cart.total')}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {t('cart.checkout')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to="/gallery">{t('cart.continueShopping')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
