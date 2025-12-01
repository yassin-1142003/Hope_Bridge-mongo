<<<<<<< HEAD
import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
=======
/**
 * Professional Date Picker Component
 * 
 * Advanced date selection with manual input, validation,
 * and professional UI/UX design.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  className?: string;
  allowManualInput?: boolean;
  showTimePicker?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
}

const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
<<<<<<< HEAD
  placeholder = 'Select date',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
=======
  placeholder = 'Select date...',
  minDate,
  maxDate,
  disabled = false,
  className = '',
  allowManualInput = true,
  showTimePicker = false,
  label,
  error,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [manualInput, setManualInput] = useState(value);
  const [timeInput, setTimeInput] = useState(
    value ? new Date(value).toTimeString().slice(0, 5) : '09:00'
  );
  const [inputMode, setInputMode] = useState<'picker' | 'manual'>('picker');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setManualInput(value);
    if (value) {
      setSelectedDate(new Date(value));
      setTimeInput(new Date(value).toTimeString().slice(0, 5));
    }
  }, [value]);
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

<<<<<<< HEAD
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    
    const dateString = newDate.toISOString().split('T')[0];
    if (onChange) {
      onChange(dateString);
    }
    
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onChange) {
      onChange(value);
    }
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="date"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 z-50 bg-white border rounded-lg shadow-lg p-4 min-w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`w-full h-full ${
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentMonth.getMonth() &&
                      selectedDate.getFullYear() === currentMonth.getFullYear()
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDate(null);
                if (onChange) {
                  onChange('');
                }
                setIsOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
=======
  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (minDate && date < new Date(minDate)) {
      return true;
    }
    
    if (maxDate && date > new Date(maxDate)) {
      return true;
    }

    return false;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === new Date().toDateString();
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;

    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (showTimePicker && timeInput) {
      const [hours, minutes] = timeInput.split(':');
      newDate.setHours(parseInt(hours), parseInt(minutes));
    }

    setSelectedDate(newDate);
    const dateString = newDate.toISOString().split('T')[0];
    setManualInput(dateString);
    onChange(dateString);
    setIsOpen(false);
  };

  const handleManualInputChange = (input: string) => {
    setManualInput(input);
    
    // Validate and format the date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(input)) {
      const date = new Date(input);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        onChange(input);
      }
    }
  };

  const handleTimeInputChange = (input: string) => {
    setTimeInput(input);
    
    if (selectedDate) {
      const [hours, minutes] = input.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
      
      const dateString = newDate.toISOString().split('T')[0];
      onChange(dateString);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return placeholder;
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Main Input */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between transition-all ${
              disabled 
                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                : error
                ? 'border-red-300 bg-red-50 text-red-900 hover:border-red-400'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                {formatDisplayDate()}
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
          >
            <span className="w-4 h-4">⚠</span>
            {error}
          </motion.p>
        )}

        {/* Date Picker Dropdown */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            >
              {/* Mode Toggle */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setInputMode('picker')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    inputMode === 'picker'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Calendar
                </button>
                {allowManualInput && (
                  <button
                    type="button"
                    onClick={() => setInputMode('manual')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      inputMode === 'manual'
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Manual Input
                  </button>
                )}
              </div>

              {/* Calendar Mode */}
              {inputMode === 'picker' && (
                <div className="p-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Previous month"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <h3 className="font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    
                    <button
                      type="button"
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Next month"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Week Days */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => (
                      <div key={index} className="aspect-square">
                        {day && (
                          <button
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            disabled={isDateDisabled(day)}
                            className={`w-full h-full flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                              isDateDisabled(day)
                                ? 'text-gray-300 cursor-not-allowed'
                                : isDateSelected(day)
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : isToday(day)
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {day}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Time Picker */}
                  {showTimePicker && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          id="calendar-time-input"
                          name="calendar-time-input"
                          value={timeInput}
                          onChange={(e) => handleTimeInputChange(e.target.value)}
                          title="Select time"
                          aria-label="Time input"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date();
                        setCurrentMonth(today);
                        handleDateSelect(today.getDate());
                      }}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setCurrentMonth(tomorrow);
                        handleDateSelect(tomorrow.getDate());
                      }}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Input Mode */}
              {inputMode === 'manual' && (
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date (YYYY-MM-DD)
                      </label>
                      <input
                        type="text"
                        id="manual-date-input"
                        name="manual-date-input"
                        value={manualInput}
                        onChange={(e) => handleManualInputChange(e.target.value)}
                        placeholder="2024-01-15"
                        title="Enter date in YYYY-MM-DD format"
                        aria-label="Manual date input"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {showTimePicker && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time (HH:MM)
                        </label>
                        <input
                          type="time"
                          id="manual-time-input"
                          name="manual-time-input"
                          value={timeInput}
                          onChange={(e) => handleTimeInputChange(e.target.value)}
                          title="Select time"
                          aria-label="Time input"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Quick formats:</p>
                      <div className="space-y-1">
                        <p>• Today: {new Date().toISOString().split('T')[0]}</p>
                        <p>• Tomorrow: {new Date(Date.now() + 86400000).toISOString().split('T')[0]}</p>
                        <p>• Next Week: {new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
    </div>
  );
};

export default DatePicker;
