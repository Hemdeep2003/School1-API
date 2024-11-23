require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;
app.use(express.json());

app.use(bodyParser.json()); // To parse JSON request bodies

// MySQL connection setup using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,     // Use environment variable for host
    user: process.env.DB_USER,     // Use environment variable for user
    password: process.env.DB_PASSWORD,  // Use environment variable for password
    database: process.env.DB_NAME  // Use environment variable for database name
  });
  db.connect(err => {
    if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL database');
  });

// Add School API
// Root route (optional)
app.get('/', (req, res) => {
    res.send('Welcome to the School API!');
  });
  
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
  
    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid data' });
    }
  
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error adding school', error: err });
      }
      res.status(201).json({ message: 'School added successfully', id: result.insertId });
    });
  });
  

// List Schools API
app.get('/listSchools', (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid location' });
  }

  const query = 'SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians(latitude) ) * cos( radians(longitude) - radians(?) ) + sin( radians(?) ) * sin( radians(latitude) ) ) ) AS distance FROM schools ORDER BY distance ASC';
  db.query(query, [latitude, longitude, latitude], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching schools', error: err });
    }
    res.json(results);
  });
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
