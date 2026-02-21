import { useState, useEffect, useRef } from 'react';
import { DECAY_CONFIG, LEVELS } from '../config/gameConfig';

export function useGameLogic() {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isDecaying, setIsDecaying] = useState(false);
  const lastClickTimeRef = useRef<number>(Date.now());
  const comboRef = useRef(0);

  // Sync ref so the setInterval closure always reads the latest combo
  useEffect(() => {
    comboRef.current = combo;
    if (combo > maxCombo) {
      setMaxCombo(combo);
      if (combo > 0) {
        setIsNewRecord(true);
        setTimeout(() => setIsNewRecord(false), 200);
      }
    }
  }, [combo, maxCombo]);

  const handleClick = () => {
    lastClickTimeRef.current = Date.now();
    setCombo(c => c + 1);
    setScore(s => s + 1);
    setIsDecaying(false);
  };

  // Decay loop — reads all settings from gameConfig, no magic numbers here
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastClick = Date.now() - lastClickTimeRef.current;
      if (timeSinceLastClick > DECAY_CONFIG.START_DELAY_MS && comboRef.current > 0) {
        setIsDecaying(true);
        setCombo(c => Math.max(0, Math.floor(c * DECAY_CONFIG.FACTOR)));
      } else {
        setIsDecaying(false);
      }
    }, DECAY_CONFIG.RATE_MS);

    return () => clearInterval(interval);
  }, []);

  // Derive level from LEVELS config — adding a new level only requires editing gameConfig.ts
  const level = [...LEVELS]
    .reverse()
    .find(l => combo >= l.threshold)?.id ?? 1;

  const resetGame = () => {
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setIsNewRecord(false);
    setIsDecaying(false);
    lastClickTimeRef.current = Date.now();
    comboRef.current = 0;
  };

  return { combo, level, handleClick, maxCombo, score, isNewRecord, isDecaying, resetGame };
}
