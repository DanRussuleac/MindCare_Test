// adminController.js
import { pool } from './db.js';

// Get all reported forum posts along with the poster's username
export const getReportedForumPosts = async (req, res) => {
  try {
    const query = `
      SELECT fp.*, u.username 
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.is_reported = true
      ORDER BY fp.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reported forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch reported forum posts.' });
  }
};

// Delete a reported forum post (admin only)
export const deleteForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM forum_posts WHERE id = $1 RETURNING *;',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Forum post not found.' });
    }
    res.json({ message: 'Forum post deleted successfully.', post: result.rows[0] });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ error: 'Failed to delete forum post.' });
  }
};

// Get all users with basic statistics
export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.daily_task_streak, 
        u.created_at,
        (SELECT COUNT(*) FROM forum_posts fp WHERE fp.user_id = u.id) AS forum_posts_count,
        (SELECT COUNT(*) FROM journal_entries je WHERE je.user_id = u.id) AS journal_entries_count
      FROM users u
      ORDER BY u.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// Delete a user account (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *;',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};
