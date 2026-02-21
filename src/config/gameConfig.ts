// Central configuration — ALL game parameters live here.
// To tune gameplay or add content, only edit this file.

import type { Level } from '../types/game';

// ─── Levels ──────────────────────────────────────────────────────────────────
// Add new levels by appending to this array.
// `threshold` = minimum combo needed to enter the level.
export const LEVELS: Level[] = [
  { id: 1, threshold:   0, name: 'NOVICE',      color: 'text-white'      },
  { id: 2, threshold:  10, name: 'AWAKENING',   color: 'text-cyan-400'   },
  { id: 3, threshold:  30, name: 'OVERDRIVE',   color: 'text-green-400'  },
  { id: 4, threshold:  60, name: 'RAMPAGE',     color: 'text-yellow-400' },
  { id: 5, threshold: 100, name: 'GODLIKE',     color: 'text-red-500'    },
  { id: 6, threshold: 200, name: 'SINGULARITY', color: 'text-purple-500' },
];

// ─── Combo Decay ──────────────────────────────────────────────────────────────
export const DECAY_CONFIG = {
  START_DELAY_MS: 2000, // Idle time before decay begins
  RATE_MS:         100, // How often decay ticks (ms)
  FACTOR:         0.90, // Combo multiplied by this each tick (0.90 = lose 10%)
} as const;

// ─── Combo Event Milestones ───────────────────────────────────────────────────
export const COMBO_EVENTS = {
  ROCKET_INTERVAL:     10,  // Spawn a rocket every N clicks
  SHOCKWAVE_INTERVAL: 100,  // Emit a shockwave ring every N clicks
  HYPERSPACE_INTERVAL: 300, // Trigger hyperspace every N clicks
  FEEDBACK_INTERVAL:    20, // Show a floating feedback word every N clicks
  SPECIAL_COMBO:        67, // The one special combo number
} as const;

// ─── Messages ─────────────────────────────────────────────────────────────────
// Add or remove entries freely — no other file needs to change.

export const FEEDBACK_MESSAGES = [
  'COOL!', 'SICK!', 'RAD!', 'EPIC!', 'WILD!', 'HYPER!',
  'MAX!',  'YEAH!', 'SUPER!', 'INSANE!', 'POWER!', 'SPEED!', 'CRAZY!',
] as const;

// Extra words unlocked at higher combos
export const FEEDBACK_HIGH_MESSAGES = [
  'AMAZING!', 'AWESOME!', 'UNSTOPPABLE!', 'MONSTER!', 'GODLIKE!', 'LEGEND!',
] as const;

export const SYSTEM_LOG_MESSAGES = [
  'SYNC RATE INCREASING...',
  'LIMITER RELEASED',
  'ENERGY SURGE DETECTED',
  'CORE TEMP RISING',
  'NEURAL LINK ESTABLISHED',
  'PROTOCOL 77-B ACTIVE',
  'OVERCLOCKING...',
  'DATA STREAM STABLE',
  'RESONANCE DETECTED',
  'AT FIELD NEUTRALIZED',
] as const;

// ─── Visual ───────────────────────────────────────────────────────────────────
// Star colors that cycle on each hyperspace jump
export const HYPERSPACE_STAR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
] as const;
