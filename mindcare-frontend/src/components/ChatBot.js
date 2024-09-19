import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, TextField, CircularProgress, Box, Typography, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// Custom styles for the chat messages
const useStyles = {
  chatWindow: {
    backgroundColor: '#1E1E1E', // Dark background
    color: '#fff', // White text color
    flexGrow: 1, // To take remaining height
    height: 'calc(100vh - 200px)', // Adjust height based on remaining screen space (subtracting for navbar and input)
    overflowY: 'auto', // Scrollable content
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
  },
  userMessage: {
    alignSelf: 'flex-end', // Align user messages to the right
    backgroundColor: '#4CAF50', // Green background for user messages
    color: '#fff', // White text
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '8px',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  botMessage: {
    alignSelf: 'flex-start', // Align bot messages to the left
    backgroundColor: '#424242', // Grey background for bot messages
    color: '#fff', // White text
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '8px',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  inputArea: {
    display: 'flex',
    backgroundColor: '#333', // Dark background for input area
    padding: '10px',
    borderRadius: '8px',
  },
  textInput: {
    flexGrow: 1,
    marginRight: '10px', // Adds space between input and button
    backgroundColor: '#424242', 
    borderRadius: '4px',
  },
  sendButton: {
    backgroundColor: '#e0e0e0', // Light grey send button
    color: '#000', // Dark text color for contrast
    borderRadius: '20px',
    width: '100px', // Fixed width for consistent sizing
  }
};

function ChatBot() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null); // Ref to automatically scroll the chat to the bottom

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Use effect to scroll to the bottom whenever new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        setError(null);
        setIsLoading(true);

        // Add user message to conversation
        setConversation(prev => [...prev, { role: 'user', content: message }]);

        // Send message to backend
        const result = await axios.post('http://localhost:5000/api/bot', { message });
        const botResponse = result.data.botResponse;

        // Add bot message to conversation
        setConversation(prev => [...prev, { role: 'bot', content: botResponse }]);
        setMessage(''); // Clear input field after sending the message
      } catch (error) {
        console.error('Error sending message:', error);
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
      <Paper elevation={3} sx={{ padding: 2, width: '100%', backgroundColor: '#121212', color: '#fff' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          ChatBot
        </Typography>

        {/* Chat window */}
        <Box sx={useStyles.chatWindow}>
          {conversation.map((msg, index) => (
            <Box
              key={index}
              sx={msg.role === 'user' ? useStyles.userMessage : useStyles.botMessage}
            >
              {msg.content}
            </Box>
          ))}
          <div ref={chatEndRef} /> {/* Scrolls to this element */}
        </Box>

        {/* Error message */}
        {error && <Typography color="error">{error}</Typography>}

        {/* Input area */}
        <Box mt={2} sx={useStyles.inputArea}>
          <TextField
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            sx={useStyles.textInput}
          />
          <Button
            variant="contained"
            sx={useStyles.sendButton}
            onClick={sendMessage}
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatBot;
