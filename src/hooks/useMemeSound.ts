import { useRef, useCallback } from 'react';

// Meme milestone definitions - each milestone triggers a unique meme sound/voice
export interface MemeMilestone {
  clicks: number;
  text: string;
  voice: string; // What the TTS says
  soundType: 'fanfare' | 'airhorn' | 'wow' | 'sad_trombone' | 'bruh' | 'oof' | 'victory' | 'dramatic' | 'mlg' | 'nyan' | 'bass_drop' | 'inception' | 'illuminati' | 'dun_dun' | 'rick' | 'triple' | 'wombo' | 'yeet';
  color: string;
}

export const MEME_MILESTONES: MemeMilestone[] = [
  { clicks: 10, text: "FIRST BLOOD!", voice: "First Blood!", soundType: 'fanfare', color: '#ef4444' },
  { clicks: 25, text: "GETTING WARMED UP!", voice: "Getting warmed up!", soundType: 'wow', color: '#f97316' },
  { clicks: 42, text: "MEANING OF LIFE!", voice: "The answer to everything!", soundType: 'dramatic', color: '#8b5cf6' },
  { clicks: 50, text: "HALF CENTURY!", voice: "Half century! Keep going!", soundType: 'airhorn', color: '#eab308' },
  { clicks: 67, text: "SIXTY SEVEN!!", voice: "Six Seven!", soundType: 'mlg', color: '#ff003c' },
  { clicks: 69, text: "NICE. 😏", voice: "Niiiice!", soundType: 'wow', color: '#ec4899' },
  { clicks: 80, text: "EIGHTY BABY!", voice: "Eighty baby!", soundType: 'bass_drop', color: '#06b6d4' },
  { clicks: 100, text: "TRIPLE DIGITS!", voice: "Triple digits! One hundred!", soundType: 'victory', color: '#ffd700' },
  { clicks: 111, text: "ONE ONE ONE!", voice: "One one one! Make a wish!", soundType: 'illuminati', color: '#22d3ee' },
  { clicks: 123, text: "ONE TWO THREE!", voice: "One two three go!", soundType: 'fanfare', color: '#34d399' },
  { clicks: 150, text: "ABSOLUTE UNIT!", voice: "Absolute unit!", soundType: 'bruh', color: '#a78bfa' },
  { clicks: 177, text: "STAY ON TARGET!", voice: "Stay on target!", soundType: 'dramatic', color: '#f472b6' },
  { clicks: 200, text: "TWO HUNDRED!!", voice: "Two hundred! You're unstoppable!", soundType: 'airhorn', color: '#fbbf24' },
  { clicks: 222, text: "TWOS EVERYWHERE!", voice: "Twos everywhere!", soundType: 'dun_dun', color: '#38bdf8' },
  { clicks: 250, text: "QUARTER K!", voice: "Quarter thousand! Let's go!", soundType: 'wow', color: '#4ade80' },
  { clicks: 300, text: "SPARTAN!!", voice: "This is Sparta! Three hundred!", soundType: 'bass_drop', color: '#ef4444' },
  { clicks: 333, text: "HALF EVIL!", voice: "Half evil! Three three three!", soundType: 'illuminati', color: '#7c3aed' },
  { clicks: 350, text: "KEEP IT GOING!", voice: "Keep it going! Don't stop!", soundType: 'fanfare', color: '#fb923c' },
  { clicks: 400, text: "FOUR HUNDRED!", voice: "Four hundred! You're a machine!", soundType: 'victory', color: '#facc15' },
  { clicks: 404, text: "NOT FOUND 💀", voice: "Error four oh four! Clicks not found!", soundType: 'sad_trombone', color: '#64748b' },
  { clicks: 420, text: "BLAZE IT! 🔥", voice: "Four twenty! Blaze it!", soundType: 'mlg', color: '#22c55e' },
  { clicks: 456, text: "SEQUENTIAL!", voice: "Four five six! Sequential perfection!", soundType: 'wow', color: '#06b6d4' },
  { clicks: 500, text: "HALF A THOUSAND!", voice: "Five hundred! Half a thousand! Incredible!", soundType: 'airhorn', color: '#ffd700' },
  { clicks: 555, text: "FIVES ALIVE!", voice: "Five five five! Fives alive!", soundType: 'nyan', color: '#c084fc' },
  { clicks: 600, text: "SIX HUNDRED!!", voice: "Six hundred! You're on fire!", soundType: 'bass_drop', color: '#f43f5e' },
  { clicks: 666, text: "NUMBER OF THE BEAST!", voice: "Six six six! Number of the beast!", soundType: 'dramatic', color: '#dc2626' },
  { clicks: 700, text: "SEVEN HUNDRED!", voice: "Seven hundred! Lucky seven!", soundType: 'fanfare', color: '#0ea5e9' },
  { clicks: 777, text: "JACKPOT!! 🎰", voice: "Seven seven seven! Jackpot!", soundType: 'victory', color: '#fbbf24' },
  { clicks: 800, text: "EIGHT HUNDRED!", voice: "Eight hundred! So close to a thousand!", soundType: 'wow', color: '#10b981' },
  { clicks: 888, text: "LUCKY EIGHTS!", voice: "Triple eights! Maximum luck!", soundType: 'nyan', color: '#f59e0b' },
  { clicks: 900, text: "NINE HUNDRED!", voice: "Nine hundred! Almost there!", soundType: 'airhorn', color: '#8b5cf6' },
  { clicks: 999, text: "SO CLOSE!!", voice: "Nine nine nine! One more!", soundType: 'dramatic', color: '#ef4444' },
  { clicks: 1000, text: "ONE THOUSAND!! 👑", voice: "One thousand! You are a legend!", soundType: 'victory', color: '#ffd700' },
  { clicks: 1111, text: "ELEVEN ELEVEN!", voice: "Eleven eleven! Make a wish!", soundType: 'illuminati', color: '#e879f9' },
  { clicks: 1234, text: "SEQUENTIAL MASTER!", voice: "One two three four! Sequential master!", soundType: 'fanfare', color: '#2dd4bf' },
  { clicks: 1337, text: "L33T H4X0R!", voice: "Leet hacker! Elite status!", soundType: 'mlg', color: '#22c55e' },
  { clicks: 1500, text: "FIFTEEN HUNDRED!", voice: "Fifteen hundred! Halfway to three K!", soundType: 'airhorn', color: '#f97316' },
  { clicks: 1776, text: "INDEPENDENCE!", voice: "Seventeen seventy six! Freedom!", soundType: 'dramatic', color: '#3b82f6' },
  { clicks: 2000, text: "TWO THOUSAND!!", voice: "Two thousand! You can't be stopped!", soundType: 'victory', color: '#ffd700' },
  { clicks: 2048, text: "POWER OF TWO!", voice: "Two thousand forty eight! Power of two!", soundType: 'bass_drop', color: '#a855f7' },
  { clicks: 2500, text: "TWENTY FIVE HUNDRED!", voice: "Twenty five hundred! Quarter way to ten K!", soundType: 'wow', color: '#14b8a6' },
  { clicks: 3000, text: "THREE THOUSAND!!", voice: "Three thousand! Over nine... wait, three thousand!", soundType: 'airhorn', color: '#ef4444' },
  { clicks: 3141, text: "PI CLICKS! π", voice: "Three point one four one! Pi clicks!", soundType: 'illuminati', color: '#6366f1' },
  { clicks: 4000, text: "FOUR THOUSAND!", voice: "Four thousand! Unbelievable!", soundType: 'victory', color: '#eab308' },
  { clicks: 4200, text: "ULTRA BLAZE!", voice: "Forty two hundred! Ultra blaze mode!", soundType: 'mlg', color: '#22c55e' },
  { clicks: 5000, text: "FIVE THOUSAND!! 🏆", voice: "Five thousand! You are a god!", soundType: 'victory', color: '#ffd700' },
  { clicks: 6969, text: "MEGA NICE! 😎", voice: "Sixty nine sixty nine! Mega nice!", soundType: 'wow', color: '#ec4899' },
  { clicks: 7777, text: "MEGA JACKPOT!!", voice: "Seventy seven seventy seven! Mega jackpot!", soundType: 'victory', color: '#fbbf24' },
  { clicks: 9001, text: "OVER 9000!!", voice: "It's over nine thousand!", soundType: 'bass_drop', color: '#ef4444' },
  { clicks: 10000, text: "TEN THOUSAND!! 💎", voice: "Ten thousand! You are immortal!", soundType: 'victory', color: '#ffd700' },
];

// Recurring milestones (trigger every N clicks after the fixed ones)
const RECURRING_INTERVAL = 500; // Every 500 clicks after 10000
const RECURRING_VOICES = [
  "Keep clicking! You're amazing!",
  "Unstoppable force!",
  "The legend continues!",
  "Nothing can stop you now!",
  "Click master supreme!",
  "Beyond all limits!",
  "Infinite power!",
  "You broke the game!",
  "Click deity detected!",
  "Maximum overdrive!",
];

export function useMemeSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const triggeredMilestonesRef = useRef<Set<number>>(new Set());

  const getCtx = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Synthesized meme sounds using Web Audio API
  const playMemeEffect = useCallback((type: MemeMilestone['soundType']) => {
    const ctx = getCtx();
    const t = ctx.currentTime;

    switch (type) {
      case 'fanfare': {
        // Triumphant fanfare - ascending notes
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const start = t + i * 0.15;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.3);
        });
        break;
      }

      case 'airhorn': {
        // MLG airhorn - buzzy stacked oscillators
        [220, 277, 330, 440].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.linearRampToValueAtTime(freq * 1.02, t + 0.5);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.setValueAtTime(0.12, t + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.6);
        });
        break;
      }

      case 'wow': {
        // Owen Wilson "wow" style - sliding sine
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(500, t + 0.15);
        osc.frequency.linearRampToValueAtTime(350, t + 0.4);
        osc.frequency.linearRampToValueAtTime(250, t + 0.7);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.8);
        break;
      }

      case 'sad_trombone': {
        // Wah wah wah wahhh - descending
        const notes = [392, 370, 349, 247];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const start = t + i * 0.35;
          osc.frequency.setValueAtTime(freq, start);
          if (i === 3) {
            osc.frequency.linearRampToValueAtTime(freq * 0.9, start + 0.6);
          }
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + (i === 3 ? 0.8 : 0.3));
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + (i === 3 ? 0.8 : 0.35));
        });
        break;
      }

      case 'bruh': {
        // Low "bruh" - descending bass with noise
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }

      case 'oof': {
        // Roblox "oof" - short punchy
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }

      case 'victory': {
        // Grand victory fanfare
        const notes = [523, 659, 784, 1047, 1319, 1568]; // C E G C E G
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc2.type = 'triangle';
          const start = t + i * 0.1;
          osc.frequency.setValueAtTime(freq, start);
          osc2.frequency.setValueAtTime(freq * 2, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
          osc.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc2.start(start);
          osc.stop(start + 0.5);
          osc2.stop(start + 0.5);
        });
        break;
      }

      case 'dramatic': {
        // DUN DUN DUNNN - dramatic reveal
        const notes = [196, 196, 147]; // G3 G3 D3
        const durations = [0.2, 0.2, 0.8];
        let offset = 0;
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const start = t + offset;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + durations[i]);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + durations[i]);
          offset += durations[i] + 0.05;
        });
        break;
      }

      case 'mlg': {
        // MLG hit marker + airhorn combo
        // Hit marker tick
        const bufSize = ctx.sampleRate * 0.02;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.value = 0.3;
        noise.connect(ng);
        ng.connect(ctx.destination);
        noise.start(t);
        // Then airhorn
        [277, 349, 415].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + 0.1);
          gain.gain.setValueAtTime(0.1, t + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + 0.1);
          osc.stop(t + 0.7);
        });
        break;
      }

      case 'nyan': {
        // Nyan cat - fast repeating arpeggios
        const scale = [659, 784, 880, 988, 1047, 988, 880, 784];
        scale.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const start = t + i * 0.08;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.1);
        });
        break;
      }

      case 'bass_drop': {
        // Heavy bass drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.setValueAtTime(0.4, t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1);
        // Impact noise
        const bufSize = ctx.sampleRate * 0.1;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const ns = ctx.createBufferSource();
        ns.buffer = buf;
        const ng = ctx.createGain();
        ng.gain.value = 0.3;
        ns.connect(ng);
        ng.connect(ctx.destination);
        ns.start(t);
        break;
      }

      case 'inception': {
        // BWAAAH - deep brass-like
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc2.frequency.setValueAtTime(112, t); // Slight detune for width
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.setValueAtTime(0.25, t + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.linearRampToValueAtTime(800, t + 0.3);
        filter.frequency.linearRampToValueAtTime(200, t + 1.5);
        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc2.start(t);
        osc.stop(t + 1.5);
        osc2.stop(t + 1.5);
        break;
      }

      case 'illuminati': {
        // Spooky X-Files style
        const notes = [659, 622, 659, 494, 587, 554, 587, 440];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const start = t + i * 0.2;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.25);
        });
        break;
      }

      case 'dun_dun': {
        // Law & Order "dun dun"
        [293, 220].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const start = t + i * 0.25;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.3, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.25);
        });
        break;
      }

      case 'rick': {
        // Never gonna give you up opening notes approximation
        const notes = [392, 440, 523, 440, 659, 659, 587];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const start = t + i * 0.12;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.15);
        });
        break;
      }

      case 'triple': {
        // OH BABY A TRIPLE - ascending triple notes
        [440, 554, 659].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const start = t + i * 0.1;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.2);
        });
        break;
      }

      case 'wombo': {
        // Wombo combo - rapid escalating hits
        for (let i = 0; i < 6; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const start = t + i * 0.06;
          osc.frequency.setValueAtTime(300 + i * 80, start);
          gain.gain.setValueAtTime(0.1 + i * 0.02, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.08);
        }
        break;
      }

      case 'yeet': {
        // Rising swoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(-1, t);
        panner.pan.linearRampToValueAtTime(1, t + 0.4);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }
    }
  }, [getCtx]);

  const playMemeVoice = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name === 'Google US English') ||
                           voices.find(v => v.name.includes('David')) ||
                           voices.find(v => v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);

    // Echo
    setTimeout(() => {
      const echo = new SpeechSynthesisUtterance(text);
      echo.rate = 1.2;
      echo.pitch = 0.9;
      echo.volume = 0.4;
      if (preferredVoice) echo.voice = preferredVoice;
      window.speechSynthesis.speak(echo);
    }, 200);
  }, []);

  const checkMilestone = useCallback((totalClicks: number): MemeMilestone | null => {
    // Check fixed milestones
    const milestone = MEME_MILESTONES.find(m => m.clicks === totalClicks);
    if (milestone && !triggeredMilestonesRef.current.has(totalClicks)) {
      triggeredMilestonesRef.current.add(totalClicks);
      playMemeEffect(milestone.soundType);
      setTimeout(() => playMemeVoice(milestone.voice), 300);
      return milestone;
    }

    // Check recurring milestones (every 500 after 10000)
    if (totalClicks > 10000 && totalClicks % RECURRING_INTERVAL === 0 && !triggeredMilestonesRef.current.has(totalClicks)) {
      triggeredMilestonesRef.current.add(totalClicks);
      const soundTypes: MemeMilestone['soundType'][] = ['victory', 'airhorn', 'bass_drop', 'mlg', 'fanfare', 'wow'];
      const colors = ['#ffd700', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'];
      const idx = Math.floor(Math.random() * soundTypes.length);
      const voice = RECURRING_VOICES[Math.floor(Math.random() * RECURRING_VOICES.length)];
      const recurring: MemeMilestone = {
        clicks: totalClicks,
        text: `${totalClicks.toLocaleString()} CLICKS!`,
        voice,
        soundType: soundTypes[idx],
        color: colors[idx],
      };
      playMemeEffect(recurring.soundType);
      setTimeout(() => playMemeVoice(recurring.voice), 300);
      return recurring;
    }

    return null;
  }, [playMemeEffect, playMemeVoice]);

  const resetMilestones = useCallback(() => {
    triggeredMilestonesRef.current.clear();
  }, []);

  // Get next upcoming milestone
  const getNextMilestone = useCallback((totalClicks: number): MemeMilestone | null => {
    return MEME_MILESTONES.find(m => m.clicks > totalClicks) || null;
  }, []);

  return { checkMilestone, resetMilestones, getNextMilestone };
}
