// Sidebar.js
import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Button,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const exampleConversations = [
  {
    id: 1,
    title: 'Session with MindCare - 01',
    lastMessage: 'How can I help you today?',
  },
  {
    id: 2,
    title: 'Session with MindCare - 02',
    lastMessage: 'Hey, can we chat?',
  },
  {
    id: 3,
    title: 'Session with MindCare - 03',
    lastMessage: 'Im not feeling so well today',
  }
 
];

function Sidebar({ conversations = exampleConversations, onSelectConversation, onNewConversation }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
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
            <ListItemText
              primary="No conversations to display."
              sx={{ padding: '16px', color: '#bbb' }}
            />
          ) : (
            conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                onClick={() => onSelectConversation && onSelectConversation(conv.id)}
                sx={{
                  color: '#fff',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  backgroundColor: '#292929',
                  '&:hover': { backgroundColor: '#333' }, // Hover effect
                  transition: 'background-color 0.3s ease', // Smooth transition
                }}
              >
                <ListItemIcon sx={{ color: '#D3D3D3', minWidth: '40px' }}>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText
                  primary={conv.title}
                  secondary={conv.lastMessage}
                  primaryTypographyProps={{
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                  secondaryTypographyProps={{
                    color: '#bbb',
                    fontSize: '0.85rem',
                  }}
                />
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
          onClick={onNewConversation} // Add your new conversation logic here
          sx={{
            backgroundColor: '#424242', // Light grey for the button
            color: '#fff', // White text inside the button
            borderRadius: '20px',
            padding: '10px 20px',
            fontFamily: "'Roboto Slab', serif",
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#555555', // Darker grey on hover
            },
            transition: 'background-color 0.3s ease', // Smooth transition
          }}
        >
          Start a New Conversation
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
