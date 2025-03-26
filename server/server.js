const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// REGISTER route (without bcrypt)
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password], // Storing password as plain text (Not recommended for production)
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'User already exists or server error' });
      }
      res.json({ message: 'User registered', userId: result.insertId });
    }
  );
});

// LOGIN route (without bcrypt)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    if (results.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = results[0];

    if (password === user.password) { // Simple password check
      res.json({ message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
