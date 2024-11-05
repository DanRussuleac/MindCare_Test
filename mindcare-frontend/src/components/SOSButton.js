import React, { useState } from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import EmergencyIcon from '@mui/icons-material/Emergency';
import { styled, keyframes } from '@mui/material/styles';
import SOSModal from './SOSModal'; 

const pulsate = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0px 0px 10px rgba(244, 67, 54, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0px 0px 20px rgba(244, 67, 54, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0px 0px 10px rgba(244, 67, 54, 0.7);
  }
`;

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  backgroundColor: '#f44336', 
  '&:hover': {
    backgroundColor: '#d32f2f', 
  },
  zIndex: 1000, 
  animation: `${pulsate} 2s infinite`,
}));

const SOSButton = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSOSClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Tooltip title="SOS" placement="left" TransitionComponent={Zoom}>
        <StyledFab
          color="primary"
          aria-label="sos"
          onClick={handleSOSClick}
        >
          <EmergencyIcon />
        </StyledFab>
      </Tooltip>
      <SOSModal open={modalOpen} handleClose={handleCloseModal} />
    </>
  );
};

export default SOSButton;
