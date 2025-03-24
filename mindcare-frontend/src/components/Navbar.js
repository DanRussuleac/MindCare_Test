// FILE: src/components/Navbar.js
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
  Button,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import BookIcon from '@mui/icons-material/Book';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MoodIcon from '@mui/icons-material/Mood';
import HotelIcon from '@mui/icons-material/Hotel';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ForumIcon from '@mui/icons-material/Forum';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import userAvatar from '../images/user.png';

function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:5000/api/auth/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setUsername(data.username);
          setRole(data.role);
          setProfilePic(data.profile_pic || '');
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
    handleCloseUserMenu();
    navigate('/login');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    navigate('/settings');
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
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left Side: Logo and Home */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={RouterLink} to="/home" edge="start" color="inherit" sx={{ mr: 2 }}>
            <HomeIcon sx={{ fontSize: '1.8rem', color: '#FFFFFF' }} />
          </IconButton>
          <Typography
            variant="h6"
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

        {/* Center: Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
          <Button component={RouterLink} to="/chat" sx={{ color: '#fff', textTransform: 'none' }}>
            <ChatIcon sx={{ mr: 0.5 }} /> Chat
          </Button>
          <Button component={RouterLink} to="/journal" sx={{ color: '#fff', textTransform: 'none' }}>
            <BookIcon sx={{ mr: 0.5 }} /> Journal
          </Button>
          <Button component={RouterLink} to="/daily" sx={{ color: '#fff', textTransform: 'none' }}>
            <ListAltIcon sx={{ mr: 0.5 }} /> Daily Tasks
          </Button>
          <Button component={RouterLink} to="/mood-tracker" sx={{ color: '#fff', textTransform: 'none' }}>
            <MoodIcon sx={{ mr: 0.5 }} /> Mood Tracker
          </Button>
          <Button component={RouterLink} to="/sleep-tracker" sx={{ color: '#fff', textTransform: 'none' }}>
            <HotelIcon sx={{ mr: 0.5 }} /> Sleep Tracker
          </Button>
          <Button component={RouterLink} to="/analytics" sx={{ color: '#fff', textTransform: 'none' }}>
            <AnalyticsIcon sx={{ mr: 0.5 }} /> Analytics
          </Button>
          <Button component={RouterLink} to="/positivemoments" sx={{ color: '#fff', textTransform: 'none' }}>
            <ForumIcon sx={{ mr: 0.5 }} /> Forum
          </Button>
          <Button component={RouterLink} to="/profile" sx={{ color: '#fff', textTransform: 'none' }}>
            <MoodIcon sx={{ mr: 0.5 }} /> Profile
          </Button>
          {role === 'admin' && (
            <Button component={RouterLink} to="/admin" sx={{ color: '#fff', textTransform: 'none' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Admin
              </Typography>
            </Button>
          )}
        </Box>

        {/* Right Side: User Avatar and Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#FFFFFF',
              mr: 1,
              fontWeight: 'bold',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {username || 'Loading...'}
          </Typography>
          <Tooltip title="Open Menu">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                src={profilePic ? `http://localhost:5000/${profilePic}` : userAvatar}
                alt="User Avatar"
                sx={{ width: 40, height: 40, backgroundColor: '#fff' }}
              />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem component={RouterLink} to="/profile" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Profile
            </MenuItem>
            <MenuItem component={RouterLink} to="/journal" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Journal
            </MenuItem>
            <MenuItem component={RouterLink} to="/dailytasks" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Daily Tasks
            </MenuItem>
            <MenuItem component={RouterLink} to="/mood-tracker" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Mood Tracker
            </MenuItem>
            <MenuItem component={RouterLink} to="/sleep-tracker" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Sleep Tracker
            </MenuItem>
            <MenuItem component={RouterLink} to="/analytics" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Analytics
            </MenuItem>
            <MenuItem component={RouterLink} to="/positivemoments" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
              Forum
            </MenuItem>
            {role === 'admin' && (
              <MenuItem component={RouterLink} to="/admin" onClick={handleCloseUserMenu} sx={{ color: '#fff' }}>
                Admin
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleSettings} sx={{ color: '#fff' }}>
              <SettingsIcon sx={{ mr: 1 }} /> Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#fff' }}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
