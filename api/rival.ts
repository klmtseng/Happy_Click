import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const currentScore = parseInt(req.query?.score) || 0;

    // Find the lowest score that still beats the current score,
    // and calculate that entry's rank in one query.
    const result = await sql`
      SELECT
        name,
        score,
        (
          SELECT COUNT(*)::int + 1
          FROM scores s2
          WHERE s2.score > scores.score
        ) AS rank
      FROM scores
      WHERE score > ${currentScore}
      ORDER BY score ASC
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.json(null);
    }

    res.json(result[0]);
  } catch (err) {
    console.error('[rival]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
