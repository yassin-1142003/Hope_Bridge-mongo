import React, { useState } from 'react';
import PrioritySelector from './PrioritySelector';
import TaskStatusSelector from './TaskStatusSelector';

const SelectorDemo: React.FC = () => {
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending');
  const [priorityError, setPriorityError] = useState(false);
  const [statusError, setStatusError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🐧 Penguin-Alpha UI Components
          </h1>
          <p className="text-lg text-gray-600">
            Premium Priority & Status Selectors - ClickUp × Linear × Notion Combined
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Priority Selector Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-900/5 p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Priority Selector</h2>
              <p className="text-sm text-gray-600">
                Clean, modern priority selection with visual indicators
              </p>
            </div>

            {/* Normal State */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Normal State
              </label>
              <PrioritySelector
                value={priority}
                onChange={setPriority}
              />
              <p className="mt-2 text-xs text-gray-500">
                Current: <span className="font-medium">{priority}</span>
              </p>
            </div>

            {/* Error State */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Error State
              </label>
              <PrioritySelector
                value={priority}
                onChange={setPriority}
                error={priorityError}
              />
              {priorityError && (
                <p className="mt-2 text-xs text-red-600">
                  Priority selection is required
                </p>
              )}
              <button
                onClick={() => setPriorityError(!priorityError)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Toggle Error State
              </button>
            </div>

            {/* Disabled State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Disabled State
              </label>
              <PrioritySelector
                value={priority}
                onChange={setPriority}
                disabled
              />
            </div>
          </div>

          {/* Status Selector Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-900/5 p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Task Status Selector</h2>
              <p className="text-sm text-gray-600">
                Elegant status selection with smooth transitions
              </p>
            </div>

            {/* Normal State */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Normal State
              </label>
              <TaskStatusSelector
                value={status}
                onChange={setStatus}
              />
              <p className="mt-2 text-xs text-gray-500">
                Current: <span className="font-medium">{status}</span>
              </p>
            </div>

            {/* Error State */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Error State
              </label>
              <TaskStatusSelector
                value={status}
                onChange={setStatus}
                error={statusError}
              />
              {statusError && (
                <p className="mt-2 text-xs text-red-600">
                  Status selection is required
                </p>
              )}
              <button
                onClick={() => setStatusError(!statusError)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Toggle Error State
              </button>
            </div>

            {/* Disabled State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Disabled State
              </label>
              <TaskStatusSelector
                value={status}
                onChange={setStatus}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-900/5 p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Interactive Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Priority
              </label>
              <PrioritySelector
                value={priority}
                onChange={setPriority}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Status
              </label>
              <TaskStatusSelector
                value={status}
                onChange={setStatus}
              />
            </div>
          </div>

          {/* Result Display */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <p className="font-semibold text-gray-900 capitalize">{priority}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-gray-900">{status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg shadow-gray-900/5 p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Enterprise Design</h3>
                  <p className="text-sm text-gray-600">Clean, professional dashboard aesthetic</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Micro-interactions</h3>
                  <p className="text-sm text-gray-600">Smooth hover states and transitions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Keyboard Accessible</h3>
                  <p className="text-sm text-gray-600">Full keyboard navigation support</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Color System</h3>
                  <p className="text-sm text-gray-600">Consistent, semantic color palette</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Responsive Design</h3>
                  <p className="text-sm text-gray-600">Mobile-first, touch-friendly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Error States</h3>
                  <p className="text-sm text-gray-600">Built-in validation support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectorDemo;
