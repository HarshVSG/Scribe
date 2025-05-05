const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); // Change from pg to mysql2
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Use promise wrapper for async/await

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

// REGISTER route (MySQL version)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username exists
    const [existingUsers] = await pool.query(
      'SELECT username FROM users WHERE username = ?', 
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    res.json({ 
      message: 'User registered successfully', 
      userId: result.insertId 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, users[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    res.json({ 
      message: 'Login successful',
      userId: users[0].id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Notes routes
app.get('/notes/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [notes] = await pool.query(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

app.post('/add-note', async (req, res) => {
  const { title, content, userId, backgroundColor } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO notes (title, content, user_id, background_color) VALUES (?, ?, ?, ?)',
      [title, content, userId, backgroundColor]
    );
    const [insertedNote] = await pool.query(
      'SELECT * FROM notes WHERE id = ?',
      [result.insertId]
    );
    res.json({ message: 'Note added', note: insertedNote[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Update note endpoint
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, userId, backgroundColor } = req.body;
  console.log('Update request:', { id, title, content, userId, backgroundColor });

  try {
    let updateFields = [];
    let values = [];

    if (backgroundColor !== undefined) {
      updateFields.push('background_color = ?');
      values.push(backgroundColor);
    }
    if (title !== undefined) {
      updateFields.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      values.push(content);
    }

    values.push(id, userId); // Add id and userId for WHERE clause

    const query = `
      UPDATE notes 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?`;

    const [result] = await pool.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Fetch updated note
    const [updatedNote] = await pool.query(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );

    res.json({ note: updatedNote[0] });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: `Failed to update note: ${err.message}` });
  }
});

// Get favorite notes
app.get('/notes/:userId/favorites', async (req, res) => {
  const { userId } = req.params;

  try {
    const [results] = await pool.query(
      'SELECT * FROM notes WHERE user_id = ? AND is_favorite = true ORDER BY created_at DESC',
      [userId]
    );
    res.json(results);
  } catch (err) {
    console.error('Error fetching favorite notes:', err);
    res.status(500).json({ error: 'Error fetching favorite notes' });
  }
});

// Delete notes endpoint
app.delete('/notes', async (req, res) => {
  const { noteIds, userId } = req.body;
  console.log('Delete request:', { noteIds, userId });

  if (!noteIds?.length || !userId) {
    return res.status(400).json({ error: 'Missing noteIds or userId' });
  }

  try {
    const placeholders = noteIds.map(() => '?').join(',');
    const query = `DELETE FROM notes WHERE id IN (${placeholders}) AND user_id = ?`;
    const values = [...noteIds, userId];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No notes found to delete' });
    }

    res.json({ 
      message: 'Notes deleted successfully',
      deletedIds: noteIds
    });
  } catch (err) {
    console.error('Error deleting notes:', err);
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});

// Add todo - Move this before the app.listen()
app.post('/todos', async (req, res) => {
  const { content, userId, isCompleted, due_date } = req.body;
  console.log('Received todo request:', { content, userId, isCompleted, due_date });

  try {
    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and userId are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO todos (content, user_id, is_completed, due_date) VALUES (?, ?, ?, ?)',
      [content, userId, isCompleted || false, due_date]
    );
    
    const [insertedTodo] = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    );
    console.log('Todo added successfully:', insertedTodo[0]);
    res.json(insertedTodo[0]);
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: `Failed to add todo: ${err.message}` });
  }
});

// Get todos
app.get('/todos/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [todos] = await pool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Update todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { content, isCompleted, userId, dueDate } = req.body;
  console.log('Update todo request:', { id, content, isCompleted, userId, dueDate });

  try {
    const [result] = await pool.query(
      'UPDATE todos SET is_completed = ? WHERE id = ? AND user_id = ?',
      [isCompleted, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    // Fetch the updated todo
    const [updatedTodo] = await pool.query(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );

    res.json(updatedTodo[0]);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo - fixed version
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log('Delete todo request:', { id, userId });

  try {
    const [result] = await pool.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Comments routes
app.get('/comments', async (req, res) => {
  try {
    const [comments] = await pool.query(
      'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id ORDER BY created_at DESC LIMIT 100'
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

app.post('/comments', async (req, res) => {
  const { content, userId } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO comments (content, user_id) VALUES (?, ?)',
      [content, userId]
    );
    
    const [comment] = await pool.query(
      'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?',
      [result.insertId]
    );
    
    res.json(comment[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Timetable routes
app.get('/timetable/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [schedule] = await pool.query(
      'SELECT * FROM timetables WHERE user_id = ? ORDER BY day_of_week, start_time',
      [userId]
    );
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching schedule' });
  }
});

app.post('/timetable', async (req, res) => {
  const { dayOfWeek, startTime, endTime, subject, room, userId } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO timetables (day_of_week, start_time, end_time, subject, room, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [dayOfWeek, startTime, endTime, subject, room, userId]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add class' });
  }
});

app.put('/timetable/:id', async (req, res) => {
  const { id } = req.params;
  const { dayOfWeek, startTime, endTime, subject, room, userId } = req.body;
  try {
    await pool.query(
      'UPDATE timetables SET day_of_week = ?, start_time = ?, end_time = ?, subject = ?, room = ? WHERE id = ? AND user_id = ?',
      [dayOfWeek, startTime, endTime, subject, room, id, userId]
    );
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

app.delete('/timetable/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await pool.query(
      'DELETE FROM timetables WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Get all courses
app.get('/courses', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses ORDER BY course_code');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// Get materials for a course
app.get('/materials/:courseId', async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT * FROM course_materials WHERE course_id = ? ORDER BY unit_number',
      [req.params.courseId]
    );
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching materials' });
  }
});

// Get all unique subjects
app.get('/studypdf/subjects', async (req, res) => {
  try {
    const [subjects] = await pool.query(
      'SELECT DISTINCT subject_code, subject_name FROM studypdf'
    );
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching subjects' });
  }
});

// Get materials by subject
app.get('/studypdf/:subjectCode', async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT * FROM studypdf WHERE subject_code = ? ORDER BY unit_number, material_type',
      [req.params.subjectCode]
    );
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching materials' });
  }
});

// Get materials by subject and unit
app.get('/studypdf/:subjectCode/:unit', async (req, res) => {
  try {
    const [materials] = await pool.query(
      'SELECT * FROM studypdf WHERE subject_code = ? AND unit_number = ? ORDER BY material_type',
      [req.params.subjectCode, req.params.unit]
    );
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching materials' });
  }
});

// Make sure this is at the very end of the file
app.listen(5001, () => {
  console.log('Server running on port 5001');
});
