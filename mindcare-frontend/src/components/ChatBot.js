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
  Menu,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoodIcon from '@mui/icons-material/Mood';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatBot() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const [messageToRead, setMessageToRead] = useState(null);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState(null); // New state variable

  const utteranceRef = useRef(null); // Ref to store the utterance

  const chatEndRef = useRef(null);

  const preprompts = [
    'Hello!',
    'How are you?',
    "I want to talk.",
    "Something's been on my mind.",
    'Can we chat?',
  ];

  // List of random names to assign to voices
  const voiceNames = ['Alex', 'Suzan', 'Taylor', 'Riley', 'Casey', 'Jordan'];

  // Fetch available voices and assign random names
  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      let availableVoices = synth.getVoices();
      if (availableVoices.length !== 0) {
        const englishVoices = availableVoices.filter((voice) =>
          voice.lang.startsWith('en')
        );

        // Limit to six voices
        const limitedVoices = englishVoices.slice(0, 6);

        // Map voices to random names
        const voicesWithNames = limitedVoices.map((voice, index) => ({
          voice,
          name: voiceNames[index] || `Voice ${index + 1}`,
        }));

        setVoices(voicesWithNames);
      }
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    scrollToBottom();

    if (autoReadEnabled && conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (
        lastMessage.role === 'bot' &&
        lastMessage.id !== lastSpokenMessageId
      ) {
        handleSpeak(lastMessage.content);
        setLastSpokenMessageId(lastMessage.id);
      }
    }
  }, [conversation]);

  const scrollToBottom = () => {
    const chatContainer = chatEndRef.current?.parentNode;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  // Function to send a message
  const sendMessage = async (userMessage = message) => {
    if (userMessage.trim()) {
      try {
        setError(null);
        setIsLoading(true);
        setTyping(true);

        // Add user message to conversation
        const userMsg = {
          id: Date.now(), // Unique ID
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

        // Add bot's response to conversation
        const botMsg = {
          id: Date.now() + 1, // Ensure unique ID
          role: 'bot',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString(),
        };
        setConversation((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error('Error sending message:', error);
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
        setTyping(false);
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

  // Function to handle text-to-speech
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window && selectedVoice) {
      // Cancel any ongoing speech
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice.voice;
      utterance.lang = selectedVoice.voice.lang;
      utterance.pitch = 1; // Adjust pitch for a soothing tone
      utterance.rate = 0.9; // Slightly slower rate for clarity

      // Store the utterance in the ref to prevent garbage collection
      utteranceRef.current = utterance;

      // Clean up the ref when speech ends
      utterance.onend = () => {
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle speaker button click
  const handleSpeakerClick = (event, messageContent) => {
    if (!autoReadEnabled) {
      // If auto-read is not enabled, open voice selection menu
      setAnchorEl(event.currentTarget);
      setMessageToRead(messageContent); // Store the message to read
    } else {
      // If auto-read is enabled, turn it off
      setAutoReadEnabled(false);
      // Cancel any ongoing speech
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
    }
  };

  // Handle voice selection
  const handleVoiceSelect = (voiceWithName) => {
    setSelectedVoice(voiceWithName);
    setAutoReadEnabled(true);
    setAnchorEl(null);

    // Read the message that was clicked
    if (messageToRead) {
      handleSpeak(messageToRead);
      setMessageToRead(null); // Reset after reading
    }
  };

  // Handle closing the voice selection menu
  const handleClose = () => {
    setAnchorEl(null);
    setMessageToRead(null); // Reset if menu is closed without selection
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        height: '100%',
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
            key={msg.id} // Use unique ID as key
            sx={{
              display: 'flex',
              justifyContent:
                msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
              flexDirection: 'column',
              alignItems:
                msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Avatar and Message */}
            <Box
              sx={{
                display: 'flex',
                flexDirection:
                  msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
              }}
            >
              {/* Avatar */}
              <Avatar
                src={
                  msg.role === 'user'
                    ? '/images/user-avatar.png'
                    : '/images/bot-avatar.png'
                }
                alt={`${msg.role} avatar`}
                sx={{
                  width: 32,
                  height: 32,
                  margin:
                    msg.role === 'user' ? '0 0 0 10px' : '0 10px 0 0',
                }}
              />

              {/* Message Bubble */}
              <Box
                sx={{
                  backgroundColor:
                    msg.role === 'user' ? '#4CAF50' : '#424242',
                  color: '#fff',
                  borderRadius:
                    msg.role === 'user'
                      ? '20px 20px 0px 20px'
                      : '20px 20px 20px 0px',
                  padding: '8px 12px',
                  maxWidth: '80%',
                  minWidth: '50px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  '& ul, & ol': {
                    margin: 0,
                    paddingLeft: '20px',
                  },
                  '& li': {
                    marginBottom: '4px',
                  },
                  '& strong': {
                    fontWeight: 'bold',
                  },
                  '& p': {
                    margin: 0,
                  },
                }}
              >
                {msg.role === 'bot' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </Box>
            </Box>

            {/* Speaker Button */}
            {msg.role === 'bot' && (
              <IconButton
                onClick={(event) =>
                  handleSpeakerClick(event, msg.content)
                }
                sx={{
                  color: autoReadEnabled ? '#4CAF50' : '#fff',
                  mt: 1,
                }}
                aria-label="toggle auto-read"
              >
                <VolumeUpIcon />
              </IconButton>
            )}

            {/* Voice Selection Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {voices.map((voiceWithName, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleVoiceSelect(voiceWithName)}
                >
                  {voiceWithName.name}
                </MenuItem>
              ))}
            </Menu>

            {/* Timestamp */}
            <Typography
              variant="caption"
              sx={{
                color: '#bbb',
                mt: 0.5,
                ml: msg.role === 'user' ? 'auto' : '0',
                mr: msg.role === 'user' ? '0' : 'auto',
                fontSize: '0.75rem',
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
                src="/images/bot-avatar.png"
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
                  maxWidth: '80%', // Match the message bubble maxWidth
                  minWidth: '50px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
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
          backgroundColor: '#1E1E1E',
        }}
      >
        {preprompts.map((prompt, index) => (
          <Chip
            key={index}
            label={prompt}
            onClick={() => handlePrepromptClick(prompt)}
            clickable
            sx={{
              backgroundColor: '#424242',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#555555',
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
