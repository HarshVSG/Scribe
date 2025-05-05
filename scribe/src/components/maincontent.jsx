import React from 'react';
import Notes from './notes';
import Todo from './to-do';
import Timetable from './timetable';
import StudyPDF from './studypdf';
import Settings from './settings';
import Course from './course';
import Comments from './comments';

function MainContent({ activePage, userId }) {
    return (
      <div className="main-content">
        {activePage === 'Notes' && <Notes userId={userId} />}
        {activePage === 'Studypdf' && <StudyPDF />}
        {activePage === 'to-do' && <Todo userId={userId} />}
        {activePage === 'timetable' && <Timetable userId={userId} />}
        {activePage === 'settings' && <Settings />}
        {activePage === 'course' && <Course />}
        {activePage === 'comments' && <Comments userId={userId} />}
      </div>
    );
}

export default MainContent;
