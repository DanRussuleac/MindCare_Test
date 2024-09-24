// ChatBot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoodIcon from '@mui/icons-material/Mood';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function ChatBot() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false); // Indicates if the bot is typing
  const [botMessage, setBotMessage] = useState(''); // Holds the bot's full message
  const [displayedBotMessage, setDisplayedBotMessage] = useState(''); // Portion of the bot's message displayed

  const chatEndRef = useRef(null);

  // Predefined preprompts
  const preprompts = [
    "Hello!",
    "How are you?",
    "I want to talk.",
    "Something's been on my mind.",
    "Can we chat?"
  ];

  // Scroll to the bottom whenever the conversation or displayedBotMessage updates
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, displayedBotMessage]);

  // useEffect to handle the typewriter effect
  useEffect(() => {
    let typingInterval;

    if (typing && botMessage) {
      typingInterval = setInterval(() => {
        setDisplayedBotMessage((prev) => {
          const nextChar = botMessage.charAt(prev.length);
          if (nextChar) {
            return prev + nextChar;
          } else {
            clearInterval(typingInterval);
            setTyping(false);
            // Add the fully typed bot message to the conversation
            const fullBotMessage = {
              role: 'bot',
              content: botMessage,
              timestamp: new Date().toLocaleTimeString(),
            };
            setConversation((prevConvo) => [...prevConvo, fullBotMessage]);
            setBotMessage('');
            return prev;
          }
        });
      }, 30); // Adjust typing speed here (milliseconds per character)
    }

    return () => clearInterval(typingInterval);
  }, [typing, botMessage]);

  // Function to send a message
  const sendMessage = async (userMessage = message) => {
    if (userMessage.trim()) {
      try {
        setError(null);
        setIsLoading(true);

        // Add user message to conversation
        const userMsg = {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toLocaleTimeString(),
        };
        setConversation((prev) => [...prev, userMsg]);

        // Clear input field if the message is from the input box
        if (userMessage === message) {
          setMessage('');
        }

        // Send message to backend
        const result = await axios.post('http://localhost:5000/api/bot', {
          message: userMessage,
        });
        const botResponse = result.data.botResponse;

        // Initiate typing indicator and set botMessage
        setTyping(true);
        setBotMessage(botResponse);
        setDisplayedBotMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Enter key press to send message
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Handle preprompt click
  const handlePrepromptClick = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        height: '100%', // Ensure it fills the parent container
      }}
    >
      {/* Chat messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '16px',
        }}
      >
        {conversation.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Avatar and Message */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
              }}
            >
              {/* Avatar */}
              <Avatar
                src={
                  msg.role === 'user'
                    ? '/path-to-user-avatar.png' // Replace with actual path or URL
                    : '/path-to-bot-avatar.png' // Replace with actual path or URL
                }
                alt={`${msg.role} avatar`}
                sx={{
                  width: 32,
                  height: 32,
                  margin: msg.role === 'user' ? '0 0 0 10px' : '0 10px 0 0',
                }}
              />

              {/* Message Bubble */}
              <Box
                sx={{
                  backgroundColor: msg.role === 'user' ? '#4CAF50' : '#424242',
                  color: '#fff',
                  borderRadius:
                    msg.role === 'user'
                      ? '20px 20px 0px 20px'
                      : '20px 20px 20px 0px',
                  padding: '8px 12px', // Reduced padding for smaller bubbles
                  maxWidth: '60%', // Reduced maxWidth for smaller bubbles
                  wordWrap: 'break-word',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              >
                {msg.content}
              </Box>
            </Box>

            {/* Timestamp */}
            <Typography
              variant="caption"
              sx={{
                color: '#bbb',
                mt: 0.5,
                ml: msg.role === 'user' ? 'auto' : '0',
                mr: msg.role === 'user' ? '0' : 'auto',
                fontSize: '0.75rem', // Smaller font size for timestamp
              }}
            >
              {msg.timestamp}
            </Typography>
          </Box>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 2,
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar and Typing Animation */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              {/* Bot Avatar */}
              <Avatar
                src="/path-to-bot-avatar.png" // Replace with actual path or URL
                alt="bot avatar"
                sx={{
                  width: 32,
                  height: 32,
                  margin: '0 10px 0 0',
                }}
              />

              {/* Typing Animation */}
              <Box
                sx={{
                  backgroundColor: '#424242',
                  color: '#fff',
                  borderRadius: '20px 20px 20px 0px',
                  padding: '8px 12px',
                  maxWidth: '60%',
                  wordWrap: 'break-word',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MoreHorizIcon
                  sx={{
                    animation: 'blink 1.4s infinite both',
                    color: '#bbb',
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Reference to scroll to bottom */}
        <div ref={chatEndRef} />
      </Box>

      {/* Preprompts Section */}
      <Box
        sx={{
          padding: '16px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          backgroundColor: '1e1e1e', // Updated to #181818 as per your request
        }}
      >
        {preprompts.map((prompt, index) => (
          <Chip
            key={index}
            label={prompt}
            onClick={() => handlePrepromptClick(prompt)}
            clickable
            sx={{
              backgroundColor: '#424242', // Dark grey bubble
              color: '#FFFFFF', // White text
              '&:hover': {
                backgroundColor: '#555555', // Slightly lighter on hover
              },
            }}
          />
        ))}
      </Box>

      {/* Error Message */}
      {error && (
        <Box
          sx={{
            backgroundColor: '#FFCDD2',
            color: '#D32F2F',
            padding: '10px',
            borderRadius: '5px',
            margin: '0 16px 10px 16px',
            textAlign: 'center',
          }}
        >
          {error}
        </Box>
      )}

      {/* Input area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#333',
          padding: '10px 16px',
          borderTop: '1px solid #444',
        }}
      >
        {/* Rounded container for input elements */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#424242',
            borderRadius: '20px',
            flexGrow: 1,
            padding: '5px 10px',
          }}
        >
          {/* Attach File Icon */}
          <IconButton sx={{ color: '#9E9E9E' }} aria-label="attach file">
            <AttachFileIcon />
          </IconButton>

          {/* Message Input */}
          <TextField
            variant="standard"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            fullWidth
            InputProps={{
              disableUnderline: true,
              style: { color: '#fff' },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton sx={{ color: '#9E9E9E' }} aria-label="add emoji">
                    <MoodIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Send Button */}
          <IconButton
            onClick={() => sendMessage()}
            disabled={isLoading}
            sx={{ color: '#4CAF50', marginLeft: '5px' }}
            aria-label="send message"
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Typing Animation Keyframes */}
      <style>
        {`
          @keyframes blink {
            0% { opacity: 0.2; }
            20% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}
      </style>
    </Box>
  );
}

export default ChatBot;
