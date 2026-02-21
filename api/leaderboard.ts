import { neon } from '@neondatabase/serverless';

// Module-level: created once per cold start, reused on warm starts
const sql = neon(process.env.DATABASE_URL!);
let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id    SERIAL       PRIMARY KEY,
      name  VARCHAR(10)  NOT NULL,
      score INTEGER      NOT NULL,
      ts    TIMESTAMPTZ  DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export default async function handler(req: any, res: any) {
  try {
    await ensureTable();

    if (req.method === 'GET') {
      const limit = Math.min(parseInt(req.query?.limit) || 10, 100);
      const scores = await sql`
        SELECT name, score
        FROM scores
        ORDER BY score DESC
        LIMIT ${limit}
      `;
      return res.json(scores);
    }

    if (req.method === 'POST') {
      const { name, score } = req.body ?? {};
      if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid input' });
      }
      await sql`INSERT INTO scores (name, score) VALUES (${name}, ${score})`;
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[leaderboard]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
