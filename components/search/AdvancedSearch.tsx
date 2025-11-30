// components/search/AdvancedSearch.tsx - Advanced search and filtering component
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, User, Tag } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-components';
import { useDebouncedValue } from '@/hooks/usePerformanceOptimizations';
import { cn } from '@/lib/utils';
import '@/styles/tag-colors.css';

export interface SearchFilters {
  query: string;
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  createdBy?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  categories?: string[];
}

export interface SearchOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

export interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  placeholder?: string;
  options?: {
    status: SearchOption[];
    priority: SearchOption[];
    users: SearchOption[];
    tags: SearchOption[];
    categories: SearchOption[];
  };
  className?: string;
  isArabic?: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  placeholder = "Search tasks...",
  options,
  className,
  isArabic = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const debouncedQuery = useDebouncedValue(query, 300);

  // Auto-search when query changes
  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      const newFilters = { ...filters, query: debouncedQuery };
      setFilters(newFilters);
      onSearch(newFilters);
    }
  }, [debouncedQuery, filters.query, onSearch]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.assignedTo?.length) count++;
    if (filters.createdBy?.length) count++;
    if (filters.dateRange?.start) count++;
    if (filters.tags?.length) count++;
    if (filters.categories?.length) count++;
    return count;
  }, [filters]);

  // Update active filters list
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filters.query) newActiveFilters.push(`"${filters.query}"`);
    if (filters.status?.length) newActiveFilters.push(`Status: ${filters.status.length}`);
    if (filters.priority?.length) newActiveFilters.push(`Priority: ${filters.priority.length}`);
    if (filters.assignedTo?.length) newActiveFilters.push(`Assigned: ${filters.assignedTo.length}`);
    if (filters.createdBy?.length) newActiveFilters.push(`Created by: ${filters.createdBy.length}`);
    if (filters.dateRange?.start) newActiveFilters.push('Date range');
    if (filters.tags?.length) newActiveFilters.push(`Tags: ${filters.tags.length}`);
    if (filters.categories?.length) newActiveFilters.push(`Categories: ${filters.categories.length}`);
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const handleFilterChange = useCallback((filterType: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  }, [filters, onSearch]);

  const handleMultiSelect = useCallback((filterType: keyof SearchFilters, optionValue: string) => {
    const currentValues = filters[filterType] as string[] || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    
    handleFilterChange(filterType, newValues);
  }, [filters, handleFilterChange]);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setFilters({ query: '' });
    onClear();
  }, [onClear]);

  const removeFilter = useCallback((filterType: keyof SearchFilters) => {
    const newFilters = { ...filters };
    
    if (filterType === 'query') {
      newFilters.query = '';
      setQuery('');
    } else if (filterType === 'dateRange') {
      delete newFilters.dateRange;
    } else {
      newFilters[filterType] = [];
    }
    
    setFilters(newFilters);
    onSearch(newFilters);
  }, [filters, onSearch]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Main search bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              isArabic && "text-right pr-10 pl-24"
            )}
          />
          
          {/* Filter toggle and clear buttons */}
          <div className={cn("absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1", isArabic && "right-auto left-2")}>
            {activeFiltersCount > 0 && (
              <EnhancedButton
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="text-red-500 hover:text-red-700"
                aria-label="Clear all filters"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </EnhancedButton>
            )}
            
            <EnhancedButton
              size="sm"
              variant={isExpanded ? "secondary" : "ghost"}
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
              aria-label={isExpanded ? "Hide advanced filters" : "Show advanced filters"}
              title={isExpanded ? "Hide advanced filters" : "Show advanced filters"}
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </EnhancedButton>
          </div>
        </div>

        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {activeFilters.map((filter, index) => (
              <motion.span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {filter}
                <button
                  onClick={() => {
                    // Remove the corresponding filter
                    const filterTypes: (keyof SearchFilters)[] = ['query', 'status', 'priority', 'assignedTo', 'createdBy', 'dateRange', 'tags', 'categories'];
                    const filterType = filterTypes[index] || 'query';
                    removeFilter(filterType);
                  }}
                  className="hover:text-blue-600"
                  aria-label={`Remove filter: ${filter}`}
                  title={`Remove filter: ${filter}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters
              </h3>
              <EnhancedButton
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                aria-label="Close advanced filters"
                title="Close advanced filters"
              >
                <X className="w-4 h-4" />
              </EnhancedButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status filter */}
              {options?.status && options.status.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Status
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {options.status.map((status) => (
                      <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.status?.includes(status.value) || false}
                          onChange={() => handleMultiSelect('status', status.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{status.label}</span>
                        {status.count && (
                          <span className="text-xs text-gray-500">({status.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority filter */}
              {options?.priority && options.priority.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Priority
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {options.priority.map((priority) => (
                      <label key={priority.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priority?.includes(priority.value) || false}
                          onChange={() => handleMultiSelect('priority', priority.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{priority.label}</span>
                        {priority.count && (
                          <span className="text-xs text-gray-500">({priority.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned to filter */}
              {options?.users && options.users.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Assigned To
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {options.users.map((user) => (
                      <label key={user.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.assignedTo?.includes(user.value) || false}
                          onChange={() => handleMultiSelect('assignedTo', user.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{user.label}</span>
                        {user.count && (
                          <span className="text-xs text-gray-500">({user.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Created by filter */}
              {options?.users && options.users.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Created By
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {options.users.map((user) => (
                      <label key={user.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.createdBy?.includes(user.value) || false}
                          onChange={() => handleMultiSelect('createdBy', user.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{user.label}</span>
                        {user.count && (
                          <span className="text-xs text-gray-500">({user.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Date range filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="start-date" className="sr-only">Start date</label>
                    <input
                      id="start-date"
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        start: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Start date"
                      title="Start date"
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="sr-only">End date</label>
                    <input
                      id="end-date"
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        end: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="End date"
                      title="End date"
                    />
                  </div>
                </div>
              </div>

              {/* Tags filter */}
              {options?.tags && options.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {options.tags.map((tag) => (
                      <label key={tag.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.tags?.includes(tag.value) || false}
                          onChange={() => handleMultiSelect('tags', tag.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{tag.label}</span>
                        {tag.color && (
                          <span
                            className={`w-3 h-3 rounded-full tag-color-base ${
                              tag.color.startsWith('#') 
                                ? '' 
                                : `tag-color-${tag.color.toLowerCase()}`
                            }`}
                            style={tag.color.startsWith('#') ? { backgroundColor: tag.color } : undefined}
                            aria-label={`Tag color: ${tag.color}`}
                          />
                        )}
                        {tag.count && (
                          <span className="text-xs text-gray-500">({tag.count})</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick filter presets */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <EnhancedButton
                size="sm"
                variant="outline"
                onClick={() => {
                  handleFilterChange('status', ['pending', 'in_progress']);
                  handleFilterChange('priority', ['high', 'urgent']);
                }}
              >
                High Priority Active
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="outline"
                onClick={() => {
                  handleFilterChange('assignedTo', [getCurrentUserId()]);
                }}
              >
                My Tasks
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  handleFilterChange('dateRange', { start: today, end: nextWeek });
                }}
              >
                This Week
              </EnhancedButton>
              <EnhancedButton
                size="sm"
                variant="outline"
                onClick={() => {
                  handleFilterChange('status', ['overdue']);
                }}
              >
                Overdue
              </EnhancedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Utility function to get current user ID
function getCurrentUserId(): string {
  try {
    const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.email;
    }
  } catch (error) {
    // Token parsing failed
  }
  return '';
}

// Search suggestions component
export interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isVisible: boolean;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  suggestions,
  onSelect,
  isVisible,
  className
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredSuggestions = useMemo(() => {
    if (!query) return suggestions.slice(0, 5);
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }, [query, suggestions]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isVisible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          onSelect(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        // Hide suggestions
        break;
    }
  };

  if (!isVisible || filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onKeyDown={handleKeyDown}
    >
      {filteredSuggestions.map((suggestion, index) => (
        <motion.div
          key={suggestion}
          className={cn(
            "px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2",
            index === selectedIndex && "bg-blue-50 text-blue-600"
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(suggestion)}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span>{suggestion}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};
