import express from 'express';
import { pool } from './db.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const userId = req.userId;
  const { date, content, mood, activities } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, date, content, mood, activities)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, date, content, mood, activities]
    );
    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  const userId = req.userId;
  const entryId = req.params.id;
  const { date, content, mood, activities } = req.body;

  try {
    const entryCheck = await pool.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );
    if (entryCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      `UPDATE journal_entries
       SET date = $1, content = $2, mood = $3, activities = $4
       WHERE id = $5 RETURNING *`,
      [date, content, mood, activities, entryId]
    );
    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  const userId = req.userId;
  const entryId = req.params.id;

  try {
    const entryCheck = await pool.query(
      'SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );
    if (entryCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await pool.query('DELETE FROM journal_entries WHERE id = $1', [entryId]);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
