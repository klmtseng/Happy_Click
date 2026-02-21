import express from "express";
import { createServer as createViteServer } from "vite";
import { getTopScores, addScore, getRival } from "./db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    // console.log(`${req.method} ${req.url}`); // Uncomment for debug
    next();
  });

  // API Routes
  app.get("/api/leaderboard", (req, res) => {
    try {
      const scores = getTopScores();
      res.json(scores);
    } catch (error) {
      console.error("Leaderboard Error:", error);
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });

  app.get("/api/rival", (req, res) => {
    const score = parseInt(req.query.score as string) || 0;
    try {
      const rival = getRival(score);
      if (rival) {
        res.json(rival);
      } else {
        res.json({
          name: "UNKNOWN_ENTITY",
          score: Math.floor(score * 1.1) + 50,
          rank: 1
        });
      }
    } catch (error) {
      console.error("Rival Error:", error);
      res.status(500).json({ error: "Failed to fetch rival" });
    }
  });

  app.post("/api/leaderboard", (req, res) => {
    const { name, score } = req.body;
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: "Invalid input" });
    }
    try {
      addScore(name, score);
      res.json({ success: true });
    } catch (error) {
      console.error("Submit Error:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
