import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeftIcon, PaperClipIcon, ChatBubbleLeftIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedTasks, setRelatedTasks] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const [taskResponse, relatedResponse] = await Promise.all([
        tasksAPI.getTaskById(id),
        tasksAPI.getRelatedTasks(id)
      ]);
      
      setTask(taskResponse.data.task);
      setRelatedTasks(relatedResponse.data.relatedTasks);
    } catch (error) {
      toast.error('Error fetching task details');
      console.error('Error fetching task details:', error);
      if (error.response?.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await tasksAPI.updateTask(id, { status: newStatus });
      toast.success('Task status updated');
      fetchTaskDetails();
    } catch (error) {
      toast.error('Error updating task status');
      console.error('Error updating task status:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await tasksAPI.addComment(id, { text: newComment });
      setNewComment('');
      toast.success('Comment added');
      fetchTaskDetails();
    } catch (error) {
      toast.error('Error adding comment');
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await tasksAPI.markComplete(id);
      toast.success('Task marked as complete');
      fetchTaskDetails();
    } catch (error) {
      toast.error('Error marking task complete');
      console.error('Error marking task complete:', error);
    }
  };

  const handleSendReminder = async () => {
    try {
      await tasksAPI.sendReminder(id);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Error sending reminder');
      console.error('Error sending reminder:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Task not found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <div className="flex flex-col gap-2 ml-6">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Created By</div>
                <div className="font-medium text-gray-900">
                  {task.createdBy?.firstName} {task.createdBy?.lastName}
                </div>
                <div className="text-sm text-gray-500">{task.createdBy?.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Assigned To</div>
                <div className="font-medium text-gray-900">
                  {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                </div>
                <div className="text-sm text-gray-500">{task.assignedTo?.email}</div>
              </div>
            </div>

            {task.projectId && (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.projectId.color }}
                  ></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Project</div>
                  <div className="font-medium text-gray-900">{task.projectId.name}</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium text-gray-900">
                  {format(new Date(task.dueDate), 'MMMM dd, yyyy')}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(task.dueDate), 'EEEE')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium text-gray-900">
                  {format(new Date(task.createdAt), 'MMMM dd, yyyy')}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(task.createdAt), 'h:mm a')}
                </div>
              </div>
            </div>

            {task.completedAt && (
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="font-medium text-gray-900">
                    {format(new Date(task.completedAt), 'MMMM dd, yyyy')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <select
            value={task.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {task.status !== 'completed' && (
            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          )}

          <button
            onClick={handleSendReminder}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Send Reminder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              Comments ({task.comments?.length || 0})
            </h2>

            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submittingComment ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {task.comments?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                task.comments.map((comment, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.author?.firstName} {comment.author?.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      <div className="text-gray-700">{comment.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            
            <div className="space-y-4">
              {task.activity?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No activity yet
                </div>
              ) : (
                task.activity.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{activity.description}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {relatedTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Tasks</h2>
              
              <div className="space-y-3">
                {relatedTasks.map((relatedTask) => (
                  <div
                    key={relatedTask._id}
                    onClick={() => navigate(`/task/${relatedTask._id}`)}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {relatedTask.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(relatedTask.priority)}`}>
                        {relatedTask.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(relatedTask.status)}`}>
                        {relatedTask.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
