import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Modal,
  Backdrop,
  Fade,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Navbar from '../components/Navbar';
import axios from 'axios';
import dayjs from 'dayjs';

const heroImage = 'https://images.pexels.com/photos/355423/pexels-photo-355423.jpeg?auto=compress'; 
// example hero image

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: '#1E1E1E',
  border: '2px solid #444',
  boxShadow: 24,
  p: 4,
  color: '#fff',
  width: '90%',
  maxWidth: '600px',
  borderRadius: '12px',
};

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'liked'
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postForm, setPostForm] = useState({ title: '', content: '', image_url: '' });
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedCommentPost, setSelectedCommentPost] = useState(null);
  const [commentForm, setCommentForm] = useState('');
  const [comments, setComments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');
  const BACKEND_URL = 'http://localhost:5000';

  // Fetch posts and current user on mount
  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data); // returns { id, username }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/forum/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Sorting
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOrder === 'liked') {
      return b.likes - a.likes;
    }
    return 0;
  });

  // Create Post Modal
  const handleOpenNewPostModal = () => {
    setPostForm({ title: '', content: '', image_url: '' });
    setNewPostModalOpen(true);
  };

  const handleCloseNewPostModal = () => {
    setNewPostModalOpen(false);
  };

  const handleCreatePost = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/forum/posts`,
        postForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Post created!', severity: 'success' });
      setNewPostModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbar({ open: true, message: 'Failed to create post.', severity: 'error' });
    }
  };

  // Edit Post Modal
  const handleOpenEditPostModal = (post) => {
    setSelectedPost(post);
    setPostForm({ title: post.title, content: post.content, image_url: post.image_url });
    setEditPostModalOpen(true);
  };

  const handleCloseEditPostModal = () => {
    setEditPostModalOpen(false);
    setSelectedPost(null);
  };

  const handleUpdatePost = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/forum/posts/${selectedPost.id}`,
        postForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Post updated!', severity: 'success' });
      setEditPostModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      setSnackbar({ open: true, message: 'Failed to update post.', severity: 'error' });
    }
  };

  // Delete
  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/forum/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Post deleted!', severity: 'success' });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setSnackbar({ open: true, message: 'Failed to delete post.', severity: 'error' });
    }
  };

  // Report
  const handleReportPost = async (id) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/forum/posts/${id}/report`,
        { reason: 'Inappropriate content' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Post reported!', severity: 'success' });
      fetchPosts();
    } catch (error) {
      console.error('Error reporting post:', error);
      setSnackbar({ open: true, message: 'Failed to report post.', severity: 'error' });
    }
  };

  // Like
  const handleLikePost = async (postId) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/forum/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: res.data.likes } : post
        )
      );
      setSnackbar({ open: true, message: 'Post liked!', severity: 'success' });
    } catch (error) {
      console.error('Error liking post:', error);
      setSnackbar({ open: true, message: 'Failed to like post.', severity: 'error' });
    }
  };

  // Comments
  const handleOpenCommentsModal = async (post) => {
    setSelectedCommentPost(post);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/forum/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data.comments || []);
      setCommentModalOpen(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCloseCommentsModal = () => {
    setCommentModalOpen(false);
    setSelectedCommentPost(null);
    setComments([]);
  };

  const handleAddComment = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/forum/posts/${selectedCommentPost.id}/comments`,
        { post_id: selectedCommentPost.id, content: commentForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentForm('');
      const res = await axios.get(`${BACKEND_URL}/api/forum/posts/${selectedCommentPost.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data.comments || []);
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbar({ open: true, message: 'Failed to add comment.', severity: 'error' });
    }
  };

  // Snackbar close
  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '200px', sm: '300px' },
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Dark overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(30,30,30,0.5))',
            backdropFilter: 'blur(4px)',
            zIndex: 1,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 2, p: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: '#fff',
              mb: 1,
              textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            Positive Moments Forum
          </Typography>
          <Typography variant="body1" sx={{ color: '#ccc', maxWidth: '600px', mx: 'auto' }}>
            A place to share and celebrate your wins, big or small!
          </Typography>
        </Box>
      </Box>

      <Box sx={{ pt: 4, px: 2, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* "Create Post" button */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#43A047' },
              borderRadius: '20px',
              boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
            onClick={handleOpenNewPostModal}
          >
            Create New Post
          </Button>

          {/* Sorting and post count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ color: '#B0BEC5' }}>
              {posts.length} total posts
            </Typography>
            <FormControl size="small">
              <Select
                value={sortOrder}
                onChange={handleSortChange}
                sx={{ color: '#fff', borderColor: '#4CAF50' }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="liked">Most Liked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {sortedPosts.map((post) => (
            <Grid item xs={12} md={6} key={post.id}>
              {/* Forum Post Card */}
              <Box
                sx={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                <Card
                  sx={{
                    background:
                      'linear-gradient(135deg, rgba(44,44,44,0.8), rgba(26,26,26,0.8))',
                    backdropFilter: 'blur(5px)',
                    color: '#fff',
                    p: 2,
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    transition: 'transform 0.4s, box-shadow 0.4s',
                    '&:hover': {
                      transform: 'translateY(-8px) rotateX(3deg) rotateY(2deg)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {post.content}
                    </Typography>
                    {post.image_url && (
                      <Box
                        component="img"
                        src={post.image_url}
                        alt="Forum Post"
                        sx={{
                          width: '100%',
                          borderRadius: '8px',
                          my: 1,
                          maxHeight: '200px',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#ccc' }}>
                      Posted by {post.username} on{' '}
                      {dayjs(post.created_at).format('MMM D, YYYY h:mm A')}
                    </Typography>
                    <Divider sx={{ backgroundColor: '#555', my: 1 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {/* Like Button */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => handleLikePost(post.id)}
                          sx={{
                            color: '#FF4081',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.2)',
                            },
                          }}
                        >
                          <FavoriteIcon />
                        </IconButton>
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {post.likes}
                        </Typography>
                      </Box>
                      {/* Right side: Comments + Edit/Report */}
                      <Box>
                        <Button
                          variant="outlined"
                          sx={{
                            mr: 1,
                            borderRadius: '20px',
                            textTransform: 'none',
                            color: '#fff',
                            borderColor: '#4CAF50',
                            '&:hover': {
                              backgroundColor: '#4CAF50',
                              color: '#fff',
                            },
                          }}
                          onClick={() => handleOpenCommentsModal(post)}
                        >
                          Comments
                        </Button>
                        {currentUser && currentUser.id === post.user_id ? (
                          <>
                            <IconButton
                              onClick={() => handleOpenEditPostModal(post)}
                              sx={{ color: '#4CAF50', mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeletePost(post.id)}
                              sx={{ color: '#e53935', mr: 1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        ) : (
                          <IconButton
                            onClick={() => handleReportPost(post.id)}
                            sx={{ color: '#FF7043', mr: 1 }}
                          >
                            <ReportIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* New Post Modal */}
      <Modal
        open={newPostModalOpen}
        onClose={handleCloseNewPostModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Fade in={newPostModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create New Post
            </Typography>
            <TextField
              label="Title"
              fullWidth
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Image URL (optional)"
              fullWidth
              value={postForm.image_url}
              onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                sx={{ mr: 1, color: '#fff', borderColor: '#4CAF50' }}
                onClick={handleCloseNewPostModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#43A047' } }}
                onClick={handleCreatePost}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        open={editPostModalOpen}
        onClose={handleCloseEditPostModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Fade in={editPostModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Edit Post
            </Typography>
            <TextField
              label="Title"
              fullWidth
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={4}
              value={postForm.content}
              onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Image URL (optional)"
              fullWidth
              value={postForm.image_url}
              onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                sx={{ mr: 1, color: '#fff', borderColor: '#4CAF50' }}
                onClick={handleCloseEditPostModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#43A047' } }}
                onClick={handleUpdatePost}
              >
                Update
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Comments Modal */}
      <Modal
        open={commentModalOpen}
        onClose={handleCloseCommentsModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Fade in={commentModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Comments for "{selectedCommentPost && selectedCommentPost.title}"
            </Typography>
            {comments.map((comment) => (
              <Card
                key={comment.id}
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#fff',
                  mb: 1,
                  p: 1,
                  borderRadius: '8px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                }}
              >
                <CardContent>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {comment.content}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ccc' }}>
                    {comment.username} on {dayjs(comment.created_at).format('MMM D, YYYY h:mm A')}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            <TextField
              label="Add a comment"
              fullWidth
              multiline
              rows={3}
              value={commentForm}
              onChange={(e) => setCommentForm(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#43A047' } }}
                onClick={handleAddComment}
              >
                Post Comment
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ForumPage;
