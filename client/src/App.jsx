import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the URL of our backend server
const API_URL = 'http://localhost:5001/api/tasks';

function App() {
  // State to hold the list of tasks from the database
  const [tasks, setTasks] = useState([]);
  
  // State to hold the text of the new task we are typing
  const [newTaskText, setNewTaskText] = useState("");

  // --- NEW: State to track which task is "thinking" ---
  // We'll store the ID of the task we're generating
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  // --- END NEW ---

  // This `useEffect` hook runs once when the app loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to fetch all tasks from our server
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data); 
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskText) return; 

    try {
      const taskToCreate = { text: newTaskText };
      const response = await axios.post(API_URL, taskToCreate);
      setTasks([...tasks, response.data]);
      setNewTaskText("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleGenerateSubtasks = async (taskId) => {
    setLoadingTaskId(taskId); // Show the "loading" spinner
    try {
      // Call our new AI endpoint on the server
      const response = await axios.post(`${API_URL}/${taskId}/generate-subtasks`);
      
      // The server sends back the *updated* task.
      // We need to find the old task in our list and replace it.
      setTasks(currentTasks =>
        currentTasks.map(t => (t._id === taskId ? response.data : t))
      );

    } catch (error) {
      console.error("Error generating sub-tasks:", error);
    } finally {
      setLoadingTaskId(null); // Stop the "loading" spinner
    }
  };

  return (
    <div className="app-container">
      <h1>AI Task Manager</h1>
      
      <form className="task-form" onSubmit={handleCreateTask}>
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Enter a new complex task..."
        />
        <button type="submit">Add Task</button>
      </form>
      
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <div key={task._id} className="task-item">
              
              {/* --- NEW: Task Item Header --- */}
              <div className="task-item-header">
                <p>{task.text}</p>
                <button 
                  className="generate-btn"
                  // Call the AI function when clicked
                  onClick={() => handleGenerateSubtasks(task._id)}
                  // Disable the button if this task is already loading
                  disabled={loadingTaskId === task._id}
                >
                  {/* Show "Generating..." if loading */}
                  {loadingTaskId === task._id ? "Generating..." : "Generate Sub-tasks"}
                </button>
              </div>

              {task.subTasks && task.subTasks.length > 0 && (
                <ul className="subtask-list">
                  {task.subTasks.map((subTask, index) => (
                    <li key={index}>
                      {subTask.text}
                    </li>
                  ))}
                </ul>
              )}

            </div>
          ))
        ) : (
          <p>No tasks yet. Add one!</p>
        )}
      </div>
    </div>
  );
}

export default App;