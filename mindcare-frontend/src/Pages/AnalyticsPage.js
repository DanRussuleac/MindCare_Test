import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';
import axios from 'axios';
import Navbar from '../components/Navbar';

// Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

const BACKEND_URL = 'http://localhost:5000'; 
const COLORS = ['#4CAF50', '#FF7043', '#29B6F6', '#AB47BC', '#FFCA28', '#ec407a'];

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/analytics/detailed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
        <Navbar />
        <Box sx={{ pt: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: '#4CAF50' }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
        <Navbar />
        <Box sx={{ pt: '80px', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!analytics) {
    return null;
  }

  const { basicCounts, moodDistribution, taskCompletionTrends, sleepTrends, mostCommonMood } =
    analytics;

  // Convert moodDistribution to Recharts data
  const moodPieData = moodDistribution.map((m) => ({
    name: m.mood,
    value: m.count,
  }));

  // tasks data is already suitable for a bar chart: { date, total, done }
  // sleep data is { date, total_hours, avg_quality }

  return (
    <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <Box sx={{ pt: '80px', px: 2, pb: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Advanced Analytics
        </Typography>

        <Grid container spacing={3}>
          {/* Basic Stats */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Basic Counts
                </Typography>
                <Divider sx={{ backgroundColor: '#555', mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Conversations</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {basicCounts.totalConversations}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Messages</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {basicCounts.totalMessages}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Journals</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {basicCounts.totalJournalEntries}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Moods</Typography>
                    <Typography variant="h5" sx={{ color: '#4CAF50' }}>
                      {basicCounts.totalMoods}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Reminders</Typography>
                    <Typography variant="body2">
                      Total: {basicCounts.totalReminders} <br />
                      Done: {basicCounts.completedReminders}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Daily Tasks</Typography>
                    <Typography variant="body2">
                      Total: {basicCounts.totalDailyTasks} <br />
                      Done: {basicCounts.completedDailyTasks}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Sleep Entries</Typography>
                    <Typography variant="body2">
                      {basicCounts.totalSleepEntries}
                    </Typography>
                    <Typography variant="body2">
                      Total Hours: {basicCounts.totalSleepHours.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body1">Most Common Mood</Typography>
                    <Typography variant="h6" sx={{ color: '#FFCA28' }}>
                      {mostCommonMood || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Mood Distribution (Pie) */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Mood Distribution
                </Typography>
                {moodPieData.length === 0 ? (
                  <Typography variant="body2">No mood data</Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <ReTooltip />
                        <Pie
                          dataKey="value"
                          data={moodPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {moodPieData.map((entry, index) => (
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

          {/* Task Completion Trends (BarChart) */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Task Completion (Last 7 Days)
                </Typography>
                {analytics.taskCompletionTrends.length === 0 ? (
                  <Typography variant="body2">No tasks found</Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={analytics.taskCompletionTrends}
                        margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="date" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <ReTooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#29B6F6" name="Total Tasks" />
                        <Bar dataKey="done" fill="#66BB6A" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sleep Trends (LineChart) */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Sleep Trends (Last 7 Days)
                </Typography>
                {analytics.sleepTrends.length === 0 ? (
                  <Typography variant="body2">No sleep data found</Typography>
                ) : (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={analytics.sleepTrends}
                        margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="date" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <ReTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total_hours"
                          stroke="#FF7043"
                          strokeWidth={2}
                          name="Hours Slept"
                        />
                        <Line
                          type="monotone"
                          dataKey="avg_quality"
                          stroke="#AB47BC"
                          strokeWidth={2}
                          name="Avg Quality (1-5)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AnalyticsPage;
