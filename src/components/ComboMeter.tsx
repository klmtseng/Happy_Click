import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { LEVELS } from '../config/gameConfig';

interface ComboMeterProps {
  combo: number;
  level: number;
}

export function ComboMeter({ combo, level }: ComboMeterProps) {
  const [prevLevel, setPrevLevel] = useState(level);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (level > prevLevel) {
      setScale(2.5);
      setPrevLevel(level);
      setTimeout(() => setScale(1), 300);
    }
  }, [level, prevLevel]);

  // Read display data from config — adding a level only requires editing gameConfig.ts
  const levelConfig = LEVELS.find(l => l.id === level);
  const levelColor  = levelConfig?.color ?? 'text-white';
  const levelName   = levelConfig?.name  ?? 'UNKNOWN';

  return (
    <div className="fixed top-4 right-4 md:top-8 md:right-8 text-right z-50 pointer-events-none select-none">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.1 }}
        key={combo}
        className="flex flex-col items-end relative"
      >
        <div className="text-xs md:text-sm font-tech tracking-widest opacity-70 mb-0 md:mb-1 text-gray-400 bg-black/40 px-2 rounded backdrop-blur-sm">
          COMBO SEQUENCE
        </div>

        <motion.div
          className={`font-display text-5xl md:text-8xl leading-[0.8] ${levelColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
          style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
        >
          {combo}
        </motion.div>
      </motion.div>

      <div className="mt-2 md:mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`font-tech text-sm md:text-xl font-bold tracking-[0.2em] ${levelColor} bg-black/60 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-lg`}
          >
            STATUS: {levelName}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
