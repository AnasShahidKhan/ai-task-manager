// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose'); // --- NEW ---

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection --- NEW ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");

    // --- Start The Server (ONLY after DB connection is successful) --- NEW ---
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
// --- END NEW ---

// --- Routes (Our API Endpoints) ---
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the server! 👋" });
});

// --- We moved the app.listen() inside the mongoose.connect() block ---