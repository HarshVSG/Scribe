import { useState } from 'react';
import axios from 'axios';
import '../styles/auth.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(''); // Add error state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state

    try {
      const res = await axios.post('http://localhost:5001/register', form);
      alert(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed'); // Display error
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create Account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          className="auth-input"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          className="auth-input"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button type="submit" className="auth-button">Register</button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
