<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
'use client';

>>>>>>> Stashed changes
=======
'use client';

>>>>>>> Stashed changes
=======
'use client';

>>>>>>> Stashed changes
=======
'use client';

>>>>>>> Stashed changes
=======
'use client';

>>>>>>> Stashed changes
=======
'use client';

>>>>>>> Stashed changes
=======
'use client';

>>>>>>> Stashed changes
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  Flag
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

interface VerificationResult {
  databaseConnection: boolean;
  userTasks: Task[];
  totalTasks: number;
  assignedTasks: number;
  completedTasks: number;
  errors: string[];
  lastSync: string;
}

const TaskVerificationPanel: React.FC = () => {
  const [verification, setVerification] = useState<VerificationResult>({
    databaseConnection: false,
    userTasks: [],
    totalTasks: 0,
    assignedTasks: 0,
    completedTasks: 0,
    errors: [],
    lastSync: new Date().toISOString()
  });
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const runVerification = async () => {
    setIsVerifying(true);
    const errors: string[] = [];
    
    try {
      // Step 1: Test database connection
      const dbResponse = await fetch('/api/test-connection');
      const dbResult = await dbResponse.json();
      
      if (!dbResult.success) {
        errors.push('Database connection failed');
      }

      // Step 2: Get current user info
      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();
      
      if (!session?.user?.id) {
        errors.push('User not authenticated');
        setVerification(prev => ({
          ...prev,
          errors,
          databaseConnection: false
        }));
        setIsVerifying(false);
        return;
      }

      // Step 3: Fetch user's assigned tasks
      const tasksResponse = await fetch(`/api/tasks/user/${session.user.id}`);
      
      if (!tasksResponse.ok) {
        errors.push(`Failed to fetch tasks: ${tasksResponse.statusText}`);
      } else {
        const tasks = await tasksResponse.json();
        
        // Step 4: Verify task data integrity
        const validTasks = tasks.filter((task: Task) => {
          return task.id && task.title && task.assignedTo?.id;
        });

        const assignedCount = validTasks.filter((task: Task) => 
          task.assignedTo.id === session.user.id
        ).length;

        const completedCount = validTasks.filter((task: Task) => 
          task.status === 'completed'
        ).length;

        setVerification({
          databaseConnection: dbResult.success,
          userTasks: validTasks,
          totalTasks: validTasks.length,
          assignedTasks: assignedCount,
          completedTasks: completedCount,
          errors,
          lastSync: new Date().toISOString()
        });
      }

    } catch (error) {
      errors.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setVerification(prev => ({
        ...prev,
        errors
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const testTaskOpening = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const task = await response.json();
        setSelectedTask(task);
      } else {
        console.error('Failed to open task:', response.statusText);
      }
    } catch (error) {
      console.error('Error opening task:', error);
    }
  };

  const testPDFDisplay = async (pdfUrl: string, fileName: string) => {
    try {
      // Test if PDF is accessible
      const response = await fetch(pdfUrl, { method: 'HEAD' });
      if (response.ok) {
        window.open(pdfUrl, '_blank');
      } else {
        alert('PDF not accessible');
      }
    } catch (error) {
      console.error('Error accessing PDF:', error);
      alert('Failed to access PDF');
    }
  };

  const filteredTasks = verification.userTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    runVerification();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Verification System</h1>
              <p className="text-gray-600 mt-1">Verify database tasks are properly assigned and accessible</p>
            </div>
            <button
              onClick={runVerification}
              disabled={isVerifying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Verifying...' : 'Run Verification'}
            </button>
          </div>
        </div>

        {/* Verification Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`bg-white rounded-xl shadow-sm border p-6 ${
            verification.databaseConnection ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <Database className={`w-8 h-8 ${
                verification.databaseConnection ? 'text-green-600' : 'text-red-600'
              }`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {verification.databaseConnection ? 'Connected' : 'Disconnected'}
                </p>
                <p className="text-sm text-gray-600">Database Status</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{verification.totalTasks}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{verification.assignedTasks}</p>
                <p className="text-sm text-gray-600">Assigned to You</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{verification.completedTasks}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {verification.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Verification Errors</h3>
            </div>
            <ul className="space-y-2">
              {verification.errors.map((error, index) => (
                <li key={index} className="text-red-700">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter tasks by status"
                aria-label="Filter tasks by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">
                  {verification.errors.length > 0 ? 'Fix verification errors to see tasks' : 'No tasks match your filters'}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{task.assignedTo.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{task.attachments.length} files</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => testTaskOpening(task.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Open Task
                      </button>
                      
                      {task.attachments && task.attachments.map((attachment) => (
                        <button
                          key={attachment.id}
                          onClick={() => testPDFDisplay(attachment.url, attachment.name)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          title={`Open ${attachment.name}`}
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Last Sync Info */}
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">
            Last verification: {new Date(verification.lastSync).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskVerificationPanel;
