import React, { useState, useEffect } from 'react';
import { Typography, Box, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

const QuoteBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#2c2c2c',
  borderRadius: '8px',
  color: '#FFFFFF',
  textAlign: 'center',
  maxWidth: '800px',
}));

const RotatingQuotes = ({ quotes, interval = 5000 }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [inProp, setInProp] = useState(true);

  useEffect(() => {
    const quoteChangeInterval = setInterval(() => {
      setInProp(false); 
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) =>
          prevIndex === quotes.length - 1 ? 0 : prevIndex + 1
        );
        setInProp(true); 
      }, 500); 
    }, interval);

    return () => clearInterval(quoteChangeInterval);
  }, [quotes, interval]);

  return (
    <QuoteBox>
      <Fade in={inProp} timeout={500}>
        <Typography variant="h6">
          "{quotes[currentQuoteIndex]}"
        </Typography>
      </Fade>
    </QuoteBox>
  );
};

export default RotatingQuotes;
