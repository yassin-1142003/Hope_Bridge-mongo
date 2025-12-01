const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'completed', 'assigned', 'comment_added', 'reminder_sent', 'status_changed']
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  comments: [commentSchema],
  activity: [activitySchema],
  attachments: [attachmentSchema],
  isReadBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ projectId: 1 });

taskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

taskSchema.methods.addActivity = function(action, description, userId) {
  this.activity.push({
    action,
    description,
    user: userId
  });
  return this.save();
};

taskSchema.methods.markAsRead = function(userId) {
  const existingRead = this.isReadBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.isReadBy.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Task', taskSchema);
