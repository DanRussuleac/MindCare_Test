// remindersController.js
import { pool } from './db.js';
import dayjs from 'dayjs';

// CREATE reminder
export const createReminder = async (req, res) => {
  try {
    const userId = req.userId; // 'verifyToken' sets req.userId
    const { content, reminder_time } = req.body;

    const query = `
      INSERT INTO reminders (user_id, content, reminder_time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userId, content, reminder_time];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return res.status(500).json({ error: 'Failed to create reminder.' });
  }
};

// GET all reminders (with is_overdue logic)
export const getReminders = async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT *,
        CASE WHEN reminder_time < NOW() AND is_completed = false THEN true
             ELSE false
        END AS is_overdue
      FROM reminders
      WHERE user_id = $1
      ORDER BY reminder_time ASC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return res.status(500).json({ error: 'Failed to fetch reminders.' });
  }
};

// UPDATE reminder
export const updateReminder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { content, reminder_time, is_completed } = req.body;

    const query = `
      UPDATE reminders
      SET content = $1,
          reminder_time = $2,
          is_completed = $3,
          updated_at = NOW()
      WHERE id = $4
        AND user_id = $5
      RETURNING *;
    `;
    const values = [content, reminder_time, is_completed, id, userId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found or not yours.' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return res.status(500).json({ error: 'Failed to update reminder.' });
  }
};

// DELETE reminder
export const deleteReminder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const query = `
      DELETE FROM reminders
      WHERE id = $1
        AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reminder not found or not yours.' });
    }
    return res.json({ message: 'Reminder deleted successfully.' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return res.status(500).json({ error: 'Failed to delete reminder.' });
  }
};
