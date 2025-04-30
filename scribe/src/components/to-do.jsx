import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/to-do.css';

function Todo({ userId }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    if (userId) fetchTodos();
  }, [userId]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/todos/${userId}`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      console.log('Attempting to add todo:', { content: newTodo, userId });
      
      const response = await axios.post('http://localhost:5001/todos', {
        content: newTodo,
        userId: parseInt(userId),
        isCompleted: false
      });
      
      console.log('Server response:', response.data);
      
      if (response.data) {
        setNewTodo('');
        fetchTodos();
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.response?.data?.error || 'Failed to add todo. Please try again.');
    }
  };

  const toggleComplete = async (todo) => {
    try {
      await axios.put(`http://localhost:5001/todos/${todo.id}`, {
        isCompleted: !todo.is_completed,
        userId: parseInt(userId)
      });
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/todos/${id}`, {
        data: { userId: parseInt(userId) }
      });
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const updateTodo = async (id, content) => {
    try {
      await axios.put(`http://localhost:5001/todos/${id}`, {
        content,
        userId: parseInt(userId)
      });
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <div className="todo-container">
      <h1>To-Do</h1>
      
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button type="submit" className="add-todo-btn">Add</button>
      </form>

      <div className="todos-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.is_completed}
              onChange={() => toggleComplete(todo)}
              className="todo-checkbox"
            />
            
            {editingTodo === todo.id ? (
              <input
                type="text"
                value={todo.content}
                onChange={(e) => {
                  const updatedTodos = todos.map(t => 
                    t.id === todo.id ? { ...t, content: e.target.value } : t
                  );
                  setTodos(updatedTodos);
                }}
                onBlur={() => updateTodo(todo.id, todo.content)}
                className="todo-edit-input"
                autoFocus
              />
            ) : (
              <span 
                className="todo-content"
                onDoubleClick={() => setEditingTodo(todo.id)}
              >
                {todo.content}
              </span>
            )}
            
            <button
              onClick={() => deleteTodo(todo.id)}
              className="delete-todo-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Todo;
