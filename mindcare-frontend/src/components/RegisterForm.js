import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  FormHelperText,
} from '@mui/material';

const RegisterForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(''); // State for success message

  const validate = () => {
    const temp = {};
    temp.username = credentials.username ? '' : 'Username is required.';
    temp.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(credentials.email) ? '' : 'Email is not valid.';
    temp.password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(credentials.password)
      ? ''
      : 'Password must be at least 8 characters long, include a number, and a special character.';
    temp.confirmPassword = credentials.confirmPassword === credentials.password ? '' : 'Passwords do not match.';
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
        const response = await axios.post('http://localhost:5000/api/auth/register', credentials);
        console.log('Registration successful!', response.data);
        setSuccess('Registration successful! You can now log in.'); // Set success message
        setErrors({}); // Clear errors
      } catch (error) {
        // Check if email or username is already in use
        if (error.response && error.response.data.msg === 'Email already in use') {
          setErrors({ email: 'Email already in use' });
        } else if (error.response && error.response.data.msg === 'Username already in use') {
          setErrors({ username: 'Username already in use' });
        } else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
        setSuccess(''); // Clear success message
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
      <TextField
        margin="normal"
        fullWidth
        label="Username"
        name="username"
        value={credentials.username}
        onChange={handleChange}
        error={!!errors.username}
        helperText={errors.username}
      />

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

      <TextField
        margin="normal"
        fullWidth
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={credentials.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2, bgcolor: 'grey.500', color: 'white', '&:hover': { bgcolor: 'grey.700' } }}
      >
        Register
      </Button>

      {/* Success message */}
      {success && <FormHelperText sx={{ color: 'green' }}>{success}</FormHelperText>}

      {/* Error message */}
      <FormHelperText error>{errors.general}</FormHelperText>
    </Box>
  );
};

export default RegisterForm;

