// Sidebar.js
import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const exampleConversations = [
  {
    id: 1,
    title: 'Session with MindCare - 01',
    lastMessage: 'How can I help you today?',
  },
  // Add more example conversations as needed
];

function Sidebar({ conversations = exampleConversations, onSelectConversation }) {
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
        position: 'relative', // Required for positioning the pseudo-element
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '2px', // Adjust the width of the border here
          height: '100%',
          background: 'linear-gradient(to bottom, #444444, #333333)', // Dark grey gradient
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          padding: '16px',
          fontFamily: "'Roboto Slab', serif",
          fontWeight: 'bold',
          color: '#D3D3D3',
        }}
      >
        Conversations
      </Typography>
      <Divider sx={{ backgroundColor: '#444' }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
          {conversations.length === 0 ? (
            <ListItemText
              primary="No conversations to display."
              sx={{ padding: '16px' }}
            />
          ) : (
            conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                onClick={() => onSelectConversation && onSelectConversation(conv.id)}
                sx={{
                  color: '#fff',
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                <ListItemIcon sx={{ color: '#D3D3D3', minWidth: '40px' }}>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText
                  primary={conv.title}
                  secondary={conv.lastMessage}
                  primaryTypographyProps={{ color: '#fff' }}
                  secondaryTypographyProps={{ color: '#bbb' }}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar;
