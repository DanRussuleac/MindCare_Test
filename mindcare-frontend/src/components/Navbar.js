// Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';

function ChatNavbar() {
  const handleLogout = () => {
    console.log("Logged out");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  return (
    <AppBar 
      position="static" 
      sx={{ backgroundColor: '#1E1E1E', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)' }}
    >
      <Toolbar>
        {/* Left Section with Logo */}
        <IconButton edge="start" color="inherit" aria-label="home">
          <HomeIcon sx={{ fontSize: '1.5rem', color: '#D3D3D3' }} />
        </IconButton>

        {/* Middle Section with Fancy Font */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontFamily: "'Roboto Slab', serif", // Apply the Roboto Slab font here
            color: '#D3D3D3',
            fontWeight: 'bold'
          }}
        >
          MindCare
        </Typography>

        {/* Right Section with Settings and Logout */}
        <Box>
          <IconButton color="inherit" onClick={handleSettings}>
            <SettingsIcon sx={{ color: '#D3D3D3' }} />
          </IconButton>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ color: '#D3D3D3' }}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ChatNavbar;
