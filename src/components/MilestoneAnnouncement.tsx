import { motion, AnimatePresence } from 'motion/react';
import type { MemeMilestone } from '../hooks/useMemeSound';

interface MilestoneAnnouncementProps {
  milestone: MemeMilestone | null;
  visible: boolean;
}

export function MilestoneAnnouncement({ milestone, visible }: MilestoneAnnouncementProps) {
  return (
    <AnimatePresence>
      {visible && milestone && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
          {/* Background flash */}
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
            style={{ backgroundColor: milestone.color, mixBlendMode: 'overlay' }}
          />

          {/* Main milestone text */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={{
              scale: [0, 1.4, 1.1],
              opacity: [0, 1, 1],
              rotate: [-15, 5, 0],
            }}
            exit={{
              scale: 3,
              opacity: 0,
              filter: 'blur(20px)',
            }}
            transition={{
              duration: 0.5,
              exit: { duration: 0.4 },
            }}
            className="flex flex-col items-center gap-2"
          >
            {/* Click count */}
            <motion.div
              className="font-tech text-lg md:text-2xl tracking-[0.5em] uppercase"
              style={{ color: milestone.color, textShadow: `0 0 20px ${milestone.color}` }}
            >
              {milestone.clicks.toLocaleString()} CLICKS
            </motion.div>

            {/* Meme text */}
            <motion.h1
              className="font-display text-5xl md:text-8xl text-center leading-none px-4"
              style={{
                color: milestone.color,
                textShadow: `0 0 30px ${milestone.color}, 4px 4px 0px rgba(0,0,0,0.8)`,
                WebkitTextStroke: '2px rgba(0,0,0,0.3)',
              }}
            >
              {milestone.text}
            </motion.h1>
          </motion.div>

          {/* Burst particles */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((i * 360 / 16) * (Math.PI / 180)) * (300 + Math.random() * 200),
                y: Math.sin((i * 360 / 16) * (Math.PI / 180)) * (300 + Math.random() * 200),
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: milestone.color,
                boxShadow: `0 0 10px ${milestone.color}`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
