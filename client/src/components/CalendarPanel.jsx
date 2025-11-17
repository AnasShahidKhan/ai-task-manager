import React from 'react';
import Calendar from 'react-calendar';

function CalendarPanel({ selectedDate, onDateChange }) {
  return (
    <div className="calendar-container">
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
      />
    </div>
  );
}

export default CalendarPanel;