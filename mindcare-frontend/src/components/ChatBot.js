// src/components/ChatBot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText, // Added for dialog content text
  DialogActions,
  Button,
  Tooltip, // Added for tooltips
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoodIcon from '@mui/icons-material/Mood';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import the avatar images
import userAvatar from '../images/user.png';
import aiAvatar from '../images/ai.png';

function ChatBot() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [autoReadEnabled, setAutoReadEnabled] = useState(false);
  const [messageToRead, setMessageToRead] = useState(null);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState(null);

  const utteranceRef = useRef(null);

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

  const [username, setUsername] = useState(''); // State to hold username

  // Dialog state for creating a new conversation
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');

  // Dialog state for confirming deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

  // Fetch the username when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/auth/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUser();
  }, []);

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

  // Fetch user's conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found, user might not be logged in.');
          setConversations([]);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/conversations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConversations(response.data);

        // If no conversations exist, prompt to create one
        if (response.data.length === 0) {
          setIsDialogOpen(true); // Open dialog to create a conversation
        } else {
          // Select the first conversation by default
          if (!selectedConversationId) {
            setSelectedConversationId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]); // Ensure conversations is set even on error
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when selectedConversationId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversationId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:5000/api/conversations/${selectedConversationId}/messages`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setConversation(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setConversation([]); // Ensure conversation is set even on error
        }
      } else {
        setConversation([]);
      }
    };
    fetchMessages();
  }, [selectedConversationId]);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    scrollToBottom();

    if (autoReadEnabled && conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (
        lastMessage.sender === 'bot' &&
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

        // Add user message to conversation locally
        const userMsg = {
          id: Date.now(), // Unique ID
          sender: 'user',
          content: userMessage,
        };
        setConversation((prev) => [...prev, userMsg]);

        // Clear input field if the message is from the input box
        if (userMessage === message) {
          setMessage('');
        }

        const token = localStorage.getItem('token');

        // Send message to backend
        const result = await axios.post(
          `http://localhost:5000/api/bot/${selectedConversationId}/send`,
          { message: userMessage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const botResponse = result.data.botResponse;

        // Add bot's response to conversation locally
        const botMsg = {
          id: Date.now() + 1, // Ensure unique ID
          sender: 'bot',
          content: botResponse,
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

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  // Handle starting a new conversation
  const handleNewConversation = () => {
    setIsDialogOpen(true); // Open the dialog to enter conversation title
  };

  // Handle creating a new conversation after entering the title
  const handleCreateConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/conversations',
        { title: newConversationTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      setNewConversationTitle('');
      setIsDialogOpen(false);

      // Add welcome message from the bot
      const welcomeMessage = {
        id: Date.now(), // Unique ID
        sender: 'bot',
        content: `Welcome, ${username}! How can I assist you today?`,
      };
      setConversation([welcomeMessage]);

      // Optionally, save the welcome message to the backend
      await axios.post(
        `http://localhost:5000/api/conversations/${newConversation.id}/messages`,
        welcomeMessage,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  // Handle deleting a conversation (updated to open confirmation dialog)
  const handleDeleteConversation = (conversationId) => {
    setConversationToDelete(conversationId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion of a conversation
  const confirmDeleteConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/conversations/${conversationToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the deleted conversation from the list
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationToDelete));
      // If the deleted conversation was selected, clear it
      if (selectedConversationId === conversationToDelete) {
        setSelectedConversationId(null);
        setConversation([]);
      }
      setIsDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setIsDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  // Cancel deletion of a conversation
  const cancelDeleteConversation = () => {
    setIsDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)', // Adjust for navbar height if necessary
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: '300px',
          flexShrink: 0, // Prevent the sidebar from shrinking
          backgroundColor: '#1E1E1E',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', // Add shadow for depth
        }}
      >
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            padding: '16px',
            fontFamily: "'Roboto Slab', serif",
            fontWeight: 'bold',
            color: '#D3D3D3',
            textAlign: 'center', // Center-align the title
            borderBottom: '1px solid #333', // Separate with border
          }}
        >
          Conversations
        </Typography>

        {/* Conversation List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '8px 16px' }}>
          <List>
            {conversations.length === 0 ? (
              <Typography sx={{ padding: '16px', color: '#bbb' }}>
                No conversations to display.
              </Typography>
            ) : (
              conversations.map((conv) => (
                <ListItemButton
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  sx={{
                    color: '#fff',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    backgroundColor: '#292929',
                    '&:hover': { backgroundColor: '#333' }, // Hover effect
                    transition: 'background-color 0.3s ease', // Smooth transition
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ChatIcon sx={{ color: '#D3D3D3', marginRight: '10px' }} />
                    <ListItemText
                      primary={conv.title}
                      primaryTypographyProps={{
                        color: '#fff',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <Tooltip title="Delete Conversation" arrow>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering onSelectConversation
                        handleDeleteConversation(conv.id);
                      }}
                      sx={{ color: '#D3D3D3' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemButton>
              ))
            )}
          </List>
        </Box>

        {/* Start a New Conversation Button */}
        <Box
          sx={{
            padding: '16px',
            textAlign: 'center',
            backgroundColor: '#1E1E1E',
          }}
        >
          <Button
            variant="contained"
            onClick={handleNewConversation}
            sx={{
              backgroundColor: '#424242',
              color: '#fff',
              borderRadius: '20px',
              padding: '10px 20px',
              fontFamily: "'Roboto Slab', serif",
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#555555',
              },
              transition: 'background-color 0.3s ease',
            }}
          >
            New Conversation
          </Button>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          backgroundColor: '#1E1E1E',
          color: '#fff',
          height: '100%',
          overflow: 'hidden', // Ensure content doesn't overflow
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
          {conversation.map((msg) => (
            <Box
              key={msg.id} // Use unique ID as key
              sx={{
                display: 'flex',
                justifyContent:
                  msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
                flexDirection: 'column',
                alignItems:
                  msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Avatar and Message */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection:
                    msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  maxWidth: '100%', // Ensure the message row doesn't exceed the container
                }}
              >
                {/* Avatar */}
                <Avatar
                  src={msg.sender === 'user' ? userAvatar : aiAvatar}
                  alt={`${msg.sender} avatar`}
                  sx={{
                    width: 32,
                    height: 32,
                    margin:
                      msg.sender === 'user' ? '0 0 0 10px' : '0 10px 0 0',
                    backgroundColor: '#FFFFFF',
                  }}
                />

                {/* Message Bubble */}
                <Box
                  sx={{
                    backgroundColor:
                      msg.sender === 'user' ? '#4CAF50' : '#424242',
                    color: '#fff',
                    borderRadius:
                      msg.sender === 'user'
                        ? '20px 20px 0px 20px'
                        : '20px 20px 20px 0px',
                    padding: '8px 12px',
                    maxWidth: '70%', // Limit the width to 70% of the chat area
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word', // Ensure long words break to the next line
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
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </Box>
              </Box>

              {/* Speaker Button */}
              {msg.sender === 'bot' && (
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
                  src={aiAvatar}
                  alt="bot avatar"
                  sx={{
                    width: 32,
                    height: 32,
                    margin: '0 10px 0 0',
                    backgroundColor: '#FFFFFF',
                  }}
                />

                {/* Typing Animation */}
                <Box
                  sx={{
                    backgroundColor: '#424242',
                    color: '#fff',
                    borderRadius: '20px 20px 20px 0px',
                    padding: '8px 12px',
                    maxWidth: '70%', // Ensure consistency with message bubbles
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
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
            justifyContent: 'center', // Center horizontally
            padding: '4px', // Reduced padding to decrease height
            backgroundColor: '#1E1E1E',
            marginBottom: '10px',
          }}
        >
          {/* Input field and send button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#424242',
              borderRadius: '16px', // Slightly smaller border radius
              width: '70%', // Set width to 70% of the container
              padding: '0 4px', // Reduced padding
            }}
          >
            {/* Message Input */}
            <TextField
              fullWidth
              label="Type here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !selectedConversationId}
              variant="filled"
              InputProps={{
                disableUnderline: true,
                style: {
                  color: '#fff',
                  fontSize: '0.8rem', // Smaller font size
                  paddingTop: '4px',
                  paddingBottom: '4px',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    {/* Emoji Icon */}
                    <IconButton
                      sx={{ color: '#9E9E9E', padding: '2px' }} // Reduced padding
                      aria-label="add emoji"
                    >
                      <MoodIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { color: '#9E9E9E', fontSize: '0.8rem' }, // Smaller font size
              }}
              sx={{
                flexGrow: 1,
                mr: 1,
              }}
            />

            {/* Send Button */}
            <IconButton
              onClick={() => sendMessage()}
              disabled={isLoading || !selectedConversationId}
              sx={{
                color: '#4CAF50',
                padding: '6px', // Reduced padding
              }}
              aria-label="send message"
            >
              {isLoading ? (
                <CircularProgress size={18} />
              ) : (
                <SendIcon fontSize="small" />
              )}
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

      {/* Dialog for naming a new conversation */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create a New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
            type="text"
            fullWidth
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateConversation}
            disabled={!newConversationTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for confirming deletion */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={cancelDeleteConversation}
      >
        <DialogTitle>Delete Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteConversation}>Cancel</Button>
          <Button
            onClick={confirmDeleteConversation}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChatBot;
