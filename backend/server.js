require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Check
async function checkDbConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to PostgreSQL database via Prisma');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

checkDbConnection();

// Routes
app.get('/', (req, res) => {
    res.send('Campus Resource Sharing API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
