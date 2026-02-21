import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  type: 'rocket' | 'fighter' | 'ufo';
  scale: number;
  rotation: number;
}

interface BackgroundEffectsProps {
  level: number;
  combo: number;
  starColor?: string;
  isHyperspace?: boolean;
  onRocketSpawn?: () => void;
  onShockwave?: () => void;
  onFlyby?: () => void;
}

export function BackgroundEffects({
  level,
  combo,
  starColor = '#ffffff',
  isHyperspace = false,
  onRocketSpawn,
  onShockwave,
}: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable data for the animation loop — stored in refs so the loop
  // always reads the latest value without needing to restart.
  const rocketsRef    = useRef<Rocket[]>([]);
  const shockwavesRef = useRef<{ size: number; opacity: number; speed: number }[]>([]);
  const hyperspaceTimerRef = useRef(0);

  // Prop mirrors — let the animation loop read current props without closure staleness
  const comboRef         = useRef(combo);
  const levelRef         = useRef(level);
  const starColorRef     = useRef(starColor);
  const onRocketSpawnRef = useRef(onRocketSpawn);
  const onShockwaveRef   = useRef(onShockwave);

  // Keep prop mirrors up-to-date
  useEffect(() => { comboRef.current = combo; },                [combo]);
  useEffect(() => { levelRef.current = level; },                [level]);
  useEffect(() => { starColorRef.current = starColor; },        [starColor]);
  useEffect(() => { onRocketSpawnRef.current = onRocketSpawn; }, [onRocketSpawn]);
  useEffect(() => { onShockwaveRef.current = onShockwave; },    [onShockwave]);

  // Hyperspace: when the prop flips true, start the flash timer
  useEffect(() => {
    if (isHyperspace) {
      hyperspaceTimerRef.current = 60; // 1 second at 60 fps
    }
  }, [isHyperspace]);

  // --- COMBO EVENT DETECTION ---
  // Runs on every combo change but only updates refs → does NOT restart the animation loop.
  const lastComboRef = useRef(combo);
  useEffect(() => {
    if (combo <= lastComboRef.current) {
      lastComboRef.current = combo;
      return;
    }

    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width  / 2 : window.innerWidth  / 2;
    const cy = canvas ? canvas.height / 2 : window.innerHeight / 2;

    // Rocket every 10 clicks
    const prevRocket = Math.floor(lastComboRef.current / 10);
    const currRocket = Math.floor(combo / 10);
    if (currRocket > prevRocket) {
      const angle = Math.random() * Math.PI * 2;
      rocketsRef.current.push({
        x:        cx + Math.cos(angle) * 10,
        y:        cy + Math.sin(angle) * 10,
        vx:       Math.cos(angle) * (3 + Math.random() * 2),
        vy:       Math.sin(angle) * (3 + Math.random() * 2),
        speed:    0,
        type:     'rocket',
        scale:    0.1,
        rotation: angle,
      });
      onRocketSpawnRef.current?.();
    }

    // Shockwave every 100 clicks
    const prevShock = Math.floor(lastComboRef.current / 100);
    const currShock = Math.floor(combo / 100);
    if (currShock > prevShock) {
      shockwavesRef.current.push({ size: 0, opacity: 1, speed: 20 + (combo / 50) });
      onShockwaveRef.current?.();
    }

    lastComboRef.current = combo;
  }, [combo]);

  // --- ANIMATION LOOP ---
  // Only restarts when `level` changes (e.g. to re-init the star field at the right density).
  // Everything else is read from refs, so the loop never needs to restart mid-game.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Size the canvas on (re)start
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Star field — created once per level, persists for the whole level
    const NUM_STARS = 150 + level * 20;
    const stars: { x: number; y: number; z: number; speed: number }[] = [];
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x:     Math.random() * canvas.width  - canvas.width  / 2,
        y:     Math.random() * canvas.height - canvas.height / 2,
        z:     Math.random() * canvas.width,
        speed: 2 + Math.random() * 5,
      });
    }

    const render = () => {
      // Responsive canvas resize
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;

      const currentCombo     = comboRef.current;
      const currentLevel     = levelRef.current;
      const currentStarColor = starColorRef.current;
      const hyperspaceActive = hyperspaceTimerRef.current > 0;

      // Background / hyperspace flash
      if (hyperspaceActive) {
        ctx.fillStyle = `rgba(255, 255, 255, ${hyperspaceTimerRef.current / 60})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        hyperspaceTimerRef.current--;
      } else {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      let speedMult = 1 + currentCombo * 0.05;
      if (hyperspaceActive) speedMult = 50;

      // --- STARS ---
      stars.forEach(star => {
        star.z -= star.speed * speedMult;
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width  - canvas.width  / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const x     = (star.x / star.z) * canvas.width  + cx;
        const y     = (star.y / star.z) * canvas.height + cy;
        const size  = (1 - star.z / canvas.width) * 4 * (currentLevel >= 4 ? 2 : 1);
        const alpha =  1 - star.z / canvas.width;

        ctx.globalAlpha = alpha;

        if (hyperspaceActive || currentLevel >= 3) {
          const streakLen = hyperspaceActive ? 0.5 : 0.1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (x - cx) * streakLen, y + (y - cy) * streakLen);
          ctx.strokeStyle = currentStarColor;
          ctx.lineWidth   = hyperspaceActive ? size * 2 : size;
          ctx.stroke();
        } else {
          ctx.fillStyle = currentStarColor;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // --- SHOCKWAVES ---
      const shockwaves = shockwavesRef.current;
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const s = shockwaves[i];
        s.size    += s.speed;
        s.opacity -= 0.02;
        if (s.opacity <= 0) { shockwaves.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(cx, cy, s.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 255, 255, ${s.opacity})`;
        ctx.lineWidth   = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, s.size * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity * 0.5})`;
        ctx.lineWidth   = 5;
        ctx.stroke();
      }

      // --- ROCKETS ---
      const rockets = rocketsRef.current;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (r.scale < 1.5) r.scale *= 1.02;
        r.vx *= 1.01;
        r.vy *= 1.01;

        const rMult = hyperspaceActive ? 3 : 1;
        r.x += r.vx * rMult;
        r.y += r.vy * rMult;

        // Remove once off-screen
        if (
          r.x > canvas.width  + 200 || r.x < -200 ||
          r.y > canvas.height + 200 || r.y < -200
        ) {
          rockets.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rotation);
        ctx.scale(r.scale, r.scale);

        if (r.type === 'rocket') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.ellipse(0, 0, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.stroke();

          ctx.fillStyle = '#ff0000';
          ctx.beginPath(); ctx.moveTo(15, -8); ctx.quadraticCurveTo(30, 0, 15, 8); ctx.lineTo(15, -8); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-30, -20); ctx.lineTo(-10, -5); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-20,  10); ctx.lineTo(-30,  20); ctx.lineTo(-10,  5); ctx.fill(); ctx.stroke();

          ctx.fillStyle = '#00ffff';
          ctx.beginPath(); ctx.arc(5, -2, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

          ctx.fillStyle = `rgba(255, 165, 0, ${0.7 + Math.random() * 0.3})`;
          ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-50 - Math.random() * 20, 0); ctx.lineTo(-30, 5); ctx.fill();

        } else if (r.type === 'fighter') {
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(-40, 10); ctx.lineTo(-40, -10); ctx.fill();
          ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(-20, -30); ctx.lineTo(20, 0); ctx.lineTo(-20, 30); ctx.stroke();
          ctx.shadowBlur = 20; ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(-40, 0, 5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;

        } else if (r.type === 'ufo') {
          ctx.fillStyle = '#10b981'; ctx.shadowBlur = 30; ctx.shadowColor = '#10b981';
          ctx.beginPath(); ctx.ellipse(0, 0, 50, 15, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(0, -10, 20, Math.PI, 0); ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [level]); // Stars re-init only on level change, NOT every click

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Base Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-20" />

      {/* Level 4: Radial Burst */}
      {level >= 4 && (
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.05)_10deg,transparent_20deg)] animate-[spin_4s_linear_infinite]" />
      )}

      {/* Level 5: Chaos Mode */}
      {level >= 5 && (
        <motion.div
          animate={{ backgroundColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.1)', 'rgba(255,0,0,0)'] }}
          transition={{ duration: 0.2, repeat: Infinity }}
          className="absolute inset-0 mix-blend-overlay"
        />
      )}

      {/* Level 6: Inversion Flashes */}
      {level >= 6 && (
        <motion.div
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 0.5 }}
          className="absolute inset-0 bg-white mix-blend-difference"
        />
      )}
    </div>
  );
}
