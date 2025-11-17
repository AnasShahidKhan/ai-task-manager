const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is the "template" for every task we create
const TaskSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  // This will store the AI-generated sub-tasks
  subTasks: [
    {
      text: String,
      isCompleted: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true }); // timestamps adds 'createdAt' and 'updatedAt'

// This creates the "Task" model in our database
module.exports = mongoose.model('Task', TaskSchema);