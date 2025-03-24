// FILE: src/Pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import Navbar from '../components/Navbar';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const BACKEND_URL = 'http://localhost:5000';
const COLORS = ['#4CAF50', '#FF7043', '#29B6F6', '#AB47BC', '#FFCA28', '#ec407a'];

function AdminPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (tabIndex === 0) {
      fetchReportedPosts();
    } else if (tabIndex === 1) {
      fetchUsers();
    } else if (tabIndex === 2) {
      fetchOverallStats();
    }
  }, [tabIndex]);

  const fetchReportedPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/reported-forum-posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportedPosts(res.data);
    } catch (error) {
      console.error('Error fetching reported posts:', error);
      setSnackbar({ open: true, message: 'Failed to fetch reported posts.', severity: 'error' });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: 'Failed to fetch users.', severity: 'error' });
    }
  };

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/overall-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverallStats(res.data);
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      setSnackbar({ open: true, message: 'Failed to fetch overall statistics.', severity: 'error' });
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/forum-posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Post deleted successfully.', severity: 'success' });
      fetchReportedPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setSnackbar({ open: true, message: 'Failed to delete post.', severity: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'User deleted successfully.', severity: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Failed to delete user.', severity: 'error' });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Prepare data for country distribution pie chart if available
  const countryPieData =
    overallStats && overallStats.usersByCountry
      ? overallStats.usersByCountry.map((entry) => ({
          name: entry.country || 'Unknown',
          value: parseInt(entry.count, 10),
        }))
      : [];

  return (
    <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <Box sx={{ pt: '80px', px: 2, pb: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Admin Dashboard
        </Typography>

        <Tabs value={tabIndex} onChange={handleTabChange} centered textColor="inherit" indicatorColor="primary">
          <Tab label="Reported Forum Posts" />
          <Tab label="User Management" />
          <Tab label="Overall Statistics" />
        </Tabs>

        <Divider sx={{ my: 2, backgroundColor: '#555' }} />

        {tabIndex === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reported Forum Posts
            </Typography>
            {reportedPosts.length === 0 ? (
              <Typography>No reported posts.</Typography>
            ) : (
              <Grid container spacing={2}>
                {reportedPosts.map((post) => (
                  <Grid item xs={12} md={6} key={post.id}>
                    <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2, borderRadius: '8px' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" sx={{ my: 1 }}>
                          {post.content.substring(0, 100)}...
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                          Posted by {post.username} on {dayjs(post.created_at).format('MMM D, YYYY h:mm A')}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton onClick={() => handleDeletePost(post.id)} sx={{ color: '#e53935' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              User Management
            </Typography>
            {users.length === 0 ? (
              <Typography>No users found.</Typography>
            ) : (
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} md={6} key={user.id}>
                    <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2, borderRadius: '8px' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.username}
                        </Typography>
                        <Typography variant="body2" sx={{ my: 1 }}>
                          Email: {user.email}
                        </Typography>
                        <Typography variant="body2" sx={{ my: 1 }}>
                          Daily Task Streak: {user.daily_task_streak}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ccc' }}>
                          Joined on {dayjs(user.created_at).format('MMM D, YYYY')}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton onClick={() => handleDeleteUser(user.id)} sx={{ color: '#e53935' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {tabIndex === 2 && overallStats && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Overall Statistics
            </Typography>
            <Grid container spacing={3}>
              {/* Row 1: Basic Counts */}
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Total Users</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {overallStats.totalUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Total Conversations</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {overallStats.totalConversations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Total Messages</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {overallStats.totalMessages}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Journal Entries</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {overallStats.totalJournalEntries}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Row 2: Additional Stats */}
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Avg. Mood</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {Number(overallStats.averageMood).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Sleep Entries</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {overallStats.totalSleepEntries}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Sleep Hours</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {Number(overallStats.totalSleepHours).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1">Daily Tasks</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {overallStats.totalDailyTasks}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Row 3: Charts */}
              <Grid item xs={12} sm={6}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Users by Country
                    </Typography>
                    {countryPieData.length === 0 ? (
                      <Typography variant="body2">No data</Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <ReTooltip />
                            <Pie dataKey="value" data={countryPieData} cx="50%" cy="50%" outerRadius={80} label>
                              {countryPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      User Growth (Last 30 Days)
                    </Typography>
                    {overallStats.growthData.length === 0 ? (
                      <Typography variant="body2">No data</Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                          <LineChart data={overallStats.growthData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                            <XAxis dataKey="date" stroke="#fff" />
                            <YAxis stroke="#fff" />
                            <ReTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="new_users" stroke="#FF7043" strokeWidth={2} name="New Users" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

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

export default AdminPage;
