const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Comment = require('../models/Comment');

const getMySentTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    
    const query = { createdBy: req.user._id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('projectId', 'name color')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get sent tasks error:', error);
    res.status(500).json({ message: 'Server error fetching sent tasks' });
  }
};

const getMyReceivedTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    
    const query = { assignedTo: req.user._id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('projectId', 'name color')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get received tasks error:', error);
    res.status(500).json({ message: 'Server error fetching received tasks' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('comments.author', 'firstName lastName avatar')
      .populate('activity.user', 'firstName lastName avatar')
      .populate('attachments.uploadedBy', 'firstName lastName avatar')
      .populate('projectId', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.markAsRead(req.user._id);

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority = 'medium', tags = [], projectId } = req.body;

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ message: 'Assigned user not found' });
    }

    const task = new Task({
      title,
      description,
      createdBy: req.user._id,
      assignedTo,
      dueDate,
      priority,
      tags,
      projectId
    });

    await task.save();

    await task.addActivity('created', `Task "${title}" was created`, req.user._id);

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('projectId', 'name color');

    req.io.to(assignedUser._id.toString()).emit('task_assigned', {
      task: populatedTask,
      message: `You have been assigned a new task: ${title}`
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = task.status;
    const updates = [];

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) {
      task.status = status;
      if (oldStatus !== status) {
        updates.push(`Status changed from ${oldStatus} to ${status}`);
      }
    }
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    await task.save();

    if (updates.length > 0) {
      await task.addActivity('updated', updates.join(', '), req.user._id);
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('projectId', 'name color');

    req.io.to(task.assignedTo.toString()).emit('task_updated', {
      task: populatedTask,
      message: `Task "${task.title}" has been updated`
    });

    res.json({
      message: 'Task updated successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = {
      text,
      author: req.user._id,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();

    await task.addActivity('comment_added', `Comment added to task "${task.title}"`, req.user._id);

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('comments.author', 'firstName lastName avatar')
      .populate('projectId', 'name color');

    const notifyUsers = [task.assignedTo.toString(), task.createdBy.toString()];
    notifyUsers.forEach(userId => {
      if (userId !== req.user._id.toString()) {
        req.io.to(userId).emit('task_updated', {
          task: populatedTask,
          message: `New comment added to task "${task.title}"`
        });
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: task.comments[task.comments.length - 1],
      task: populatedTask
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

const markComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only assigned user can mark task as complete' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    await task.addActivity('completed', `Task "${task.title}" was marked as complete`, req.user._id);

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('projectId', 'name color');

    req.io.to(task.createdBy.toString()).emit('task_updated', {
      task: populatedTask,
      message: `Task "${task.title}" has been completed`
    });

    res.json({
      message: 'Task marked as complete',
      task: populatedTask
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({ message: 'Server error marking task complete' });
  }
};

const sendReminder = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only task creator can send reminders' });
    }

    if (task.reminderSent) {
      return res.status(400).json({ message: 'Reminder already sent for this task' });
    }

    task.reminderSent = true;
    await task.save();

    await task.addActivity('reminder_sent', `Reminder sent for task "${task.title}"`, req.user._id);

    req.io.to(task.assignedTo.toString()).emit('alert', {
      type: 'reminder',
      message: `Reminder: Task "${task.title}" is due on ${new Date(task.dueDate).toLocaleDateString()}`,
      task: task._id
    });

    res.json({
      message: 'Reminder sent successfully'
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ message: 'Server error sending reminder' });
  }
};

const getRelatedTasks = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user._id.toString() && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const relatedTasks = await Task.find({
      _id: { $ne: task._id },
      $or: [
        { projectId: task.projectId },
        { assignedTo: task.assignedTo },
        { tags: { $in: task.tags } },
        { 
          dueDate: {
            $gte: new Date(new Date(task.dueDate).getTime() - 3 * 24 * 60 * 60 * 1000),
            $lte: new Date(new Date(task.dueDate).getTime() + 3 * 24 * 60 * 60 * 1000)
          }
        }
      ]
    })
    .populate('assignedTo', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar')
    .populate('projectId', 'name color')
    .limit(10);

    res.json({ relatedTasks });
  } catch (error) {
    console.error('Get related tasks error:', error);
    res.status(500).json({ message: 'Server error fetching related tasks' });
  }
};

module.exports = {
  getMySentTasks,
  getMyReceivedTasks,
  getTaskById,
  createTask,
  updateTask,
  addComment,
  markComplete,
  sendReminder,
  getRelatedTasks
};
