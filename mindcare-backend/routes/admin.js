import express from 'express';
import {
  getReportedForumPosts,
  deleteForumPost,
  getAllUsers,
  deleteUser,
} from '../adminController.js';
import { getOverallStats } from '../adminOverallStats.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Reported forum posts endpoint
router.get('/reported-forum-posts', verifyToken, getReportedForumPosts);

// Delete a forum post (admin)
router.delete('/forum-posts/:id', verifyToken, deleteForumPost);

// Get all users with statistics
router.get('/users', verifyToken, getAllUsers);

// Delete a user account (admin)
router.delete('/users/:id', verifyToken, deleteUser);

// NEW: Overall statistics endpoint
router.get('/overall-stats', verifyToken, getOverallStats);

export default router;
