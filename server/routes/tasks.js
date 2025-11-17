const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // We get our Task model

// --- API ROUTES ---

// GET /api/tasks : Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find(); // Find all tasks in the database
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks : Create a new task
router.post('/', async (req, res) => {
  const task = new Task({
    text: req.body.text // Get the text from the request body
  });

  try {
    const newTask = await task.save(); // Save the new task
    res.status(201).json(newTask); // Send the new task back
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// We will add DELETE and UPDATE routes here later

module.exports = router;