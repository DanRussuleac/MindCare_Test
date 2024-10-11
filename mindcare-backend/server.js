// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import authRoutes from './auth.js';
import conversationRoutes from './conversations.js'; // Import conversation routes
import { pool } from './db.js'; // Import the database pool
import verifyToken from './middleware/auth.js'; // Import the auth middleware

// Load environment variables from the .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Function to log messages to a file
const logMessageToFile = (userMessage, botResponse) => {
  const logData = `User: ${userMessage}\nAI: ${botResponse}\n\n`;
  fs.appendFile('conversation_logs.txt', logData, (err) => {
    if (err) {
      console.error('Error logging the message:', err);
    }
  });
};

// Basic endpoint to test if the server is running
app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

// Add the auth routes to handle login/register functionality
app.use('/api/auth', authRoutes);

// Add the conversation routes (must come after auth routes)
app.use('/api/conversations', verifyToken, conversationRoutes);

// Modified route to handle AI chatbot interaction with conversation ID
app.post('/api/bot/:conversationId/send', verifyToken, async (req, res) => {
  const { message } = req.body;
  const { conversationId } = req.params;
  const userId = req.userId;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // Verify that the conversation belongs to the user
    const convoCheck = await pool.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convoCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Save user's message to the database
    await pool.query(
      'INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
      [conversationId, 'user', message]
    );

    // Call your existing AI model
    const api = new OpenAI({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.aimlapi.com/v1',
    });

    const completion = await api.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant who knows everything.' },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      timeout: 10000,
    });

    const botResponse = completion.choices[0].message.content;

    // Save bot's response to the database
    await pool.query(
      'INSERT INTO messages (conversation_id, sender, content) VALUES ($1, $2, $3)',
      [conversationId, 'bot', botResponse]
    );

    // Update the conversation's updated_at timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    // Optionally log messages to file
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

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
