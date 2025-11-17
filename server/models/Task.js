const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubTaskSchema = new Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const TaskSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  subTasks: [SubTaskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);