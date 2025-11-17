const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });


// --- API ROUTES ---

// GET /api/tasks : Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks : Create a new task
router.post('/', async (req, res) => {
  const task = new Task({
    text: req.body.text
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// POST /api/tasks/:id/generate-subtasks
router.post('/:id/generate-subtasks', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 1. Create the AI Prompt
    const prompt = `
      You are a helpful project manager. A user has given you a task.
      Break this task down into 3-5 simple, actionable sub-tasks.
      
      IMPORTANT: Respond *only* with a valid JSON array of strings. Do not include any other text, titles, or explanations.
      
      Example:
      Task: "Build a new website"
      Your Response: ["Design the homepage layout", "Develop the HTML and CSS", "Add a contact form", "Deploy the website"]
      
      Now, do the same for this task:
      Task: "${task.text}"
      Your Response:
    `;

    // 2. Call the Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let subTaskArray;

    // 3. Parse the AI's JSON response
    try {
      // We ask the AI to return a JSON string, so we need to parse it
      subTaskArray = JSON.parse(response.text());
    } catch (e) {
      console.error("Error parsing AI response:", e);
      return res.status(500).json({ message: "AI returned invalid data" });
    }

    // 4. Create sub-task objects from the array of strings
    const newSubTasks = subTaskArray.map(subTaskText => {
      return { text: subTaskText, isCompleted: false };
    });

    // 5. Save the new sub-tasks to the database
    task.subTasks = newSubTasks;
    const updatedTask = await task.save();

    // 6. Send the fully updated task back to the client
    res.json(updatedTask);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;