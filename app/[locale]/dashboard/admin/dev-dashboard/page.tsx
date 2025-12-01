"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { 
  Database, 
  Server, 
  Users, 
  FolderOpen, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Activity,
  RefreshCw,
  Settings,
  Terminal,
  Globe,
  Shield,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error';
  apis: 'working' | 'partial' | 'down';
  users: number;
  projects: number;
  tasks: number;
  lastUpdate: string;
}

interface APIStatus {
  name: string;
  status: 'success' | 'error' | 'loading';
  responseTime?: number;
  error?: string;
}

export default function DevDashboard() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'disconnected',
    apis: 'down',
    users: 0,
    projects: 0,
    tasks: 0,
    lastUpdate: new Date().toISOString()
  });
  
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'Database', status: 'loading' },
    { name: 'Projects', status: 'loading' },
    { name: 'Tasks', status: 'loading' },
    { name: 'Analytics', status: 'loading' },
    { name: 'Auth', status: 'loading' }
  ]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    
    try {
      // Check database
      const dbResponse = await fetch('/api/test-db');
      const dbData = await dbResponse.json();
      
      // Check projects API
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.ok ? await projectsResponse.json() : null;
      
      // Check tasks API
      const tasksResponse = await fetch('/api/tasks');
      const tasksData = await tasksResponse.ok ? await tasksResponse.json() : null;
      
      // Check analytics API
      const analyticsResponse = await fetch('/api/analytics');
      const analyticsData = await analyticsResponse.ok ? await analyticsResponse.json() : null;
      
      // Update system status
      setSystemStatus({
        database: dbResponse.ok ? 'connected' : 'error',
        apis: (projectsResponse.ok && tasksResponse.ok) ? 'working' : 'partial',
        users: dbData.users || 0,
        projects: projectsData?.data?.length || 0,
        tasks: tasksData?.data?.length || 0,
        lastUpdate: new Date().toISOString()
      });
      
      // Update API statuses
      const newApiStatuses: APIStatus[] = [
        { 
          name: 'Database', 
          status: dbResponse.ok ? 'success' : 'error',
          responseTime: Date.now() - startTime,
          error: dbResponse.ok ? undefined : 'Connection failed'
        },
        { 
          name: 'Projects', 
          status: projectsResponse.ok ? 'success' : 'error',
          responseTime: Date.now() - startTime,
          error: projectsResponse.ok ? undefined : 'API error'
        },
        { 
          name: 'Tasks', 
          status: tasksResponse.ok ? 'success' : 'error',
          responseTime: Date.now() - startTime,
          error: tasksResponse.ok ? undefined : 'API error'
        },
        { 
          name: 'Analytics', 
          status: analyticsResponse.ok ? 'success' : 'error',
          responseTime: Date.now() - startTime,
          error: analyticsResponse.ok ? undefined : 'API error'
        },
        { 
          name: 'Auth', 
          status: 'success', // Auth is always available
          responseTime: Date.now() - startTime
        }
      ];
      
      setApiStatuses(newApiStatuses);
      
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        database: 'error',
        apis: 'down'
      }));
      
      setApiStatuses(prev => prev.map(api => ({
        ...api,
        status: 'error',
        error: 'Network error'
      })));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'connected':
      case 'working':
        return 'text-green-600 bg-green-100';
      case 'error':
      case 'disconnected':
      case 'down':
        return 'text-red-600 bg-red-100';
      case 'partial':
      case 'loading':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'connected':
      case 'working':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
      case 'disconnected':
      case 'down':
        return <AlertCircle className="w-4 h-4" />;
      case 'partial':
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {isArabic ? 'لوحة تطوير النظام' : 'System Development Dashboard'}
              </h1>
              <p className="text-accent-foreground">
                {isArabic ? 'مراقبة حالة النظام وواجهات برمجة التطبيقات' : 'Monitor system status and APIs'}
              </p>
            </div>
            <button
              onClick={checkSystemHealth}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isArabic ? 'تحديث' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isArabic ? 'قاعدة البيانات' : 'Database'}
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.database)}
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(systemStatus.database)}`}>
                    {systemStatus.database.charAt(0).toUpperCase() + systemStatus.database.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isArabic ? 'واجهات برمجة التطبيقات' : 'APIs'}
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.apis)}
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(systemStatus.apis)}`}>
                    {systemStatus.apis.charAt(0).toUpperCase() + systemStatus.apis.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isArabic ? 'المستخدمون' : 'Users'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.users}</div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'مستخدم نشط' : 'Active users'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isArabic ? 'المشاريع' : 'Projects'}
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.projects}</div>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'مشروع نشط' : 'Active projects'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* API Status Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {isArabic ? 'حالة واجهات برمجة التطبيقات' : 'API Status Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiStatuses.map((api, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(api.status)}
                      <div>
                        <p className="font-medium">{api.name}</p>
                        {api.error && (
                          <p className="text-sm text-red-600">{api.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {api.responseTime && (
                        <span className="text-sm text-gray-500">
                          {api.responseTime}ms
                        </span>
                      )}
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(api.status)}`}>
                        {api.status === 'success' ? (isArabic ? 'يعمل' : 'Working') : 
                         api.status === 'error' ? (isArabic ? 'خطأ' : 'Error') : 
                         (isArabic ? 'تحميل' : 'Loading')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href={`/${locale}/projects`}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{isArabic ? 'عرض المشاريع' : 'View Projects'}</span>
                </a>
                <a
                  href={`/${locale}/dashboard/tasks`}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{isArabic ? 'إدارة المهام' : 'Task Management'}</span>
                </a>
                <a
                  href="/api/test-db"
                  target="_blank"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span>{isArabic ? 'اختبار قاعدة البيانات' : 'Test Database'}</span>
                </a>
                <div className="flex items-center gap-3 p-3 border rounded-lg opacity-50">
                  <MessageSquare className="w-4 h-4" />
                  <span>{isArabic ? 'الدردشة (للأدوار المسموح بها)' : 'Chat (Authorized Roles)'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Update */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {isArabic ? 'آخر تحديث:' : 'Last update:'} {new Date(systemStatus.lastUpdate).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
