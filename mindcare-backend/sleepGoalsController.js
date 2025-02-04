// sleepGoalsController.js
import { pool } from './db.js';

export const getSleepGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const query = `SELECT * FROM sleep_goals WHERE user_id = $1;`;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.json(null); // user has no goal yet
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching sleep goal:', error);
    res.status(500).json({ error: 'Failed to fetch sleep goal.' });
  }
};

export const upsertSleepGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      daily_sleep_target,
      target_bedtime,
      target_waketime
    } = req.body;

    // If row doesn't exist, create it; otherwise update it.
    const query = `
      INSERT INTO sleep_goals (user_id, daily_sleep_target, target_bedtime, target_waketime)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        daily_sleep_target = EXCLUDED.daily_sleep_target,
        target_bedtime = EXCLUDED.target_bedtime,
        target_waketime = EXCLUDED.target_waketime,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      userId,
      daily_sleep_target,
      target_bedtime || null,
      target_waketime || null,
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error upserting sleep goal:', error);
    res.status(500).json({ error: 'Failed to update or create sleep goal.' });
  }
};
