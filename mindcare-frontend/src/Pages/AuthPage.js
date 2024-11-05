import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ParticleWaveEffectComponent from '../components/ParticleWaveEffectComponent'; // Import the component

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleLogin = (credentials) => {
    console.log('Logging in with:', credentials);
  };

  const handleRegister = (credentials) => {
    console.log('Registering with:', credentials);
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
            Mindcare
          </Typography>
          <Typography variant="h6" component="h2">
            Login to explore your mind
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

          <Button
            onClick={toggleForm}
            sx={{ mt: 2 }}
            variant="text"
          >
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
