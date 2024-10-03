// LoginForm.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormHelperText,
} from '@mui/material';

const LoginForm = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const temp = {};
    temp.username = credentials.username
      ? ''
      : 'Username is required.';
    temp.password = credentials.password
      ? ''
      : 'Password is required.';
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

      <FormHelperText error>
        {errors.general}
      </FormHelperText>
    </Box>
  );
};

export default LoginForm;
