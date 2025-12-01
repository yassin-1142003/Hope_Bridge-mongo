const Task = require('../models/Task');
const User = require('../models/User');

const getAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const overdueTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'completed' },
      dueDate: { $lt: now }
    })
    .populate('createdBy', 'firstName lastName avatar')
    .populate('assignedTo', 'firstName lastName avatar')
    .sort({ dueDate: 1 });

    const dueSoonTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: twoDaysFromNow }
    })
    .populate('createdBy', 'firstName lastName avatar')
    .populate('assignedTo', 'firstName lastName avatar')
    .sort({ dueDate: 1 });

    const urgentTasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'completed' },
      priority: 'urgent'
    })
    .populate('createdBy', 'firstName lastName avatar')
    .populate('assignedTo', 'firstName lastName avatar')
    .sort({ dueDate: 1 });

    const newTasks = await Task.find({
      assignedTo: userId,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      isReadBy: { $not: { $elemMatch: { user: userId } } }
    })
    .populate('createdBy', 'firstName lastName avatar')
    .populate('assignedTo', 'firstName lastName avatar')
    .sort({ createdAt: -1 });

    const alerts = [];

    overdueTasks.forEach(task => {
      alerts.push({
        id: `overdue-${task._id}`,
        type: 'overdue',
        severity: 'critical',
        title: 'Task Overdue',
        message: `"${task.title}" is overdue by ${Math.ceil((now - task.dueDate) / (1000 * 60 * 60 * 24))} days`,
        task: task,
        createdAt: task.dueDate
      });
    });

    dueSoonTasks.forEach(task => {
      alerts.push({
        id: `due-soon-${task._id}`,
        type: 'due-soon',
        severity: 'warning',
        title: 'Task Due Soon',
        message: `"${task.title}" is due on ${new Date(task.dueDate).toLocaleDateString()}`,
        task: task,
        createdAt: task.createdAt
      });
    });

    urgentTasks.forEach(task => {
      if (!alerts.find(alert => alert.task && alert.task._id.toString() === task._id.toString())) {
        alerts.push({
          id: `urgent-${task._id}`,
          type: 'urgent',
          severity: 'high',
          title: 'Urgent Task',
          message: `"${task.title}" requires immediate attention`,
          task: task,
          createdAt: task.createdAt
        });
      }
    });

    newTasks.forEach(task => {
      alerts.push({
        id: `new-${task._id}`,
        type: 'new-assignment',
        severity: 'info',
        title: 'New Task Assignment',
        message: `You have been assigned "${task.title}"`,
        task: task,
        createdAt: task.createdAt
      });
    });

    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, warning: 2, info: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      alerts,
      summary: {
        total: alerts.length,
        overdue: overdueTasks.length,
        dueSoon: dueSoonTasks.length,
        urgent: urgentTasks.length,
        new: newTasks.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
};

const markAlertRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    if (alertId.startsWith('new-')) {
      const taskId = alertId.replace('new-', '');
      const task = await Task.findById(taskId);
      if (task) {
        await task.markAsRead(userId);
      }
    }

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert read error:', error);
    res.status(500).json({ message: 'Server error marking alert as read' });
  }
};

module.exports = {
  getAlerts,
  markAlertRead
};
