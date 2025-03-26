import React, { useState } from 'react';
import '../styles/sidebar.css';

function Sidebar({ setActivePage, setIsLoggedIn }) {
  const [active, setActive] = useState('Notes');

  const handleClick = (page) => {
    setActive(page);
    setActivePage(page);
  };

  return (
    <div className="sidebar">
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
        <li className={active === 'settings' ? 'active' : ''} onClick={() => handleClick('settings')}>
          <span>Favourites</span>
        </li>
      </ul>
      <button className="logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
      <h2>Scribe</h2>
    </div>
  );
}

export default Sidebar;
