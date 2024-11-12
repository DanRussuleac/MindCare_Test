import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Modal,
  Backdrop,
  Fade,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Favorite as FavoriteIcon,
  SportsEsports as SportsEsportsIcon,
  Mediation as MediationIcon,
  Nature as NatureIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: '#1E1E1E',
  border: '2px solid #444',
  boxShadow: 24,
  p: 3,
  color: '#FFFFFF',
  width: '90%',
  maxWidth: '450px',
  borderRadius: '8px',
};

const greyBackground = {
  backgroundColor: '#1E1E1E',
  minHeight: '100vh',
  backgroundImage: 'linear-gradient(135deg, #1E1E1E 0%, #2c2c2c 100%)',
};

const MoodTracker = () => {
  const [moods, setMoods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState({
    mood: '',
    reason: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [timeframe, setTimeframe] = useState('week');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMoods();
  }, [timeframe]);

  const fetchMoods = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/moods`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { timeframe },
      });
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch mood data.',
        severity: 'error',
      });
    }
  };

  const handleOpenModal = () => {
    setCurrentMood({
      mood: '',
      reason: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleMoodChange = (event, newMood) => {
    if (newMood !== null) {
      setCurrentMood({ ...currentMood, mood: newMood });
    }
  };

  const handleChange = (e) => {
    setCurrentMood({ ...currentMood, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!currentMood.mood || !currentMood.reason) {
      setSnackbar({
        open: true,
        message: 'Please select a mood and provide a reason.',
        severity: 'warning',
      });
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/api/moods`, currentMood, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Mood entry added successfully!',
        severity: 'success',
      });
      fetchMoods();
      handleCloseModal();
    } catch (error) {
      console.error('Error adding mood entry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add mood entry.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const chartData = moods.map((entry) => ({
    date: dayjs(entry.created_at).format('MM-DD'),
    mood: mapMoodToNumber(entry.mood),
    moodNumber: mapMoodToNumber(entry.mood),
    reason: entry.reason,
    description: entry.description,
    id: entry.id,
    created_at: entry.created_at,
  }));

  function mapMoodToNumber(mood) {
    switch (mood) {
      case '😊':
        return 5;
      case '😃':
        return 4;
      case '😐':
        return 3;
      case '😞':
        return 2;
      case '😡':
        return 1;
      default:
        return 3;
    }
  }

  const moodLabels = {
    1: '😡 Angry',
    2: '😞 Sad',
    3: '😐 Neutral',
    4: '😃 Happy',
    5: '😊 Very Happy',
  };

  const [selectedMood, setSelectedMood] = useState(null);

  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const moodData = data.activePayload[0].payload;
      setSelectedMood(moodData);
    }
  };

  const handleCloseMoodDetails = () => {
    setSelectedMood(null);
  };

  return (
    <Box sx={greyBackground}>
      <Navbar />
      <Box
        sx={{
          paddingTop: '80px',
          paddingX: isSmallScreen ? '10px' : '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{ color: '#FFFFFF', marginBottom: 2, textAlign: 'center' }}
        >
          Mood Tracker
        </Typography>

        {/* Facts Section */}
        <Box sx={{ width: '100%', maxWidth: '600px', mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              mb: 1,
              textAlign: 'center',
              fontSize: '1rem',
            }}
          >
            Did You Know?
          </Typography>
          {/* Simple Slider using CSS */}
          <Box
            sx={{
              backgroundColor: '#2c2c2c',
              color: '#FFFFFF',
              padding: 2,
              borderRadius: '8px',
              boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'slide 10s infinite',
              '@keyframes slide': {
                '0%': { opacity: 1, transform: 'translateX(0)' },
                '20%': { opacity: 1, transform: 'translateX(0)' },
                '25%': { opacity: 0, transform: 'translateX(-100%)' },
                '45%': { opacity: 0, transform: 'translateX(-100%)' },
                '50%': { opacity: 1, transform: 'translateX(0)' },
                '100%': { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
              Regular mood tracking helps identify patterns and triggers in your emotional well-being.
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ backgroundColor: '#555', width: '100%', maxWidth: '600px', mb: 3 }} />

        {/* Mood Chart or Message */}
        {moods.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ color: '#B0BEC5', textAlign: 'center' }}
          >
            No mood entries found for the selected timeframe.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="date" stroke="#B0BEC5" />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => moodLabels[value]}
                stroke="#B0BEC5"
                tick={{ fontSize: '0.8rem' }}
              />
              <Tooltip
                formatter={(value) => moodLabels[value]}
                contentStyle={{
                  backgroundColor: '#2c2c2c',
                  border: 'none',
                  color: '#FFFFFF',
                }}
                labelStyle={{ color: '#FFFFFF', fontSize: '0.9rem' }}
                itemStyle={{ fontSize: '0.9rem' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#4CAF50"
                strokeWidth={2}
                activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Add Mood Button */}
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#43A047' },
            marginTop: 3,
            paddingX: 3,
            paddingY: 1,
            borderRadius: '6px',
            boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
            },
          }}
        >
          <AddIcon sx={{ marginRight: 0.5, fontSize: '1rem' }} />
          Add Mood
        </Button>

        {/* Tips Section */}
        <Box sx={{ width: '100%', maxWidth: '800px', mt: 4, mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FFFFFF',
              mb: 1,
              textAlign: 'center',
              fontSize: '1rem',
            }}
          >
            Tips to Improve Your Mood
          </Typography>
          <Grid container spacing={2}>
            {/* Tip 1 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  padding: 1,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <FavoriteIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}
                >
                  Stay Active
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  Engage in regular physical activities like walking, jogging, or yoga to boost your mood.
                </Typography>
              </Box>
            </Grid>
            {/* Tip 2 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  padding: 1,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <MediationIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}
                >
                  Practice Mindfulness
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  Take time to meditate or practice deep breathing exercises to reduce stress.
                </Typography>
              </Box>
            </Grid>
            {/* Tip 3 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  padding: 1,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <NatureIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}
                >
                  Connect with Nature
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  Spend time outdoors to rejuvenate your mind and body.
                </Typography>
              </Box>
            </Grid>
            {/* Tip 4 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  padding: 1,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                }}
              >
                <SportsEsportsIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}
                >
                  Engage in Hobbies
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  Participate in activities you love to maintain a positive outlook.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ backgroundColor: '#555', width: '100%', maxWidth: '800px', mb: 3 }} />

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%', fontSize: '0.9rem' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Modal for Adding Mood */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
          }}
        >
          <Fade in={modalOpen}>
            <Box sx={modalStyle}>
              <Typography
                variant="h5"
                sx={{ mb: 2, textAlign: 'center', fontSize: '1.3rem' }}
              >
                Add Mood
              </Typography>
              <Grid container spacing={2}>
                {/* Mood Selection */}
                <Grid item xs={12}>
                  <ToggleButtonGroup
                    color="primary"
                    value={currentMood.mood}
                    exclusive
                    onChange={handleMoodChange}
                    aria-label="mood selection"
                    fullWidth
                  >
                    <ToggleButton
                      value="😊"
                      aria-label="very happy"
                      sx={{
                        borderColor: '#4CAF50',
                        '&.Mui-selected': {
                          backgroundColor: '#4CAF50',
                          color: '#FFFFFF',
                        },
                        fontSize: '0.9rem',
                        paddingY: 1,
                      }}
                    >
                      😊 Very Happy
                    </ToggleButton>
                    <ToggleButton
                      value="😃"
                      aria-label="happy"
                      sx={{
                        borderColor: '#4CAF50',
                        '&.Mui-selected': {
                          backgroundColor: '#4CAF50',
                          color: '#FFFFFF',
                        },
                        fontSize: '0.9rem',
                        paddingY: 1,
                      }}
                    >
                      😃 Happy
                    </ToggleButton>
                    <ToggleButton
                      value="😐"
                      aria-label="neutral"
                      sx={{
                        borderColor: '#4CAF50',
                        '&.Mui-selected': {
                          backgroundColor: '#4CAF50',
                          color: '#FFFFFF',
                        },
                        fontSize: '0.9rem',
                        paddingY: 1,
                      }}
                    >
                      😐 Neutral
                    </ToggleButton>
                    <ToggleButton
                      value="😞"
                      aria-label="sad"
                      sx={{
                        borderColor: '#4CAF50',
                        '&.Mui-selected': {
                          backgroundColor: '#4CAF50',
                          color: '#FFFFFF',
                        },
                        fontSize: '0.9rem',
                        paddingY: 1,
                      }}
                    >
                      😞 Sad
                    </ToggleButton>
                    <ToggleButton
                      value="😡"
                      aria-label="angry"
                      sx={{
                        borderColor: '#4CAF50',
                        '&.Mui-selected': {
                          backgroundColor: '#4CAF50',
                          color: '#FFFFFF',
                        },
                        fontSize: '0.9rem',
                        paddingY: 1,
                      }}
                    >
                      😡 Angry
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {/* Reason for Mood */}
                <Grid item xs={12}>
                  <TextField
                    name="reason"
                    label="Reason for Mood"
                    fullWidth
                    variant="outlined"
                    value={currentMood.reason}
                    onChange={handleChange}
                    sx={{
                      color: '#FFFFFF',
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#555',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                      },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                    placeholder="Why are you feeling this way?"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    size="small"
                  />
                </Grid>

                {/* Description (Optional) */}
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description (Optional)"
                    multiline
                    rows={2}
                    fullWidth
                    variant="outlined"
                    value={currentMood.description}
                    onChange={handleChange}
                    sx={{
                      color: '#FFFFFF',
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#555',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                      },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                    placeholder="Additional details about your mood..."
                    InputLabelProps={{
                      shrink: true,
                    }}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleCloseModal}
                  sx={{
                    mr: 1,
                    backgroundColor: '#555',
                    '&:hover': { backgroundColor: '#666' },
                    fontSize: '0.9rem',
                  }}
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#43A047' },
                    fontSize: '0.9rem',
                  }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Modal for Viewing Mood Details */}
        <Modal
          open={!!selectedMood}
          onClose={handleCloseMoodDetails}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
          }}
        >
          <Fade in={!!selectedMood}>
            <Box sx={modalStyle}>
              {selectedMood && (
                <>
                  <Typography
                    variant="h5"
                    sx={{ mb: 2, textAlign: 'center', fontSize: '1.3rem' }}
                  >
                    Mood Details
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    {selectedMood.mood} &nbsp;
                    <span style={{ marginLeft: '8px' }}>
                      {moodLabels[selectedMood.moodNumber]}
                    </span>
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontSize: '0.95rem' }}
                  >
                    <strong>Reason:</strong> {selectedMood.reason}
                  </Typography>
                  {selectedMood.description && (
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontSize: '0.95rem' }}
                    >
                      <strong>Description:</strong> {selectedMood.description}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      onClick={handleCloseMoodDetails}
                      sx={{
                        backgroundColor: '#555',
                        '&:hover': { backgroundColor: '#666' },
                        fontSize: '0.9rem',
                      }}
                      variant="outlined"
                      color="secondary"
                    >
                      Close
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Modal>
      </Box>
    </Box>
  );
};

export default MoodTracker;
