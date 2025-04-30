const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Use pg library for PostgreSQL
const bcrypt = require('bcrypt'); // Import bcrypt
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1', // Default to localhost
  user: process.env.DB_USER, // Use environment variable for user
  password: process.env.DB_PASSWORD, // Use environment variable for password
  database: process.env.DB_NAME, // Use environment variable for database name
  port: process.env.DB_PORT, // Default to port 5432
});

// Check if all required environment variables are set
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('Missing required database environment variables (DB_USER, DB_PASSWORD, DB_NAME).');
  process.exit(1); // Exit the application
}

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Ensure PostgreSQL is running and the connection details are correct.');
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

// REGISTER route (with PostgreSQL)
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // First check if username already exists
    const existingUser = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    res.json({ 
      message: 'User registered successfully', 
      userId: result.rows[0].id 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for:', username);

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation:', { valid: validPassword });

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    res.json({ 
      message: 'Login successful',
      userId: user.id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ADD NOTE route
app.post('/addnote', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  pool.query(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id',
    [title, content],
    (err, result) => {
      if (err) {
        console.error('Error adding note:', err);
        return res.status(500).json({ error: 'Failed to add note' });
      }
      res.json({ message: 'Note added successfully', noteId: result.rows[0].id });
    }
  );
});

// Get notes for a user
app.get('/notes/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching notes for userId:', userId);

  try {
    const results = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    console.log('Fetched notes:', results.rows);
    res.json(results.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

// Add a new note
app.post('/add-note', async (req, res) => {
  const { title, content, userId, backgroundColor } = req.body;
  console.log('Adding note with color:', { title, content, userId, backgroundColor });

  try {
    const result = await pool.query(
      'INSERT INTO notes (title, content, user_id, background_color) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, userId, backgroundColor]
    );
    console.log('Added note:', result.rows[0]);
    res.json({ message: 'Note added', note: result.rows[0] });
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Update note endpoint - fixed
app.put('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, userId, backgroundColor } = req.body;

  console.log('Update request:', { id, title, content, userId, backgroundColor });

  try {
    const query = `
      UPDATE notes 
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          background_color = COALESCE($3, background_color),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *`;

    const values = [title, content, backgroundColor, id, userId];
    const result = await pool.query(query, values);
    
    console.log('Update result:', result.rows[0]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note: result.rows[0] });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ error: `Failed to update note: ${err.message}` });
  }
});

// Get favorite notes
app.get('/notes/:userId/favorites', async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 AND is_favorite = true ORDER BY created_at DESC',
      [userId]
    );
    res.json(results.rows);
  } catch (err) {
    console.error('Error fetching favorite notes:', err);
    res.status(500).json({ error: 'Error fetching favorite notes' });
  }
});

// Delete notes endpoint
app.delete('/notes', async (req, res) => {
  const { noteIds, userId } = req.body;

  if (!noteIds?.length || !userId) {
    return res.status(400).json({ error: 'Missing noteIds or userId' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = ANY($1::int[]) AND user_id = $2 RETURNING id',
      [noteIds, userId]
    );
    
    res.json({ 
      message: 'Notes deleted successfully',
      deletedIds: result.rows.map(row => row.id)
    });
  } catch (err) {
    console.error('Error deleting notes:', err);
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});

// Add todo - Move this before the app.listen()
app.post('/todos', async (req, res) => {
  const { content, userId, isCompleted } = req.body;
  console.log('Received todo request:', { content, userId, isCompleted });

  try {
    if (!content || !userId) {
      return res.status(400).json({ error: 'Content and userId are required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (content, user_id, is_completed) VALUES ($1, $2, $3) RETURNING *',
      [content, userId, isCompleted || false]
    );
    
    console.log('Todo added successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding todo:', err);
    res.status(500).json({ error: `Failed to add todo: ${err.message}` });
  }
});

// Get todos
app.get('/todos/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Update todo
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { content, isCompleted, userId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE todos SET content = COALESCE($1, content), is_completed = COALESCE($2, is_completed) WHERE id = $3 AND user_id = $4 RETURNING *',
      [content, isCompleted, id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Make sure this is at the very end of the file
app.listen(5001, () => {
  console.log('Server running on port 5001');
});
