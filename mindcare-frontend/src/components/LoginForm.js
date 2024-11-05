import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import {
  Box,
  TextField,
  Button,
  FormHelperText,
} from '@mui/material';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); 

  const validate = () => {
    const temp = {};
    temp.email = credentials.email ? '' : 'Email is required.';
    temp.password = credentials.password ? '' : 'Password is required.';
    setErrors(temp);
    return Object.values(temp).every((x) => x === '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
        const { token } = response.data;

        localStorage.setItem('token', token);

        navigate('/home');

        console.log('Login successful!');
      } catch (error) {
        console.error('Login failed:', error.response.data);
        setErrors({ general: 'Invalid credentials. Please try again.' });
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 1, width: '100%' }}
    >
      <TextField
        margin="normal"
        fullWidth
        label="Email"
        name="email"
        value={credentials.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        name="password"
        value={credentials.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{
          mt: 3,
          mb: 2,
          bgcolor: 'grey.500',
          color: 'white',
          '&:hover': { bgcolor: 'grey.700' },
        }}
      >
        Sign In
      </Button>

      <FormHelperText error>{errors.general}</FormHelperText>
    </Box>
  );
};

export default LoginForm;
