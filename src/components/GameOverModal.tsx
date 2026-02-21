import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { RefreshCcw } from 'lucide-react';
import { getTopScores, addScore, type ScoreEntry } from '../services/leaderboard';

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

export function GameOverModal({ score, onRestart }: GameOverModalProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    getTopScores().then(setLeaderboard);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addScore(name.toUpperCase(), score);
    const updated = await getTopScores();
    setLeaderboard(updated);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border-4 border-yellow-500 rounded-none p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(255,215,0,0.3)] text-center font-mono relative overflow-hidden"
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%]" />

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-yellow-500 mb-2 tracking-widest animate-pulse" style={{ textShadow: '4px 4px 0px #b91c1c' }}>GAME OVER</h2>
          <div className="text-2xl text-white mb-8">FINAL SCORE: <span className="text-yellow-400">{score}</span></div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
              <div className="flex flex-col items-center gap-2">
                <label className="text-green-400 text-sm tracking-widest">ENTER INITIALS</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  placeholder=""
                  className="w-48 bg-black border-2 border-green-500 px-4 py-2 text-white text-center text-3xl font-bold focus:outline-none focus:border-green-400 focus:shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all caret-green-500 animate-pulse-caret"
                  maxLength={3}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white font-black text-xl py-3 hover:bg-red-500 transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
              >
                SUBMIT
              </button>
            </form>
          ) : (
            <div className="mb-8">
              <h3 className="text-2xl text-cyan-400 mb-4 border-b-2 border-cyan-400 inline-block px-8 pb-1">HIGH SCORES</h3>
              <div className="space-y-2 text-lg max-h-60 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 text-zinc-500 text-sm mb-2 border-b border-zinc-800 pb-1">
                  <div className="text-left">RANK</div>
                  <div className="text-center">SCORE</div>
                  <div className="text-right">NAME</div>
                </div>
                {leaderboard.map((entry, index) => (
                  <div key={index} className={`grid grid-cols-3 ${entry.name === name && entry.score === score ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                    <div className="text-left text-red-500">{index + 1}ST</div>
                    <div className="text-center">{entry.score}</div>
                    <div className="text-right">{entry.name}</div>
                  </div>
                ))}
                {leaderboard.length === 0 && <div className="text-zinc-500">Loading scores...</div>}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={onRestart}
              className="bg-yellow-500 text-black font-black py-3 px-8 rounded-none hover:bg-yellow-400 transition-colors flex items-center gap-2 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1"
            >
              <RefreshCcw size={20} />
              TRY AGAIN
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
