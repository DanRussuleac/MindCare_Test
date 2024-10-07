// src/components/Welcome.js

import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';
import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min'; // Correct import for Vanta.CLOUDS
import '../styles/Welcome.css'; // Import the CSS file

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FFFFFF', // White text
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const Overlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(34, 34, 34, 0.6)', // Dark grey tint with increased opacity
  zIndex: 1,
}));

const Content = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  maxWidth: '800px',
  padding: theme.spacing(0, 2),
}));

function Welcome() {
  const vantaRef = useRef(null); // Reference to the HeroSection
  const vantaEffect = useRef(null); // Reference to store the Vanta effect instance

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = CLOUDS({
        el: vantaRef.current,
        THREE: THREE, // Pass the THREE.js instance
        mouseControls: true,
        touchControls: true,
        gyroControls: true,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        skyColor: 0x000000, 
        cloudColor: 0xa8a8a8, 
        cloudShadowColor: 0xa8a8a8, 
        sunColor: 0x000000, 
        sunGlareColor: 0xffffff, 
        sunlightColor: 0xffffff, 
        texturePath: '../images/noise.png', 
        speed: 1.5, 
      });
    }
    // Cleanup function to destroy the effect when the component unmounts
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <HeroSection ref={vantaRef} id="your-element-selector">
      <Overlay className="overlay" />
      <Content className="hero-content">
        <Typography variant="h2" component="h1" gutterBottom className="fade-in">
          Welcome to MindCare
        </Typography>
        <Typography variant="h5" component="p" gutterBottom className="slide-in">
          Your Personal Mental Health Assistant
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={RouterLink}
          to="/login" // Update this route to your login/register screen
          className="fade-in-button"
        >
          Start Your Journey
        </Button>
      </Content>
    </HeroSection>
  );
}

export default Welcome;
