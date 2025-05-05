import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/timetable.css';

function Timetable({ userId }) {
  const [schedule, setSchedule] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    subject: '',
    room: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    if (userId) fetchSchedule();
  }, [userId]);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/timetable/${userId}`);
      const groupedByDay = response.data.reduce((acc, entry) => {
        if (!acc[entry.day_of_week]) acc[entry.day_of_week] = [];
        acc[entry.day_of_week].push(entry);
        return acc;
      }, {});
      setSchedule(groupedByDay);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.subject) {
        alert('Please fill in all required fields');
        return;
      }

      if (!userId) {
        alert('User ID is required');
        return;
      }

      console.log('Submitting timetable entry:', {
        ...formData,
        userId
      });

      const response = await axios.post('http://localhost:5001/timetable', {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subject: formData.subject,
        room: formData.room,
        userId: parseInt(userId)
      });

      if (response.data.id) {
        await fetchSchedule();
        setShowForm(false);
        setFormData({
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          subject: '',
          room: ''
        });
      }
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/timetable/${id}`, {
        data: { userId }
      });
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  return (
    <div className="timetable-container">
      <h1>Timetable</h1>
      
      <button className="add-class-btn" onClick={() => setShowForm(true)}>
        Add Class
      </button>

      {showForm && (
        <div className="modal-overlay">
          <form className="timetable-form" onSubmit={handleSubmit}>
            <h2>{editingEntry ? 'Edit Class' : 'Add New Class'}</h2>
            
            <select
              required
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            >
              <option value="">Select Day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />

            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />

            <input
              type="text"
              placeholder="Subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />

            <input
              type="text"
              placeholder="Room (Optional)"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />

            <div className="form-buttons">
              <button type="submit">Save</button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                  setFormData({
                    dayOfWeek: '',
                    startTime: '',
                    endTime: '',
                    subject: '',
                    room: ''
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="timetable-grid">
        {days.map(day => (
          <div key={day} className="day-column">
            <h2>{day}</h2>
            <div className="classes-list">
              {schedule[day]?.sort((a, b) => a.start_time.localeCompare(b.start_time)).map(entry => (
                <div key={entry.id} className="class-card">
                  <div className="class-time">
                    {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                  </div>
                  <h3>{entry.subject}</h3>
                  {entry.room && <div className="room">Room {entry.room}</div>}
                  <div className="card-actions">
                    <button onClick={() => {
                      setEditingEntry(entry);
                      setFormData({
                        dayOfWeek: entry.day_of_week,
                        startTime: entry.start_time.slice(0, 5),
                        endTime: entry.end_time.slice(0, 5),
                        subject: entry.subject,
                        room: entry.room
                      });
                      setShowForm(true);
                    }}>Edit</button>
                    <button onClick={() => handleDelete(entry.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timetable;
