import React, { useState } from 'react';
import axios from 'axios';
import AISupporter from './AISupporter';
import { format } from 'date-fns';

function Sidebar({ selectedDate, onTaskCreated }) {
  const [text, setText] = useState("");

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    try {
      // Manually create a task for the *selected* date
      const taskToCreate = {
        text: text,
        dueDate: selectedDate 
      };
      
      await axios.post('http://localhost:5001/api/tasks', taskToCreate);
      
      // Tell the main App.jsx to refresh its list
      onTaskCreated(selectedDate);
      setText(""); // Clear the input
      
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="form-container">
        <h2>Add Task for {format(selectedDate, 'MM/dd')}</h2>
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="New task title..."
          />
          <button type="submit">Add Manually</button>
        </form>
      </div>

      <AISupporter onTaskCreated={onTaskCreated} />
    </aside>
  );
}

export default Sidebar;