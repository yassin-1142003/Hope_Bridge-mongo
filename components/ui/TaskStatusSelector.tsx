import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { ChevronDown, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface TaskStatusSelectorProps {
  value?: 'new' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
  onChange?: (status: 'new' | 'pending' | 'in-progress' | 'completed' | 'cancelled') => void;
  disabled?: boolean;
  className?: string;
}

const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
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
  };

  return (
    <div className={`relative ${className}`}>
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
      )}
    </div>
  );
};

export default TaskStatusSelector;
