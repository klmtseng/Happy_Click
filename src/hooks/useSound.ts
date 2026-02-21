import { useRef, useCallback, useState, useEffect } from 'react';

export function useSound(combo: number, bgmPhase: number) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const comboRef = useRef(combo);
  const bgmPhaseRef = useRef(bgmPhase);

  // Keep refs in sync
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    bgmPhaseRef.current = bgmPhase;
  }, [bgmPhase]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const bgmRef = useRef<{
    kick?: number;
    hat?: number;
    bass?: number;
    engine?: AudioNode;
    ctx?: AudioContext;
    isPlaying: boolean;
  }>({ isPlaying: false });

  const [isMuted, setIsMuted] = useState(false); // Default ON (not muted)

  const toggleMute = useCallback(() => {
    if (!audioContextRef.current) initAudio();
    
    if (isMuted) {
      // Unmute
      setIsMuted(false);
      if (!bgmRef.current.isPlaying) {
        startBgm();
      }
    } else {
      // Mute
      setIsMuted(true);
      stopBgm();
    }
  }, [isMuted, initAudio]);

  const stopBgm = () => {
      bgmRef.current.isPlaying = false;
      if (bgmRef.current.engine) {
          try { (bgmRef.current.engine as any).stop(); } catch(e) {}
          (bgmRef.current.engine as any).disconnect();
      }
  };

  const startBgm = () => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current!;
      bgmRef.current.isPlaying = true;

      // 1. Engine Drone (Always on)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.value = 80; // Low rumble
      
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      
      gain.gain.value = 0.15;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      
      bgmRef.current.engine = osc;

      // 2. The Beat Loop (Scheduler)
      let nextNoteTime = ctx.currentTime;
      
      const schedule = () => {
        if (!bgmRef.current.isPlaying) return;
        
        // Dynamic Tempo Calculation (Cyclic)
        // Resets every 500 combo to give the "slow down then speed up" feel
        const currentCombo = comboRef.current;
        const cycleCombo = currentCombo % 500; // 0 to 500
        const tempo = Math.min(130 + (cycleCombo / 100) * 15, 300); // 130 -> 205+ BPM
        const secondsPerBeat = 60.0 / tempo;

        while (nextNoteTime < ctx.currentTime + 0.1) {
            playBeat(nextNoteTime, bgmPhaseRef.current);
            nextNoteTime += secondsPerBeat / 4; // 16th notes
        }
        requestAnimationFrame(schedule);
      };
      
      let beatCount = 0;
      const playBeat = (time: number, phase: number) => {
          // Phase determines the "Key" or "Feel"
          // Phase 0: Base
          // Phase 1: Higher Pitch
          // Phase 2: Darker
          // etc.
          const baseFreq = 100 + (phase % 5) * 20;

          // Kick (Every quarter note)
          if (beatCount % 4 === 0) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.setValueAtTime(baseFreq * 1.5, time);
              osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
              gain.gain.setValueAtTime(0.8, time);
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(time);
              osc.stop(time + 0.5);
          }
          
          // Hi-hat
          if (beatCount % 2 !== 0) {
              const bufferSize = ctx.sampleRate * 0.05;
              const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
              const data = buffer.getChannelData(0);
              for (let i = 0; i < bufferSize; i++) {
                  data[i] = Math.random() * 2 - 1;
              }
              const noise = ctx.createBufferSource();
              noise.buffer = buffer;
              const filter = ctx.createBiquadFilter();
              filter.type = 'highpass';
              filter.frequency.value = 5000 + (phase % 3) * 1000;
              const gain = ctx.createGain();
              gain.gain.value = 0.1; 
              gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
              noise.connect(filter);
              filter.connect(gain);
              gain.connect(ctx.destination);
              noise.start(time);
          }
          
          // Bass (Off-beats)
          if (beatCount % 4 === 2) {
               const osc = ctx.createOscillator();
               const gain = ctx.createGain();
               osc.type = phase % 2 === 0 ? 'sawtooth' : 'square';
               osc.frequency.setValueAtTime(baseFreq, time);
               gain.gain.setValueAtTime(0.2, time);
               gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
               osc.connect(gain);
               gain.connect(ctx.destination);
               osc.start(time);
               osc.stop(time + 0.2);
          }

          beatCount = (beatCount + 1) % 16;
      };
      
      schedule();
  };

  // Auto-start BGM on first interaction if not muted
  const ensureBgmRunning = useCallback(() => {
      if (!isMuted && !bgmRef.current.isPlaying && audioContextRef.current?.state === 'running') {
          startBgm();
      }
  }, [isMuted]);

  const playClickSound = useCallback((combo: number = 0) => {
    if (!audioContextRef.current) initAudio();
    ensureBgmRunning();
    
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // "Gear Shift" Logic
    const GEAR_SIZE = 12; // Shifts every 12 clicks
    const gear = Math.floor(combo / GEAR_SIZE);
    const step = combo % GEAR_SIZE;
    
    // Base frequency rises slowly with every gear (The "Base Instrument" rising)
    const gearBaseFreq = 150 + (gear * 30); 
    
    // Pitch rises rapidly within a gear (The "Revving" engine)
    const revAmount = step * 25; 
    
    const finalFreq = gearBaseFreq + revAmount;

    // Oscillator 1: Engine/Main Tone (Sawtooth for aggressive "bite")
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(finalFreq, t);
    // Pitch drop envelope for "punch"
    osc1.frequency.exponentialRampToValueAtTime(finalFreq * 0.5, t + 0.1);
    
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Oscillator 2: Sub/Body (Sine wave) - Adds weight
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(finalFreq * 0.5, t); // Octave down
    gain2.gain.setValueAtTime(0.3, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.15);

    // Oscillator 3: Gear Shift Whine (Square) - Emphasize the "Rev"
    // Louder as we get closer to shifting gear
    const revIntensity = step / GEAR_SIZE;
    if (revIntensity > 0.5) {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'square';
      osc3.frequency.setValueAtTime(finalFreq * 1.5, t); // Fifth
      
      gain3.gain.setValueAtTime(0.05 * revIntensity, t);
      gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(t);
      osc3.stop(t + 0.15);
    }

    // Noise Burst (Kick/Snare impact)
    const bufferSize = ctx.sampleRate * 0.03; // Short snappy click
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1 + (gear * 0.01), t); // Noise gets slightly louder with gears
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

  }, [initAudio, ensureBgmRunning]);

  const playHyperspaceSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // "Whoosh" - Filtered Noise Sweep
    const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1;
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(8000, t + 0.5); // Sweep up
    filter.frequency.exponentialRampToValueAtTime(100, t + 1.5); // Sweep down
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);
    
    // Pan effect (Left to Right)
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(-1, t);
    panner.pan.linearRampToValueAtTime(1, t + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    
    noise.start(t);
  }, []);

  const playRocketSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // "Pew" / Launch sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }, []);

  const playShockwaveSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // "Boom" / Pulse sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }, []);

  const playEncouragementSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // "咻咻" - High pitched double whistle
    const playWhistle = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, startTime);
        osc.frequency.exponentialRampToValueAtTime(2000, startTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, startTime); // Increased from 0.1 to 0.3
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.1);
    };

    playWhistle(t);
    playWhistle(t + 0.15);
  }, []);

  const playFlybySound = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // Fast Doppler-like swoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.4); // Pitch drop (Doppler)

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.2);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);

    // Pan from left to right (or random?)
    // Let's randomize direction slightly
    const startPan = Math.random() > 0.5 ? -1 : 1;
    panner.pan.setValueAtTime(startPan, t);
    panner.pan.linearRampToValueAtTime(-startPan, t + 0.4);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.4);
  }, []);

  const playSpecialVoice = useCallback((text: string, echo: boolean = false) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech to ensure immediate shout
      window.speechSynthesis.cancel();

      const speak = (delay: number = 0, volume: number = 1) => {
          const utterance = new SpeechSynthesisUtterance(text);
          // Changed from "Movie Trailer" (0.4 pitch) to "Energetic Announcer"
          utterance.rate = 1.1; // Slightly fast
          utterance.pitch = 0.8; // Slightly deep but natural
          utterance.volume = volume;
          
          // Try to find a good male voice, but maybe not the "Google UK Male" if that was bad.
          // Let's try to find a standard "Google US English" or "Microsoft David" type.
          const voices = window.speechSynthesis.getVoices();
          
          // Priority: 
          // 1. "Google US English" (Standard, clean)
          // 2. "Microsoft David" (Standard Windows Male)
          // 3. Any "English" voice
          const preferredVoice = voices.find(v => v.name === 'Google US English') || 
                                 voices.find(v => v.name.includes('David')) ||
                                 voices.find(v => v.lang === 'en-US');
          
          if (preferredVoice) utterance.voice = preferredVoice;

          if (delay > 0) {
              setTimeout(() => window.speechSynthesis.speak(utterance), delay);
          } else {
              window.speechSynthesis.speak(utterance);
          }
      };

      // Main Voice
      speak(0, 1);
      
      if (echo) {
        // Echo 1
        speak(150, 0.6);
        
        // Echo 2
        speak(300, 0.3);
      }
    }
  }, []);

  const playLevelUpSound = useCallback(() => {
    if (!audioContextRef.current) initAudio();
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;
    
    // Arpeggio effect
    const notes = [440, 554, 659, 880, 1108, 1318]; // A Major
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = t + i * 0.05;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }, [initAudio]);

  const playDecaySound = useCallback((combo: number = 0) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current!;
    const t = ctx.currentTime;

    // "Falling" sound effect
    // Higher combo = Higher start pitch (Falling from greater height)
    const startFreq = 200 + Math.min(combo * 5, 800); 
    const endFreq = Math.max(50, startFreq * 0.5);

    // Oscillator 1: The "Whistle" of falling
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine'; // Sine gives a cleaner "cartoon fall" feel, Sawtooth is more "alarm"
    // Let's mix: Sine for the drop, slight noise for wind?
    // Actually, a Triangle wave cuts through better for "urgency" without being too harsh
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15); // Dramatic slide down
    
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);

    // Oscillator 2: Dissonant undertone for "Urgency/Warning"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(startFreq * 0.95, t); // Slight detune
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 0.9, t + 0.15);
    
    gain2.gain.setValueAtTime(0.05, t); // Quieter
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(t);
    osc2.stop(t + 0.15);

  }, []);

  return { playClickSound, playLevelUpSound, initAudio, playSpecialVoice, playDecaySound, toggleMute, isMuted, playHyperspaceSound, playRocketSound, playShockwaveSound, playEncouragementSound, playFlybySound };
}
