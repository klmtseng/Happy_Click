import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameLogic } from './hooks/useGameLogic';
import { useSound } from './hooks/useSound';
import { ClickButton } from './components/ClickButton';
import { ComboMeter } from './components/ComboMeter';
import { BackgroundEffects } from './components/BackgroundEffects';
import { SystemLog } from './components/SystemLog';
import { FileUploader } from './components/FileUploader';
import { GameOverModal } from './components/GameOverModal';
import {
  COMBO_EVENTS,
  FEEDBACK_MESSAGES,
  FEEDBACK_HIGH_MESSAGES,
  HYPERSPACE_STAR_COLORS,
} from './config/gameConfig';

export default function App() {
  const { combo, level, handleClick, maxCombo, score, isNewRecord, isDecaying, resetGame } = useGameLogic();
  const [prevLevel, setPrevLevel] = useState(level);
  const [showSpecial67, setShowSpecial67] = useState(false);
  const [customSfxUrl, setCustomSfxUrl] = useState<string | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  // Game Over State
  const [isGameOver, setIsGameOver] = useState(false);

  // Hyperspace & BGM State
  const [bgmPhase, setBgmPhase] = useState(0);
  const [starColor, setStarColor] = useState('#ffffff');
  const [isHyperspace, setIsHyperspace] = useState(false);
  const [hyperspaceTarget, setHyperspaceTarget] = useState(COMBO_EVENTS.HYPERSPACE_INTERVAL);

  const {
    playClickSound,
    playLevelUpSound,
    initAudio,
    playAnnouncementSound,
    playDecaySound,
    playHyperspaceSound,
    playRocketSound,
    playShockwaveSound,
    playEncouragementSound,
    playFlybySound,
  } = useSound(combo, bgmPhase);

  // Ranking State
  const [currentRank, setCurrentRank] = useState<number>(1);
  const [prevRank, setPrevRank]       = useState<number>(1);
  const [showRankUp, setShowRankUp]   = useState(false);

  // Floating Feedback State
  const [feedbacks, setFeedbacks] = useState<
    { id: number; text: string; x: number; y: number; rotate: number; color: string }[]
  >([]);
  const lastFeedbackTextRef = useRef<string>('');

  // ─── Real-time Rank Check ────────────────────────────────────────────────────
  useEffect(() => {
    if (score === 0) {
      setCurrentRank(1);
      setPrevRank(1);
      return;
    }

    const saved = localStorage.getItem('leaderboard');
    let leaderboard: { name: string; score: number }[] = [];
    if (saved) {
      try { leaderboard = JSON.parse(saved); } catch (_) {}
    }

    const newRank = leaderboard.filter(entry => entry.score > score).length + 1;

    if (newRank < prevRank) {
      setShowRankUp(true);
      playAnnouncementSound(true); // echo ON, no TTS
      setTimeout(() => setShowRankUp(false), 1500);
    }

    setPrevRank(currentRank);
    setCurrentRank(newRank);
  }, [score, prevRank, currentRank, playAnnouncementSound]);

  // ─── Game Over Logic ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (combo === 0 && score > 0 && !isGameOver && !isNewRecord) {
      const timer = setTimeout(() => setIsGameOver(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [combo, score, isGameOver, isNewRecord]);

  const handleRestart = () => {
    setIsGameOver(false);
    resetGame();
    setStarColor('#ffffff');
    setBgmPhase(0);
    setHyperspaceTarget(COMBO_EVENTS.HYPERSPACE_INTERVAL);
    setCurrentRank(1);
    setPrevRank(1);
  };

  // ─── Hyperspace Logic ────────────────────────────────────────────────────────
  useEffect(() => {
    if (combo >= hyperspaceTarget && !isHyperspace) {
      setIsHyperspace(true);
      playHyperspaceSound();
    }
    if (isHyperspace && combo >= hyperspaceTarget + 5) {
      setIsHyperspace(false);
      setBgmPhase(p => p + 1);

      // Pick a different star color from config
      let newColor = HYPERSPACE_STAR_COLORS[Math.floor(Math.random() * HYPERSPACE_STAR_COLORS.length)];
      while (newColor === starColor) {
        newColor = HYPERSPACE_STAR_COLORS[Math.floor(Math.random() * HYPERSPACE_STAR_COLORS.length)];
      }
      setStarColor(newColor);
      setHyperspaceTarget(t => t + COMBO_EVENTS.HYPERSPACE_INTERVAL);
    }
  }, [combo, hyperspaceTarget, isHyperspace, playHyperspaceSound, starColor]);

  // ─── Floating Feedback ───────────────────────────────────────────────────────
  useEffect(() => {
    if (combo > 0 && combo % COMBO_EVENTS.FEEDBACK_INTERVAL === 0) {
      // Build word pool from config, expanding at higher combos
      let pool: readonly string[] = FEEDBACK_MESSAGES;
      if (combo >= 50) pool = [...pool, ...FEEDBACK_HIGH_MESSAGES];

      const candidates = pool.filter(t => t !== lastFeedbackTextRef.current);
      const source = candidates.length > 0 ? candidates : pool;
      const text = source[Math.floor(Math.random() * source.length)];
      lastFeedbackTextRef.current = text;

      // Random position, pushed away from center
      let x = Math.random() * 80 + 10;
      let y = Math.random() * 80 + 10;
      if (x > 30 && x < 70 && y > 30 && y < 70) {
        if (Math.random() > 0.5) x = x < 50 ? 20 : 80;
        else                     y = y < 50 ? 20 : 80;
      }

      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#d946ef'];
      const newFeedback = {
        id:     Date.now() + Math.random(),
        text,
        x,
        y,
        rotate: Math.random() * 40 - 20,
        color:  colors[Math.floor(Math.random() * colors.length)],
      };

      setFeedbacks(prev => [...prev, newFeedback]);
      playEncouragementSound();

      setTimeout(() => {
        setFeedbacks(prev => prev.filter(f => f.id !== newFeedback.id));
      }, 1000);
    }
  }, [combo, playEncouragementSound]);

  // ─── Decay Sound ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDecaying) playDecaySound(combo);
  }, [isDecaying, playDecaySound, combo]);

  // ─── Level Up Sound ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (level > prevLevel) {
      playLevelUpSound();
      setPrevLevel(level);
    } else if (level < prevLevel) {
      setPrevLevel(level);
    }
  }, [level, prevLevel, playLevelUpSound]);

  // ─── Custom SFX File ─────────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomSfxUrl(url);
  };

  // ─── Special Combo ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (combo === COMBO_EVENTS.SPECIAL_COMBO) {
      setShowSpecial67(true);

      if (customSfxUrl) {
        if (!customAudioRef.current) {
          customAudioRef.current = new Audio(customSfxUrl);
        } else {
          customAudioRef.current.src = customSfxUrl;
        }
        customAudioRef.current.currentTime = 0;
        customAudioRef.current.play().catch(e => console.error('Audio play failed', e));
      } else {
        playAnnouncementSound(true); // echo ON, no TTS
      }

      setTimeout(() => setShowSpecial67(false), 800);
    }
  }, [combo, playAnnouncementSound, customSfxUrl]);

  // ─── Click Handler ───────────────────────────────────────────────────────────
  const onButtonClick = () => {
    handleClick();
    playClickSound(combo);
    if (navigator.vibrate) navigator.vibrate(5 + level * 5);
  };

  const isChaos = level >= 5;

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white"
      onClick={initAudio}
    >
      <BackgroundEffects
        level={level}
        combo={combo}
        starColor={starColor}
        isHyperspace={isHyperspace}
        onRocketSpawn={playRocketSound}
        onShockwave={playShockwaveSound}
        onFlyby={playFlybySound}
      />

      <FileUploader onFileSelect={handleFileSelect} />

      {/* Real-time Ranking Display */}
      {currentRank && (
        <motion.div
          key={currentRank}
          initial={{ scale: 2.5, color: '#ffff00', rotate: -5 }}
          animate={{ scale: 1, color: '#ffffff', rotate: 0 }}
          className="fixed top-4 left-4 z-50 pointer-events-none select-none flex flex-col items-start"
        >
          <div className="text-xs md:text-sm font-tech tracking-widest opacity-70 mb-0 md:mb-1 text-gray-400 bg-black/40 px-2 rounded backdrop-blur-sm">
            GLOBAL RANK
          </div>
          <div
            className="font-display text-5xl md:text-7xl leading-[0.8] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}
          >
            #{currentRank}
          </div>
        </motion.div>
      )}

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && <GameOverModal score={score} onRestart={handleRestart} />}
      </AnimatePresence>

      {/* Rank Up Effect */}
      <AnimatePresence>
        {showRankUp && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: 1.5, opacity: 1, y: -100 }}
            exit={{ opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <h2 className="font-display text-6xl md:text-8xl text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,1)] tracking-tighter whitespace-nowrap">
              RANK UP!
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Chaos Shake */}
      <motion.div
        animate={
          isChaos
            ? { x: [-5, 5, -5], y: [-5, 5, -5], rotate: [-1, 1, -1] }
            : { x: 0, y: 0, rotate: 0 }
        }
        transition={{ duration: 0.1, repeat: isChaos ? Infinity : 0 }}
        className="relative z-10 flex flex-col items-center justify-center w-full h-full"
      >
        <ComboMeter combo={combo} level={level} />

        <div className="mt-16 mb-8 md:mb-12 text-center space-y-2 relative z-20">
          <h1 className="font-display text-3xl md:text-6xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-lg">
            HAPPY CLICKER
          </h1>
          <p className="font-tech text-[10px] md:text-xs text-gray-500 tracking-[0.5em] uppercase">
            System Status: {level >= 5 ? 'CRITICAL' : 'NORMAL'}
          </p>
        </div>

        {/* Graffiti Feedback Layer */}
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          <AnimatePresence>
            {feedbacks.map(f => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.2, rotate: f.rotate + 180 }}
                animate={{ opacity: 1, scale: 1.5, rotate: f.rotate }}
                exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="absolute font-display font-black tracking-tighter"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  color: f.color,
                  textShadow: '4px 4px 0px #000, -2px -2px 0px #fff',
                  fontSize: 'clamp(3rem, 8vw, 6rem)',
                  WebkitTextStroke: '2px black',
                }}
              >
                {f.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="scale-75 md:scale-100 relative z-10 mb-20">
          <ClickButton onClick={onButtonClick} level={level} combo={combo} />
        </div>
      </motion.div>

      <SystemLog combo={combo} level={level} />

      {/* Special Effect Overlay */}
      <AnimatePresence>
        {showSpecial67 && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0.1, opacity: 0, rotate: 0 }}
              animate={{ scale: [0.1, 1.5, 3], opacity: [0, 1, 0], rotate: [0, -10, 10] }}
              transition={{ duration: 0.6, times: [0, 0.2, 1], ease: 'easeOut' }}
            >
              <h1 className="font-display text-[15rem] md:text-[25rem] text-white tracking-tighter drop-shadow-[0_0_50px_rgba(255,0,0,1)] mix-blend-screen leading-none">
                {COMBO_EVENTS.SPECIAL_COMBO}
              </h1>
            </motion.div>

            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(i * 30 * (Math.PI / 180)) * 400,
                  y: Math.sin(i * 30 * (Math.PI / 180)) * 400,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.8)]"
              />
            ))}

            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white mix-blend-overlay"
            />
          </div>
        )}
      </AnimatePresence>

      {/* Max Combo Footer */}
      <motion.div
        animate={isNewRecord ? { scale: [1, 1.5, 1], color: ['#4b5563', '#ffff00', '#4b5563'] } : {}}
        className="absolute bottom-4 left-4 font-tech text-xs text-gray-600 transition-colors"
      >
        MAX SEQUENCE: {maxCombo}
      </motion.div>
    </div>
  );
}
