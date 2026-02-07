import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/store';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  const subtotal = getTotalPrice();
  const shipping = 15;
  const tax = subtotal * 0.19;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/account/purchases');
    }, 2000);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>

          <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-muted rounded-xl p-6">
                  <h2 className="font-semibold mb-4">{t('checkout.shippingAddress')}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input required />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input required />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Address</Label>
                      <Input required />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input required />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input required />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Country</Label>
                      <Input required />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-muted rounded-xl p-6">
                  <h2 className="font-semibold mb-4">{t('checkout.paymentMethod')}</h2>
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'card' ? 'border-violet-600 bg-violet-50' : 'border-muted'
                      }`}
                    >
                      {t('checkout.creditCard')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-violet-600 bg-violet-50'
                          : 'border-muted'
                      }`}
                    >
                      {t('checkout.paypal')}
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expiry Date</Label>
                          <Input placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label>CVC</Label>
                          <Input placeholder="123" required />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {t('checkout.placeOrder')} - €{total.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-muted rounded-xl p-6 sticky top-24">
                <h2 className="font-semibold mb-4">{t('checkout.orderSummary')}</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.title} x {item.quantity}
                      </span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.shipping')}</span>
                    <span>€{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.tax')}</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t('cart.total')}</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
