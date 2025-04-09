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
  Divider,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Hotel as HotelIcon,
  LocalHotel as LocalHotelIcon,
  WbTwilight as WbTwilightIcon,
  Bedtime as BedtimeIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';

// Recharts imports at the top
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from 'recharts';

// 2) Constants & styles
const BACKEND_URL = 'http://localhost:5000'; // or your actual backend
const pageBackgroundStyle = {
  backgroundColor: '#1E1E1E',
  minHeight: '100vh',
  backgroundImage: 'linear-gradient(135deg, #1E1E1E 0%, #2c2c2c 100%)',
};
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
  maxWidth: '600px',
  borderRadius: '8px',
};

// 3) SleepTracker component
function SleepTracker() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // A) Sleep entries
  const [sleepEntries, setSleepEntries] = useState([]);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [entryFormData, setEntryFormData] = useState({
    id: null,
    start_time: '',
    end_time: '',
    sleep_quality: '',
    notes: '',
  });

  // B) Sleep Goals
  const [sleepGoal, setSleepGoal] = useState(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    daily_sleep_target: '',
    target_bedtime: '',
    target_waketime: '',
  });

  // C) AI Analysis
  const [analysisRange, setAnalysisRange] = useState(7);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // D) Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // On mount, fetch data
  useEffect(() => {
    fetchSleepEntries();
    fetchSleepGoal();
    fetchAnalysisHistory();
  }, []);

  // -----------------------------------
  // SECTION A: Sleep Entries (CRUD)
  // -----------------------------------
  const fetchSleepEntries = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sleep`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSleepEntries(res.data);
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch sleep entries.',
        severity: 'error',
      });
    }
  };

  const handleOpenEntryModal = (entry = null) => {
    if (entry) {
      setIsEditing(true);
      setEntryFormData({
        id: entry.id,
        start_time: dayjs(entry.start_time).format('YYYY-MM-DDTHH:mm'),
        end_time: dayjs(entry.end_time).format('YYYY-MM-DDTHH:mm'),
        sleep_quality: entry.sleep_quality || '',
        notes: entry.notes || '',
      });
    } else {
      setIsEditing(false);
      setEntryFormData({
        id: null,
        start_time: '',
        end_time: '',
        sleep_quality: '',
        notes: '',
      });
    }
    setEntryModalOpen(true);
  };

  const handleCloseEntryModal = () => {
    setEntryModalOpen(false);
  };

  const handleEntryChange = (e) => {
    setEntryFormData({
      ...entryFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEntry = async () => {
    const token = localStorage.getItem('token');
    const payload = {
      start_time: entryFormData.start_time,
      end_time: entryFormData.end_time,
      // We do not send duration_hours—it's computed on the back-end
      sleep_quality: entryFormData.sleep_quality,
      notes: entryFormData.notes,
    };
    try {
      if (isEditing) {
        // Update
        await axios.put(`${BACKEND_URL}/api/sleep/${entryFormData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Sleep entry updated successfully!',
          severity: 'success',
        });
      } else {
        // Create
        await axios.post(`${BACKEND_URL}/api/sleep`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: 'Sleep entry created successfully!',
          severity: 'success',
        });
      }
      fetchSleepEntries();
      setEntryModalOpen(false);
    } catch (error) {
      console.error('Error saving sleep entry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save sleep entry.',
        severity: 'error',
      });
    }
  };

  const handleDeleteEntry = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/api/sleep/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: 'Sleep entry deleted!',
        severity: 'success',
      });
      fetchSleepEntries();
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete sleep entry.',
        severity: 'error',
      });
    }
  };

  // Calculate average hours from server-provided `duration_hours`
  const averageSleepHours = sleepEntries.length
    ? (
        sleepEntries.reduce((sum, e) => sum + Number(e.duration_hours), 0) /
        sleepEntries.length
      ).toFixed(2)
    : 0;

  // -----------------------------------
  // SECTION B: Sleep Goals
  // -----------------------------------
  const fetchSleepGoal = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sleep-goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setSleepGoal(res.data);
        setGoalForm({
          daily_sleep_target: res.data.daily_sleep_target,
          target_bedtime: res.data.target_bedtime || '',
          target_waketime: res.data.target_waketime || '',
        });
      }
    } catch (error) {
      console.error('Error fetching sleep goal:', error);
    }
  };

  const handleOpenGoalModal = () => {
    setGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setGoalModalOpen(false);
  };

  const handleGoalChange = (e) => {
    setGoalForm({
      ...goalForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveGoal = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/sleep-goals`, goalForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSleepGoal(res.data);
      setGoalModalOpen(false);
      setSnackbar({
        open: true,
        message: 'Sleep goal saved!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving sleep goal:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save sleep goal.',
        severity: 'error',
      });
    }
  };

  // -----------------------------------
  // SECTION C: Sleep Analysis (AI)
  // -----------------------------------
  const fetchAnalysisHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/sleep-analysis/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysisHistory(res.data);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  };

  const handleAnalyzeSleep = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/sleep-analysis`,
        { range: analysisRange },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysisResult({
        analysis: res.data.analysis,
        suggestions: res.data.suggestions,
      });
      fetchAnalysisHistory();
      setAnalysisModalOpen(true);
    } catch (error) {
      console.error('Error analyzing sleep data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to analyze sleep data.',
        severity: 'error',
      });
    }
  };

  const handleCloseAnalysisModal = () => {
    setAnalysisModalOpen(false);
  };

  // -----------------------------------
  // SECTION D: Recharts Data
  // -----------------------------------
  // We'll rely on `entry.duration_hours` from the server
  const chartData = sleepEntries.map((entry) => ({
    date: dayjs(entry.start_time).format('MMM D'),
    duration: Number(entry.duration_hours) || 0,
  }));

  // -----------------------------------
  // SNACKBAR
  // -----------------------------------
  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // -----------------------------------
  // RENDER
  // -----------------------------------
  return (
    <Box sx={pageBackgroundStyle}>
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
        {/* Title */}
        <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 2, textAlign: 'center' }}>
          Sleep Tracker
        </Typography>

        {/* "Sleep Fact" example */}
        <Box sx={{ width: '100%', maxWidth: '600px', mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1, textAlign: 'center' }}>
            Sleep Fact
          </Typography>
          <Box
            sx={{
              backgroundColor: '#2c2c2c',
              color: '#FFFFFF',
              p: 2,
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
              Adequate sleep is key to boosting mood, cognition, and overall well-being.
            </Typography>
          </Box>
        </Box>

        <Divider
          sx={{
            backgroundColor: '#555',
            width: '100%',
            maxWidth: '600px',
            mb: 3,
          }}
        />

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3, maxWidth: '900px' }}>
          {/* Average Sleep */}
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Average Sleep
              </Typography>
              <Typography variant="body1">
                <strong>{averageSleepHours} hrs/night</strong>
              </Typography>
            </Card>
          </Grid>

          {/* Sleep Goal */}
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Sleep Goal
              </Typography>
              {sleepGoal ? (
                <>
                  <Typography variant="body2">
                    <strong>Daily Target:</strong> {sleepGoal.daily_sleep_target} hrs
                  </Typography>
                  {sleepGoal.target_bedtime && (
                    <Typography variant="body2">
                      <strong>Bedtime:</strong> {sleepGoal.target_bedtime}
                    </Typography>
                  )}
                  {sleepGoal.target_waketime && (
                    <Typography variant="body2">
                      <strong>Wake Time:</strong> {sleepGoal.target_waketime}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    sx={{
                      mt: 1,
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#43A047' },
                    }}
                    onClick={handleOpenGoalModal}
                  >
                    Edit Goal
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    No goal set.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#43A047' } }}
                    onClick={handleOpenGoalModal}
                  >
                    Set Goal
                  </Button>
                </>
              )}
            </Card>
          </Grid>

          {/* AI Analysis */}
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                AI Analysis
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <FormControl fullWidth>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Select Range (days)
                  </Typography>
                  <Select
                    value={analysisRange}
                    onChange={(e) => setAnalysisRange(e.target.value)}
                    sx={{ color: '#fff' }}
                  >
                    <MenuItem value={7}>Last 7 days</MenuItem>
                    <MenuItem value={14}>Last 14 days</MenuItem>
                    <MenuItem value={30}>Last 30 days</MenuItem>
                  </Select>
                </FormControl>
                <MuiTooltip title="Analyze your sleep data with AI" arrow>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#4CAF50',
                      '&:hover': { backgroundColor: '#43A047' },
                    }}
                    onClick={handleAnalyzeSleep}
                    endIcon={<AssessmentIcon />}
                  >
                    Analyze
                  </Button>
                </MuiTooltip>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Chart */}
        {sleepEntries.length > 0 ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: '900px',
              height: 300,
              mb: 3,
              backgroundColor: '#2c2c2c',
              borderRadius: '8px',
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
              Recent Sleep Hours
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#B0BEC5" />
                <YAxis domain={[0, 'dataMax+2']} stroke="#B0BEC5" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#2c2c2c', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ color: '#B0BEC5', mb: 3 }}>
            No sleep entries to display. Add one below!
          </Typography>
        )}

        {/* Sleep Entries List */}
        <Box sx={{ width: '100%', maxWidth: '900px' }}>
          <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
            Your Sleep Entries
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#43A047' },
              mb: 2,
            }}
            onClick={() => handleOpenEntryModal()}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add Sleep Entry
          </Button>

          <Grid container spacing={2}>
            {sleepEntries.length === 0 ? (
              <Typography sx={{ ml: 2, color: '#B0BEC5' }}>
                No sleep entries yet.
              </Typography>
            ) : (
              sleepEntries.map((entry) => (
                <Grid item xs={12} md={6} key={entry.id}>
                  <Card sx={{ backgroundColor: '#2c2c2c', color: '#fff' }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        <strong>Start:</strong>{' '}
                        {dayjs(entry.start_time).format('MMM D, YYYY h:mm A')}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>End:</strong>{' '}
                        {dayjs(entry.end_time).format('MMM D, YYYY h:mm A')}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>Duration:</strong> {entry.duration_hours} hrs
                      </Typography>
                      {entry.sleep_quality && (
                        <Typography variant="subtitle1">
                          <strong>Quality:</strong> {entry.sleep_quality}/5
                        </Typography>
                      )}
                      {entry.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Notes:</strong> {entry.notes}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="outlined"
                          sx={{ mr: 1, borderColor: '#4CAF50', color: '#4CAF50' }}
                          onClick={() => handleOpenEntryModal(entry)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{ borderColor: '#e53935', color: '#e53935' }}
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Sleep Tips Section */}
        <Box sx={{ width: '100%', maxWidth: '900px', mt: 4 }}>
          <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
            Tips for Better Sleep
          </Typography>
          <Grid container spacing={2}>
            {/* 4 example tips */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  p: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <HotelIcon sx={{ color: '#4CAF50', fontSize: 30, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}>
                  Consistent Schedule
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  Go to bed and wake up at the same time each day to regulate your sleep cycle.
                </Typography>
              </Box>
            </Grid>
            {/* ...the other 3 tips... */}
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  p: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <LocalHotelIcon sx={{ color: '#4CAF50', fontSize: 30, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}>
                  Comfortable Environment
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  Keep your bedroom cool, dark, and quiet to improve sleep quality.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  p: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <BedtimeIcon sx={{ color: '#4CAF50', fontSize: 30, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}>
                  Wind Down
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  Develop a relaxing bedtime routine—avoid screens and bright lights before sleep.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                  p: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0px 6px 12px rgba(0,0,0,0.3)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <WbTwilightIcon sx={{ color: '#4CAF50', fontSize: 30, mb: 1 }} />
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5, fontSize: '0.9rem' }}>
                  Limit Naps
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  Keep daytime naps short to prevent nighttime sleep disruption.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CREATE/EDIT Sleep Entry Modal */}
        <Modal
          open={entryModalOpen}
          onClose={handleCloseEntryModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
          }}
        >
          <Fade in={entryModalOpen}>
            <Box sx={modalStyle}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                {isEditing ? 'Edit Sleep Entry' : 'New Sleep Entry'}
              </Typography>
              <Grid container spacing={2}>
                {/* Start Time */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="start_time"
                    label="Start Time"
                    type="datetime-local"
                    fullWidth
                    value={entryFormData.start_time}
                    onChange={handleEntryChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>

                {/* End Time */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="end_time"
                    label="End Time"
                    type="datetime-local"
                    fullWidth
                    value={entryFormData.end_time}
                    onChange={handleEntryChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>

                {/* Sleep Quality */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="sleep_quality"
                    label="Sleep Quality (1-5)"
                    type="number"
                    fullWidth
                    value={entryFormData.sleep_quality}
                    onChange={handleEntryChange}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="Notes (Optional)"
                    multiline
                    rows={2}
                    fullWidth
                    value={entryFormData.notes}
                    onChange={handleEntryChange}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleCloseEntryModal}
                  sx={{
                    mr: 1,
                    backgroundColor: '#555',
                    '&:hover': { backgroundColor: '#666' },
                    fontSize: '0.9rem',
                  }}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEntry}
                  variant="contained"
                  sx={{
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#43A047' },
                    fontSize: '0.9rem',
                  }}
                >
                  {isEditing ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* GOAL MODAL */}
        <Modal
          open={goalModalOpen}
          onClose={handleCloseGoalModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
          }}
        >
          <Fade in={goalModalOpen}>
            <Box sx={modalStyle}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                {sleepGoal ? 'Edit Sleep Goal' : 'Set Sleep Goal'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="daily_sleep_target"
                    label="Daily Sleep Target (hrs)"
                    type="number"
                    fullWidth
                    value={goalForm.daily_sleep_target}
                    onChange={handleGoalChange}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="target_bedtime"
                    label="Target Bedtime"
                    type="time"
                    fullWidth
                    value={goalForm.target_bedtime}
                    onChange={handleGoalChange}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="target_waketime"
                    label="Target Wake Time"
                    type="time"
                    fullWidth
                    value={goalForm.target_waketime}
                    onChange={handleGoalChange}
                    sx={{
                      '& .MuiInputBase-input': { color: '#FFFFFF' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                      label: { color: '#B0BEC5', fontSize: '0.9rem' },
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleCloseGoalModal}
                  sx={{
                    mr: 1,
                    backgroundColor: '#555',
                    '&:hover': { backgroundColor: '#666' },
                    fontSize: '0.9rem',
                  }}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveGoal}
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

        {/* ANALYSIS MODAL */}
        <Modal
          open={analysisModalOpen}
          onClose={handleCloseAnalysisModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
          }}
        >
          <Fade in={analysisModalOpen}>
            <Box sx={{ ...modalStyle, maxHeight: '80vh', overflowY: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                AI Sleep Analysis
              </Typography>
              {analysisResult ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    <strong>Analysis:</strong> {analysisResult.analysis}
                  </Typography>
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                    <strong>Suggestions:</strong> {analysisResult.suggestions}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">Analyzing your sleep data...</Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={handleCloseAnalysisModal}
                  variant="contained"
                  sx={{
                    backgroundColor: '#4CAF50',
                    '&:hover': { backgroundColor: '#43A047' },
                    fontSize: '0.9rem',
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* SNACKBAR */}
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
      </Box>
    </Box>
  );
}

export default SleepTracker;
