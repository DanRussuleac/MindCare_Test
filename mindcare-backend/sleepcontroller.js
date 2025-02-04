// sleepcontroller.js
import { pool } from './db.js';
import dayjs from 'dayjs';

/**
 * Create a new sleep entry for the authenticated user
 * Duration is computed on the server (end_time - start_time)
 */
export const createSleepEntry = async (req, res) => {
  try {
    const userId = req.userId; // from verifyToken middleware
    const { start_time, end_time, sleep_quality, notes } = req.body;

    // Compute duration in hours (as a floating number)
    const start = dayjs(start_time);
    const end = dayjs(end_time);
    const duration_hours = end.diff(start, 'hour', true); 
    // e.g. 2.5 hours if end-start is 2h30m

    const query = `
      INSERT INTO sleep_entries (user_id, start_time, end_time, duration_hours, sleep_quality, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      userId,
      start_time,
      end_time,
      duration_hours,
      sleep_quality || null,
      notes || null,
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sleep entry:', error);
    res.status(500).json({ error: 'Failed to create sleep entry.' });
  }
};

/**
 * Get all sleep entries for the authenticated user
 */
export const getAllSleepEntries = async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT *
      FROM sleep_entries
      WHERE user_id = $1
      ORDER BY start_time DESC;
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    res.status(500).json({ error: 'Failed to fetch sleep entries.' });
  }
};

/**
 * Get a specific sleep entry by ID
 */
export const getSleepEntryById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const query = `
      SELECT *
      FROM sleep_entries
      WHERE id = $1
        AND user_id = $2;
    `;
    const result = await pool.query(query, [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sleep entry not found.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting sleep entry by id:', error);
    res.status(500).json({ error: 'Failed to get sleep entry.' });
  }
};

/**
 * Update a sleep entry by ID
 * Again, duration_hours is recomputed from new start_time/end_time
 */
export const updateSleepEntry = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { start_time, end_time, sleep_quality, notes } = req.body;

    // Recompute duration based on any new start/end time
    const start = dayjs(start_time);
    const end = dayjs(end_time);
    const duration_hours = end.diff(start, 'hour', true);

    const query = `
      UPDATE sleep_entries
      SET
        start_time = $1,
        end_time = $2,
        duration_hours = $3,
        sleep_quality = $4,
        notes = $5
      WHERE id = $6
        AND user_id = $7
      RETURNING *;
    `;
    const values = [
      start_time,
      end_time,
      duration_hours,
      sleep_quality || null,
      notes || null,
      id,
      userId,
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sleep entry not found or not yours.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating sleep entry:', error);
    res.status(500).json({ error: 'Failed to update sleep entry.' });
  }
};

/**
 * Delete a sleep entry
 */
export const deleteSleepEntry = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const query = `
      DELETE FROM sleep_entries
      WHERE id = $1
        AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sleep entry not found or not yours.' });
    }
    res.json({ message: 'Sleep entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    res.status(500).json({ error: 'Failed to delete sleep entry.' });
  }
};
