import React, { useState } from 'react';
import '../styles/sidebar.css';

function Sidebar({ setActivePage, setIsLoggedIn }) {
  const [active, setActive] = useState('Notes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (page) => {
    setActive(page);
    setActivePage(page);
    setIsMenuOpen(false);
  };

  return (
    <>
      <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          <li className={active === 'Notes' ? 'active' : ''} onClick={() => handleClick('Notes')}>
            <span>Notes</span>
          </li>
          <li className={active === 'Studypdf' ? 'active' : ''} onClick={() => handleClick('Studypdf')}>
            <span>StudyPDF</span>
          </li>
          <li className={active === 'to-do' ? 'active' : ''} onClick={() => handleClick('to-do')}>
            <span>To-Do</span>
          </li>
          <li className={active === 'timetable' ? 'active' : ''} onClick={() => handleClick('timetable')}>
            <span>Timetable</span>
          </li>
          <li className={active === 'course' ? 'active' : ''} onClick={() => handleClick('course')}>
            <span>Course</span>
          </li>
          <li className={active === 'comments' ? 'active' : ''} onClick={() => handleClick('comments')}>
            <span>Chat</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
        <h2>Scribe</h2>
      </div>
    </>
  );
}

export default Sidebar;
