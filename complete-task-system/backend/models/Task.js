import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task sender is required']
  },
  receivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  status: {
    type: String,
    enum: ['new', 'pending', 'in-progress', 'completed', 'cancelled'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachment: {
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  isRead: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['new', 'pending', 'in-progress', 'completed', 'cancelled'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    comment: {
      type: String,
      maxlength: [200, 'Status change comment cannot exceed 200 characters']
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
taskSchema.index({ sender: 1, createdAt: -1 });
taskSchema.index({ receivers: 1, createdAt: -1 });
taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ priority: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1 });

// Virtual for unread status
taskSchema.virtual('isUnread').get(function() {
  return this.status === 'new' && this.isRead.length === 0;
});

// Virtual for receiver count
taskSchema.virtual('receiverCount').get(function() {
  return this.receivers.length;
});

// Method to check if user is involved in task
taskSchema.methods.isUserInvolved = function(userId) {
  return this.sender.toString() === userId.toString() || 
         this.receivers.some(receiver => receiver.toString() === userId.toString());
};

// Method to check if user can update task
taskSchema.methods.canUserUpdate = function(userId) {
  const userIdStr = userId.toString();
  return this.sender.toString() === userIdStr || 
         this.receivers.some(receiver => receiver.toString() === userIdStr);
};

// Method to mark as read by user
taskSchema.methods.markAsReadByUser = function(userId) {
  const alreadyRead = this.isRead.some(read => read.user.toString() === userId.toString());
  if (!alreadyRead) {
    this.isRead.push({ user: userId });
  }
  return this.save();
};

// Method to update status with history
taskSchema.methods.updateStatus = function(newStatus, userId, comment = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'completed' && oldStatus !== 'completed') {
    this.completedAt = new Date();
  }
  
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    comment: comment
  });
  
  return this.save();
};

// Static method to find tasks for user
taskSchema.statics.findUserTasks = function(userId, filters = {}) {
  const query = {
    $or: [
      { sender: userId },
      { receivers: userId }
    ]
  };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ]
    });
  }
  
  return this.find(query)
    .populate('sender', 'name email avatar')
    .populate('receivers', 'name email avatar')
    .populate('statusHistory.changedBy', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .populate('isRead.user', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Static method to find unread tasks for user
taskSchema.statics.findUnreadTasks = function(userId) {
  return this.find({
    receivers: userId,
    status: 'new',
    'isRead.user': { $ne: userId }
  })
    .populate('sender', 'name email avatar')
    .populate('receivers', 'name email avatar')
    .sort({ createdAt: -1 });
};

// Static method to get task statistics
taskSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receivers: new mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model('Task', taskSchema);
