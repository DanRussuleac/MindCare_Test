// Navbar.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

// Import your user avatar image
import userAvatar from '../images/user.png';

function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    console.log('Logged out');
    // Implement your logout functionality here
    handleCloseUserMenu();
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // Implement your settings functionality here
    handleCloseUserMenu();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(90deg, #1E1E1E 0%, #2E2E2E 100%)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
        height: '64px',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Side - Home Icon as Link */}
        <IconButton
          component={RouterLink}
          to="/"
          edge="start"
          color="inherit"
          aria-label="home"
        >
          <HomeIcon sx={{ fontSize: '1.5rem', color: '#FFFFFF' }} />
        </IconButton>

        {/* Center - Title */}
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontFamily: "'Roboto Slab', serif",
            color: '#FFFFFF',
            fontWeight: 'bold',
            flexGrow: 1,
            textAlign: 'center',
          }}
        >
          MindCare
        </Typography>

        {/* Right Side - User Profile */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open Menu">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 32, // Reduced size from 40 to 32
                  height: 32,
                  backgroundColor: '#FFFFFF', // Set background color to white
                }}
                src={userAvatar}
                alt="User Avatar"
              />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem
              component={RouterLink}
              to="/journal"
              onClick={handleCloseUserMenu}
            >
              Journal
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/dailytasks"
              onClick={handleCloseUserMenu}
            >
              Daily Tasks
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/moodrange"
              onClick={handleCloseUserMenu}
            >
              Mood Range
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSettings}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
