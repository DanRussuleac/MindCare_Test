// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Pages/Chat';
import Welcome from './Pages/Welcome'; // Import the Welcome page
import Login from './Pages/AuthPage';
import Homepage from './Pages/HomePage'; // Import your Homepage component
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';


function App() {
  return (
    <Router>
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

      
      </Routes>
    </Router>
  );
}

export default App;
