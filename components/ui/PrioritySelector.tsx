import React, { useState } from 'react';
import { 
  Flag, 
  AlertTriangle, 
  Zap, 
  Flame,
  ChevronDown,
  Check
} from 'lucide-react';

interface PriorityOption {
  value: 'low' | 'medium' | 'high' | 'urgent';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

interface PrioritySelectorProps {
  value?: 'low' | 'medium' | 'high' | 'urgent';
  onChange?: (value: 'low' | 'medium' | 'high' | 'urgent') => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  value = 'medium',
  onChange,
  disabled = false,
  error = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const priorities: PriorityOption[] = [
    {
      value: 'low',
      label: 'Low',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: <Flag className="w-4 h-4" />
    },
    {
      value: 'medium',
      label: 'Medium',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: <Flag className="w-4 h-4" />
    },
    {
      value: 'high',
      label: 'High',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: <AlertTriangle className="w-4 h-4" />
    },
    {
      value: 'urgent',
      label: 'Urgent',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <Flame className="w-4 h-4" />
    }
  ];

  const selectedPriority = priorities.find(p => p.value === value);

  const handleSelect = (priorityValue: 'low' | 'medium' | 'high' | 'urgent') => {
    onChange?.(priorityValue);
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
          setFocusedIndex(priorities.findIndex(p => p.value === value));
        } else if (focusedIndex >= 0) {
          handleSelect(priorities[focusedIndex].value);
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
          setFocusedIndex(priorities.findIndex(p => p.value === value));
        } else {
          setFocusedIndex(prev => (prev + 1) % priorities.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev <= 0 ? priorities.length - 1 : prev - 1);
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
        {selectedPriority && (
          <>
            <span className={selectedPriority.color}>
              {selectedPriority.icon}
            </span>
            <span className="font-medium text-sm">{selectedPriority.label}</span>
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
          <div className="absolute top-full left-0 mt-2 z-20 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-900/10 overflow-hidden">
            <div 
              role="listbox"
              className="py-1"
            >
              {priorities.map((priority, index) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleSelect(priority.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-all duration-150 ease-out
                    ${value === priority.value 
                      ? `${priority.bgColor} ${priority.borderColor} border-l-4` 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }
                    ${focusedIndex === index ? 'ring-inset ring-2 ring-blue-500 ring-offset-0' : ''}
                  `}
                  role="option"
                  aria-selected={value === priority.value ? 'true' : 'false'}
                >
                  <span className={priority.color}>
                    {priority.icon}
                  </span>
                  <span className={`font-medium text-sm ${
                    value === priority.value ? priority.color : 'text-gray-700'
                  }`}>
                    {priority.label}
                  </span>
                  {value === priority.value && (
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

export default PrioritySelector;
