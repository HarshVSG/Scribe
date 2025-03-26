import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/register';
import Sidebar from './components/sidebar';
import MainContent from './components/maincontent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true"; // Read from storage on load
  });

  const [showLogin, setShowLogin] = useState(true);
  const [activePage, setActivePage] = useState('Notes');

  // Save login state in localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        {showLogin ? (
          <>
            <Login setIsLoggedIn={setIsLoggedIn} />
            <p>Don't have an account? <button onClick={() => setShowLogin(false)}>Register</button></p>
          </>
        ) : (
          <>
            <Register setIsLoggedIn={setIsLoggedIn} />
            <p>Already have an account? <button onClick={() => setShowLogin(true)}>Login</button></p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar setActivePage={setActivePage} setIsLoggedIn={setIsLoggedIn} />
      <MainContent activePage={activePage} />
    </div>
  );
}

export default App;
