// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // This loads our .env variables

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 5001; // Use port 5001 as a fallback

// --- Middleware ---
// These functions run on every request
app.use(cors()); // Allows your React app to make requests to this server
app.use(express.json()); // Allows the server to understand incoming JSON data

// --- Routes (Our API Endpoints) ---
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the server! 👋" });
});

// --- Start The Server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});