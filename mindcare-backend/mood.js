import express from 'express';
import { pool } from './db.js';
import verifyToken from './middleware/auth.js';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';

dayjs.extend(isBetween);

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { mood, reason, description } = req.body;
  const userId = req.userId;

  if (!mood || !reason) {
    return res.status(400).json({ msg: 'Mood and reason are required.' });
  }

  try {
    const newMood = await pool.query(
      'INSERT INTO moods (user_id, mood, reason, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, mood, reason, description]
    );
    console.log('New mood entry added:', newMood.rows[0]);
    res.status(201).json(newMood.rows[0]);
  } catch (error) {
    console.error('Error adding mood entry:', error.message);
    res.status(500).json({ msg: 'Failed to add mood entry. Please try again later.' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { timeframe } = req.query; 

  let query = 'SELECT * FROM moods WHERE user_id = $1';
  let values = [userId];

  const now = dayjs();
  let startDate;

  if (timeframe === 'day') {
    startDate = now.startOf('day').toDate();
    query += ' AND created_at >= $2 ORDER BY created_at ASC';
    values.push(startDate);
  } else if (timeframe === 'week') {
    startDate = now.startOf('week').toDate();
    query += ' AND created_at >= $2 ORDER BY created_at ASC';
    values.push(startDate);
  } else if (timeframe === 'month') {
    startDate = now.startOf('month').toDate();
    query += ' AND created_at >= $2 ORDER BY created_at ASC';
    values.push(startDate);
  } else if (timeframe === 'year') {
    startDate = now.startOf('year').toDate();
    query += ' AND created_at >= $2 ORDER BY created_at ASC';
    values.push(startDate);
  } else {
    query += ' ORDER BY created_at ASC';
  }

  try {
    const moods = await pool.query(query, values);
    console.log(`Retrieved ${moods.rows.length} mood entries for timeframe: ${timeframe}`);
    res.json(moods.rows);
  } catch (error) {
    console.error('Error fetching mood entries:', error.message);
    res.status(500).json({ msg: 'Failed to fetch mood entries. Please try again later.' });
  }
});

export default router;
