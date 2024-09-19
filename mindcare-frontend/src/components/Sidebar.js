import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

function Sidebar({ conversations = [], onSelectConversation }) {
  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Conversations
      </Typography>
      <Divider />
      <List>
        {conversations.length === 0 ? (
          <ListItem>
            <ListItemText primary="No conversations to display." />
          </ListItem>
        ) : (
          conversations.map((conv) => (
            <ListItem button key={conv.id} onClick={() => onSelectConversation(conv.id)}>
              <ChatIcon sx={{ marginRight: 2 }} />
              <ListItemText primary={conv.title} />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default Sidebar;
