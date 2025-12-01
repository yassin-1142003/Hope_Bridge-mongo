import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  Calendar,
  Clock,
  User,
  Tag,
  Flag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

interface AwesomeDashboardFormProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onCreateTask?: () => void;
  className?: string;
}

const AwesomeDashboardForm: React.FC<AwesomeDashboardFormProps> = ({
  onSearch,
  onFilter,
  onCreateTask,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignedTo: [],
    dateRange: 'all'
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters };
    
    if (filterType === 'dateRange') {
      newFilters.dateRange = value;
    } else {
      const filterArray = newFilters[filterType as keyof typeof newFilters] as string[];
      if (filterArray.includes(value)) {
        newFilters[filterType as keyof typeof newFilters] = filterArray.filter(item => item !== value);
      } else {
        (newFilters[filterType as keyof typeof newFilters] as string[]).push(value);
      }
    }
    
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assignedTo: [],
      dateRange: 'all'
    });
    onFilter?.({});
  };

  const activeFiltersCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    }
    return filter !== 'all' ? count + 1 : count;
  }, 0);

  return (
    <div className={`bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* Main Search Bar */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input with Awesome Styling */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search anything... tasks, people, dates, tags ✨"
              className="block w-full pl-12 pr-4 py-4 text-lg font-medium bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-3 px-6 py-4 font-semibold rounded-xl transition-all duration-200 ${
                activeFiltersCount > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Create Task Button */}
            <button
              onClick={onCreateTask}
              className="flex items-center gap-3 px-6 py-4 font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>New Task</span>
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Live search active</span>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-gray-700 font-medium">Searching for: "{searchQuery}"</span>
            </div>
          )}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-gray-700 font-medium">{activeFiltersCount} filters applied</span>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                    <p className="text-sm text-gray-600">Refine your search with powerful filters</p>
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <h4 className="font-semibold text-gray-900">Status</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'pending', label: 'Pending', color: 'yellow' },
                      { value: 'in_progress', label: 'In Progress', color: 'blue' },
                      { value: 'completed', label: 'Completed', color: 'green' },
                      { value: 'cancelled', label: 'Cancelled', color: 'red' }
                    ].map((status) => (
                      <label
                        key={status.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          filters.status.includes(status.value)
                            ? `border-${status.color}-500 bg-${status.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status.value)}
                          onChange={() => handleFilterChange('status', status.value)}
                          className="sr-only"
                        />
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          filters.status.includes(status.value)
                            ? `border-${status.color}-500 bg-${status.color}-500`
                            : 'border-gray-300'
                        }`}>
                          {filters.status.includes(status.value) && (
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-500" />
                    <h4 className="font-semibold text-gray-900">Priority</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'low', label: 'Low', color: 'gray' },
                      { value: 'medium', label: 'Medium', color: 'blue' },
                      { value: 'high', label: 'High', color: 'orange' },
                      { value: 'urgent', label: 'Urgent', color: 'red' }
                    ].map((priority) => (
                      <label
                        key={priority.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          filters.priority.includes(priority.value)
                            ? `border-${priority.color}-500 bg-${priority.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.priority.includes(priority.value)}
                          onChange={() => handleFilterChange('priority', priority.value)}
                          className="sr-only"
                        />
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          filters.priority.includes(priority.value)
                            ? `border-${priority.color}-500 bg-${priority.color}-500`
                            : 'border-gray-300'
                        }`}>
                          {filters.priority.includes(priority.value) && (
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{priority.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Assigned To Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">Assigned To</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'me', label: 'Assigned to Me', avatar: '👤' },
                      { value: 'unassigned', label: 'Unassigned', avatar: '❓' },
                      { value: 'team', label: 'My Team', avatar: '👥' },
                      { value: 'all', label: 'Everyone', avatar: '🌍' }
                    ].map((person) => (
                      <label
                        key={person.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          filters.assignedTo.includes(person.value)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.assignedTo.includes(person.value)}
                          onChange={() => handleFilterChange('assignedTo', person.value)}
                          className="sr-only"
                        />
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          filters.assignedTo.includes(person.value)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {filters.assignedTo.includes(person.value) && (
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-lg mr-2">{person.avatar}</span>
                        <span className="text-sm font-medium text-gray-700">{person.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Date Range</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'today', label: 'Today', desc: 'Tasks due today' },
                      { value: 'week', label: 'This Week', desc: 'Tasks due this week' },
                      { value: 'month', label: 'This Month', desc: 'Tasks due this month' },
                      { value: 'all', label: 'All Time', desc: 'All tasks' }
                    ].map((date) => (
                      <label
                        key={date.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          filters.dateRange === date.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dateRange"
                          checked={filters.dateRange === date.value}
                          onChange={() => handleFilterChange('dateRange', date.value)}
                          className="sr-only"
                        />
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          filters.dateRange === date.value
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {filters.dateRange === date.value && (
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">{date.label}</div>
                          <div className="text-xs text-gray-500">{date.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AwesomeDashboardForm;
