import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useHiddenInteractionsStore } from '@/store';
import { toast } from 'sonner';

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'normal' | 'ufo' | 'mushroom' | 'clock' | 'duck';
  delay: number;
}

const pastelColors = [
  'rgba(255, 182, 193, 0.6)', // Pink
  'rgba(173, 216, 230, 0.6)', // Light Blue
  'rgba(221, 160, 221, 0.6)', // Plum
  'rgba(152, 251, 152, 0.6)', // Pale Green
  'rgba(255, 218, 185, 0.6)', // Peach
  'rgba(176, 224, 230, 0.6)', // Powder Blue
  'rgba(255, 240, 245, 0.6)', // Lavender Blush
  'rgba(240, 230, 140, 0.6)', // Khaki
];

const hiddenSurprises = ['ufo', 'mushroom', 'clock', 'duck'] as const;

export default function InteractiveBubbles() {
  const { t } = useTranslation();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedBubbles, setPoppedBubbles] = useState<Set<string>>(new Set());
  const { markFound, ufoFound, mushroomFound, clockFound, duckFound } =
    useHiddenInteractionsStore();

  // Generate initial bubbles
  useEffect(() => {
    const initialBubbles: Bubble[] = Array.from({ length: 5 }, (_, i) => ({
      id: `bubble-${i}`,
      x: Math.random() * 80 + 10, // 10% to 90% of screen width
      y: Math.random() * 60 + 20, // 20% to 80% of screen height
      size: Math.random() * 40 + 30, // 30px to 70px
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      type: 'normal',
      delay: Math.random() * 2,
    }));
    setBubbles(initialBubbles);
  }, []);

  // Respawn bubbles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length < 5) {
          const hasHiddenSurprise = prev.some((b) =>
            hiddenSurprises.includes(b.type as any)
          );
          const shouldAddHidden = !hasHiddenSurprise && Math.random() < 0.3;

          const newBubble: Bubble = {
            id: `bubble-${Date.now()}`,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            size: Math.random() * 40 + 30,
            color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
            type: shouldAddHidden
              ? hiddenSurprises[Math.floor(Math.random() * hiddenSurprises.length)]
              : 'normal',
            delay: 0,
          };
          return [...prev, newBubble];
        }
        return prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleBubblePop = useCallback(
    (bubble: Bubble) => {
      if (poppedBubbles.has(bubble.id)) return;

      setPoppedBubbles((prev) => new Set(prev).add(bubble.id));
      setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

      // Handle hidden surprises
      if (bubble.type !== 'normal') {
        markFound(bubble.type);
        const messages: Record<string, string> = {
          ufo: t('hidden.ufoFound'),
          mushroom: t('hidden.mushroomFound'),
          clock: t('hidden.clockFound'),
          duck: t('hidden.duckFound'),
        };
        toast.success(messages[bubble.type], {
          icon: bubble.type === 'ufo' ? '🛸' : bubble.type === 'mushroom' ? '🍄' : bubble.type === 'clock' ? '🕰️' : '🦆',
          duration: 3000,
        });

        // Check if all found
        const allFound =
          (ufoFound || bubble.type === 'ufo') &&
          (mushroomFound || bubble.type === 'mushroom') &&
          (clockFound || bubble.type === 'clock') &&
          (duckFound || bubble.type === 'duck');

        if (allFound) {
          setTimeout(() => {
            toast.success(t('hidden.secretMessage'), {
              icon: '🎉',
              duration: 5000,
            });
          }, 1000);
        }
      }
    },
    [poppedBubbles, markFound, t, ufoFound, mushroomFound, clockFound, duckFound]
  );

  const getBubbleIcon = (type: string) => {
    switch (type) {
      case 'ufo':
        return '🛸';
      case 'mushroom':
        return '🍄';
      case 'clock':
        return '🕰️';
      case 'duck':
        return '🦆';
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: poppedBubbles.has(bubble.id) ? 1.5 : 1,
              opacity: poppedBubbles.has(bubble.id) ? 0 : 1,
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { duration: 0.3 },
              opacity: { duration: 0.3 },
              x: {
                repeat: Infinity,
                duration: 3 + Math.random() * 2,
                ease: 'easeInOut',
              },
              y: {
                repeat: Infinity,
                duration: 4 + Math.random() * 2,
                ease: 'easeInOut',
              },
            }}
            style={{
              position: 'absolute',
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
            }}
            className="pointer-events-auto cursor-pointer"
            onClick={() => handleBubblePop(bubble)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm border border-white/30"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${bubble.color}, transparent)`,
                boxShadow: `inset -5px -5px 10px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.2)`,
              }}
            >
              {getBubbleIcon(bubble.type)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pop particles effect */}
      <AnimatePresence>
        {Array.from(poppedBubbles).map((bubbleId) => (
          <PopParticles key={bubbleId} bubbleId={bubbleId} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Pop particles effect when bubble is clicked
function PopParticles({ bubbleId: _bubbleId }: { bubbleId: string }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 pointer-events-none"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: '50%', y: '50%' }}
          animate={{
            scale: [0, 1, 0],
            x: `${50 + Math.cos((i / 8) * Math.PI * 2) * 30}%`,
            y: `${50 + Math.sin((i / 8) * Math.PI * 2) * 30}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full bg-violet-400"
        />
      ))}
    </motion.div>
  );
}
