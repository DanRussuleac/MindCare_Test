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
  DialogContentText, 
  DialogActions,
  Button,
  Tooltip, 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoodIcon from '@mui/icons-material/Mood';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  const voiceNames = ['Alex', 'Suzan', 'Taylor', 'Riley', 'Casey', 'Jordan'];

  const [username, setUsername] = useState(''); 

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);

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

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      let availableVoices = synth.getVoices();
      if (availableVoices.length !== 0) {
        const englishVoices = availableVoices.filter((voice) =>
          voice.lang.startsWith('en')
        );

        const limitedVoices = englishVoices.slice(0, 6);

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

        if (response.data.length === 0) {
          setIsDialogOpen(true); 
        } else {
          if (!selectedConversationId) {
            setSelectedConversationId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]); 
      }
    };
    fetchConversations();
  }, []);

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
          setConversation([]); 
        }
      } else {
        setConversation([]);
      }
    };
    fetchMessages();
  }, [selectedConversationId]);

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

  const sendMessage = async (userMessage = message) => {
    if (userMessage.trim()) {
      try {
        setError(null);
        setIsLoading(true);
        setTyping(true);

        const userMsg = {
          id: Date.now(), 
          sender: 'user',
          content: userMessage,
        };
        setConversation((prev) => [...prev, userMsg]);

        if (userMessage === message) {
          setMessage('');
        }

        const token = localStorage.getItem('token');

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

        const botMsg = {
          id: Date.now() + 1, 
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handlePrepromptClick = (prompt) => {
    sendMessage(prompt);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window && selectedVoice) {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice.voice;
      utterance.lang = selectedVoice.voice.lang;
      utterance.pitch = 1; 
      utterance.rate = 0.9; 

      utteranceRef.current = utterance;

      utterance.onend = () => {
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakerClick = (event, messageContent) => {
    if (!autoReadEnabled) {
      setAnchorEl(event.currentTarget);
      setMessageToRead(messageContent); 
    } else {
      setAutoReadEnabled(false);
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
    }
  };

  const handleVoiceSelect = (voiceWithName) => {
    setSelectedVoice(voiceWithName);
    setAutoReadEnabled(true);
    setAnchorEl(null);

    if (messageToRead) {
      handleSpeak(messageToRead);
      setMessageToRead(null); 
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMessageToRead(null); 
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setIsDialogOpen(true); 
  };

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

      const welcomeMessage = {
        id: Date.now(), 
        sender: 'bot',
        content: `Welcome, ${username}! How can I assist you today?`,
      };
      setConversation([welcomeMessage]);

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

  const handleDeleteConversation = (conversationId) => {
    setConversationToDelete(conversationId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/conversations/${conversationToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationToDelete));
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

  const cancelDeleteConversation = () => {
    setIsDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)', 
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: '300px',
          flexShrink: 0, 
          backgroundColor: '#1E1E1E',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', 
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
            textAlign: 'center', 
            borderBottom: '1px solid #333', 
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
                    '&:hover': { backgroundColor: '#333' }, 
                    transition: 'background-color 0.3s ease', 
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
                        e.stopPropagation(); 
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
          overflow: 'hidden', 
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
              key={msg.id} 
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
                  maxWidth: '100%', 
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
                    maxWidth: '70%', 
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word', 
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
                    maxWidth: '70%', 
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
            justifyContent: 'center', 
            padding: '4px', 
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
              borderRadius: '16px', 
              width: '70%', 
              padding: '0 4px', 
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
                  fontSize: '0.8rem', 
                  paddingTop: '4px',
                  paddingBottom: '4px',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{ color: '#9E9E9E', padding: '2px' }} 
                      aria-label="add emoji"
                    >
                      <MoodIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: { color: '#9E9E9E', fontSize: '0.8rem' },
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
                padding: '6px', 
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
