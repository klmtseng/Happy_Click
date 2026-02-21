import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Rival {
  name: string;
  score: number;
  rank: number;
}

interface RivalTrackerProps {
  currentMaxScore: number;
}

export function RivalTracker({ currentMaxScore }: RivalTrackerProps) {
  const [rival, setRival] = useState<Rival | null>(null);

  useEffect(() => {
    const fetchRival = async () => {
      try {
        const res = await fetch(`/api/rival?score=${currentMaxScore}`);
        if (res.ok) {
          const text = await res.text();
          try {
             const data = JSON.parse(text);
             setRival(data);
          } catch(e) {
             console.error("Invalid JSON from rival API:", text);
          }
        }
      } catch (e) {
        console.error("Failed to fetch rival", e);
      }
    };

    // Poll less frequently for rival to avoid spamming
    fetchRival();
    const interval = setInterval(fetchRival, 5000);
    return () => clearInterval(interval);
  }, [currentMaxScore]);

  if (!rival) return null;

  const diff = rival.score - currentMaxScore;
  const progress = Math.max(0, Math.min(1, 1 - (diff / (rival.score * 0.2)))); // Visual progress bar

  return (
    <div className="fixed top-20 left-4 md:left-8 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={rival.name} // Animate when rival changes
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-black/60 backdrop-blur-md border border-red-500/30 p-3 rounded-lg shadow-lg max-w-[200px]"
        >
          <div className="text-[10px] font-tech text-red-400 tracking-widest mb-1">
            TARGET DETECTED // RANK #{rival.rank}
          </div>
          <div className="flex justify-between items-end mb-1">
            <span className="font-display text-xl text-white truncate mr-2">{rival.name}</span>
            <span className="font-mono text-cyan-400 text-lg">{rival.score}</span>
          </div>
          
          {/* Progress Bar to beat rival */}
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentMaxScore / rival.score) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-[9px] font-tech text-gray-500 text-right mt-1">
            -{diff} TO OVERTAKE
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
