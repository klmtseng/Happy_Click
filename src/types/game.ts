// Shared type definitions — single source of truth for the whole project

export interface Score {
  name: string;
  score: number;
  timestamp?: string;
}

export interface Level {
  id: number;
  threshold: number; // Minimum combo required to reach this level
  name: string;
  color: string;     // Tailwind class for text color
}
