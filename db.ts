interface Score {
  name: string;
  score: number;
  timestamp: string;
}

// In-memory storage
let scores: Score[] = [];

export const getTopScores = (limit = 10) => {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, limit);
};

export const addScore = (name: string, score: number) => {
  scores.push({ name, score, timestamp: new Date().toISOString() });
};

export const getRival = (currentScore: number) => {
  // Sort ascending
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  // Find first score > currentScore
  const rival = sorted.find(s => s.score > currentScore);
  
  if (!rival) return null;
  
  // Calculate rank (1-based index in descending list)
  const rank = scores.filter(s => s.score > rival.score).length + 1;
  
  return { ...rival, rank };
};
