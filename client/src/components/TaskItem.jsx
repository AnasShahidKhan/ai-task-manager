import React, { useState } from 'react';

function TaskItem({ task, onToggleComplete, onDelete, onGenerateSubtasks, onUpdateTask, onToggleSubtask }) {
  const [loadingAI, setLoadingAI] = useState(false);
  
  const handleGenerate = async () => {
    setLoadingAI(true);
    await onGenerateSubtasks(task._id);
    setLoadingAI(false);
  };

  return (
    <div className="task-item">
      <div className="task-item-header">
        <input 
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggleComplete(task._id, !task.isCompleted)}
        />
        <p 
          className={task.isCompleted ? 'completed' : ''}
          onClick={() => onToggleComplete(task._id, !task.isCompleted)}
        >
          {task.text}
        </p>
        <div className="task-item-buttons">
          <button 
            className="task-btn generate-btn"
            onClick={handleGenerate}
            disabled={loadingAI}
          >
            {loadingAI ? "..." : "AI Sub-tasks"}
          </button>
          <button 
            className="task-btn delete-btn" 
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </div>
      </div>

      {task.subTasks && task.subTasks.length > 0 && (
        <ul className="subtask-list">
          {task.subTasks.map((subTask, index) => (
            <li key={index} className={subTask.isCompleted ? 'completed' : ''}>
              <input 
                type="checkbox"
                checked={subTask.isCompleted}
                onChange={() => onToggleSubtask(task._id, index, !subTask.isCompleted)}
              />
              {subTask.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskItem;