import Task from '../models/Task.js';
import User from '../models/User.js';

// Send task
export const sendTask = async (req, res) => {
  try {
    const { title, description, receiver } = req.body;
    const sender = req.user._id;
    const attachment = req.file ? req.file.filename : null;

    // Validate receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(400).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Don't allow sending task to yourself
    if (receiver.toString() === sender.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send task to yourself'
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      sender,
      receiver,
      attachment
    });

    // Populate sender and receiver info
    const populatedTask = await Task.findById(task._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task sent successfully',
      data: {
        task: populatedTask
      }
    });
  } catch (error) {
    console.error('Send task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending task',
      error: error.message
    });
  }
};

// Get received tasks
export const getReceivedTasks = async (req, res) => {
  try {
    const receiverId = req.user._id;
    
    const tasks = await Task.find({ receiver: receiverId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    });
  } catch (error) {
    console.error('Get received tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching received tasks',
      error: error.message
    });
  }
};

// Get sent tasks
export const getSentTasks = async (req, res) => {
  try {
    const senderId = req.user._id;
    
    const tasks = await Task.find({ sender: senderId })
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    });
  } catch (error) {
    console.error('Get sent tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sent tasks',
      error: error.message
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is either sender or receiver
    if (task.sender._id.toString() !== userId.toString() && 
        task.receiver._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own tasks.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task',
      error: error.message
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in-progress, done'
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only receiver can update status
    if (task.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the task receiver can update status.'
      });
    }

    // Update status
    task.status = status;
    await task.save();

    // Return updated task with populated data
    const updatedTask = await Task.findById(id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.status(200).json({
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
      message: 'Server error updating task status',
      error: error.message
    });
  }
};

// Get new tasks (tasks received in last 24 hours)
export const getNewTasks = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const tasks = await Task.find({ 
      receiver: receiverId,
      createdAt: { $gte: twentyFourHoursAgo }
    })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length
      }
    });
  } catch (error) {
    console.error('Get new tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching new tasks',
      error: error.message
    });
  }
};
