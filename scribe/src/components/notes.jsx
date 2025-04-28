import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/notes.css';

function Notes({ userId }) {
  const generatePastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 90%)`;
  };

  const colorOptions = [
    '#fcf3ee',  // Original color
    '#f8e6e6',  // Light pink
    '#e6f3e6',  // Light green
    '#e6e6f8',  // Light blue
    '#f8f6e6'   // Light yellow
  ];

  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]); // Track selected notes
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingNote, setEditingNote] = useState(null); // Track the note being edited
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [hiddenNoteId, setHiddenNoteId] = useState(null);
  const [pressTimer, setPressTimer] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (userId) {
      console.log('Fetching notes for userId:', userId); // Debugging log
      fetchNotes();
    } else {
      setNotes([]); // Clear notes if no userId
    }
  }, [userId]); // Re-fetch when userId changes

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/notes/${userId}`);
      console.log('Fetched notes for user:', userId, res.data); // Debugging log
      setNotes(res.data || []); // Ensure we always have an array, even if empty
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotes([]); // Set to empty array on error
    }
  };

  const addNote = async () => {
    if (!newTitle || !newContent || !userId) {
      alert('Please fill in all fields');
      return;
    }

    const backgroundColor = generatePastelColor();
    try {
      const response = await axios.post('http://localhost:5001/add-note', {
        title: newTitle,
        content: newContent,
        userId: parseInt(userId, 10),
        backgroundColor
      });

      if (response.data.note) {
        setNotes(prevNotes => [...prevNotes, response.data.note]);
        setNewTitle('');
        setNewContent('');
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('Failed to save note');
    }
  };

  const updateNote = async () => {
    if (!editingNote.title || !editingNote.content) return;

    try {
      await axios.put(`http://localhost:5001/notes/${editingNote.notesid}`, {
        title: editingNote.title,
        content: editingNote.content,
      });
      setEditingNote(null); // Exit edit mode
      fetchNotes(); // Refresh notes after updating
    } catch (err) {
      console.error('Error updating note', err);
    }
  };

  const toggleSelectNote = (noteId) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]
    );
  };

  const deleteSelectedNotes = async () => {
    if (selectedNotes.length === 0) return;

    try {
      await axios.delete('http://localhost:5001/notes', {
        data: { 
          noteIds: selectedNotes, 
          userId: parseInt(userId, 10) 
        }
      });
      setSelectedNotes([]); // Clear selection
      fetchNotes(); // Refresh notes after deletion
    } catch (err) {
      console.error('Error deleting notes', err);
      alert('Failed to delete notes');
    }
  };

  const handleNoteClick = (note) => {
    if (isSelectionMode) {
      toggleSelectNote(note.id);
    } else {
      setEditingNote(note);
      setNewTitle(note.title);
      setNewContent(note.content);
      setShowForm(true);
      setHiddenNoteId(note.id);
    }
  };

  const handleMouseDown = (note) => {
    const timer = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedNotes([note.id]); // Immediately select the note
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleUpdate = async () => {
    if (!newTitle || !newContent) return;

    try {
      await axios.put(`http://localhost:5001/notes/${editingNote.id}`, {
        title: newTitle,
        content: newContent,
        userId
      });
      
      // Reset all states
      setShowForm(false);
      setEditingNote(null);
      setNewTitle('');
      setNewContent('');
      setHiddenNoteId(null);
      
      // Fetch fresh notes
      await fetchNotes();
    } catch (err) {
      console.error('Error updating note:', err);
      alert('Failed to update note');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setHiddenNoteId(null);
  };

  const handleNotePress = (note) => {
    if (isSelectionMode) {
      toggleSelectNote(note.id);
      return;
    }

    const timer = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedNotes([note.id]);
      setIsSelecting(true);
    }, 500);
    setPressTimer(timer);
  };

  const handleNoteRelease = (note) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    if (!isSelecting && !isSelectionMode) {
      handleNoteClick(note);
    }
    setIsSelecting(false);
  };

  const handleColorChange = async (note, color, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Changing color for note:', note.id, 'to:', color);

    try {
      const response = await axios.put(`http://localhost:5001/notes/${note.id}`, {
        backgroundColor: color,
        userId: parseInt(userId, 10)
      });

      if (response.data.note) {
        console.log('Color updated successfully:', response.data.note);
        setNotes(prevNotes => prevNotes.map(n => 
          n.id === note.id ? { ...n, background_color: color } : n
        ));
      }
    } catch (err) {
      console.error('Error updating color:', err);
    }
  };

  const renderColorPicker = (note) => (
    <div className="color-picker" onClick={e => e.stopPropagation()}>
      {colorOptions.map((color, index) => (
        <div
          key={index}
          className="color-circle"
          style={{ backgroundColor: color }}
          onClick={(e) => handleColorChange(note, color, e)}
        />
      ))}
    </div>
  );

  const renderNotes = () => {
    if (!Array.isArray(notes) || notes.length === 0) {
      return <p>No notes available</p>;
    }

    return notes.map((note) => (
      <div
        key={note?.id || Math.random()}
        className={`note-card ${selectedNotes.includes(note?.id) ? 'selected' : ''}
                  ${note?.id === hiddenNoteId ? 'hidden' : ''}`}
        style={{ backgroundColor: note.background_color || '#fcf3ee' }}
        onMouseDown={() => handleNotePress(note)}
        onMouseUp={() => handleNoteRelease(note)}
        onTouchStart={() => handleNotePress(note)}
        onTouchEnd={() => handleNoteRelease(note)}
      >
        <h3>{note?.title || 'Untitled'}</h3>
        <p>{note?.content || 'No content'}</p>
        {renderColorPicker(note)}
      </div>
    ));
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1>Notes</h1>
        <div className="notes-actions">
          {!showForm && (
            <>
              <button className="add-note-btn" onClick={() => {
                setShowForm(true);
                setEditingNote(null);
                setNewTitle('');
                setNewContent('');
              }}>➕ Add Note</button>
              {isSelectionMode && (
                <>
                  <button className="delete-note-btn" onClick={deleteSelectedNotes}>
                    🗑️ Delete Selected
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedNotes([]);
                  }}>✖️ Cancel</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showForm && (
        <div className="note-form" style={{ backgroundColor: editingNote?.background_color || '#fcf3ee' }}>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="form-buttons">
            <button onClick={() => editingNote ? handleUpdate() : addNote()}>
              {editingNote ? 'Update' : 'Save'}
            </button>
            <button onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      <div className="notes-list">
        {renderNotes()}
      </div>
    </div>
  );
}

export default Notes;
