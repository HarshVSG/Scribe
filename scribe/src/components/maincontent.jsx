import React from 'react';
import Notes from './notes';
import Todo from './to-do';
import Timetable from './timetable';
import StudyPDF from './studypdf';
import Settings from './settings';

function MainContent({ activePage }) {
    return (
        <div className="main-content">
            {activePage === 'Notes' && <Notes />}
            {activePage === 'Studypdf' && <StudyPDF />}
            {activePage === 'to-do' && <Todo />}
            {activePage === 'timetable' && <Timetable />}
            {activePage === 'settings' && <Settings />}
        </div>
    );
}

export default MainContent;
