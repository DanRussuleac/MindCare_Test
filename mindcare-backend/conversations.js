// conversations.js
import express from 'express';
const router = express.Router();
import { pool } from './db.js';
import verifyToken from './middleware/auth.js';

// Get all conversations for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a specific conversation
router.get('/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify that the conversation belongs to the user
    const convoCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convoCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY timestamp ASC',
      [conversationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new conversation
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;

    const result = await pool.query(
      'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating conversation:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a conversation
router.delete('/:conversationId', verifyToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.userId;
  
      // Verify ownership
      const convoCheck = await pool.query(
        'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
        [conversationId, userId]
      );
      if (convoCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      // Delete the conversation
      await pool.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
  
      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting conversation:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

export default router;
