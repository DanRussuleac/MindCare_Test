import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import express from 'express';
const router = express.Router();
import verifyToken from './middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

// REGISTER endpoint (role defaults to 'user')
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Email already in use' });
    }
    const usernameCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Username already in use' });
    }
    // Default role is 'user'
    const role = 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, role]
    );
    console.log('User successfully registered!');
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).send('Server error');
  }
});

// LOGIN endpoint (includes role in JWT payload)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Include id and role in token payload
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('User successfully logged in!');
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).send('Server error');
  }
});

// GET /user endpoint returns id, username, role, and profile_pic
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userResult = await pool.query(
      'SELECT id, username, role, profile_pic FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error('Error fetching user info:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
