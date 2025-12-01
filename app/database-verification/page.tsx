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
import React, { useState, useEffect } from 'react';
import DatabaseConnectedDashboard from '@/components/professional/DatabaseConnectedDashboard';

export default function DatabaseVerificationPage() {
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSampleData, setCreatingSampleData] = useState(false);

  useEffect(() => {
    const runVerification = async () => {
      try {
        // Try simple test first
        const simpleResponse = await fetch('/api/test-database-simple');
        if (simpleResponse.ok) {
          const simpleData = await simpleResponse.json();
          setVerification(simpleData);
        } else {
          // Fall back to full verification
          const response = await fetch('/api/verify-database');
          if (!response.ok) {
            throw new Error('Verification failed');
          }
          const data = await response.json();
          setVerification(data);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    runVerification();
  }, []);

  const createSampleData = async () => {
    try {
      setCreatingSampleData(true);
      const response = await fetch('/api/create-sample-tasks', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create sample data');
      }
      
      const result = await response.json();
      
      // Refresh verification after creating sample data
      const verifyResponse = await fetch('/api/verify-database');
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        setVerification(verifyData);
      }
      
      alert(`Sample data created successfully!\n\nUsers: ${result.data.usersCreated}\nTasks: ${result.data.tasksCreated}\nAttachments: ${result.data.attachmentsCreated}`);
      
    } catch (error) {
      alert('Error creating sample data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCreatingSampleData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Database Integration</h2>
          <p className="text-gray-600">Checking all database connections and API endpoints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Database Integration Verification</h1>
          <p className="text-gray-600 mt-2">Complete verification of database connectivity and task management functionality</p>
        </div>
      </div>

      {/* Verification Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Database Connection</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    verification.database.connection === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.database.connection}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Overall Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    verification.api.functionality.overall === 'excellent' 
                      ? 'bg-green-100 text-green-800'
                    : verification.api.functionality.overall === 'good'
                      ? 'bg-blue-100 text-blue-800'
                    : verification.api.functionality.overall === 'needs_attention'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.api.functionality.overall}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Issues Found</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    verification.issues.length === 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verification.issues.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Recommendations</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {verification.recommendations.length}
                  </span>
                </div>
              </div>

              {/* Issues */}
              {verification.issues.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Issues Found</h3>
                  <div className="space-y-2">
                    {verification.issues.map((issue: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-sm text-gray-700">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {verification.recommendations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {verification.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={createSampleData}
                  disabled={creatingSampleData}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingSampleData ? 'Creating Sample Data...' : 'Create Sample Data'}
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Verification
                </button>
                
                <button
                  onClick={() => window.location.href = '/database-verification'}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Live Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Database Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Database Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(verification.database.counts).map(([table, count]) => (
                  <div key={table} className="text-center">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
=======
                    <div className="text-2xl font-bold text-gray-900">{String(count)}</div>
>>>>>>> Stashed changes
=======
                    <div className="text-2xl font-bold text-gray-900">{String(count)}</div>
>>>>>>> Stashed changes
=======
                    <div className="text-2xl font-bold text-gray-900">{String(count)}</div>
>>>>>>> Stashed changes
=======
                    <div className="text-2xl font-bold text-gray-900">{String(count)}</div>
>>>>>>> Stashed changes
=======
                    <div className="text-2xl font-bold text-gray-900">{String(count)}</div>
>>>>>>> Stashed changes
=======
                    <div className="text-2xl font-bold text-gray-900">{String(count)}</div>
>>>>>>> Stashed changes
                    <div className="text-sm text-gray-600 capitalize">{table}</div>
                  </div>
                ))}
              </div>

              {/* Sample Data */}
              {verification.database.sampleData.tasks && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Tasks from Database</h3>
                  <div className="space-y-3">
                    {verification.database.sampleData.tasks.slice(0, 3).map((task: any, index: number) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                          <span>Created by: {task.createdBy?.name}</span>
                          <span>Priority: {task.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* API Functionality */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">API Functionality</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Assignments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {verification.api.functionality.taskAssignments?.slice(0, 4).map((assignment: any) => (
                      <div key={assignment.assignedToId} className="text-center">
                        <div className="text-lg font-bold text-gray-900">{assignment._count.id}</div>
                        <div className="text-sm text-gray-600">Tasks</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {verification.api.functionality.userRoles?.map((role: any) => (
                      <span key={role.role} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {role.role}: {role._count.id} users
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Statuses</h3>
                  <div className="flex flex-wrap gap-2">
                    {verification.api.functionality.taskStatuses?.map((status: any) => (
                      <span key={status.status} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {status.status}: {status._count.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Dashboard Preview */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Database Dashboard</h2>
            <p className="text-gray-600 mb-4">This dashboard shows real data from your database. All tasks are fetched live and updated in real-time.</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <DatabaseConnectedDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
