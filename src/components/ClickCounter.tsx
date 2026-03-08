import { motion, AnimatePresence } from 'motion/react';
import type { MemeMilestone } from '../hooks/useMemeSound';

interface ClickCounterProps {
  totalClicks: number;
  nextMilestone: MemeMilestone | null;
}

export function ClickCounter({ totalClicks, nextMilestone }: ClickCounterProps) {
  const progress = nextMilestone
    ? Math.min((totalClicks / nextMilestone.clicks) * 100, 100)
    : 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none select-none flex flex-col items-end gap-2">
      {/* Next milestone teaser */}
      {nextMilestone && (
        <div className="flex flex-col items-end gap-1">
          <div className="font-tech text-[10px] text-gray-500 tracking-widest uppercase">
            Next meme at
          </div>
          <div className="font-tech text-sm tracking-wider" style={{ color: nextMilestone.color }}>
            {nextMilestone.clicks.toLocaleString()} clicks
          </div>
          {/* Progress bar */}
          <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: nextMilestone.color }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      )}

      {/* Total clicks display */}
      <motion.div
        key={totalClicks}
        initial={totalClicks > 0 ? { scale: 1.3 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="flex flex-col items-end"
      >
        <div className="font-tech text-[10px] text-gray-500 tracking-[0.3em] uppercase">
          Total Clicks
        </div>
        <div
          className="font-display text-4xl md:text-6xl leading-none"
          style={{
            textShadow: '0 0 20px rgba(255, 0, 60, 0.5), 0 0 40px rgba(255, 0, 60, 0.2)',
            color: totalClicks >= 1000 ? '#ffd700' : totalClicks >= 500 ? '#ff003c' : '#ffffff',
          }}
        >
          {totalClicks.toLocaleString()}
        </div>
      </motion.div>
    </div>
  );
}
