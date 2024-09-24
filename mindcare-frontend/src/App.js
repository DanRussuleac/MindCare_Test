// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Pages/Chat';
import Home from './Pages/Welcome';

function App() {
  return (
    <Router>
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
