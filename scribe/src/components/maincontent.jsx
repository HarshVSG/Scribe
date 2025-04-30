import React from 'react';
import Notes from './notes';
import Todo from './to-do';
import Timetable from './timetable';
import StudyPDF from './studypdf';
import Settings from './settings';

function MainContent({ activePage, userId }) {
    return (
      <div className="main-content">
        {activePage === 'Notes' && <Notes userId={userId} />}
        {activePage === 'Studypdf' && <StudyPDF />}
        {activePage === 'to-do' && <Todo userId={userId} />}
        {activePage === 'timetable' && <Timetable />}
        {activePage === 'settings' && <Settings />}
      </div>
    );
}

export default MainContent;
