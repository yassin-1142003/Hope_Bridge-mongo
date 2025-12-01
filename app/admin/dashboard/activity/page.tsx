// app/admin/dashboard/activity/page.tsx - Admin dashboard for viewing all tracked activities
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';

interface TaskActivity {
  _id: string;
  userId: string;
  userRole: string;
  userName: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  operation: string;
  description: string;
  dataSent?: any;
  dataReceived?: any;
  apiEndpoint?: string;
  httpMethod?: string;
  statusCode?: number;
  responseTime?: number;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  department?: string;
  createdAt: string;
}

interface RoleMetrics {
  role: string;
  date: string;
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntity: Record<string, number>;
  successfulActions: number;
  failedActions: number;
  averageResponseTime: number;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
  peakHours: Array<{
    hour: number;
    actionCount: number;
  }>;
}

export default function ActivityDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [roleReport, setRoleReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    if (selectedRole !== 'all') {
      fetchRoleReport();
    }
  }, [selectedRole]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/activity?type=dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      setError('Failed to fetch dashboard data');
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: 'recent-activities',
        limit: '100'
      });
      
      if (selectedRole !== 'all') {
        params.append('role', selectedRole);
      }
      
      const response = await fetch(`/api/admin/activity?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.data.activities || []);
      }
    } catch (error) {
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleReport = async () => {
    try {
      const response = await fetch(`/api/admin/activity?type=role-report&role=${selectedRole}`);
      const data = await response.json();
      
      if (data.success) {
        setRoleReport(data.data);
      }
    } catch (error) {
      setError('Failed to fetch role report');
    }
  };

  const clearActivities = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/activity?action=${action}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Activity cleanup completed: ${data.deletedCount} records deleted`);
        fetchDashboardData();
        fetchRecentActivities();
      }
    } catch (error) {
      alert('Failed to clear activities');
    }
  };

  const exportData = async () => {
    try {
      const params = new URLSearchParams({
        type: 'recent-activities',
        limit: '1000'
      });
      
      if (selectedRole !== 'all') {
        params.append('role', selectedRole);
      }
      
      const response = await fetch(`/api/admin/activity?${params}`);
      const data = await response.json();
      
      if (data.success) {
        const csv = convertToCSV(data.data.activities || []);
        downloadCSV(csv, `activity-report-${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const convertToCSV = (activities: TaskActivity[]): string => {
    const headers = [
      'Timestamp', 'User', 'Role', 'Action', 'Entity', 'Operation', 
      'Status', 'Response Time', 'Endpoint', 'IP Address'
    ];
    
    const rows = activities.map(activity => [
      new Date(activity.createdAt).toLocaleString(),
      activity.userName,
      activity.userRole,
      activity.action,
      activity.entityName,
      activity.operation,
      activity.success ? 'Success' : 'Failed',
      `${activity.responseTime || 0}ms`,
      activity.apiEndpoint || '',
      activity.ipAddress || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getOperationBadge = (operation: string) => {
    const colors: Record<string, string> = {
      'CREATE': 'bg-blue-100 text-blue-800',
      'READ': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'SEND': 'bg-purple-100 text-purple-800',
      'RECEIVE': 'bg-indigo-100 text-indigo-800'
    };
    
    return colors[operation] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Activity Tracking Dashboard
        </h1>
        <div className="flex gap-2">
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchRecentActivities} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.summary?.totalActivities || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours: {dashboardData.summary?.last24Hours || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary?.successRate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                API request success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.summary?.averageResponseTime?.toFixed(0) || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Average API response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.alerts?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                System alerts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="PROJECT_COORDINATOR">Project Coordinator</SelectItem>
                  <SelectItem value="FIELD_OFFICER">Field Officer</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchRecentActivities}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="roles">Role Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No activities found
                    </p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity._id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getOperationBadge(activity.operation)}>
                                {activity.operation}
                              </Badge>
                              <Badge variant="outline">{activity.userRole}</Badge>
                              <span className={`text-sm ${getStatusColor(activity.success)}`}>
                                {activity.success ? '✓' : '✗'}
                              </span>
                            </div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.userName} • {activity.userEmail}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{new Date(activity.createdAt).toLocaleString()}</div>
                            {activity.responseTime && (
                              <div>{activity.responseTime}ms</div>
                            )}
                          </div>
                        </div>
                        
                        {activity.errorMessage && (
                          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-sm">
                            Error: {activity.errorMessage}
                          </div>
                        )}
                        
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {activity.apiEndpoint && (
                            <span>Endpoint: {activity.apiEndpoint}</span>
                          )}
                          {activity.httpMethod && (
                            <span>Method: {activity.httpMethod}</span>
                          )}
                          {activity.statusCode && (
                            <span>Status: {activity.statusCode}</span>
                          )}
                          {activity.ipAddress && (
                            <span>IP: {activity.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData?.roleBreakdown?.map((roleData: any) => (
              <Card key={roleData._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {roleData._id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Actions:</span>
                      <span className="font-bold">{roleData.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-bold text-green-600">
                        {((roleData.success / roleData.count) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Actions:</span>
                      <span className="font-bold text-red-600">
                        {roleData.count - roleData.success}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.roleBreakdown?.map((roleData: any) => (
                  <div key={roleData._id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{roleData._id}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Actions:</span>
                        <div className="font-bold">{roleData.count}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <div className="font-bold text-green-600">
                          {((roleData.success / roleData.count) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <div className="font-bold text-red-600">
                          {roleData.count - roleData.success}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <div className="font-bold text-red-600">
                          {(((roleData.count - roleData.success) / roleData.count) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Clear Old Activities</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Remove old activity logs to free up database space
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => clearActivities('clear-errors')} 
                      variant="outline"
                      size="sm"
                    >
                      Clear Errors
                    </Button>
                    <Button 
                      onClick={() => clearActivities('clear-all&olderThan=30')} 
                      variant="outline"
                      size="sm"
                    >
                      Clear 30+ Days
                    </Button>
                    <Button 
                      onClick={() => clearActivities('clear-all')} 
                      variant="destructive"
                      size="sm"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
