import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Track whether it's login or register

  const toggleForm = () => {
    setIsLogin(!isLogin); // Toggle between login and register forms
  };

  const handleLogin = (credentials) => {
    console.log('Logging in with:', credentials);
    // Perform login logic here
  };

  const handleRegister = (credentials) => {
    console.log('Registering with:', credentials);
    // Perform registration logic here
  };

  return (
    <div className="auth-page">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>

      {isLogin ? (
        <LoginForm onSubmit={handleLogin} />
      ) : (
        <RegisterForm onSubmit={handleRegister} />
      )}

      <button onClick={toggleForm}>
        {isLogin ? 'Don’t have an account? Register' : 'Already have an account? Login'}
      </button>
    </div>
  );
};

export default AuthPage;
