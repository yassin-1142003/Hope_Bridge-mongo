import React, { useState } from 'react';
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
  className?: string;
}

const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
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
  };

  return (
    <div className={`relative ${className}`}>
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
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-disabled={disabled ? 'true' : 'false'}
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
                  aria-selected={value === status.value ? 'true' : 'false'}
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
      )}
    </div>
  );
};

export default TaskStatusSelector;
