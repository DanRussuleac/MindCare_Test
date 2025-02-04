import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Pages/Chat';
import Welcome from './Pages/Welcome';
import Login from './Pages/AuthPage';
import Homepage from './Pages/HomePage';
import JournalPage from './Pages/JournalPage';
import MoodTracker from './Pages/MoodTracker';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import SOSModal from './components/SOSModal';
import SOSButton from './components/SOSButton';

// >>> ADD THIS IMPORT <<<
import SleepTracker from './Pages/SleepTracker'; // <-- New SleepTracker page

function App() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const handleOpenSOS = () => {
    setIsSOSOpen(true);
  };

  const handleCloseSOS = () => {
    setIsSOSOpen(false);
  };

  return (
    <Router>
      <SOSModal open={isSOSOpen} handleClose={handleCloseSOS} />
      <SOSButton handleClick={handleOpenSOS} />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />

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
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood-tracker"
          element={
            <ProtectedRoute>
              <MoodTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sleep-tracker"
          element={
            <ProtectedRoute>
              <SleepTracker />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
