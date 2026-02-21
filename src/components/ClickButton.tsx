import { motion } from 'motion/react';

interface ClickButtonProps {
  onClick: () => void;
  level: number;
  combo: number;
}

export function ClickButton({ onClick, level, combo }: ClickButtonProps) {
  // Button intensity increases with level
  const glowIntensity = Math.min(level * 10, 60);
  
  // Heat calculation (0 to 1) based on combo
  const heat = Math.min(combo / 100, 1);
  
  // Dynamic color interpolation
  // Red -> Orange -> Yellow -> White
  const getButtonColor = () => {
    if (heat < 0.3) return 'from-red-500 to-red-700';
    if (heat < 0.6) return 'from-orange-500 to-red-600';
    if (heat < 0.9) return 'from-yellow-400 to-orange-500';
    return 'from-white to-yellow-300';
  };

  const getShadowColor = () => {
    if (heat < 0.3) return 'rgb(153,27,27)'; // Red
    if (heat < 0.6) return 'rgb(194, 65, 12)'; // Orange
    if (heat < 0.9) return 'rgb(234, 179, 8)'; // Yellow
    return 'rgb(255, 255, 255)'; // White
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Smoke Effect (Particles) */}
      {heat > 0.4 && (
        <div className="absolute inset-0 pointer-events-none">
           {[...Array(5)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute top-0 left-1/2 w-4 h-4 bg-gray-400/30 rounded-full blur-md"
               initial={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
               animate={{ 
                 opacity: [0, 0.5, 0], 
                 scale: [1, 3], 
                 y: -100 - Math.random() * 50,
                 x: (Math.random() - 0.5) * 50
               }}
               transition={{ 
                 duration: 1 + Math.random(), 
                 repeat: Infinity,
                 delay: Math.random() * 0.5
               }}
             />
           ))}
        </div>
      )}

      {/* Ripple/Shockwave effects behind button */}
      <div className="absolute inset-0 flex items-center justify-center">
        {level >= 3 && (
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-64 h-64 rounded-full border-4 border-red-500/30"
          />
        )}
        {level >= 5 && (
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.3, 0], rotate: [0, 90] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute w-80 h-80 border-2 border-purple-500/40"
          />
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9, y: 10 }}
        onClick={onClick}
        className={`relative z-10 w-64 h-64 rounded-full bg-gradient-to-b ${getButtonColor()} shadow-[0_15px_20px_rgba(0,0,0,0.5)] active:translate-y-[10px] transition-all duration-200 outline-none group`}
        style={{
          boxShadow: `0 10px 0 ${getShadowColor()}, 0 0 ${glowIntensity}px ${glowIntensity/2}px rgba(255, ${Math.floor(255 * heat)}, 60, 0.5)`
        }}
      >
        {/* Inner detail */}
        <div className={`absolute inset-4 rounded-full bg-gradient-to-b ${getButtonColor()} border-4 border-black/10 flex items-center justify-center overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full pointer-events-none" />
          
          <span className={`font-display text-4xl ${heat > 0.8 ? 'text-black' : 'text-red-900/50'} group-active:text-red-900/80 select-none transition-colors duration-300`}>
            PUSH
          </span>
          
          {/* Heat Haze / Glitch */}
          {heat > 0.6 && (
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay animate-pulse" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
