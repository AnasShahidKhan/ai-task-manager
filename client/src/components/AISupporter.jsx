import React, { useState } from 'react';
import axios from 'axios';

function AISupporter({ onTaskCreated }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! How can I help you? Try asking me to add a task.' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    const userMessage = { role: 'user', text: prompt };
    // Add the user's message to the chat history immediately
    setChatHistory(currentHistory => [...currentHistory, userMessage]);
    setPrompt(""); // Clear the input
    setIsLoading(true);

    try {
      // Call our new, smarter AI endpoint
      const response = await axios.post('http://localhost:5001/api/tasks/chat-to-task', { 
        userPrompt: prompt 
      });

      if (response.data.type === 'task') {
        // It's a task. Add a confirmation message and tell App.jsx
        const aiMessage = { role: 'ai', text: `OK, I've added "${response.data.task.text}" to your list.` };
        setChatHistory(currentHistory => [...currentHistory, aiMessage]);
        onTaskCreated(response.data.task.dueDate); // This refreshes the calendar

      } else if (response.data.type === 'chat') {
        // It's a chat message. Just add it to the history.
        const aiMessage = { role: 'ai', text: response.data.response };
        setChatHistory(currentHistory => [...currentHistory, aiMessage]);
      }

    } catch (error) {
      console.error("Error creating task from chat:", error);
      const aiMessage = { role: 'ai', text: "Sorry, I had trouble with that. Please try again." };
      setChatHistory(currentHistory => [...currentHistory, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-supporter">
      <h2>AI Supporter</h2>

      <div className="chat-window">
        {chatHistory.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Chat with your AI assistant..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default AISupporter;