import React, { useState } from 'react';
import axios from 'axios';

function ChatBot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // To manage loading state

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        setError(null);
        setResponse('');
        setIsLoading(true); // Disable button and show loading state

        const result = await axios.post('http://localhost:5000/api/bot', { message });

        // Assuming the response contains the message content directly
        const botResponse = result.data.choices[0].message.content;

        setResponse(botResponse);
        setMessage(''); // Clear the input field after sending the message
      } catch (error) {
        console.error('Error sending message:', error);
        setError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false); // Re-enable the button after the request completes
      }
    }
  };

  return (
    <div>
      <h1>ChatBot</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        disabled={isLoading} // Disable input while loading
      />
      <button onClick={sendMessage} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
      <div>
        <h2>Response:</h2>
        {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{response}</p>}
      </div>
    </div>
  );
}

export default ChatBot;
