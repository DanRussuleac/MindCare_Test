// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Pages/Chat';
import Welcome from './Pages/Welcome';
import Login from './Pages/AuthPage';
import Homepage from './Pages/HomePage';
import JournalPage from './Pages/JournalPage'; // Import the JournalPage component
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import SOSModal from './components/SOSModal'; // Import SOSModal
import SOSButton from './components/SOSButton'; // Import SOSButton

function App() {
  // State to control the SOS Modal
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  // Handler to open the SOS Modal
  const handleOpenSOS = () => {
    setIsSOSOpen(true);
  };

  // Handler to close the SOS Modal
  const handleCloseSOS = () => {
    setIsSOSOpen(false);
  };

  return (
    <Router>
      {/* SOS Modal - Always present */}
      <SOSModal open={isSOSOpen} handleClose={handleCloseSOS} />

      {/* SOS Button - Always present */}
      <SOSButton handleClick={handleOpenSOS} />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} /> {/* Welcome page as the root */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Add the Journal route */}
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
