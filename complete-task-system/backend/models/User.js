import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['manager', 'employee', 'admin'],
    default: 'employee'
  },
  avatar: {
    type: String,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user profile without sensitive data
userSchema.methods.getProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    department: this.department,
    createdAt: this.createdAt
  };
};

// Static method to find online users
userSchema.statics.findOnlineUsers = function() {
  return this.find({ isOnline: true }).select('name email avatar role isOnline lastSeen');
};

// Static method to search users
userSchema.statics.searchUsers = function(query, excludeUserId = null) {
  const searchQuery = {
    $and: [
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };
  
  if (excludeUserId) {
    searchQuery.$and.push({ _id: { $ne: excludeUserId } });
  }
  
  return this.find(searchQuery).select('name email avatar role isOnline lastSeen department');
};

export default mongoose.model('User', userSchema);
