// Navbar.js
// Navbar.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom'; 

function Navbar() {
  const handleLogout = () => {
    console.log('Logged out');
    // Implement your logout functionality here
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // Implement your settings functionality here
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#1E1E1E',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
        height: '64px',
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure navbar is above sidebar
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Side - Home Icon as Link */}
        <IconButton
          component={RouterLink} // Make IconButton behave like a Link
          to="/" // Target route
          edge="start"
          color="inherit"
          aria-label="home"
        >
          <HomeIcon sx={{ fontSize: '1.5rem', color: '#D3D3D3' }} />
        </IconButton>

        {/* Center - Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontFamily: "'Roboto Slab', serif",
            color: '#D3D3D3',
            fontWeight: 'bold',
            flexGrow: 1,
            textAlign: 'center',
          }}
        >
          MindCare
        </Typography>

        {/* Right Side - Settings and Logout */}
        <Box>
          <IconButton
            color="inherit"
            onClick={handleSettings}
            aria-label="settings"
          >
            <SettingsIcon sx={{ color: '#D3D3D3' }} />
          </IconButton>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon sx={{ color: '#D3D3D3' }} />}
            sx={{ color: '#D3D3D3', textTransform: 'none' }}
            aria-label="logout"
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
