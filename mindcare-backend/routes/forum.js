// routes/forum.js
import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  reportPost,
  likePost,
  createComment,
  updateComment,
  deleteComment,
} from '../forumController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Posts endpoints
router.get('/posts', verifyToken, getPosts);
router.post('/posts', verifyToken, createPost);
router.get('/posts/:id', verifyToken, getPostById);
router.put('/posts/:id', verifyToken, updatePost);
router.delete('/posts/:id', verifyToken, deletePost);
router.post('/posts/:id/report', verifyToken, reportPost);
router.post('/posts/:id/like', verifyToken, likePost);

// Comments endpoints
router.post('/posts/:postId/comments', verifyToken, createComment);
router.put('/comments/:id', verifyToken, updateComment);
router.delete('/comments/:id', verifyToken, deleteComment);

export default router;
