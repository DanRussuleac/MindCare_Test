import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

app.post('/api/bot', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // Use the API key from the environment variable
    const apiKey = process.env.API_KEY;

    // The API URL for the Llama 3.1 model hosted on aimlapi.com
    const apiUrl = 'https://api.aimlapi.com/v1/chat/completions';

    // Send the user's message to the Llama 3.1 API
    const response = await axios.post(
      apiUrl,
      {
        model: 'meta-llama/Meta-Llama-3-8B-Instruct-Lite',  // Specify the model you're using
        messages: [
          { role: 'system', content: 'You are an AI assistant who knows everything.' },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Send the API's response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error communicating with the AI API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
