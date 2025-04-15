import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Card,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  LinearProgress,
  CardContent,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import axios from 'axios';

import Navbar from '../components/Navbar'; 

const BACKEND_URL = 'http://localhost:5000'; 

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'linear-gradient(135deg, #2c2c2c, #1a1a1a)',
  border: '2px solid #444',
  boxShadow: 24,
  p: 3,
  color: '#FFFFFF',
  width: '90%',
  maxWidth: '600px',
  borderRadius: '12px',
  transition: 'all 0.4s ease-in-out',
};

function DailyTasksRemindersPage() {
  // Reminders
  const [reminders, setReminders] = useState([]);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [reminderForm, setReminderForm] = useState({
    content: '',
    reminder_time: '',
    is_completed: false,
  });

  // Daily Tasks
  const [tasks, setTasks] = useState([]);
  const [tasksDate, setTasksDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    content: '',
    is_completed: false,
  });

  // AI generation
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [rawAIResponse, setRawAIResponse] = useState('');
  // Store AI tasks as an array: { id, content, isEditing }
  const [aiTasks, setAiTasks] = useState([]);

  // Streak
  const [streak, setStreak] = useState(0);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // On mount or date change
  useEffect(() => {
    fetchData();
  }, [tasksDate]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      // Reminders
      const remindersRes = await axios.get(`${BACKEND_URL}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(remindersRes.data);

      // Daily Tasks
      const tasksRes = await axios.get(`${BACKEND_URL}/api/daily-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: tasksDate },
      });
      setTasks(tasksRes.data);

      // Streak
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.data.daily_task_streak !== undefined) {
        setStreak(userRes.data.daily_task_streak);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // ---------------------------
  // REMINDERS CRUD
  // ---------------------------
  const handleOpenReminderModal = (rem = null) => {
    if (rem) {
      setEditingReminder(rem);
      setReminderForm({
        content: rem.content,
        reminder_time: dayjs(rem.reminder_time).format('YYYY-MM-DDTHH:mm'),
        is_completed: rem.is_completed,
      });
    } else {
      setEditingReminder(null);
      setReminderForm({
        content: '',
        reminder_time: dayjs().format('YYYY-MM-DDTHH:mm'),
        is_completed: false,
      });
    }
    setReminderModalOpen(true);
  };

  const handleCloseReminderModal = () => {
    setReminderModalOpen(false);
  };

  const handleReminderChange = (e) => {
    setReminderForm({ ...reminderForm, [e.target.name]: e.target.value });
  };

  const handleSaveReminder = async () => {
    const token = localStorage.getItem('token');
    try {
      if (editingReminder) {
        await axios.put(`${BACKEND_URL}/api/reminders/${editingReminder.id}`, reminderForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Reminder updated!', severity: 'success' });
      } else {
        await axios.post(`${BACKEND_URL}/api/reminders`, reminderForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Reminder created!', severity: 'success' });
      }
      setReminderModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving reminder:', error);
      setSnackbar({ open: true, message: 'Failed to save reminder.', severity: 'error' });
    }
  };

  const handleDeleteReminder = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Reminder deleted!', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      setSnackbar({ open: true, message: 'Failed to delete reminder.', severity: 'error' });
    }
  };

  const toggleCompleteReminder = async (rem) => {
    const token = localStorage.getItem('token');
    try {
      const updated = { ...rem, is_completed: !rem.is_completed };
      await axios.put(`${BACKEND_URL}/api/reminders/${rem.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: updated.is_completed ? 'Reminder completed!' : 'Reminder uncompleted!',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling reminder complete:', error);
      setSnackbar({ open: true, message: 'Failed to toggle reminder.', severity: 'error' });
    }
  };

  // ---------------------------
  // TASKS CRUD
  // ---------------------------
  const handleOpenTaskModal = (t = null) => {
    if (t) {
      setEditingTask(t);
      setTaskForm({
        date: t.date,
        content: t.content,
        is_completed: t.is_completed,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        date: tasksDate,
        content: '',
        is_completed: false,
      });
    }
    setTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setTaskModalOpen(false);
  };

  const handleTaskChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleSaveTask = async () => {
    const token = localStorage.getItem('token');
    try {
      if (editingTask) {
        await axios.put(`${BACKEND_URL}/api/daily-tasks/${editingTask.id}`, taskForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
      } else {
        await axios.post(`${BACKEND_URL}/api/daily-tasks`, taskForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Task created!', severity: 'success' });
      }
      setTaskModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({ open: true, message: 'Failed to save task.', severity: 'error' });
    }
  };

  const handleDeleteTask = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BACKEND_URL}/api/daily-tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Task deleted!', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({ open: true, message: 'Failed to delete task.', severity: 'error' });
    }
  };

  const toggleCompleteTask = async (task) => {
    const token = localStorage.getItem('token');
    try {
      const updated = { ...task, is_completed: !task.is_completed };
      await axios.put(`${BACKEND_URL}/api/daily-tasks/${task.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: updated.is_completed ? 'Task completed!' : 'Task uncompleted!',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling task complete:', error);
      setSnackbar({ open: true, message: 'Failed to toggle task.', severity: 'error' });
    }
  };

  const handleMarkAllCompleted = async () => {
    const token = localStorage.getItem('token');
    try {
      const updates = tasks.map(async (task) => {
        if (!task.is_completed) {
          const updated = { ...task, is_completed: true };
          return axios.put(`${BACKEND_URL}/api/daily-tasks/${task.id}`, updated, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        return null;
      });
      await Promise.all(updates);
      setSnackbar({ open: true, message: 'All tasks marked completed!', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error marking all tasks completed:', error);
      setSnackbar({ open: true, message: 'Failed to mark tasks.', severity: 'error' });
    }
  };

  // ---------------------------
  // AI GENERATION
  // ---------------------------
  const handleOpenAiModal = () => {
    setAiModalOpen(true);
    setPrompt('');
    setRawAIResponse('');
    setAiTasks([]);
  };

  const handleCloseAiModal = () => {
    setAiModalOpen(false);
  };

  const handleAiGenerate = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/daily-tasks/generate`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const text = res.data.tasksText;
      setRawAIResponse(text);

      // parse lines
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const possibleTasks = [];
      for (const line of lines) {
        if (
          line.startsWith('-') ||
          line.startsWith('*') ||
          /^\d+\./.test(line)
        ) {
          // remove bullet
          const cleaned = line.replace(/^[-*]\s?/, '').replace(/^\d+\.\s?/, '');
          possibleTasks.push(cleaned);
        }
      }
      if (possibleTasks.length === 0 && lines.length > 0) {
        possibleTasks.push(...lines);
      }

      const structured = possibleTasks.map((taskLine, index) => ({
        id: index,
        content: taskLine,
        isEditing: false,
      }));
      setAiTasks(structured);
    } catch (error) {
      console.error('Error generating tasks with AI:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate tasks.',
        severity: 'error',
      });
    }
  };

  const handleEditAiTask = (id) => {
    setAiTasks((prev) =>
      prev.map((obj) =>
        obj.id === id ? { ...obj, isEditing: !obj.isEditing } : obj
      )
    );
  };

  const handleAiTaskChange = (id, newContent) => {
    setAiTasks((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, content: newContent } : obj))
    );
  };

  const handleAddAiTask = async (item) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${BACKEND_URL}/api/daily-tasks`,
        {
          date: tasksDate,
          content: item.content,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({
        open: true,
        message: 'AI-generated task added!',
        severity: 'success',
      });
      fetchData();
    } catch (error) {
      console.error('Error adding AI task:', error);
      setSnackbar({ open: true, message: 'Failed to add AI task.', severity: 'error' });
    }
  };

  // ---------------------------
  // SNACKBAR
  // ---------------------------
  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // tasks completed
  const tasksCompletedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercentage = tasks.length
    ? Math.floor((tasksCompletedCount / tasks.length) * 100)
    : 0;

  return (
    <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
      <Navbar />

      <Box sx={{ pt: '80px', px: 2, pb: 4, fontFamily: "'Roboto', sans-serif" }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transition: 'color 0.3s',
            '&:hover': {
              color: '#4CAF50',
            },
          }}
        >
          Daily Tasks & Reminders
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Current Streak: {streak} days
        </Typography>

        {/* REMINDERS */}
        <Typography
          variant="h5"
          sx={{ mt: 2, mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}
        >
          Reminders
          <Button
            variant="contained"
            sx={{
              ml: 2,
              background: 'linear-gradient(135deg, #43A047, #2E7D32)',
              color: '#FFFFFF',
              '&:hover': {
                background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
                transform: 'translateY(-2px)',
              },
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              borderRadius: '20px',
            }}
            onClick={() => handleOpenReminderModal()}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add Reminder
          </Button>
        </Typography>
        {reminders.length === 0 ? (
          <Typography variant="body1" sx={{ color: '#B0BEC5', mb: 2 }}>
            No reminders set.
          </Typography>
        ) : (
          reminders.map((rem) => (
            <Card
              key={rem.id}
              sx={{
                backgroundColor: '#2c2c2c',
                color: '#fff',
                mb: 2,
                p: 2,
                borderRadius: '8px',
                border: rem.is_overdue && !rem.is_completed ? '1px solid #e53935' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    <strong>Content:</strong> {rem.content}
                  </Typography>
                  <Typography variant="subtitle2">
                    <strong>Time:</strong> {dayjs(rem.reminder_time).format('MMM D, YYYY h:mm A')}
                    {rem.is_overdue && !rem.is_completed && (
                      <span style={{ color: '#e53935', marginLeft: '10px' }}>(Overdue)</span>
                    )}
                  </Typography>
                  <Typography variant="subtitle2">
                    <strong>Completed:</strong> {rem.is_completed ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => toggleCompleteReminder(rem)}
                    sx={{ color: rem.is_completed ? '#e53935' : '#4CAF50', mr: 1 }}
                    title={rem.is_completed ? 'Un-complete' : 'Complete'}
                  >
                    {rem.is_completed ? <CancelIcon /> : <CheckCircleIcon />}
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenReminderModal(rem)}
                    sx={{ color: '#4CAF50', mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteReminder(rem.id)}
                    sx={{ color: '#e53935' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))
        )}

        {/* TASKS */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            Daily Tasks
          </Typography>
          <FormControl sx={{ mb: 2 }}>
            <TextField
              type="date"
              label="Select Date"
              value={tasksDate}
              onChange={(e) => setTasksDate(e.target.value)}
              sx={{
                label: { color: '#B0BEC5' },
                input: { color: '#fff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                transition: 'border-color 0.3s ease',
              }}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>

          <Button
            variant="contained"
            sx={{
              ml: 2,
              background: 'linear-gradient(135deg, #43A047, #2E7D32)',
              color: '#FFFFFF',
              '&:hover': {
                background: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              borderRadius: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            }}
            onClick={() => handleOpenTaskModal()}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add Task
          </Button>

          <Button
            variant="contained"
            sx={{
              ml: 2,
              background: 'linear-gradient(135deg, #00897b, #00695c)',
              color: '#FFFFFF',
              '&:hover': {
                background: 'linear-gradient(135deg, #00695c, #004d40)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              borderRadius: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            }}
            onClick={handleOpenAiModal}
          >
            AI Generate
          </Button>

          {tasks.length > 0 && tasksCompletedCount < tasks.length && (
            <Button
              variant="outlined"
              sx={{
                ml: 2,
                color: '#4CAF50',
                borderColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                },
                borderRadius: '20px',
              }}
              onClick={handleMarkAllCompleted}
            >
              Mark All Completed
            </Button>
          )}

          {tasks.length > 0 && (
            <Box sx={{ mt: 2, width: '100%', maxWidth: '600px' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Tasks Completed: {tasksCompletedCount}/{tasks.length} ({progressPercentage}%)
              </Typography>
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
                  boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
                }}
              />
            </Box>
          )}

          {tasks.length === 0 ? (
            <Typography variant="body1" sx={{ color: '#B0BEC5', mt: 2 }}>
              No tasks for this day.
            </Typography>
          ) : (
            tasks.map((t) => (
              <Card
                key={t.id}
                sx={{
                  backgroundColor: '#2c2c2c',
                  color: '#fff',
                  mb: 2,
                  p: 2,
                  mt: 2,
                  borderRadius: '8px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      <strong>Task:</strong> {t.content}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Date:</strong> {t.date}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Completed:</strong> {t.is_completed ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => toggleCompleteTask(t)}
                      sx={{ color: t.is_completed ? '#e53935' : '#4CAF50', mr: 1 }}
                      title={t.is_completed ? 'Un-complete' : 'Complete'}
                    >
                      {t.is_completed ? <CancelIcon /> : <CheckCircleIcon />}
                    </IconButton>
                    <IconButton onClick={() => handleOpenTaskModal(t)} sx={{ color: '#4CAF50' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTask(t.id)} sx={{ color: '#e53935' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            ))
          )}
        </Box>
      </Box>

      {/* REMINDER MODAL */}
      <Modal
        open={reminderModalOpen}
        onClose={handleCloseReminderModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Fade in={reminderModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingReminder ? 'Edit Reminder' : 'New Reminder'}
            </Typography>
            <TextField
              label="Content"
              name="content"
              fullWidth
              value={reminderForm.content}
              onChange={handleReminderChange}
              sx={{ mb: 2, color: '#fff', label: { color: '#B0BEC5' } }}
            />
            <TextField
              label="Reminder Time"
              name="reminder_time"
              type="datetime-local"
              fullWidth
              value={reminderForm.reminder_time}
              onChange={handleReminderChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2, color: '#fff', label: { color: '#B0BEC5' } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                sx={{ mr: 1, color: '#fff', borderColor: '#4CAF50' }}
                onClick={handleCloseReminderModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': { backgroundColor: '#43A047' },
                }}
                onClick={handleSaveReminder}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* TASK MODAL */}
      <Modal
        open={taskModalOpen}
        onClose={handleCloseTaskModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Fade in={taskModalOpen}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingTask ? 'Edit Task' : 'New Task'}
            </Typography>
            <TextField
              label="Date"
              name="date"
              type="date"
              fullWidth
              value={taskForm.date}
              onChange={handleTaskChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2, color: '#fff', label: { color: '#B0BEC5' } }}
            />
            <TextField
              label="Content"
              name="content"
              fullWidth
              value={taskForm.content}
              onChange={handleTaskChange}
              sx={{ mb: 2, color: '#fff', label: { color: '#B0BEC5' } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                sx={{ mr: 1, color: '#fff', borderColor: '#4CAF50' }}
                onClick={handleCloseTaskModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': { backgroundColor: '#43A047' },
                }}
                onClick={handleSaveTask}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* AI MODAL */}
      <Modal
        open={aiModalOpen}
        onClose={handleCloseAiModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0,0,0,0.7)' },
        }}
      >
        <Fade in={aiModalOpen}>
          <Box sx={{ ...modalStyle, maxHeight: '80vh', overflowY: 'auto' }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              AI Task Generation
            </Typography>
            <TextField
              label="Prompt"
              multiline
              rows={3}
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2, color: '#fff', label: { color: '#B0BEC5' } }}
            />
            <Button
              variant="contained"
              onClick={handleAiGenerate}
              sx={{
                mb: 2,
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#43A047' },
                borderRadius: '20px',
              }}
            >
              Generate
            </Button>
            {/* AI Suggestions */}
            {rawAIResponse && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: 'pre-wrap', mb: 1, color: '#B0BEC5' }}
                >
                  Raw AI Output:
                </Typography>
                <Card
                  sx={{
                    backgroundColor: '#333',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                  }}
                >
                  <CardContent>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {rawAIResponse}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
            {aiTasks.length > 0 && (
              <Box
                sx={{
                  backgroundColor: '#2c2c2c',
                  p: 2,
                  borderRadius: '8px',
                }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Generated Tasks (Edit or Add):
                </Typography>
                <Divider sx={{ mb: 2, backgroundColor: '#444' }} />

                {aiTasks.map((item) => (
                  <Card
                    key={item.id}
                    sx={{
                      mb: 2,
                      backgroundColor: '#3a3a3a',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      borderRadius: '8px',
                      p: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.isEditing ? (
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={item.content}
                          onChange={(e) => handleAiTaskChange(item.id, e.target.value)}
                          sx={{
                            label: { color: '#B0BEC5' },
                            input: { color: '#fff' },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4CAF50',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {item.content}
                        </Typography>
                      )}
                      <IconButton
                        onClick={() => handleEditAiTask(item.id)}
                        sx={{ color: '#4CAF50' }}
                        size="small"
                      >
                        {item.isEditing ? <DoneIcon /> : <EditIcon />}
                      </IconButton>
                      <Button
                        variant="outlined"
                        sx={{
                          color: '#4CAF50',
                          borderColor: '#4CAF50',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                          },
                        }}
                        onClick={() => handleAddAiTask(item)}
                      >
                        Add
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                sx={{
                  mr: 1,
                  color: '#fff',
                  borderColor: '#4CAF50',
                  borderRadius: '20px',
                  '&:hover': {
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                  },
                }}
                onClick={handleCloseAiModal}
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DailyTasksRemindersPage;
