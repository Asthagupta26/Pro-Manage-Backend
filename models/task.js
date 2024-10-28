const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
    },
    queue: {
      type: String,
    },
    tasks: {
      type: Array,
      required: true,
    },
    checkedTasks: {
      type: Array,
    },
    checkedNumber: {
      type: Number,
    },
    dueDate: {
      type: Date,
    },
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Task', taskSchema);
