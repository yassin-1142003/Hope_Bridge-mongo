import User from '../models/User.js';
import Task from '../models/Task.js';

// Get all users for task assignment
export const getAllUsers = async (req, res) => {
  try {
    const { search, department, role } = req.query;
    const currentUserId = req.user._id;

    // Build query
    let query = { _id: { $ne: currentUserId } }; // Exclude current user

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email avatar role department isOnline lastSeen')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name email avatar role department isOnline lastSeen createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      isOnline: true
    })
      .select('name email avatar role department lastSeen')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching online users'
    });
  }
};

// Update user online status
export const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnline: isOnline,
        lastSeen: new Date()
      },
      { new: true }
    ).select('name email avatar role isOnline lastSeen');

    res.json({
      success: true,
      message: 'Online status updated',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating online status'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get task statistics
    const taskStats = await Task.getTaskStats(userId);
    
    // Get unread tasks count
    const unreadTasks = await Task.findUnreadTasks(userId);
    
    // Get sent vs received counts
    const sentTasks = await Task.countDocuments({ sender: userId });
    const receivedTasks = await Task.countDocuments({ receivers: userId });

    res.json({
      success: true,
      data: {
        taskStats,
        unreadCount: unreadTasks.length,
        sentTasks,
        receivedTasks
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.searchUsers(query, currentUserId)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
};

// Get departments list
export const getDepartments = async (req, res) => {
  try {
    const departments = await User.distinct('department', {
      department: { $ne: null, $ne: '' }
    });

    res.json({
      success: true,
      data: {
        departments: departments.sort()
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching departments'
    });
  }
};

// Get user activity (recent tasks, etc.)
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { limit = 10 } = req.query;

    // Users can only see their own activity unless admin
    if (userId !== currentUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s activity'
      });
    }

    const targetUserId = userId || currentUserId;

    // Get recent tasks
    const recentTasks = await Task.find({
      $or: [
        { sender: targetUserId },
        { receivers: targetUserId }
      ]
    })
      .populate('sender', 'name email avatar')
      .populate('receivers', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        recentTasks,
        count: recentTasks.length
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user activity'
    });
  }
};
