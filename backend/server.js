require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());

// Database Connection Check
const { sequelize, syncDatabase } = require('./models');

sequelize.authenticate()
    .then(() => {
        console.log('✓ MySQL Connected successfully');
        return syncDatabase(); // Sync models to database
    })
    .catch(err => console.error('✗ Unable to connect to the database:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));

app.get('/', (req, res) => {
    res.json({ message: 'Campus Resource Sharing API' });
});

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});
