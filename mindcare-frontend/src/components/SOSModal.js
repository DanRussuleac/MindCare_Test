import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: '#1E1E1E',
  border: '2px solid #FF0000',
  boxShadow: 24,
  p: 4,
  color: '#FFFFFF',
  width: '90%',
  maxWidth: '500px',
  borderRadius: '12px',
};

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF0000',
  color: '#FFFFFF',
  '&:hover': {
    backgroundColor: '#CC0000',
  },
  marginTop: theme.spacing(2),
}));

const SOSModal = ({ open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="sos-modal-title"
      aria-describedby="sos-modal-description"
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
      }}
    >
      <Box sx={modalStyle}>
        <Typography id="sos-modal-title" variant="h5" component="h2" sx={{ mb: 2 }}>
          SOS Mode Activated
        </Typography>
        <Typography id="sos-modal-description" sx={{ mb: 3 }}>
          If you're in need of immediate assistance, please contact the appropriate emergency services below:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#FFEB3B', mb: 1 }}>
              North America (NA)
            </Typography>
            <Typography variant="body1"><strong>Emergency Services:</strong> 911</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#FFEB3B', mb: 1 }}>
              Europe (EU)
            </Typography>
            <Typography variant="body1"><strong>Emergency Services:</strong> 112</Typography>
          </Grid>
        </Grid>
        <StyledButton variant="contained" onClick={handleClose} fullWidth>
          Close SOS
        </StyledButton>
      </Box>
    </Modal>
  );
};

export default SOSModal;
