import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Mood as MoodIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { styled, keyframes } from '@mui/material/styles';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import RotatingQuotes from '../components/RotatingQuotes';

dayjs.extend(isBetween);

const cardHover = keyframes`
  from {
    transform: scale(1);
    box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
  }
  to {
    transform: scale(1.02);
    box-shadow: 0px 10px 20px rgba(0,0,0,0.2);
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#2c2c2c',
  color: '#FFFFFF',
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    animation: `${cardHover} 0.3s forwards`,
  },
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: '#1E1E1E',
  border: '2px solid #444',
  boxShadow: 24,
  p: 4,
  color: '#FFFFFF',
  width: '90%',
  maxWidth: '600px',
  borderRadius: '12px',
};

const greyBackground = {
  backgroundColor: '#1E1E1E',
  minHeight: '100vh',
};

const JournalPage = () => {
  const [entries, setEntries] = useState([]);
  const [weeklyEntries, setWeeklyEntries] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    id: null,
    date: dayjs().format('YYYY-MM-DD'),
    content: '',
    mood: '',
    activities: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [username, setUsername] = useState('');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { width, height } = useWindowSize();

  const BACKEND_URL = 'http://localhost:5000';

  const WEEKLY_GOAL = 20;

  useEffect(() => {
    fetchEntries();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${BACKEND_URL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }
        const data = await response.json();
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch user information.',
        severity: 'error',
      });
    }
  };

  const fetchEntries = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/journal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(response.data.entries);
      calculateWeeklyEntries(response.data.entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch journal entries.',
        severity: 'error',
      });
    }
  };

  const calculateWeeklyEntries = (entries) => {
    const today = dayjs();
    const startOfWeek = today.startOf('week');
    const endOfWeek = today.endOf('week');
    const weeklyEntriesCount = entries.filter((entry) =>
      dayjs(entry.date).isBetween(startOfWeek, endOfWeek, null, '[]')
    ).length;
    setWeeklyEntries(weeklyEntriesCount);
  };

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setCurrentEntry(entry);
      setIsEditing(true);
    } else {
      setCurrentEntry({
        id: null,
        date: dayjs().format('YYYY-MM-DD'),
        content: '',
        mood: '',
        activities: '',
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentEntry({
      id: null,
      date: dayjs().format('YYYY-MM-DD'),
      content: '',
      mood: '',
      activities: '',
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setCurrentEntry({ ...currentEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      if (isEditing) {
        await axios.put(
          `${BACKEND_URL}/api/journal/${currentEntry.id}`,
          currentEntry,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSnackbar({
          open: true,
          message: 'Entry updated successfully!',
          severity: 'success',
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/journal`, currentEntry, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Entry added successfully!',
          severity: 'success',
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      fetchEntries();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting entry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit entry.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/api/journal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Entry deleted successfully!',
        severity: 'success',
      });
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete entry.',
        severity: 'error',
      });
    }
  };

  const progressPercentage = Math.min(
    (weeklyEntries / WEEKLY_GOAL) * 100,
    100
  );

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const motivationalQuotesList = [
    "Believe you can and you're halfway there.",
    "Keep going. Everything you need will come to you at the perfect time.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Stay positive. Work hard. Make it happen.",
    "Don’t stop until you’re proud.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
  ];

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
        {showConfetti && <Confetti width={width} height={height} />}

        <Typography variant="h4" sx={{ color: '#FFFFFF', marginBottom: 2, textAlign: 'center' }}>
          {username ? `${username}'s Journal` : 'Your Journal'}
        </Typography>

        <RotatingQuotes quotes={motivationalQuotesList} interval={5000} />

        <Box
          sx={{
            marginTop: 4,
            marginBottom: 4,
            width: '100%',
            maxWidth: '600px',
            animation: 'fadeIn 1s ease-in-out',
          }}
        >
          <Typography variant="h6" sx={{ color: '#FFFFFF', marginBottom: 1, textAlign: 'center' }}>
            Weekly Goal Progress
          </Typography>
          <Tooltip
            title={`${weeklyEntries} out of ${WEEKLY_GOAL} entries this week`}
            arrow
          >
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#555',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4CAF50',
                },
              }}
            />
          </Tooltip>
          <Typography
            variant="body2"
            sx={{ color: '#B0BEC5', marginTop: 1, textAlign: 'center' }}
          >
            {weeklyEntries} / {WEEKLY_GOAL} entries this week
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => handleOpenModal()}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#43A047' },
            marginBottom: 3,
            paddingX: 4,
            paddingY: 1.5,
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0px 6px 15px rgba(0,0,0,0.4)',
            },
          }}
        >
          <AddIcon sx={{ marginRight: 1 }} />
          Add Entry
        </Button>

        <Grid container spacing={2} justifyContent="center">
          {entries.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ color: '#B0BEC5', textAlign: 'center' }}>
                No journal entries yet. Start by adding a new entry!
              </Typography>
            </Grid>
          ) : (
            entries.map((entry) => (
              <Grid item xs={12} md={6} key={entry.id}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    </Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{
                        transition: 'color 0.3s',
                        '&:hover': { color: '#4CAF50' },
                      }}
                    >
                      {entry.content}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        <strong>Mood:</strong> {entry.mood}{' '}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Activities:</strong> {entry.activities}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        marginTop: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        transition: 'opacity 0.3s',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenModal(entry)}
                        sx={{ marginRight: 1 }}
                        aria-label="edit entry"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(entry.id)}
                        aria-label="delete entry"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

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
          <Box
            sx={{
              ...modalStyle,
              animation: 'fadeIn 0.5s',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translate(-50%, -60%)' },
                to: { opacity: 1, transform: 'translate(-50%, -50%)' },
              },
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              {isEditing ? 'Edit Entry' : 'New Entry'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={currentEntry.date}
                  onChange={handleChange}
                  sx={{
                    input: { color: '#FFFFFF' },
                    label: { color: '#B0BEC5' },
                  }}
                  InputProps={{
                    inputProps: {
                      max: dayjs().format('YYYY-MM-DD'),
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="content"
                  label="Content"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={currentEntry.content}
                  onChange={handleChange}
                  sx={{
                    textarea: { color: '#FFFFFF' },
                    label: { color: '#B0BEC5' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ToggleButtonGroup
                  color="primary"
                  value={currentEntry.mood}
                  exclusive
                  onChange={(event, newMood) => {
                    if (newMood !== null) {
                      setCurrentEntry({ ...currentEntry, mood: newMood });
                    }
                  }}
                  aria-label="mood selection"
                  fullWidth
                >
                  <ToggleButton value="😊" aria-label="happy">
                    😊
                  </ToggleButton>
                  <ToggleButton value="😐" aria-label="neutral">
                    😐
                  </ToggleButton>
                  <ToggleButton value="😞" aria-label="sad">
                    😞
                  </ToggleButton>
                  <ToggleButton value="😡" aria-label="angry">
                    😡
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" sx={{ color: '#B0BEC5', mt: 1, display: 'block', textAlign: 'center' }}>
                  Select your mood
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Tooltip title="Describe the activities you engaged in today." arrow>
                  <TextField
                    name="activities"
                    label="Activities"
                    fullWidth
                    variant="outlined"
                    value={currentEntry.activities}
                    onChange={handleChange}
                    sx={{
                      input: { color: '#FFFFFF' },
                      label: { color: '#B0BEC5' },
                    }}
                  />
                </Tooltip>
              </Grid>
            </Grid>
            <Box
              sx={{
                mt: 4,
                padding: 2,
                backgroundColor: '#333',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '600px',
                transition: 'background-color 0.3s',
              }}
            >
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, textAlign: 'center' }}>
                Preview
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>
                    <strong>Content:</strong> {currentEntry.content || 'Your journal entry will appear here...'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>
                    <strong>Mood:</strong> {currentEntry.mood || 'Select a mood'}{' '}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>
                    <strong>Activities:</strong> {currentEntry.activities || 'Describe your activities'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                onClick={handleCloseModal}
                sx={{
                  mr: 2,
                  backgroundColor: '#555',
                  '&:hover': { backgroundColor: '#666' },
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
                }}
              >
                {isEditing ? 'Update' : 'Save'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JournalPage;
