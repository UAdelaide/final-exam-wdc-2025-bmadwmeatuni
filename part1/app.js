var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');
const fs = require('fs');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Set your MySQL root password
      multipleStatements: true
    });

    // Read sql file as a string
    const dogWalkSql = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');

    await connection.query(dogWalkSql);

    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Insert data if table is empty
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role)
        VALUES ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('patrick', 'star@sb.com', 'patrickstar', 'walker'),
        ('spongebob', 'sb@sb.com', 'bikini', 'owner')
      `);
    }

    const [rows1] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (rows1[0].count === 0) {
      await db.execute(`
        INSERT INTO Dogs (name, size, owner_id)
        VALUES ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
        ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
        ('Luna', 'large', (SELECT user_id FROM Users WHERE username = 'carol123')),
        ('Bow', 'medium', (SELECT user_id FROM Users WHERE username = 'spongebob')),
        ('Mayonnaise', 'small', (SELECT user_id FROM Users WHERE username = 'spongebob'));
      `);
    }

    const [rows2] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (rows2[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (requested_time, duration_minutes, status, location, dog_id)
        VALUES ('2025-06-10 08:00:00', 30, 'open', 'Parklands', (SELECT dog_id FROM Dogs WHERE name = 'Max')),
        ('2025-06-10 09:30:00', 45, 'accepted', 'Beachside Ave', (SELECT dog_id FROM Dogs WHERE name = 'Bella')),
        ('2025-06-10 10:00:00', 60, 'open', 'Esplanade', (SELECT dog_id FROM Dogs WHERE name = 'Luna')),
        ('2025-06-10 23:45:00', 5, 'cancelled', 'Churchill Rd', (SELECT dog_id FROM Dogs WHERE name = 'Bow')),
        ('2025-06-10 00:00:05', 15, 'accepted', 'Bowden', (SELECT dog_id FROM Dogs WHERE name = 'Mayonnaise'));
      `);
    }

    const [rows3] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (rows2[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (requested_time, duration_minutes, status, location, dog_id)
        VALUES ('2025-06-10 08:00:00', 30, 'open', 'Parklands', (SELECT dog_id FROM Dogs WHERE name = 'Max')),
        ('2025-06-10 09:30:00', 45, 'accepted', 'Beachside Ave', (SELECT dog_id FROM Dogs WHERE name = 'Bella')),
        ('2025-06-10 10:00:00', 60, 'open', 'Esplanade', (SELECT dog_id FROM Dogs WHERE name = 'Luna')),
        ('2025-06-10 23:45:00', 5, 'cancelled', 'Churchill Rd', (SELECT dog_id FROM Dogs WHERE name = 'Bow')),
        ('2025-06-10 00:00:05', 15, 'accepted', 'Bowden', (SELECT dog_id FROM Dogs WHERE name = 'Mayonnaise'));
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return users as JSON
app.get('/', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM Users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Users' });
  }
});

app.get('/api/dogs', async (req, res) => {
  try {
    const [dogs] = await db.execute(`
        SELECT Dogs.name AS dog_name, Dogs.size AS size, Users.username AS owner_username
        FROM Dogs JOIN Users ON Dogs.owner_id = Users.user_id
        `);
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [open] = await db.execute(`
        SELECT r.request_id AS request_id, d.name AS dog_name, r.requested_time AS requested_time, r.duration_minutes AS duration_minutes, r.location AS location, u.username AS owner_username
        FROM WalkRequests r
        JOIN Dogs d ON r.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE r.status = 'open'
        `);
    res.json(open);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch open walk requests' });
  }
});

app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [open] = await db.execute(`
        SELECT r.request_id AS request_id, d.name AS dog_name, r.requested_time AS requested_time, r.duration_minutes AS duration_minutes, r.location AS location, u.username AS owner_username
        FROM WalkRequests r
        JOIN Dogs d ON r.dog_id = d.dog_id
        JOIN Users u ON d.owner_id = u.user_id
        WHERE r.status = 'open'
        `);
    res.json(open);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch open walk requests' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
