// chat.js
import React from 'react';
import Navbar from '../components/Navbar'; // Adjust the path if needed
import ChatBot from '../components/ChatBot'; // Adjust the path if needed
import '../styles/Chat.css'; // Importing the separate CSS file for the Chat page

const Chat = () => {
  return (
    <div className="App">
      {/* Navbar */}
      <Navbar />

      {/* Main content area */}
      <div className="main-content">
        <ChatBot />
      </div>
    </div>
  );
};

export default Chat;
