import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import authRoutes from './auth.js';
import conversationRoutes from './conversations.js';
import { pool } from './db.js';
import journalRoutes from './journal.js';
import verifyToken from './middleware/auth.js';
import moodRoutes from './mood.js';
import sleepRoutes from './routes/sleepRoutes.js';
import sleepGoalsRoutes from './routes/sleepGoalsRoutes.js';
import sleepAnalysisRoutes from './routes/sleepAnalysisRoutes.js';
import remindersRoutes from './routes/reminders.js';
import dailyTasksRoutes from './routes/dailyTasks.js';
import analyticsRoutes from './routes/analytics.js';
import forumRoutes from './routes/forum.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './profile.js'; 


dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const logMessageToFile = (userMessage, botResponse) => {
  const logData = `User: ${userMessage}\nAI: ${botResponse}\n\n`;
  fs.appendFile('conversation_logs.txt', logData, (err) => {
    if (err) {
      console.error('Error logging the message:', err);
    }
  });
};

app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

app.use('/api/auth', authRoutes);

app.use('/api/conversations', verifyToken, conversationRoutes);

app.use('/api/journal', verifyToken, journalRoutes);

app.use('/api/moods', moodRoutes);

app.use('/api/sleep', verifyToken, sleepRoutes); 

app.use('/api/sleep-goals', verifyToken, sleepGoalsRoutes);

app.use('/api/sleep-analysis', verifyToken, sleepAnalysisRoutes);

app.use('/api/reminders', verifyToken, remindersRoutes);

app.use('/api/daily-tasks', verifyToken, dailyTasksRoutes);

app.use('/api/analytics', verifyToken, analyticsRoutes);

app.use('/api/forum', forumRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/users', profileRoutes);

app.use('/uploads', express.static('uploads'));

app.post('/api/bot/:conversationId/send', verifyToken, async (req, res) => {
  const { message } = req.body;
  const { conversationId } = req.params;
  const userId = req.userId;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const convoCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convoCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await pool.query(
      'INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', message]
    );

    const api = new OpenAI({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.aimlapi.com/v1',
    });

    const completion = await api.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant who knows everything. You are pretending to be a therapist and work as a chatbot, try to be as humane and empathic as possible' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      timeout: 10000,
    });

    const botResponse = completion.choices[0].message.content;

    await pool.query(
      'INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
      [conversationId, 'bot', botResponse]
    );

    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    logMessageToFile(message, botResponse);

    res.json({ botResponse });
  } catch (error) {
    console.error('Error communicating with the AI API:', error);

    if (error.code === 'ECONNRESET') {
      setTimeout(() => {
        res.status(500).json({ error: 'Connection error, please try again.' });
      }, 5000);
    } else {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message || 'Unknown error occurred',
      });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
