import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';

interface BackgroundEffectsProps {
  level: number;
  combo: number;
}

export function BackgroundEffects({ level, combo }: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastComboRef = useRef(combo);
  const nextHyperspaceTargetRef = useRef(800 + Math.floor(Math.random() * 21) - 10); // 790-810

  // Starfall & Rocket Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const stars: { x: number; y: number; z: number; speed: number }[] = [];
    const shockwaves: { size: number; opacity: number; speed: number }[] = [];
    let hyperspaceActive = false;
    let hyperspaceTimer = 0;

    const numStars = 100 + (combo * 2); 

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            z: Math.random() * canvas.width,
            speed: 2 + Math.random() * 5
        });
    }

    // --- EVENT TRIGGERS ---
    if (combo > lastComboRef.current) {
        // 1. Rocket Spawn: EVERY 10 CLICKS
        // Spawn from center (behind button) and fly OUTWARDS
        const prevRocket = Math.floor(lastComboRef.current / 10);
        const currRocket = Math.floor(combo / 10);
        
        if (currRocket > prevRocket) {
            const count = 1; 
            for (let i = 0; i < count; i++) {
                // Always cartoon rocket for this effect
                let type: 'rocket' | 'fighter' | 'ufo' = 'rocket'; 
                
                // Random angle
                const angle = Math.random() * Math.PI * 2;
                
                // Start very close to center (behind button)
                const startDist = 10; 
                
                rocketsRef.current.push({
                    x: cx + Math.cos(angle) * startDist,
                    y: cy + Math.sin(angle) * startDist,
                    // Velocity vector
                    vx: Math.cos(angle) * (3 + Math.random() * 2),
                    vy: Math.sin(angle) * (3 + Math.random() * 2),
                    speed: 0, // Unused
                    type: type,
                    scale: 0.1, // Start tiny
                    rotation: angle
                });
                
                onRocketSpawn();
            }
        }

        // 2. Light Ring Shockwave: Every 100 clicks
        const prevShock = Math.floor(lastComboRef.current / 100);
        const currShock = Math.floor(combo / 100);
        if (currShock > prevShock) {
            shockwaves.push({ size: 0, opacity: 1, speed: 20 + (combo / 50) });
        }

        // 3. Hyperspace Jump: Every ~800 clicks
        if (combo >= nextHyperspaceTargetRef.current && lastComboRef.current < nextHyperspaceTargetRef.current) {
            hyperspaceActive = true;
            hyperspaceTimer = 60; // 1 second at 60fps
            // Set next target: Current + 800 +/- 10
            nextHyperspaceTargetRef.current += 800 + Math.floor(Math.random() * 21) - 10;
        }
    }
    lastComboRef.current = combo;

    const render = () => {
        // Resize handling
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        // Clear
        // If hyperspace, white flash fade
        if (hyperspaceActive) {
            ctx.fillStyle = `rgba(255, 255, 255, ${hyperspaceTimer / 60})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            hyperspaceTimer--;
            if (hyperspaceTimer <= 0) hyperspaceActive = false;
        } else {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.3)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        // Speed multiplier based on combo OR hyperspace
        let speedMult = 1 + (combo * 0.05);
        if (hyperspaceActive) speedMult = 50; // HYPER SPEED

        // --- STARS ---
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            star.z -= star.speed * speedMult;
            if (star.z <= 0) {
                star.z = canvas.width;
                star.x = Math.random() * canvas.width - canvas.width / 2;
                star.y = Math.random() * canvas.height - canvas.height / 2;
            }
            const x = (star.x / star.z) * canvas.width + cx;
            const y = (star.y / star.z) * canvas.height + cy;
            const size = (1 - star.z / canvas.width) * 4 * (level >= 4 ? 2 : 1);
            const alpha = (1 - star.z / canvas.width);
            ctx.globalAlpha = alpha;
            
            // Hyperspace streaks
            if (hyperspaceActive || level >= 3) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                // Longer streaks in hyperspace
                const streakLen = hyperspaceActive ? 0.5 : 0.1;
                ctx.lineTo(x + (x - cx) * streakLen, y + (y - cy) * streakLen);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = hyperspaceActive ? size * 2 : size;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;

        // --- SHOCKWAVES (Light Rings) ---
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const s = shockwaves[i];
            s.size += s.speed;
            s.opacity -= 0.02;
            
            if (s.opacity <= 0) {
                shockwaves.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(cx, cy, s.size, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 255, 255, ${s.opacity})`;
            ctx.lineWidth = 10;
            ctx.stroke();
            
            // Inner ring
            ctx.beginPath();
            ctx.arc(cx, cy, s.size * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity * 0.5})`;
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        // --- ROCKETS ---
        for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
            const r = rocketsRef.current[i];
            // Grow to max size of ~1cm (approx 40px)
            // Start at 0.1 scale (4px), end at 1.0 scale (40px)
            if (r.scale < 1.5) {
                r.scale *= 1.02;
            }
            
            // Also accelerate velocity slightly
            r.vx *= 1.01;
            r.vy *= 1.01;

            // 3D "Fly Out" Effect
            // Accelerate outwards
            const rocketSpeedMult = hyperspaceActive ? 3 : 1;
            
            r.x += r.vx * rocketSpeedMult;
            r.y += r.vy * rocketSpeedMult;

            ctx.save();
            ctx.translate(r.x, r.y);
            ctx.rotate(r.rotation);
            ctx.scale(r.scale, r.scale);
            
            // Draw based on type (Same as before)
            if (r.type === 'rocket') {
                // CARTOON ROCKET STYLE
                // White body with red tip and blue window
                
                // Body
                ctx.fillStyle = '#ffffff'; 
                ctx.beginPath(); ctx.ellipse(0, 0, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
                // Outline
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Red Tip
                ctx.fillStyle = '#ff0000'; 
                ctx.beginPath(); 
                ctx.moveTo(15, -8); 
                ctx.quadraticCurveTo(30, 0, 15, 8); 
                ctx.lineTo(15, -8); 
                ctx.fill();
                ctx.stroke();

                // Fins
                ctx.fillStyle = '#ff0000';
                ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-30, -20); ctx.lineTo(-10, -5); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-20, 10); ctx.lineTo(-30, 20); ctx.lineTo(-10, 5); ctx.fill(); ctx.stroke();

                // Window
                ctx.fillStyle = '#00ffff'; 
                ctx.beginPath(); ctx.arc(5, -2, 6, 0, Math.PI * 2); ctx.fill();
                ctx.stroke();

                // Flame
                ctx.fillStyle = `rgba(255, 165, 0, ${0.7 + Math.random() * 0.3})`;
                ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-50 - Math.random() * 20, 0); ctx.lineTo(-30, 5); ctx.fill();
            } else if (r.type === 'fighter') {
                ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(-40, 10); ctx.lineTo(-40, -10); ctx.fill();
                ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-20, -30); ctx.lineTo(20, 0); ctx.lineTo(-20, 30); ctx.stroke();
                ctx.shadowBlur = 20; ctx.shadowColor = '#06b6d4'; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-40, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            } else if (r.type === 'ufo') {
                ctx.fillStyle = '#10b981'; ctx.shadowBlur = 30; ctx.shadowColor = '#10b981'; ctx.beginPath(); ctx.ellipse(0, 0, 50, 15, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -10, 20, Math.PI, 0); ctx.fill(); ctx.shadowBlur = 0;
            }

            ctx.restore();

            if (r.x > canvas.width + 200) {
                rocketsRef.current.splice(i, 1);
            }
        }

        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [level, combo]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Base Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-20" />

      {/* Level 4: Speed Lines / Radial Burst */}
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
      
      {/* Level 6: Inversion flashes */}
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
