// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const taskRoutes = require('./routes/tasks'); // Import our new routes

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // This is CRITICAL for POST requests

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");

    // --- Start The Server (ONLY after DB connection is successful) ---
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// --- Routes (Our API Endpoints) ---
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the server! 👋" });
});

// Tell our app to use the task routes for any URL starting with /api/tasks
app.use('/api/tasks', taskRoutes); 
