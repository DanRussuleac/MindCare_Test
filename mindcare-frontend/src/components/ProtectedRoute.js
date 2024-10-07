import React from 'react';
import { Navigate } from 'react-router-dom'; // Use Navigate instead of Redirect

// A function to check if the user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Check if token is stored in localStorage
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />; // Navigate to /login if not authenticated
};

export default ProtectedRoute;
