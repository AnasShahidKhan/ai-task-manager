const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { startOfDay, endOfDay } = require('date-fns');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });


// --- FULL CRUD API ---
// GET /api/tasks/by-date/:date
router.get('/by-date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const start = startOfDay(date); 
    const end = endOfDay(date);     

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
    dueDate: new Date(req.body.dueDate)
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
      { new: true }
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
// POST /api/tasks/:id/generate-subtasks
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
    const rawText = response.text();

    let subTaskArray;

    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("AI returned plain text, not a JSON array");
      }
      const jsonString = jsonMatch[0];
      subTaskArray = JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing AI response:", rawText, e);
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
    You are an AI assistant for a task manager app. Today's date is ${today}.
    First, determine the user's "intent": "chatting", "creating_task", or "unsupported_request".

    - "chatting": If the user is just talking (e.g., "Hi", "How are you?").
    - "creating_task": If the user is giving a command to create a task (e.g., "Add milk", "Call bank tomorrow").
    - "unsupported_request": If the user is asking to DO something you can't, like delete, update, or read a task (e.g., "delete my last task", "what's on my list?", "change my task").

    You MUST respond with *only* a valid JSON object in one of these three formats.
    Do NOT include any other text, markdown, or explanations. Do NOT be conversational if the type is 'unsupported_request'.

    Format 1 (Chat):
    {
      "type": "chat",
      "response": "Hello! How can I help you today?"
    }

    Format 2 (Task):
    {
      "type": "task",
      "task": {
        "text": "Call the bank",
        "dueDate": "2025-11-18T10:00:00.000Z"
      }
    }

    Format 3 (Unsupported):
    {
      "type": "unsupported_request"
    }

    Now, parse this prompt:
    User: "${userPrompt}"
    Your Response:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let aiResponse;

    try {
      const jsonMatch = rawText.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        // The AI just sent plain chat (e.g., "Hello")
        throw new Error("AI returned plain text, not JSON");
      }
      const jsonString = jsonMatch[0];
      aiResponse = JSON.parse(jsonString);
    } catch (e) {
      // If parsing fails, treat it as a basic chat response
      console.warn("AI returned non-JSON, treating as chat:", rawText);
      aiResponse = {
        type: "chat",
        response: rawText.replace(/```json|```/g, "")
      };
    }


    if (aiResponse.type === 'task' && aiResponse.task) {
      // It's a task. Save it to the database.
      const task = new Task({
        text: aiResponse.task.text,
        dueDate: new Date(aiResponse.task.dueDate)
      });
      const newTask = await task.save();
      res.status(201).json({ type: 'task', task: newTask });

    } else if (aiResponse.type === 'unsupported_request') {
      res.status(200).json({ type: 'chat', response: "Sorry, I can only add new tasks and chat. I can't delete or modify tasks." });

    } else {
      res.status(200).json({ type: 'chat', response: aiResponse.response });
    }

  } catch (err) {
    console.error("Error with AI chat-to-task:", err);
    res.status(500).json({ message: "Failed to create task from prompt" });
  }
});

module.exports = router;