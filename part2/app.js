const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Initialize session management
const session = require('express-session');

app.use(session({
  secret: 'dogwalk-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

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


// Export the app instead of listening here
module.exports = app;