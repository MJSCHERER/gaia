import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PurchasesPage() {
  const { t } = useTranslation();

  // Mock purchases data
  const purchases = [
    {
      id: 1,
      orderNumber: 'GM-001',
      date: '2024-01-15',
      total: 450,
      status: 'completed',
      items: [{ title: 'Cosmic Dreams', artist: 'Mel' }],
    },
    {
      id: 2,
      orderNumber: 'GM-002',
      date: '2024-01-10',
      total: 380,
      status: 'completed',
      items: [{ title: 'Ethereal Portrait', artist: 'Lena' }],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-8">{t('profile.purchases')}</h1>

          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-muted rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{purchase.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.items.map((item) => item.title).join(', ')}
                      </p>
                      <p className="text-sm text-muted-foreground">{purchase.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">€{purchase.total}</span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-xl">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No purchases yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
