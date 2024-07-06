const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 9000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const HOST = "database-1.cjs84igecwkk.ap-south-1.rds.amazonaws.com";
const USER = "admin";
const PASS = "saadm1412";
const Database = "apex";

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASS,
  database: Database,
  port: 3306
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to parse application/json
app.use(bodyParser.json());

// Route to handle form submission
app.post('/submit-appointment', (req, res) => {
  const { name, email, phone, age, date, message, timeslot } = req.body;

  // Create SQL INSERT query
  const sql = 'INSERT INTO appointments (name, email, phone, age, date, message, timeslot) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [name, email, phone, age, date, message, timeslot];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting appointment:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('Appointment inserted:', result);
    res.status(200).send('Appointment submitted successfully');
  });
});

// Route to get all appointments
app.get('/api/appointments', (req, res) => {
  const sql = 'SELECT * FROM appointments';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Route to get a specific patient by ID
app.get('/api/patient/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM appointments WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching patient:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(result[0]);
  });
});

// Route to submit a prescription
app.post('/submit-prescription', (req, res) => {
  const { patientId, prescription } = req.body;
  const sql = 'INSERT INTO prescriptions (patientId, prescription) VALUES (?, ?)';
  db.query(sql, [patientId, prescription], (err, result) => {
    if (err) {
      console.error('Error inserting prescription:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(200).send('Prescription submitted successfully');
  });
});

// API endpoint to get patient details by ID
app.get('/api/patient/:id', (req, res) => {
  const patientId = req.params.id;
  db.query('SELECT name, age, date FROM appointments WHERE id = ?', [patientId], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Database query error' });
      }
      if (results.length === 0) {
          return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(results[0]);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
