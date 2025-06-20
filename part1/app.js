var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');
const fs = require('fs');

//  var indexRouter = require('./routes/index');
//  var usersRouter = require('./routes/users');

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
      password: '' // Set your MySQL root password
    });

    // Read sql file as a string
    const dogWalkSql = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');

    const statements = dogWalkSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }

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
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Route to return users as JSON
app.get('/', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM books');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Users' });
  }
});

//  app.use('/', indexRouter);
//  app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
