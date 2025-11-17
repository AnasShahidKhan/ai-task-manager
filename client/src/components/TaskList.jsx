import React from 'react';
import TaskItem from './TaskItem';
import { format } from 'date-fns';

function TaskList({ tasks, selectedDate, ...handlers }) {
  const formattedDate = format(selectedDate, 'MMMM d, yyyy');

  return (
    <div className="task-list-container">
      <h2>Tasks for {formattedDate}</h2>
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskItem 
              key={task._id} 
              task={task}
              {...handlers}
            />
          ))
        ) : (
          <p>No tasks for this day. Add one!</p>
        )}
      </div>
    </div>
  );
}

export default TaskList;