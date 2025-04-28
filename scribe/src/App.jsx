import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/register';
import Sidebar from './components/sidebar';
import MainContent from './components/maincontent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check both isLoggedIn and userId to determine login state
    return localStorage.getItem("isLoggedIn") === "true" && localStorage.getItem("userId") !== null;
  });
  const [showLogin, setShowLogin] = useState(true);
  const [activePage, setActivePage] = useState('Notes');
  const [userId, setUserId] = useState(() => localStorage.getItem("userId")); // Retrieve userId from localStorage

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !userId) {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) setUserId(storedUserId); // Ensure userId is set after login
    }
  }, [isLoggedIn, userId]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        {showLogin ? (
          <>
            <Login setIsLoggedIn={setIsLoggedIn} />
            <div className="auth-switch">
              <p>Don't have an account? <button onClick={() => setShowLogin(false)}>Register</button></p>
            </div>
          </>
        ) : (
          <>
            <Register setIsLoggedIn={setIsLoggedIn} />
            <div className="auth-switch">
              <p>Already have an account? <button onClick={() => setShowLogin(true)}>Login</button></p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar setActivePage={setActivePage} setIsLoggedIn={handleLogout} />
      <MainContent activePage={activePage} userId={userId} /> {/* Pass userId */}
    </div>
  );
}

export default App;
