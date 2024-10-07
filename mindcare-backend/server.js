import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import authRoutes from './auth.js'; 

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

// Main route to handle AI chatbot interaction
app.post('/api/bot', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const api = new OpenAI({
      apiKey: process.env.API_KEY,
      baseURL: "https://api.aimlapi.com/v1",
    });

    const completion = await api.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant who knows everything.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      timeout: 10000,
    });

    const botResponse = completion.choices[0].message.content;

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

// Add the auth routes to handle login/register functionality
app.use('/api/auth', authRoutes);

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
