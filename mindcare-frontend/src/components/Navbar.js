import React, { useState, useEffect } from 'react';
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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import userAvatar from '../images/user.png';

function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState(''); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:5000/api/auth/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          setUsername(data.username);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUser();
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');

    console.log('Successfully logged out');

    handleCloseUserMenu();

    navigate('/login');
  };

  const handleSettings = () => {
    console.log('Settings clicked');
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
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Left Side - Home Icon as Link */}
        <Box sx={{ flex: 1 }}>
          <IconButton
            component={RouterLink}
            to="/home"
            edge="start"
            color="inherit"
            aria-label="home"
          >
            <HomeIcon sx={{ fontSize: '1.5rem', color: '#FFFFFF' }} />
          </IconButton>
        </Box>

        {/* Center - Title */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontFamily: "'Roboto Slab', serif",
              color: '#FFFFFF',
              fontWeight: 'bold',
            }}
          >
            MindCare
          </Typography>
        </Box>

        {/* Right Side - Username and User Profile */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#FFFFFF',
              marginRight: '10px',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {username || 'Loading...'}
          </Typography>
          <Tooltip title="Open Menu">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#FFFFFF',
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
              sx={{ color: '#FFFFFF' }}
            >
              Journal
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/dailytasks"
              onClick={handleCloseUserMenu}
              sx={{ color: '#FFFFFF' }}
            >
              Daily Tasks
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/moodrange"
              onClick={handleCloseUserMenu}
              sx={{ color: '#FFFFFF' }}
            >
              Mood Range
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSettings} sx={{ color: '#FFFFFF' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#FFFFFF' }}>
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
