import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },
  attachment: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'done'],
    default: 'pending',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
taskSchema.index({ sender: 1, createdAt: -1 });
taskSchema.index({ receiver: 1, createdAt: -1 });
taskSchema.index({ status: 1 });

// Virtual for checking if task is new (created within last 24 hours)
taskSchema.virtual('isNew').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInHours = (now - created) / (1000 * 60 * 60);
  return diffInHours <= 24;
});

export default mongoose.model('Task', taskSchema);
