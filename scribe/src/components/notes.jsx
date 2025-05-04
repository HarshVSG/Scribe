import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/notes.css';

function Notes({ userId }) {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const colors = [
    '#FFE4E1', // Misty Rose - Light Pink
    '#E0FFFF', // Light Cyan - Ice Blue
    '#F0FFF0', // Honeydew - Mint Green
    '#F5F5DC', // Beige
    '#E6E6FA', // Lavender - Light Purple
  ];

  useEffect(() => {
    if (userId) fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/notes/${userId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (editingNote) {
        const response = await axios.put(
          `http://localhost:5001/notes/${editingNote.id}`, 
          {
            title: formData.title,
            content: formData.content,
            userId: parseInt(userId)
          }
        );

        if (response.data && response.data.note) {
          await fetchNotes(); // Refresh notes after update
          closeForm();
        }
      } else {
        const response = await axios.post('http://localhost:5001/add-note', {
          title: formData.title,
          content: formData.content,
          userId: parseInt(userId),
          backgroundColor: '#ffffff'  // Changed from '#fcf3ee' to white
        });

        if (response.data.note) {
          await fetchNotes(); // Refresh notes after creation
          closeForm();
        }
      }
    } catch (error) {
      console.error('Error details:', error);
      alert(error.response?.data?.error || 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote({
      ...note,
      id: parseInt(note.id) // Ensure ID is integer
    });
    setFormData({
      title: note.title,
      content: note.content,
      backgroundColor: note.background_color || colors[0]
    });
    setShowForm(true);
  };

  const handleColorChange = async (noteId, color, e) => {
    e.stopPropagation();
    try {
      console.log('Changing color:', { noteId, color });
      const response = await axios.put(`http://localhost:5001/notes/${noteId}`, {
        backgroundColor: color,
        userId: parseInt(userId)
      });
      
      if (response.data && response.data.note) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === noteId 
              ? { ...note, background_color: color }
              : note
          )
        );
      }
    } catch (error) {
      console.error('Error updating color:', error);
      alert('Failed to update note color');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormData({ title: '', content: '' });
  };

  const handleDelete = async () => {
    if (!selectedNotes.length) return;
    
    try {
      console.log('Deleting notes:', selectedNotes);
      const response = await axios.delete('http://localhost:5001/notes', {
        data: {
          noteIds: selectedNotes,
          userId: parseInt(userId)
        }
      });

      if (response.data.deletedIds) {
        setNotes(prevNotes => 
          prevNotes.filter(note => !selectedNotes.includes(note.id))
        );
        setSelectedNotes([]);
        setIsSelectionMode(false);
      }
    } catch (error) {
      console.error('Error deleting notes:', error);
      alert('Failed to delete notes');
    }
  };

  // Add selection handlers
  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => {
      const isSelected = prev.includes(noteId);
      if (isSelected) {
        const newSelected = prev.filter(id => id !== noteId);
        if (newSelected.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelected;
      }
      return [...prev, noteId];
    });
  };

  // Simplified note click handler
  const handleNoteClick = (note, e) => {
    if (isSelectionMode) {
      toggleNoteSelection(note.id);
    } else {
      handleEdit(note);
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotes([]);
  };

  return (
    <div className="notes-container">
      <h1>Notes</h1>

      {showForm && (
        <>
          <div className="note-form-overlay" onClick={closeForm} />
          <form 
            className="note-form" 
            onSubmit={handleSubmit}
            style={{ 
              backgroundColor: editingNote?.background_color || formData.backgroundColor || colors[0]
            }}
          >
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
            <textarea
              placeholder="Write your note here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <div className="form-buttons">
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingNote ? 'Update' : 'Save')}
              </button>
              <button type="button" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </form>
        </>
      )}

      <div className="notes-list">
        {notes.map(note => (
          <div 
            key={note.id}
            className={`note-card ${selectedNotes.includes(note.id) ? 'selected' : ''}`}
            onClick={(e) => handleNoteClick(note, e)}
            style={{ backgroundColor: note.background_color || colors[0] }}
          >
            <div className="select-circle" onClick={(e) => {
              e.stopPropagation();
              setIsSelectionMode(true);
              toggleNoteSelection(note.id);
            }} />
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="color-picker">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="color-circle"
                  style={{ 
                    backgroundColor: color,
                    border: note.background_color === color ? '2px solid #666' : '1px solid rgba(0,0,0,0.1)'
                  }}
                  onClick={(e) => handleColorChange(note.id, color, e)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="floating-buttons">
        {isSelectionMode && selectedNotes.length > 0 && (
          <button 
            className="delete-btn"
            onClick={handleDelete}
            aria-label="Delete selected notes"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
        {!isSelectionMode && (
          <button 
            className="add-note-btn" 
            onClick={() => setShowForm(true)}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

export default Notes;
