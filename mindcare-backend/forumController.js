// forumController.js
import { pool } from './db.js';
import dayjs from 'dayjs';
import path from 'path';

// Simple censorship function
const bannedWords = ['badword1', 'badword2', 'badword3']; // Add your banned words here
const censorText = (text) => {
  let censored = text;
  bannedWords.forEach((word) => {
    const regex = new RegExp(word, 'gi');
    censored = censored.replace(regex, '****');
  });
  return censored;
};

// Create a new forum post
export const createPost = async (req, res) => {
  try {
    const userId = req.userId;
    let { title, content, image_url } = req.body;
    title = censorText(title);
    content = censorText(content);
    const query = `
      INSERT INTO forum_posts (user_id, title, content, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [userId, title, content, image_url || null];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ error: 'Failed to create forum post.' });
  }
};

// Get all forum posts (with username)
export const getPosts = async (req, res) => {
  try {
    const query = `
      SELECT fp.*, u.username
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      ORDER BY fp.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch forum posts.' });
  }
};

// Get a single post and its comments
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const postQuery = `
      SELECT fp.*, u.username
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.id = $1
    `;
    const postResult = await pool.query(postQuery, [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    const post = postResult.rows[0];
    const commentsQuery = `
      SELECT fc.*, u.username
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = $1
      ORDER BY fc.created_at ASC
    `;
    const commentsResult = await pool.query(commentsQuery, [id]);
    post.comments = commentsResult.rows;
    res.json(post);
  } catch (error) {
    console.error('Error fetching post by id:', error);
    res.status(500).json({ error: 'Failed to fetch forum post.' });
  }
};

// Update a forum post (only owner)
export const updatePost = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    let { title, content, image_url } = req.body;
    title = censorText(title);
    content = censorText(content);
    const checkRes = await pool.query(
      'SELECT * FROM forum_posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this post.' });
    }
    const query = `
      UPDATE forum_posts
      SET title = $1,
          content = $2,
          image_url = $3,
          updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *;
    `;
    const values = [title, content, image_url || null, id, userId];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating forum post:', error);
    res.status(500).json({ error: 'Failed to update forum post.' });
  }
};

// Delete a forum post (only owner)
export const deletePost = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const checkRes = await pool.query(
      'SELECT * FROM forum_posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }
    await pool.query('DELETE FROM forum_posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ error: 'Failed to delete forum post.' });
  }
};

// Report a forum post
export const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await pool.query(
      'UPDATE forum_posts SET is_reported = true, updated_at = NOW() WHERE id = $1',
      [id]
    );
    // Optionally, log the report in a separate table
    res.json({ message: 'Post reported successfully.' });
  } catch (error) {
    console.error('Error reporting forum post:', error);
    res.status(500).json({ error: 'Failed to report forum post.' });
  }
};

// Like a forum post (increment likes)
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE forum_posts
       SET likes = likes + 1, updated_at = NOW()
       WHERE id = $1
       RETURNING likes;`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json({ likes: result.rows[0].likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post.' });
  }
};

// Create a comment for a forum post
export const createComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { post_id, content } = req.body;
    const censoredContent = censorText(content);
    const query = `
      INSERT INTO forum_comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [post_id, userId, censoredContent];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment.' });
  }
};

// Update a comment (only owner)
export const updateComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    let { content } = req.body;
    content = censorText(content);
    const checkRes = await pool.query(
      'SELECT * FROM forum_comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this comment.' });
    }
    const query = `
      UPDATE forum_comments
      SET content = $1,
          updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
    const values = [content, id, userId];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment.' });
  }
};

// Delete a comment (only owner)
export const deleteComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const checkRes = await pool.query(
      'SELECT * FROM forum_comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (checkRes.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this comment.' });
    }
    await pool.query('DELETE FROM forum_comments WHERE id = $1', [id]);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};

// Upload post image
export const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    // Build the URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
};
