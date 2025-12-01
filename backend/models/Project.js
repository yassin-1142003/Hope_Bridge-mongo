const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
