import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define the URL of our backend server
const API_URL = 'http://localhost:5001/api/tasks';

function App() {
  // State to hold the list of tasks from the database
  const [tasks, setTasks] = useState([]);
  
  // State to hold the text of the new task we are typing
  const [newTaskText, setNewTaskText] = useState("");

  // This `useEffect` hook runs once when the app loads
  // It's the perfect place to fetch our data
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to fetch all tasks from our server
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data); // Put the tasks from the API into our state
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Function to create a new task
  const handleCreateTask = async (e) => {
    // Prevent the form from refreshing the page on submit
    e.preventDefault();
    if (!newTaskText) return; // Don't create empty tasks

    try {
      const taskToCreate = { text: newTaskText };
      // Make the POST request to our server
      const response = await axios.post(API_URL, taskToCreate);
      
      // Add the new task (from the server response) to our UI
      setTasks([...tasks, response.data]);
      
      // Clear the input box
      setNewTaskText("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="app-container">
      <h1>AI Task Manager</h1>
      
      {/* Form for creating a new task */}
      <form className="task-form" onSubmit={handleCreateTask}>
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Enter a new task..."
        />
        <button type="submit">Add Task</button>
      </form>
      
      {/* List of current tasks */}
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            // We use task._id (from MongoDB) as the unique key
            <div key={task._id} className="task-item">
              <p>{task.text}</p>
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