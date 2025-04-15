import express from 'express';
import { pool } from './db.js';
import verifyToken from './middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// GET extended user profile (including country)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT id, username, email, role, address, mobile, age, occupation, country, profile_pic
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// UPDATE extended user profile (including country)
// Removed updated_at from SET clause since the column does not exist
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { address, mobile, age, occupation, country } = req.body;
    const query = `
      UPDATE users
      SET address = $1,
          mobile = $2,
          age = $3,
          occupation = $4,
          country = $5
      WHERE id = $6
      RETURNING id, username, email, role, address, mobile, age, occupation, country, profile_pic;
    `;
    const values = [address, mobile, age, occupation, country, userId];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found or update failed' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Configure Multer storage for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists in your project
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Filename: "profile-<userId>-<timestamp>.<ext>"
    cb(null, 'profile-' + req.userId + '-' + Date.now() + ext);
  },
});
const upload = multer({ storage });

// POST endpoint for uploading profile picture
router.post('/profile/picture', verifyToken, upload.single('profile_pic'), async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const profilePicPath = req.file.path; 
    const result = await pool.query(
      'UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING profile_pic;',
      [profilePicPath, userId]
    );
    res.json({ profile_pic: result.rows[0].profile_pic });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

export default router;
