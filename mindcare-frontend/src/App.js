import React from 'react';
import ChatNavbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot'; 
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <ChatNavbar />
      <Container fluid>
        <Row>
          <Col md={3} className="p-0">
            <Sidebar />
          </Col>
          <Col md={9} className="d-flex flex-column p-0 vh-100">
            {/* Render ChatBot Component */}
            <ChatBot />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;
