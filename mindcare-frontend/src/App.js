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
import SleepTracker from './Pages/SleepTracker';
import AnalyticsPage from './Pages/AnalyticsPage';
import DailyTasksRemindersPage from './Pages/DailyTasksRemindersPage';
import ForumPage from './Pages/ForumPage';
import AdminPage from './Pages/AdminPage';
import ProfilePage from './Pages/ProfilePage';


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
        <Route
          path="/daily"
          element={
            <ProtectedRoute>
              <DailyTasksRemindersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/positivemoments"
          element={
            <ProtectedRoute>
              <ForumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
