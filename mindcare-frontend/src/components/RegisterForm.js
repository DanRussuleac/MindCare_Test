// RegisterForm.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormHelperText,
} from '@mui/material';

const RegisterForm = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const temp = {};
    temp.username = credentials.username
      ? ''
      : 'Username is required.';
    temp.email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
      credentials.email
    )
      ? ''
      : 'Email is not valid.';
    temp.password = credentials.password
      ? ''
      : 'Password is required.';
    temp.confirmPassword =
      credentials.confirmPassword === credentials.password
        ? ''
        : 'Passwords do not match.';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(credentials);
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
        sx={{
          mt: 3,
          mb: 2,
          bgcolor: 'grey.500',
          color: 'white',
          '&:hover': { bgcolor: 'grey.700' },
        }}
      >
        Register
      </Button>

      <FormHelperText error>
        {errors.general}
      </FormHelperText>
    </Box>
  );
};

export default RegisterForm;
