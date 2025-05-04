import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/to-do.css';

function Todo({ userId }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    content: '',
    dueDate: new Date().toISOString().split('T')[0], // Today's date as default
    category: 'personal'
  });
  const [editingTodo, setEditingTodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Categories array
  const categories = ['personal', 'work', 'shopping', 'health', 'others'];

  // Move isOverdue function before it's used
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Stats calculation - now safe to use isOverdue
  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.is_completed).length,
    pending: todos.filter(todo => !todo.is_completed).length,
    overdue: todos.filter(todo => !todo.is_completed && isOverdue(todo.due_date)).length
  };

  // Filter and sort todos
  const filteredTodos = todos
    .filter(todo => 
      todo.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'date':
          return new Date(b.due_date || 0) - new Date(a.due_date || 0);
        case 'alpha':
          return a.content.localeCompare(b.content);
        case 'status':
          return (a.is_completed === b.is_completed) ? 0 : a.is_completed ? 1 : -1;
        default:
          return 0;
      }
    });

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
    if (!newTodo.content.trim() || !newTodo.dueDate) return;

    try {
      console.log('Sending todo with due date:', newTodo.dueDate);
      const response = await axios.post('http://localhost:5001/todos', {
        content: newTodo.content,
        userId: parseInt(userId),
        isCompleted: false,
        due_date: newTodo.dueDate  // Changed to match database column name
      });
      
      if (response.data) {
        setNewTodo({
          content: '',
          dueDate: new Date().toISOString().split('T')[0] // Reset to today's date
        });
        fetchTodos();
      }
    } catch (error) {
      console.error('Error details:', error);
      alert('Failed to add todo');
    }
  };

  const toggleComplete = async (todo) => {
    try {
      console.log('Toggling todo:', todo.id, 'to:', !todo.is_completed);
      const response = await axios.put(`http://localhost:5001/todos/${todo.id}`, {
        isCompleted: !todo.is_completed,
        userId: parseInt(userId)
      });

      if (response.data) {
        setTodos(prevTodos => 
          prevTodos.map(t => 
            t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
          )
        );
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo');
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

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return ''; // Invalid date check
      
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const groupTodosByDate = () => {
    // Filter todos based on search term
    const filtered = searchTerm 
      ? todos.filter(todo => todo.content.toLowerCase().includes(searchTerm.toLowerCase()))
      : todos;

    // Group by due_date
    return filtered.reduce((groups, todo) => {
      // Use the todo's due_date instead of created_at
      const dueDate = todo.due_date ? todo.due_date.split('T')[0] : 'No Date';
      if (!groups[dueDate]) {
        groups[dueDate] = [];
      }
      groups[dueDate].push(todo);
      return groups;
    }, {});
  };

  const formatDateHeader = (dateStr) => {
    if (dateStr === 'No Date') return 'No Due Date';
    
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset hours to compare dates properly
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="todo-container">
      <h1>To-Do</h1>

      <div className="todo-stats">
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="todo-controls-wrapper">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="date">Sort by Date</option>
          <option value="alpha">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>
      
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTodo.content}
          onChange={(e) => setNewTodo({...newTodo, content: e.target.value})}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <select
          value={newTodo.category}
          onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={newTodo.dueDate}
          onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
          className="date-input"
        />
        <button type="submit" className="add-todo-btn">Add</button>
      </form>

      <div className="todos-list">
        {Object.entries(groupTodosByDate())
          .sort(([dateA], [dateB]) => {
            if (dateA === 'No Date') return 1;
            if (dateB === 'No Date') return -1;
            return new Date(dateA) - new Date(dateB);
          })
          .map(([date, todosForDate]) => (
            <div key={date} className="todo-date-group">
              <h2 className="date-header">{formatDateHeader(date)}</h2>
              {todosForDate.map(todo => (
                <div key={todo.id} className={`todo-item ${todo.is_completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => toggleComplete(todo)}
                    className="todo-checkbox"
                  />
                  
                  <div className="todo-content-wrapper">
                    <span 
                      className="todo-content"
                      onDoubleClick={() => setEditingTodo(todo.id)}
                    >
                      {todo.content}
                    </span>
                    {todo.due_date && (
                      <span className={`todo-due-date ${isOverdue(todo.due_date) ? 'todo-overdue' : ''}`}>
                        {formatDate(todo.due_date)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-todo-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Todo;
