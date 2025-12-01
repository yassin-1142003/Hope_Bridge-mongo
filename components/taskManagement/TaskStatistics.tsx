import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BarChart, TrendingUp, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import styles from './TaskStatistics.module.css';

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  assignedToMe: number;
}

const TaskStatistics: React.FC = () => {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    assignedToMe: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to get progress class based on percentage
  const getProgressClass = (percentage: number): string => {
    // Round to nearest 5%
    const roundedPercentage = Math.round(percentage / 5) * 5;
    return `progress-${roundedPercentage}`;
  };

  useEffect(() => {
    fetchTaskStatistics();
  }, []);

  const fetchTaskStatistics = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStats: TaskStats = {
        total: 45,
        completed: 12,
        inProgress: 8,
        pending: 15,
        overdue: 3,
        assignedToMe: 7
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch task statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <div className="flex items-center gap-2">
                  <div className={`w-32 bg-gray-200 rounded-full h-2 ${styles.progressContainer}`}>
                    <div 
                      className={`bg-green-500 ${styles.progressBar} ${styles[getProgressClass(completionRate)]}`}
                    />
                  </div>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <div className="flex items-center gap-2">
                  <div className={`w-32 bg-gray-200 rounded-full h-2 ${styles.progressContainer}`}>
                    <div 
                      className={`bg-orange-500 ${styles.progressBar} ${styles[getProgressClass(stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0)]}`}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <div className="flex items-center gap-2">
                  <div className={`w-32 bg-gray-200 rounded-full h-2 ${styles.progressContainer}`}>
                    <div 
                      className={`bg-yellow-500 ${styles.progressBar} ${styles[getProgressClass(stats.total > 0 ? (stats.pending / stats.total) * 100 : 0)]}`}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <div className="flex items-center gap-2">
                  <div className={`w-32 bg-gray-200 rounded-full h-2 ${styles.progressContainer}`}>
                    <div 
                      className={`bg-red-500 ${styles.progressBar} ${styles[getProgressClass(overdueRate)]}`}
                    />
                  </div>
                  <span className="text-sm font-medium">{overdueRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personal Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Assigned to Me</span>
                <Badge variant="outline">{stats.assignedToMe}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">My Completion Rate</span>
                <Badge variant="outline">
                  {stats.assignedToMe > 0 ? Math.round((stats.completed / stats.assignedToMe) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Team Efficiency</span>
                <Badge variant="outline">{completionRate}%</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Urgent Tasks</span>
                <Badge variant="destructive">{stats.overdue}</Badge>
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full" variant="outline">
                View Detailed Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskStatistics;
