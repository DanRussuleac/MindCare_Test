// auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import express from 'express';
const router = express.Router();
import verifyToken from './middleware/auth.js';

import dotenv from 'dotenv';
dotenv.config();

// Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email is already in use
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Email already in use' });
    }

    // Check if username is already in use
    const usernameCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'Username already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    console.log('User successfully registered!');
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).send('Server error');
  }
});

// Login user
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

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('User successfully logged in!');
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).send('Server error');
  }
});

// Get current user info (protected route)
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch the user's data from the database
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Send the username to the client
    res.json({ username: userResult.rows[0].username });
  } catch (err) {
    console.error('Error fetching user info:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
