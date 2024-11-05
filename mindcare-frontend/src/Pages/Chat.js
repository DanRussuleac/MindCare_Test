import React from 'react';
import Navbar from '../components/Navbar'; 
import ChatBot from '../components/ChatBot'; 
import '../styles/Chat.css'; 

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
