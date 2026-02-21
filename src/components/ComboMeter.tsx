import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface ComboMeterProps {
  combo: number;
  level: number;
}

export function ComboMeter({ combo, level }: ComboMeterProps) {
  const [prevLevel, setPrevLevel] = useState(level);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (level > prevLevel) {
      // Level up effect
      setScale(2.5);
      setPrevLevel(level);
      setTimeout(() => setScale(1), 300);
    }
  }, [level, prevLevel]);

  // Dynamic color based on level
  const getLevelColor = (lvl: number) => {
    switch (lvl) {
      case 1: return 'text-white';
      case 2: return 'text-cyan-400';
      case 3: return 'text-green-400';
      case 4: return 'text-yellow-400';
      case 5: return 'text-red-500';
      case 6: return 'text-purple-500';
      default: return 'text-white';
    }
  };

  const getLevelTitle = (lvl: number) => {
    switch (lvl) {
      case 1: return 'NOVICE';
      case 2: return 'AWAKENING';
      case 3: return 'OVERDRIVE';
      case 4: return 'RAMPAGE';
      case 5: return 'GODLIKE';
      case 6: return 'SINGULARITY';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="fixed top-4 right-4 md:top-8 md:right-8 text-right z-50 pointer-events-none select-none">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.1 }}
        key={combo} // Re-animate on combo change
        className="flex flex-col items-end relative"
      >
        <div className="text-xs md:text-sm font-tech tracking-widest opacity-70 mb-0 md:mb-1 text-gray-400 bg-black/40 px-2 rounded backdrop-blur-sm">
          COMBO SEQUENCE
        </div>
        
        {/* Combo Number */}
        <motion.div 
          className={`font-display text-5xl md:text-8xl leading-[0.8] ${getLevelColor(level)} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
          animate={{ scale: scale }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
        >
          {combo}
        </motion.div>
      </motion.div>

      {/* Status Label - Positioned to avoid overlap */}
      <div className="mt-2 md:mt-4">
         <AnimatePresence mode="wait">
            <motion.div
              key={level}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`font-tech text-sm md:text-xl font-bold tracking-[0.2em] ${getLevelColor(level)} bg-black/60 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-lg`}
            >
              STATUS: {getLevelTitle(level)}
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
