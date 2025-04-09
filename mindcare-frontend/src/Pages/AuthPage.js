import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ParticleWaveEffectComponent from '../components/ParticleWaveEffectComponent';

const BACKEND_URL = 'http://localhost:5000';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  // Handle login
  const handleLogin = async (credentials) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, credentials);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        console.log('Login successful. Token stored.');

        // Now fetch user info to see if they are admin
        const userRes = await axios.get(`${BACKEND_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${res.data.token}` },
        });
        console.log('Fetched user info:', userRes.data);

        if (userRes.data.role === 'admin') {
          console.log('Detected admin role. Redirecting to /admin...');
          navigate('/admin');
        } else {
          console.log('Detected non-admin user. Redirecting to /home...');
          navigate('/home');
        }
      } else {
        console.error('No token received from login endpoint.');
      }
    } catch (error) {
      console.error('Error logging in:', error.response?.data || error.message);
    }
  };

  // Handle register
  const handleRegister = async (credentials) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, credentials);
      if (res.data.id) {
        console.log('Registered successfully:', res.data);

        // Auto-login after registering
        const loginRes = await axios.post(`${BACKEND_URL}/api/auth/login`, {
          email: credentials.email,
          password: credentials.password,
        });
        if (loginRes.data.token) {
          localStorage.setItem('token', loginRes.data.token);
          console.log('Auto-login successful. Token stored.');

          const userRes = await axios.get(`${BACKEND_URL}/api/auth/user`, {
            headers: { Authorization: `Bearer ${loginRes.data.token}` },
          });
          console.log('Fetched user info after register:', userRes.data);

          if (userRes.data.role === 'admin') {
            console.log('Detected admin role. Redirecting to /admin...');
            navigate('/admin');
          } else {
            console.log('Detected non-admin user. Redirecting to /home...');
            navigate('/home');
          }
        }
      } else {
        console.error('Registration response missing user data.');
      }
    } catch (error) {
      console.error('Error registering user:', error.response?.data || error.message);
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Left side with ParticleWaveEffect and centered text */}
      <Grid
        item
        xs={false}
        sm={4}
        md={6}
        sx={{
          position: 'relative',
          backgroundColor: 'grey.900',
          overflow: 'hidden',
        }}
      >
        {/* Particle Wave Effect as background */}
        <ParticleWaveEffectComponent />

        {/* Centered Title and Subtitle */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#FFFFFF',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            MindCare
          </Typography>
          <Typography variant="h6" component="h2">
            {isLogin
              ? 'Login to explore your mind'
              : 'Create an account to get started'}
          </Typography>
        </Box>
      </Grid>

      {/* Right side with login/register form */}
      <Grid
        item
        xs={12}
        sm={8}
        md={6}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '450px',
            px: 4,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'grey.500' }}>
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            {isLogin ? 'Sign in' : 'Register'}
          </Typography>

          {isLogin ? (
            <LoginForm onSubmit={handleLogin} />
          ) : (
            <RegisterForm onSubmit={handleRegister} />
          )}

          <Button onClick={toggleForm} sx={{ mt: 2 }} variant="text">
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Sign in'}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthPage;
