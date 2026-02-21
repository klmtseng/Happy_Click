import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getTopScores, addScore, type ScoreEntry } from '../services/leaderboard';

interface LeaderboardProps {
  currentScore: number;
}

export function Leaderboard({ currentScore }: LeaderboardProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScores = async () => {
    const data = await getTopScores();
    setScores(data);
  };

  useEffect(() => {
    fetchScores();
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addScore(name.toUpperCase(), currentScore);
      setName('');
      fetchScores();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 font-tech text-xs border border-cyan-500/50 text-cyan-500 px-3 py-1 rounded hover:bg-cyan-500/10 transition-colors bg-black/80 backdrop-blur"
      >
        {isOpen ? 'CLOSE DATA' : 'LEADERBOARD'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed top-0 left-0 h-full w-80 bg-black/90 border-r border-cyan-500/30 z-40 p-6 pt-16 backdrop-blur-md overflow-y-auto"
          >
            <h2 className="font-display text-2xl text-cyan-400 mb-6 tracking-wider">TOP RANKINGS</h2>

            <div className="space-y-4 mb-8">
              {scores.map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-tech text-sm text-gray-400">
                    {i + 1}. <span className="text-white">{s.name}</span>
                  </span>
                  <span className="font-mono text-cyan-500">{s.score}</span>
                </div>
              ))}
              {scores.length === 0 && <div className="text-gray-500 font-tech text-xs">NO DATA AVAILABLE</div>}
            </div>

            <div className="border-t border-white/20 pt-6">
              <h3 className="font-tech text-xs text-gray-400 mb-2">UPLOAD CURRENT SEQUENCE</h3>
              <div className="font-display text-3xl text-white mb-4">{currentScore}</div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="CODENAME"
                  maxLength={10}
                  className="bg-white/5 border border-white/20 rounded px-3 py-2 text-white font-tech text-sm w-full focus:outline-none focus:border-cyan-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || currentScore === 0}
                  className="bg-cyan-600 text-white px-3 py-2 rounded font-tech text-xs hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SEND
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
