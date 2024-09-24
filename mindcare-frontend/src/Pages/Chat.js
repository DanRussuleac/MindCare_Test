// chat.js
import React from 'react';
import Navbar from '../components/Navbar'; // Adjust the path if needed
import Sidebar from '../components/Sidebar'; // Adjust the path if needed
import ChatBot from '../components/ChatBot'; // Adjust the path if needed
import '../styles/Chat.css'; // Importing the separate CSS file for the Chat page

const Chat = () => {
  return (
    <div className="App">
      {/* Navbar */}
      <Navbar />

      {/* Main content area */}
      <div className="main-content">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <div className="chatbot-container">
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default Chat;
