// FILE: src/Pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  Avatar,
  FormControl,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import ReactSelect from 'react-select';
import countryList from 'react-select-country-list';

const BACKEND_URL = 'http://localhost:5000';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ProfileContainer = styled(Paper)(({ theme }) => ({
  margin: '80px auto',
  padding: theme.spacing(4),
  maxWidth: 600,
  background: 'rgba(44, 44, 44, 0.8)',
  backdropFilter: 'blur(8px)',
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
  animation: `${fadeIn} 0.7s ease-in-out`,
}));

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    role: '',
    address: '',
    mobile: '',
    age: '',
    occupation: '',
    country: '',
    profile_pic: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const token = localStorage.getItem('token');
  const theme = useTheme();
  const options = countryList().getData();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (selectedOption) => {
    setProfile({ ...profile, country: selectedOption.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/users/profile`,
        {
          address: profile.address,
          mobile: profile.mobile,
          age: profile.age,
          occupation: profile.occupation,
          country: profile.country,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('profile_pic', selectedFile);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/users/profile/picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile({ ...profile, profile_pic: res.data.profile_pic });
      setSnackbar({ open: true, message: 'Profile picture updated!', severity: 'success' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setSnackbar({ open: true, message: 'Failed to upload profile picture.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <ProfileContainer elevation={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profile.profile_pic ? `http://localhost:5000/${profile.profile_pic}` : undefined}
            alt={profile.username}
            sx={{ width: 100, height: 100, mb: 2, border: '2px solid #4CAF50' }}
          >
            {profile.username && profile.username.charAt(0).toUpperCase()}
          </Avatar>
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Choose Profile Picture
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {selectedFile && (
            <Button variant="outlined" onClick={handleUploadProfilePic} sx={{ mb: 2 }}>
              Upload Picture
            </Button>
          )}
        </Box>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Your Profile
        </Typography>
        <TextField label="Username" value={profile.username} fullWidth disabled sx={{ mb: 2 }} />
        <TextField label="Email" value={profile.email} fullWidth disabled sx={{ mb: 2 }} />
        <TextField
          label="Address"
          name="address"
          value={profile.address}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Mobile"
          name="mobile"
          value={profile.mobile}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Age"
          name="age"
          type="number"
          value={profile.age}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Occupation"
          name="occupation"
          value={profile.occupation}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, color: '#fff' }}>
            Country
          </Typography>
          <ReactSelect
            options={options}
            value={profile.country ? { value: profile.country, label: profile.country } : null}
            onChange={handleCountryChange}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: '#2c2c2c',
                borderColor: '#555',
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: '#2c2c2c',
                color: '#fff',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected ? '#4CAF50' : '#2c2c2c',
                color: '#fff',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: '#fff',
              }),
            }}
          />
        </FormControl>
        <Button variant="contained" onClick={handleSubmit} fullWidth sx={{ mt: 2 }}>
          Update Profile
        </Button>
      </ProfileContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
