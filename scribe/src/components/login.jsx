import React, { useState } from 'react';
import axios from 'axios';
import '../styles/auth.css';

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/login', {
        username,
        password,
      });

      if (response.data.message === 'Login successful') {
        localStorage.setItem('userId', response.data.userId); // Store userId
        localStorage.setItem('isLoggedIn', 'true'); // Add this line
        setIsLoggedIn(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          className="auth-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Login</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
