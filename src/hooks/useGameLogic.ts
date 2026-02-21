import { useState, useEffect, useRef } from 'react';

export const DECAY_RATE_MS = 100; // Check decay every 100ms
export const DECAY_AMOUNT = 0.5; // Lose 0.5 combo per tick if inactive
export const DECAY_START_DELAY_MS = 2000; // Increased to 2s for better "interval" feel

export function useGameLogic() {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0); // Total accumulated clicks
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isDecaying, setIsDecaying] = useState(false);
  const lastClickTimeRef = useRef<number>(Date.now());
  const comboRef = useRef(0); // Ref for interval access

  // Sync ref
  useEffect(() => {
    comboRef.current = combo;
    if (combo > maxCombo) {
        setMaxCombo(combo);
        if (combo > 0) {
            setIsNewRecord(true);
            // Reset flag after a short burst
            setTimeout(() => setIsNewRecord(false), 200);
        }
    }
  }, [combo, maxCombo]);

  const handleClick = () => {
    lastClickTimeRef.current = Date.now();
    setCombo(c => c + 1);
    setScore(s => s + 1); // Increment total score
    setIsDecaying(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;

      if (timeSinceLastClick > DECAY_START_DELAY_MS && comboRef.current > 0) {
        setIsDecaying(true);
        setCombo(c => Math.max(0, Math.floor(c * 0.90))); // Faster decay for tension
      } else {
        setIsDecaying(false);
      }
    }, DECAY_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  // Determine Level based on Combo
  let level = 1;
  if (combo >= 10) level = 2;
  if (combo >= 30) level = 3;
  if (combo >= 60) level = 4;
  if (combo >= 100) level = 5;
  if (combo >= 200) level = 6;

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
