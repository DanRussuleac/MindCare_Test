import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';  // Import the file system module
// Removed import of 'marked'

// Load environment variables from the .env file
dotenv.config();

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

  // Check if message is provided
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // Initialize OpenAI with API key and AIMLAPI base URL
    const api = new OpenAI({
      apiKey: process.env.API_KEY,  // Ensure your .env file has a correct API key
      baseURL: "https://api.aimlapi.com/v1",  // AIMLAPI endpoint
    });

    // Set a retry mechanism and timeout
    const completion = await api.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',  // Updated model
      messages: [
        { role: 'system', content: 'You are an AI assistant who knows everything.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 256,
      timeout: 10000, // 10 seconds timeout
    });

    // Extract and send back the response from the API
    let botResponse = completion.choices[0].message.content;

    // Removed conversion to HTML using `marked`
    // botResponse = marked(botResponse);

    // Log the user message and AI response
    logMessageToFile(message, botResponse);

    // Send the raw Markdown response
    res.json({ botResponse });

  } catch (error) {
    // Error handling remains the same
    console.error('Error communicating with the AI API:', error);

    if (error.code === 'ECONNRESET') {
      console.log('Connection was reset. Retrying...');
      setTimeout(() => {
        res.status(500).json({
          error: 'Connection error, please try again.',
        });
      }, 5000); // Retry after 5 seconds
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
