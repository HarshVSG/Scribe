const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting:', err);
    return;
  }
  console.log('Connected as:', connection.config.user);
  console.log('Database:', connection.config.database);
  connection.end();
});
