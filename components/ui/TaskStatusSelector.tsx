import React, { useState } from 'react';
<<<<<<< HEAD
import { Button } from './button';
import { Badge } from './badge';
import { ChevronDown, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface TaskStatusSelectorProps {
  value?: 'new' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
  onChange?: (status: 'new' | 'pending' | 'in-progress' | 'completed' | 'cancelled') => void;
  disabled?: boolean;
=======
import { 
  Clock, 
  Play, 
  Eye, 
  CheckCircle, 
  XCircle,
  Archive,
  ChevronDown,
  Check
} from 'lucide-react';

interface StatusOption {
  value: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

interface TaskStatusSelectorProps {
  value?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  onChange?: (value: 'pending' | 'in_progress' | 'completed' | 'cancelled') => void;
  disabled?: boolean;
  error?: boolean;
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
  className?: string;
}

const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
<<<<<<< HEAD
  value = 'new',
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statuses = [
    {
      value: 'new' as const,
      label: 'New',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Clock className="h-4 w-4" />
    },
    {
      value: 'pending' as const,
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Clock className="h-4 w-4" />
    },
    {
      value: 'in-progress' as const,
      label: 'In Progress',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      value: 'completed' as const,
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      value: 'cancelled' as const,
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="h-4 w-4" />
    }
  ];

  const currentStatus = statuses.find(s => s.value === value) || statuses[0];

  const handleSelect = (status: typeof statuses[0]) => {
    if (onChange) {
      onChange(status.value);
    }
    setIsOpen(false);
  };

  const getStatusIcon = (statusValue: string) => {
    const status = statuses.find(s => s.value === statusValue);
    return status?.icon || <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (statusValue: string) => {
    const status = statuses.find(s => s.value === statusValue);
    return status?.color || statuses[0].color;
=======
  value = 'pending',
  onChange,
  disabled = false,
  error = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const statuses: StatusOption[] = [
    {
      value: 'pending',
      label: 'Pending',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: <Clock className="w-4 h-4" />
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: <Play className="w-4 h-4" />
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <XCircle className="w-4 h-4" />
    }
  ];

  const selectedStatus = statuses.find(s => s.value === value);

  const handleSelect = (statusValue: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    onChange?.(statusValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(statuses.findIndex(s => s.value === value));
        } else if (focusedIndex >= 0) {
          handleSelect(statuses[focusedIndex].value);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(statuses.findIndex(s => s.value === value));
        } else {
          setFocusedIndex(prev => (prev + 1) % statuses.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev <= 0 ? statuses.length - 1 : prev - 1);
        }
        break;
    }
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
  };

  return (
    <div className={`relative ${className}`}>
<<<<<<< HEAD
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span>{currentStatus.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-1 z-50 w-full bg-white border rounded-lg shadow-lg p-1">
          {statuses.map((status) => (
            <Button
              key={status.value}
              type="button"
              variant="ghost"
              className={`w-full justify-start gap-2 ${
                value === status.value ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(status)}
            >
              {status.icon}
              <span>{status.label}</span>
              {value === status.value && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </Button>
          ))}
        </div>
=======
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl border-2
          transition-all duration-200 ease-out
          ${disabled 
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
            : error
            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }
          ${isOpen && !disabled ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-300 shadow-md' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen} // Edge Tools may show false positive - this is correct boolean usage
        aria-disabled={disabled}
        title="Select task status"
        aria-label="Select task status"
      >
        {selectedStatus && (
          <>
            <span className={selectedStatus.color}>
              {selectedStatus.icon}
            </span>
            <span className="font-medium text-sm">{selectedStatus.label}</span>
          </>
        )}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          } ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 z-20 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-900/10 overflow-hidden"
            title="Status options"
            aria-label="Status options">
            <div 
              role="listbox"
              className="py-1"
            >
              {statuses.map((status, index) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleSelect(status.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-all duration-150 ease-out
                    ${value === status.value 
                      ? `${status.bgColor} ${status.borderColor} border-l-4` 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }
                    ${focusedIndex === index ? 'ring-inset ring-2 ring-blue-500 ring-offset-0' : ''}
                  `}
                  role="option"
                  aria-selected={value === status.value} // Edge Tools may show false positive - this is correct boolean usage
                >
                  <span className={status.color}>
                    {status.icon}
                  </span>
                  <span className={`font-medium text-sm ${
                    value === status.value ? status.color : 'text-gray-700'
                  }`}>
                    {status.label}
                  </span>
                  {value === status.value && (
                    <Check className="w-4 h-4 ml-auto text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
      )}
    </div>
  );
};

export default TaskStatusSelector;
