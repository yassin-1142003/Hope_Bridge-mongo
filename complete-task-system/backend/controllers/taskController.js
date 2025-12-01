import Task from '../models/Task.js';
import { getFileInfo } from '../middleware/upload.js';

// Create new task with multiple receivers
export const createTask = async (req, res) => {
  try {
    const { title, description, receivers, priority = 'medium', tags, dueDate } = req.body;
    const senderId = req.user._id;

    // Validate input
    if (!title || !description || !receivers || !Array.isArray(receivers) || receivers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and at least one receiver'
      });
    }

    // Validate receivers exist and are not the sender
    const uniqueReceivers = [...new Set(receivers)];
    if (uniqueReceivers.includes(senderId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You cannot assign a task to yourself'
      });
    }

    // Create task
    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      sender: senderId,
      receivers: uniqueReceivers,
      priority,
      tags: tags || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      attachment: req.file ? getFileInfo(req.file) : null
    });

    await task.save();

    // Populate task details for response
    const populatedTask = await Task.findById(task._id)
      .populate('sender', 'name email avatar')
      .populate('receivers', 'name email avatar');

    // Emit real-time notification to receivers
    if (req.io) {
      uniqueReceivers.forEach(receiverId => {
        req.io.to(receiverId).emit('new_task', {
          task: populatedTask,
          sender: req.user.getProfile()
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: populatedTask
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all tasks for logged-in user (both sent and received)
export const getMyTasks = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20, type } = req.query;
    const userId = req.user._id;

    // Build filters
    const filters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;

    // Get tasks
    const tasks = await Task.findUserTasks(userId, filters)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter by type if specified
    let filteredTasks = tasks;
    if (type === 'sent') {
      filteredTasks = tasks.filter(task => task.sender._id.toString() === userId.toString());
    } else if (type === 'received') {
      filteredTasks = tasks.filter(task => 
        task.receivers.some(receiver => receiver._id.toString() === userId.toString())
      );
    }

    // Get total count for pagination
    const totalCount = await Task.countDocuments({
      $or: [
        { sender: userId },
        { receivers: userId }
      ]
    });

    res.json({
      success: true,
      data: {
        tasks: filteredTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
};

// Get tasks sent by user
export const getSentTasks = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    // Build filters
    const filters = { sender: userId };
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;

    const tasks = await Task.findUserTasks(userId, filters)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const sentTasks = tasks.filter(task => task.sender._id.toString() === userId.toString());

    const totalCount = await Task.countDocuments({ sender: userId });

    res.json({
      success: true,
      data: {
        tasks: sentTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sent tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sent tasks'
    });
  }
};

// Get tasks received by user
export const getReceivedTasks = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    // Build filters
    const filters = { receivers: userId };
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;

    const tasks = await Task.findUserTasks(userId, filters)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const receivedTasks = tasks.filter(task => 
      task.receivers.some(receiver => receiver._id.toString() === userId.toString())
    );

    const totalCount = await Task.countDocuments({ receivers: userId });

    res.json({
      success: true,
      data: {
        tasks: receivedTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get received tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching received tasks'
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId)
      .populate('sender', 'name email avatar')
      .populate('receivers', 'name email avatar')
      .populate('statusHistory.changedBy', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('isRead.user', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is involved in this task
    if (!task.isUserInvolved(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task'
      });
    }

    // Mark as read if user is a receiver
    if (task.receivers.some(receiver => receiver._id.toString() === userId.toString())) {
      await task.markAsReadByUser(userId);
    }

    res.json({
      success: true,
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task'
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, comment } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['new', 'pending', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user can update this task
    if (!task.canUserUpdate(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Update status
    const oldStatus = task.status;
    await task.updateStatus(status, userId, comment);

    // Populate updated task
    const updatedTask = await Task.findById(taskId)
      .populate('sender', 'name email avatar')
      .populate('receivers', 'name email avatar')
      .populate('statusHistory.changedBy', 'name email avatar');

    // Emit real-time notification
    if (req.io) {
      // Notify sender
      req.io.to(task.sender.toString()).emit('task_status_updated', {
        task: updatedTask,
        updatedBy: req.user.getProfile(),
        oldStatus,
        newStatus: status
      });

      // Notify all receivers
      task.receivers.forEach(receiver => {
        req.io.to(receiver.toString()).emit('task_status_updated', {
          task: updatedTask,
          updatedBy: req.user.getProfile(),
          oldStatus,
          newStatus: status
        });
      });
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task status'
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only sender can delete task (or admin)
    if (task.sender.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can delete the task'
      });
    }

    await Task.findByIdAndDelete(taskId);

    // Emit real-time notification
    if (req.io) {
      // Notify all receivers
      task.receivers.forEach(receiver => {
        req.io.to(receiver.toString()).emit('task_deleted', {
          taskId,
          deletedBy: req.user.getProfile()
        });
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
};

// Add comment to task
export const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is involved in this task
    if (!task.isUserInvolved(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this task'
      });
    }

    // Add comment
    task.comments.push({
      user: userId,
      text: text.trim()
    });

    await task.save();

    // Populate updated task
    const updatedTask = await Task.findById(taskId)
      .populate('sender', 'name email avatar')
      .populate('receivers', 'name email avatar')
      .populate('comments.user', 'name email avatar');

    // Emit real-time notification
    if (req.io) {
      // Notify sender
      req.io.to(task.sender.toString()).emit('task_comment_added', {
        task: updatedTask,
        comment: task.comments[task.comments.length - 1],
        commentedBy: req.user.getProfile()
      });

      // Notify all receivers
      task.receivers.forEach(receiver => {
        req.io.to(receiver.toString()).emit('task_comment_added', {
          task: updatedTask,
          comment: task.comments[task.comments.length - 1],
          commentedBy: req.user.getProfile()
        });
      });
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// Get new/unread tasks for user
export const getNewTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadTasks = await Task.findUnreadTasks(userId);

    res.json({
      success: true,
      data: {
        tasks: unreadTasks,
        count: unreadTasks.length
      }
    });
  } catch (error) {
    console.error('Get new tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching new tasks'
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Task.getTaskStats(userId);

    // Get additional stats
    const totalTasks = await Task.countDocuments({
      $or: [
        { sender: userId },
        { receivers: userId }
      ]
    });

    const overdueTasks = await Task.countDocuments({
      receivers: userId,
      status: { $in: ['new', 'pending', 'in-progress'] },
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        stats,
        totalTasks,
        overdueTasks
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task statistics'
    });
  }
};
