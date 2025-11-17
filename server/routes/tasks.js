const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { startOfDay, endOfDay } = require('date-fns'); // --- NEW: For date queries

// --- NEW: Import and set up the Google Gemini AI ---
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
// --- END NEW ---


// --- FULL CRUD API ---

// GET /api/tasks/by-date/:date
// This is our NEW "Read" route for the calendar
router.get('/by-date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const start = startOfDay(date); // e.g., 2025-11-17 00:00:00
    const end = endOfDay(date);     // e.g., 2025-11-17 23:59:59

    const tasks = await Task.find({
      dueDate: {
        $gte: start,
        $lt: end
      }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks : Create a new task (NOW WITH DATE)
router.post('/', async (req, res) => {
  const task = new Task({
    text: req.body.text,
    dueDate: new Date(req.body.dueDate) // --- UPDATED ---
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/tasks/:id : Update a task (e.g., mark as complete)
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // This returns the *new*, updated document
    );
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id : Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- AI ENDPOINTS ---

// POST /api/tasks/:id/generate-subtasks (Your existing feature)
router.post('/:id/generate-subtasks', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const prompt = `
      You are a helpful project manager. A user has given you a task.
      Break this task down into 3-5 simple, actionable sub-tasks.
      IMPORTANT: Respond *only* with a valid JSON array of strings.
      Task: "${task.text}"
      Your Response:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let subTaskArray;

    try {
      subTaskArray = JSON.parse(response.text());
    } catch (e) {
      console.error("Error parsing AI response:", e);
      return res.status(500).json({ message: "AI returned invalid data" });
    }

    task.subTasks = subTaskArray.map(text => ({ text, isCompleted: false }));
    const updatedTask = await task.save();
    res.json(updatedTask);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/chat-to-task (Your NEW AI chat feature)
router.post('/chat-to-task', async (req, res) => {
  const { userPrompt } = req.body;
  const today = new Date().toISOString();

  const prompt = `
    You are an intelligent task parser. Today's date is ${today}.
    Convert the user's prompt into a JSON object with "text" and "dueDate".
    The "dueDate" MUST be a valid ISO 8601 date string.

    Rules:
    - If no date is mentioned, use today's date.
    - If "tomorrow" is mentioned, calculate tomorrow's date.
    - If a day of the week is mentioned (e.g., "this Friday"), calculate the upcoming Friday.
    - Be smart about times (e.g., "tomorrow at 10am").

    IMPORTANT: Respond *only* with the single, valid JSON object. Do not include any other text or markdown.

    Examples:
    User: "Call the bank tomorrow at 10am"
    Your Response: {"text": "Call the bank", "dueDate": "2025-11-18T10:00:00.000Z"}
    
    User: "Finish the report"
    Your Response: {"text": "Finish the report", "dueDate": "${today}"}
    
    User: "Submit project this Friday"
    Your Response: {"text": "Submit project", "dueDate": "2025-11-21T17:00:00.000Z"}

    Now, parse this prompt:
    User: "${userPrompt}"
    Your Response:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = JSON.parse(response.text());

    // Create the new task using the AI's response
    const task = new Task({
      text: aiResponse.text,
      dueDate: new Date(aiResponse.dueDate)
    });

    const newTask = await task.save();
    res.status(201).json(newTask); // Send the new task back to the client

  } catch (err) {
    console.error("Error with AI chat-to-task:", err);
    res.status(500).json({ message: "Failed to create task from prompt" });
  }
});

module.exports = router;