//
// src/services/leaderboard.ts
//
// All components read/write through these three functions only.
// Backing store: Vercel Serverless Functions → Neon PostgreSQL (global shared).
// Local dev:     same fetch() calls → Express server → in-memory DB (server.ts).
//
// If you ever need to swap the backend, change only this file.
//

export interface ScoreEntry {
  name: string;
  score: number;
}

export interface Rival {
  name: string;
  score: number;
  rank: number;
}

export async function getTopScores(limit = 10): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`/api/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return [];
  }
}

export async function addScore(name: string, score: number): Promise<void> {
  try {
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
  } catch {
    // fail silently — score submission is best-effort
  }
}

export async function getRival(currentScore: number): Promise<Rival | null> {
  try {
    const res = await fetch(`/api/rival?score=${currentScore}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
