/**
 * Task Statistics Component
 * 
 * Displays comprehensive task statistics for the dashboard
 */

import React from 'react';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  FileText, 
  UserX, 
  AlertTriangle,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface Statistics {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

interface TaskStatisticsProps {
  statistics: Statistics;
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ statistics }) => {
  const statCards = [
    {
      title: 'Total Tasks',
      value: statistics.total,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'All tasks in the system'
    },
    {
      title: 'Pending',
      value: statistics.pending,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      description: 'Tasks awaiting action'
    },
    {
      title: 'In Progress',
      value: statistics.inProgress,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Tasks being worked on'
    },
    {
      title: 'Submitted',
      value: statistics.submitted,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Tasks awaiting review'
    },
    {
      title: 'Completed',
      value: statistics.completed,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Successfully completed'
    },
    {
      title: 'Overdue',
      value: statistics.overdue,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      description: 'Tasks past due date'
    }
  ];

  // Calculate completion rate
  const completionRate = statistics.total > 0 
    ? Math.round((statistics.completed / statistics.total) * 100) 
    : 0;

  // Calculate active tasks (pending + in progress + submitted)
  const activeTasks = statistics.pending + statistics.inProgress + statistics.submitted;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={stat.title}
          className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.textColor} ${stat.bgColor} p-3 rounded-lg`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {stat.title}
            </h3>
            <p className="text-xs text-gray-600">
              {stat.description}
            </p>
          </div>
          
          {/* Progress bar for visual representation */}
          {statistics.total > 0 && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`${stat.color} h-1.5 rounded-full transition-all duration-300`}
                  style={{ width: `${(stat.value / statistics.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((stat.value / statistics.total) * 100)}% of total
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <Target className="w-6 h-6 text-white" />
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        
        <div className="text-2xl font-bold mb-2">
          {completionRate}%
        </div>
        
        <div>
          <h3 className="text-sm font-semibold mb-1">
            Completion Rate
          </h3>
          <p className="text-xs opacity-90">
            {statistics.completed} of {statistics.total} tasks completed
          </p>
        </div>
        
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span>Active Tasks:</span>
            <span className="font-semibold">{activeTasks}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Cancelled:</span>
            <span className="font-semibold">{statistics.cancelled}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStatistics;
