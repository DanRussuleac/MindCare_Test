import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables from the .env file
dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

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

    // Send the request to the Llama model
    const completion = await api.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',  // Correct Llama 3.1 model
      messages: [
        { role: 'system', content: 'You are an AI assistant who knows everything.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    // Extract and send back the response from the API
    const botResponse = completion.choices[0].message.content;
    res.json({ botResponse });

  } catch (error) {
    // Log more detailed error information
    console.error('Error communicating with the AI API:', error);

    // Handle errors coming from the API response
    if (error.response) {
      console.error('API Response Data:', error.response.data);
      console.error('Status Code:', error.response.status);
      console.error('Headers:', error.response.headers);

      // Send API-specific error response
      return res.status(error.response.status || 500).json({
        error: 'Error from AI API',
        details: error.response.data || 'Unknown API error',
      });
    }

    // Handle other types of errors (network issues, etc.)
    console.error('Error Message:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'Unknown error occurred',
    });
  }
});

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
