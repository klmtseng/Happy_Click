//
// src/services/leaderboard.ts
//
// Phase 1 (current): localStorage — per-browser, works on Vercel static deployment.
//
// To upgrade to Phase 2 (global shared leaderboard):
//   1. Create Vercel serverless functions:
//        api/leaderboard.ts  →  GET (top scores)  +  POST (add score)
//        api/rival.ts        →  GET ?score=N       →  return rival entry
//   2. Add your database URL in Vercel → Settings → Environment Variables
//      (e.g. POSTGRES_URL from Neon, or use Vercel KV)
//   3. Replace the three functions below with fetch() calls to those endpoints.
//   4. Components (Leaderboard, RivalTracker, GameOverModal) require NO changes.
//

const STORAGE_KEY = 'leaderboard';
const MAX_ENTRIES = 10;

export interface ScoreEntry {
  name: string;
  score: number;
}

export interface Rival {
  name: string;
  score: number;
  rank: number;
}

function readStorage(): ScoreEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function getTopScores(limit = 10): Promise<ScoreEntry[]> {
  const scores = readStorage();
  return scores.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function addScore(name: string, score: number): Promise<void> {
  const scores = readStorage();
  const updated = [...scores, { name, score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getRival(currentScore: number): Promise<Rival | null> {
  const scores = readStorage();
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  const rival = sorted.find(s => s.score > currentScore);
  if (!rival) return null;
  const rank = scores.filter(s => s.score > rival.score).length + 1;
  return { ...rival, rank };
}
