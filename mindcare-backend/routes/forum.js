// routes/forum.js
import express from 'express';
import multer from 'multer';
import path from 'path';
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
  uploadPostImage,
} from '../forumController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename using the current timestamp
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + Date.now() + ext;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Posts endpoints
router.get('/posts', verifyToken, getPosts);
router.post('/posts', verifyToken, createPost);
router.get('/posts/:id', verifyToken, getPostById);
router.put('/posts/:id', verifyToken, updatePost);
router.delete('/posts/:id', verifyToken, deletePost);
router.post('/posts/:id/report', verifyToken, reportPost);
router.post('/posts/:id/like', verifyToken, likePost);

// File upload endpoint for forum posts
router.post('/posts/upload', verifyToken, upload.single('post_image'), uploadPostImage);

// Comments endpoints
router.post('/posts/:postId/comments', verifyToken, createComment);
router.put('/comments/:id', verifyToken, updateComment);
router.delete('/comments/:id', verifyToken, deleteComment);

export default router;
