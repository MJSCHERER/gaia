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
  randomOffsetX: number;
  randomOffsetY: number;
  durationX: number;
  durationY: number;
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
] as const;

const hiddenSurprises = ['ufo', 'mushroom', 'clock', 'duck'] as const;
type HiddenType = (typeof hiddenSurprises)[number];

// Utility: create a single bubble (stable single-shot random values)
function createBubble(type: Bubble['type'] = 'normal'): Bubble {
  return {
    id: `bubble-${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
    x: Math.random() * 80 + 10, // 10% - 90%
    y: Math.random() * 60 + 20, // 20% - 80%
    size: Math.random() * 40 + 30, // 30 - 70 px
    color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
    type,
    delay: Math.random() * 2,
    randomOffsetX: Math.random() * 20 - 10,
    randomOffsetY: Math.random() * 20 - 10,
    durationX: 3 + Math.random() * 2,
    durationY: 4 + Math.random() * 2,
  };
}

export default function InteractiveBubbles() {
  const { t } = useTranslation();
  const [bubbles, setBubbles] = useState<Bubble[]>(() =>
    Array.from({ length: 5 }, () => createBubble()),
  );
  const [poppedBubbles, setPoppedBubbles] = useState<Set<string>>(new Set());

  // Hidden interactions store
  const { markFound, ufoFound, mushroomFound, clockFound, duckFound } =
    useHiddenInteractionsStore();

  // Respawn bubbles periodically (adds either normal or a single hidden type if none present)
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length < 5) {
          const hasHidden = prev.some((b) =>
            (hiddenSurprises as readonly string[]).includes(b.type),
          );
          const shouldAddHidden = !hasHidden && Math.random() < 0.3;

          if (shouldAddHidden) {
            const chosen = hiddenSurprises[
              Math.floor(Math.random() * hiddenSurprises.length)
            ] as HiddenType;
            return [...prev, createBubble(chosen)];
          } else {
            return [...prev, createBubble('normal')];
          }
        }
        return prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle popping a bubble: mark popped, remove from array, and handle hidden surprises.
  const handleBubblePop = useCallback(
    (bubble: Bubble) => {
      // use functional updates to avoid stale closures and to prevent double-add
      setPoppedBubbles((prev) => {
        if (prev.has(bubble.id)) return prev;
        const next = new Set(prev);
        next.add(bubble.id);
        return next;
      });

      setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

      if (bubble.type !== 'normal') {
        // mark found in store
        markFound(bubble.type as Exclude<Bubble['type'], 'normal'>);

        const messages: Record<Exclude<Bubble['type'], 'normal'>, string> = {
          ufo: t('hidden.ufoFound'),
          mushroom: t('hidden.mushroomFound'),
          clock: t('hidden.clockFound'),
          duck: t('hidden.duckFound'),
        };

        const icon =
          bubble.type === 'ufo'
            ? '🛸'
            : bubble.type === 'mushroom'
              ? '🍄'
              : bubble.type === 'clock'
                ? '🕰️'
                : '🦆';

        toast.success(messages[bubble.type as Exclude<Bubble['type'], 'normal'>], {
          icon,
          duration: 3000,
        });

        // If all found, celebratory message
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
    [markFound, t, ufoFound, mushroomFound, clockFound, duckFound],
  );

  const getBubbleIcon = (type: Bubble['type']) => {
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
              x: [0, bubble.randomOffsetX, 0],
              y: [0, bubble.randomOffsetY, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { duration: 0.3 },
              opacity: { duration: 0.3 },
              x: { repeat: Infinity, duration: bubble.durationX, ease: 'easeInOut' },
              y: { repeat: Infinity, duration: bubble.durationY, ease: 'easeInOut' },
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

      <AnimatePresence>
        {Array.from(poppedBubbles).map((id) => (
          <PopParticles key={id} bubbleId={id} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Pop particle effect — uses bubbleId so ESLint/TS won't mark it unused
function PopParticles({ bubbleId }: { bubbleId: string }) {
  return (
    <motion.div
      data-bubble-id={bubbleId}
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
