import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import { Link as RouterLink } from 'react-router-dom';

import ChatIcon from '@mui/icons-material/Chat';
import BookIcon from '@mui/icons-material/Book';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MoodIcon from '@mui/icons-material/Mood';
import HotelIcon from '@mui/icons-material/Hotel';
import ShareIcon from '@mui/icons-material/Share';

import Carousel from 'react-material-ui-carousel';

const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: '220px',
  background: 'linear-gradient(145deg, #2c2c2c, #1a1a1a)',
  backdropFilter: 'blur(10px)',
  color: '#FFFFFF',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.4s, box-shadow 0.4s',
  cursor: 'pointer',
  borderRadius: '12px',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.5)',
  },
}));

const StyledIcon = styled('div')(({ theme }) => ({
  fontSize: '3rem',
  color: '#B0BEC5',
  transition: 'color 0.3s, transform 0.3s',
  '&:hover': {
    color: '#FFFFFF',
    transform: 'scale(1.2)',
  },
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: '#2c2c2c',
  border: '2px solid #444',
  boxShadow: 24,
  p: 4,
  color: '#FFFFFF',
  width: '85%',
  maxWidth: '700px',
  borderRadius: '12px',
};

const features = [
  {
    title: 'Mental Health Chatbot',
    description: 'Chat with our AI-powered mental health assistant.',
    detailedDescription:
      'Our AI-powered chatbot is here to listen and provide support whenever you need it. Engage in conversations that can help you understand your feelings and find ways to cope with challenges.',
    icon: <ChatIcon fontSize="large" />,
    link: '/chat',
    image: 'https://wp.technologyreview.com/wp-content/uploads/2021/11/Unknown-2.jpeg',
  },
  {
    title: 'Journal Entry',
    description: 'Record your thoughts and feelings in your personal journal.',
    detailedDescription:
      'Maintain a personal journal to reflect on your daily experiences. Journaling can help you process emotions, reduce stress, and track your personal growth over time.',
    icon: <BookIcon fontSize="large" />,
    link: '/journal',
    image: 'https://moonsterleather.com/cdn/shop/articles/creative_writing_journal_1920x.jpg?v=1695818824',
  },
  {
    title: 'Daily Tasks/Reminders',
    description: 'Manage your daily tasks and set reminders.',
    detailedDescription:
      'Organize your day with our task manager. Setting goals and reminders can improve productivity and provide a sense of accomplishment, positively impacting your mental well-being.',
    icon: <ListAltIcon fontSize="large" />,
    link: '/dailytasks',
    image: 'https://media.idownloadblog.com/wp-content/uploads/2023/08/Reminders-app-keyboard-shortcuts.jpg',
  },
  {
    title: 'Mood Tracking/Graphing',
    description: 'Track your mood over time and view graphical data.',
    detailedDescription:
      'Monitor your mood patterns to gain insights into your emotional well-being. Understanding your mood fluctuations can help you identify triggers and manage your mental health more effectively.',
    icon: <MoodIcon fontSize="large" />,
    link: '/moodrange',
    image: 'https://s22908.pcdn.co/wp-content/uploads/2021/02/mood-tracking-technology-1068x706.jpg',
  },
  {
    title: 'Sleep Tracking',
    description: 'Monitor your sleep patterns and improve rest.',
    detailedDescription:
      'Track your sleep habits to ensure you’re getting the rest you need. Good sleep is essential for mental health, affecting mood, energy levels, and overall well-being.',
    icon: <HotelIcon fontSize="large" />,
    link: '/sleeptracking',
    image: 'https://img.freepik.com/free-photo/bedroom-with-view-cityscape_188544-7713.jpg',
  },
  {
    title: 'Positive Moments Sharing',
    description: 'Share positive moments and uplift others.',
    detailedDescription:
      'Share your positive experiences and read about others’ uplifting moments. Fostering positivity can enhance your mood and contribute to a supportive community.',
    icon: <ShareIcon fontSize="large" />,
    link: '/positivemoments',
    image: 'https://images.pexels.com/photos/949592/pexels-photo-949592.jpeg?cs=srgb&dl=pexels-rovenimages-com-344613-949592.jpg&fm=jpg',
  },
];

const Homepage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleOpenModal = (feature) => {
    setSelectedFeature(feature);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFeature(null);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#1E1E1E',
        minHeight: '100vh',
        display: 'block', 
        overflowY: 'auto', 
      }}
    >
      {/* Navbar */}
      <Navbar />

      <Box sx={{ paddingTop: '80px', paddingBottom: '20px' }}>
        {/* Carousel Section */}
        <Carousel
          indicators={true}
          navButtonsAlwaysVisible
          animation="fade"
          interval={5000} 
          navButtonsProps={{
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#FFFFFF',
            },
          }}
          indicatorIconButtonProps={{
            style: {
              padding: '6px',
              color: '#B0BEC5',
            },
          }}
          activeIndicatorIconButtonProps={{
            style: {
              color: '#4CAF50',
            },
          }}
          sx={{ marginBottom: '30px' }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                height: { xs: '250px', sm: '350px', md: '450px' },
                backgroundImage: `url(${feature.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '20px',
                  transition: 'background-color 0.5s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    fontFamily: "'Roboto Slab', serif",
                    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                    marginBottom: '20px',
                  }}
                >
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={feature.link}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    transition: 'background-color 0.3s, transform 0.3s',
                    '&:hover': {
                      backgroundColor: '#43A047',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Explore
                </Button>
              </Box>
            </Box>
          ))}
        </Carousel>

        {/* Features Section */}
        <Box
          sx={{
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingBottom: '40px',
          }}
        >
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <StyledCard onClick={() => handleOpenModal(feature)}>
                  <CardContent sx={{ padding: '20px' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '15px',
                      }}
                    >
                      {/* Icon */}
                      <StyledIcon>{feature.icon}</StyledIcon>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontFamily: "'Roboto Slab', serif",
                        fontSize: '1.1rem',
                        marginBottom: '10px',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        color: '#B0BEC5',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: '0.95rem',
                      }}
                    >
                      {feature.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '15px',
                      }}
                    >
                      <Button
                        variant="outlined"
                        component={RouterLink}
                        to={feature.link}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          borderColor: '#4CAF50',
                          color: '#4CAF50',
                          fontSize: '0.9rem',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          transition: 'background-color 0.3s, color 0.3s',
                          '&:hover': {
                            backgroundColor: '#4CAF50',
                            color: '#FFFFFF',
                          },
                        }}
                      >
                        Explore
                      </Button>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Modal for Feature Details */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 700,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={modalStyle}>
            {selectedFeature && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${selectedFeature.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '8px',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {selectedFeature.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedFeature.detailedDescription}
                  </Typography>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to={selectedFeature.link}
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#43A047',
                      },
                      borderRadius: '25px',
                      padding: '10px 20px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                    onClick={handleCloseModal}
                  >
                    Explore
                  </Button>
                </Grid>
              </Grid>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Homepage;
