import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, UserIcon, ChatBubbleLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, onAction, showActions = true }) => {
  const navigate = useNavigate();
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isDueSoon = new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && task.status !== 'completed';

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = () => {
    navigate(`/task/${task._id}`);
  };

  const handleMarkComplete = async () => {
    if (onAction) {
      await onAction('markComplete', task._id);
    }
  };

  const handleSendReminder = async () => {
    if (onAction) {
      await onAction('sendReminder', task._id);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <UserIcon className="h-4 w-4" />
          <span>{task.assignedTo?.firstName} {task.assignedTo?.lastName}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4" />
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
            {isOverdue && ' (Overdue)'}
            {isDueSoon && !isOverdue && ' (Due Soon)'}
          </span>
        </div>
        {task.comments?.length > 0 && (
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="h-4 w-4" />
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleViewDetails}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          {task.status !== 'completed' && (
            <button
              onClick={handleMarkComplete}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Complete
            </button>
          )}
          <button
            onClick={handleSendReminder}
            className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Reminder
          </button>
        </div>
      )}

      {task.projectId && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: task.projectId.color }}
            ></div>
            <span className="text-xs text-gray-600">{task.projectId.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
