import React, { useState } from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { ChevronDown, AlertTriangle, Flag, Zap } from 'lucide-react';

interface PrioritySelectorProps {
  value?: 'low' | 'medium' | 'high' | 'urgent';
  onChange?: (priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  disabled?: boolean;
  className?: string;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value = 'medium',
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const priorities = [
    {
      value: 'low' as const,
      label: 'Low',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <Flag className="h-4 w-4" />
    },
    {
      value: 'medium' as const,
      label: 'Medium',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Flag className="h-4 w-4" />
    },
    {
      value: 'high' as const,
      label: 'High',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      value: 'urgent' as const,
      label: 'Urgent',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <Zap className="h-4 w-4" />
    }
  ];

  const currentPriority = priorities.find(p => p.value === value) || priorities[1];

  const handleSelect = (priority: typeof priorities[0]) => {
    if (onChange) {
      onChange(priority.value);
    }
    setIsOpen(false);
  };

  const getPriorityIcon = (priorityValue: string) => {
    const priority = priorities.find(p => p.value === priorityValue);
    return priority?.icon || <Flag className="h-4 w-4" />;
  };

  const getPriorityColor = (priorityValue: string) => {
    const priority = priorities.find(p => p.value === priorityValue);
    return priority?.color || priorities[1].color;
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
          {getPriorityIcon(value)}
          <span>{currentPriority.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-1 z-50 w-full bg-white border rounded-lg shadow-lg p-1">
          {priorities.map((priority) => (
            <Button
              key={priority.value}
              type="button"
              variant="ghost"
              className={`w-full justify-start gap-2 ${
                value === priority.value ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(priority)}
            >
              {priority.icon}
              <span>{priority.label}</span>
              {value === priority.value && (
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

export default PrioritySelector;
