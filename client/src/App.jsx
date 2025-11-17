import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Sidebar from './components/Sidebar';
import CalendarPanel from './components/CalendarPanel';
import TaskList from './components/TaskList';

const API_URL = 'http://localhost:5001/api/tasks';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  // --- Data Fetching ---
  // This will re-run every time the 'selectedDate' changes
  useEffect(() => {
    fetchTasksForDate(selectedDate);
  }, [selectedDate]);

  const fetchTasksForDate = async (date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`${API_URL}/by-date/${dateString}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // --- Task CRUD Handlers ---
  // These functions are passed down to the components
  
  const handleTaskCreated = (taskDate) => {
    // This is a simple way to refresh the list
    // If the new task was for today, refresh our list.
    if (format(new Date(taskDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      fetchTasksForDate(selectedDate);
    } else {
      // If the task was for a *different* day, just select that day
      setSelectedDate(new Date(taskDate));
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      const response = await axios.put(`${API_URL}/${taskId}`, { isCompleted });
      // Find and replace the task in our local list
      setTasks(currentTasks => 
        currentTasks.map(t => (t._id === taskId ? response.data : t))
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`);
      // Filter out the deleted task from our local list
      setTasks(currentTasks => currentTasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleGenerateSubtasks = async (taskId) => {
    try {
      const response = await axios.post(`${API_URL}/${taskId}/generate-subtasks`);
      // Find and replace the task to show its new subtasks
      setTasks(currentTasks => 
        currentTasks.map(t => (t._id === taskId ? response.data : t))
      );
    } catch (error) {
      console.error("Error generating sub-tasks:", error);
    }
  };

  const handleToggleSubtask = async (taskId, subTaskIndex, isCompleted) => {
    // 1. Find the task
    const taskToUpdate = tasks.find(t => t._id === taskId);
    if (!taskToUpdate) return;
  
    // 2. Create a deep copy of the subtasks array
    const newSubTasks = [...taskToUpdate.subTasks];
    // 3. Update the specific subtask
    newSubTasks[subTaskIndex] = { ...newSubTasks[subTaskIndex], isCompleted };
  
    // 4. Call the API to update the entire task
    try {
      const response = await axios.put(`${API_URL}/${taskId}`, { 
        subTasks: newSubTasks 
      });
      // 5. Update our local state
      setTasks(currentTasks => 
        currentTasks.map(t => (t._id === taskId ? response.data : t))
      );
    } catch (error) {
      console.error("Error updating sub-task:", error);
    }
  };


  // --- Render the App ---
  return (
    <div className="app-layout">
      
      <Sidebar 
        selectedDate={selectedDate}
        onTaskCreated={handleTaskCreated}
      />
      
      <main className="main-panel">
        <CalendarPanel 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <TaskList
          tasks={tasks}
          selectedDate={selectedDate}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onGenerateSubtasks={handleGenerateSubtasks}
          onToggleSubtask={handleToggleSubtask}
        />
      </main>

    </div>
  );
}

export default App;